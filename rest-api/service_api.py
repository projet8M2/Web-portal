from flask import Flask, jsonify, request, render_template, flash, redirect, url_for
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import networkx as nx
from networkx.readwrite import json_graph
import json
import os
import os.path
from collections import OrderedDict
from pymongo import MongoClient
import Calculations as calc
import glob
import sys

# Create the application instance
UPLOAD_FOLDER = "rest-api/uploadedFiles"
ALLOWED_EXTENSIONS = set(['gml'])
ABS_PATH = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, template_folder="templates")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
api = Api(app)
CORS(app)
# Create a URL route in our application for "/"


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/uploadedFiles', methods=['GET', 'POST'])
@cross_origin()
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'filepond' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['filepond']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(
                os.path.abspath(app.config['UPLOAD_FOLDER']), filename))
            return redirect(url_for('upload_file',
                                    filename=filename))
    if request.method == 'GET':
        return '''
                <!doctype html>
                <title>Upload new File</title>
                <h1>Upload new File</h1>
                <form method=post enctype=multipart/form-data>
                <input type=file name=file>
                <input type=submit value=Upload>
                </form>
                '''
# If we're running in stand alone mode, run the application


@app.route('/getgraphlist', methods=['GET'])
@cross_origin()
def getGraphNameList():
    if request.method == 'GET':
        client = MongoClient('mongodb://localhost:27017/', connect=False)
        db = client.graphDB
        collection = db.documentCollection
        results = collection.find({}, {"graph.label": 1, "_id": 0})
        documents_result = [document for document in results]
        print(documents_result)
        return json.dumps(documents_result, ensure_ascii=False)


@app.route('/getsavedgraph', methods=['POST'])
@cross_origin()
def getSaved_Graph():
    if request.method == 'POST':
        client = MongoClient('mongodb://localhost:27017/', connect=False)
        db = client.graphDB
        collection = db.documentCollection
        results = collection.find(
            {"graph.label":  request.get_json(force=True)['gml_data'], "_id":  request.get_json(force=True)['gml_data']})
        documents_result = [document for document in results]
        return json.dumps(documents_result, ensure_ascii=False)


@app.route('/deletegraph', methods=['POST'])
@cross_origin()
def delete_graph():
    client = MongoClient('mongodb://localhost:27017/', connect=False)
    db = client.graphDB
    collection = db.documentCollection
    try:
        result = collection.delete_one(
            {"graph.label":  request.get_json(force=True)['gml_data'], "_id":  request.get_json(force=True)['gml_data']}).raw_result
        print(result)
    except:
        result = "error"
    return json.dumps(result, ensure_ascii=False)


@app.route('/shortestpath', methods=['POST'])
@cross_origin()
def shortestpath():
    json_object = request.get_json(force=True)['graph_data']
    graphe = json_graph.node_link_graph(json_object)
    service_data = request.get_json(force=True)['gml_data']
    djkistra_path = []
    old_target = ""
    lenght = 0 
    for key, value in enumerate(service_data['links']):
        actual_node = value['source']
        target_node = value['target']
        try:
            sub_path = nx.dijkstra_path(graphe, actual_node, target_node)
        except nx.exception.NetworkXNoPath:
            target_node_adjusted = actual_node
            actual_node = target_node
            target_node = target_node_adjusted
            sub_path = nx.dijkstra_path(
                graphe, actual_node, target_node)
        lenght = len(sub_path)
        for index, node in enumerate(sub_path):
            if index<lenght-1:
                try:
                    actual_bandwith = graphe[node][sub_path[index+1]]['bandwith']
                except KeyError:
                    actual_bandwith = 0
                graphe[node][sub_path[index+1]
                            ]['bandwith'] = actual_bandwith - value['bandwith']
        if key > 0:
            if old_target ==  target_node:
                sub_path = list(reversed(sub_path))
            sub_path = sub_path[1:]
        djkistra_path.extend(sub_path)
        old_target = target_node
    python_json = json_graph.node_link_data(
            graphe)
    json_object = json.dumps(python_json, ensure_ascii=False)
    return json.dumps({"path": djkistra_path, 'graph': json_object})

@app.route('/enrichwithdelay', methods=['POST'])
@cross_origin()
def EnrichWithDelay():
    json_object = request.get_json(force=True)['graph_data']
    graphe = json_graph.node_link_graph(json_object)
    nodes = graphe.nodes(True)
    for nodes_index in nx.connected_components(graphe):
        it_edge = graphe.edges(nodes_index).__iter__()
        try:
            while it_edge:
                edge = it_edge.__next__()
                node_src = nodes[edge[0]]
                node_dst = nodes[edge[1]]
                lat1 = node_src.get('Latitude')
                long1 = node_src.get('Longitude')
                lat2 = node_dst.get('Latitude')
                long2 = node_dst.get('Longitude')
                delay = calc.getLinkDelay(lat1, long1, lat2, long2)
                graphe[edge[0]][edge[1]]['delay'] = delay
        except:
            pass

    data = json_graph.node_link_data(graphe)
    json_object = json.dumps(data, ensure_ascii=False)
    return json.dumps({'graph': json_object})

class Converter(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        graphe = nx.read_gml(os.path.join(os.path.abspath(
            app.config['UPLOAD_FOLDER']), json_data['gml_data']))
        # create a dictionary in a node-link format that is suitable for JSON serialization
        if(json_data['service'] != True or json_data['service'] == None):
            nx.set_edge_attributes(graphe,  50, "bandwith")
        python_json = json_graph.node_link_data(
            graphe)
        json_object = json.dumps(python_json, ensure_ascii=False)
        # os.remove(os.path.abspath(json_data['gml_data']))
        return json_object


class SaveGraphDB(Resource):
    def post(self):
        client = MongoClient('mongodb://localhost:27017/', connect=False)
        db = client.graphDB
        collection = db.documentCollection
        data = request.get_json(force=True)
        graph = data['gml_data']
        graph["_id"] = graph['graph']['label']
        try:
            graph_id = collection.insert_one(graph).inserted_id
        except:
            graph_id = "error"
        return graph_id


api.add_resource(Converter, '/converter')
api.add_resource(SaveGraphDB, '/saveGraph')

if __name__ == '__main__':
    app.run(debug=True)
