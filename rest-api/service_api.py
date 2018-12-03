from flask import Flask, jsonify, request, render_template, flash, redirect, url_for
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import networkx as nx
from networkx.readwrite import json_graph
import json
import os
import os.path
from pymongo import MongoClient
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
        result =  "error" 
    return json.dumps(result, ensure_ascii=False)


class Converter(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        graphe = nx.read_gml(os.path.join(os.path.abspath(
            app.config['UPLOAD_FOLDER']), json_data['gml_data']))
        # create a dictionary in a node-link format that is suitable for JSON serialization
        nx.set_edge_attributes(graphe,"bandwith", 50)
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
