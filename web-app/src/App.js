import React, { Component } from "react";
import "./App.css";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Graph } from "react-d3-graph";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
class App extends Component {
  state = {
    // Set initial files
    file: "",
    jsonObject: {},
    showNetwork: false,
    data: {},
    open: false,
    message: ""
  };

  closeModal = () => {
    this.setState({ open: false });
  };
  callGmlToJson = file => {
    var filePath = "rest-api/uploadedFiles/" + file;
    axios
      .post(`http://127.0.0.1:5000/converter`, { gml_data: filePath })
      //.post("http://ee7b905d.ngrok.io/converter", { gml_data: filePath })
      .then(res => {
        var jsonData = JSON.parse(res.data);
        var dataCopy = {
          nodes: JSON.parse(res.data).nodes,
          links: []
        };
        console.log(jsonData.adjacency);
        jsonData.adjacency.map((edges, id) =>
          edges
            .filter(edge => edge.id !== edges[0].id)
            .map((edge, index) =>
              dataCopy.links.push({
                source: edges[0].id,
                target: edge.id,
                LinkLabel: edge.LinkLabel,
                LinkNote: edge.LinkNote,
                LinkType: edge.LinkType
              })
            )
        );

        console.log(dataCopy);
        this.setState({
          jsonObject: JSON.parse(res.data),
          showNetwork: true,
          data: dataCopy
        });
      });
  };

  renderNetwork() {
    const myConfig = {
      width: 950,
      heigth: 2000,
      nodeHighlightBehavior: true,
      node: {
        color: "lightgreen",
        size: 120,
        highlightStrokeColor: "blue"
      },
      link: {
        highlightColor: "lightblue"
      }
    };
    if (this.state.data.lenght !== 0) {
      return (
        <Graph
          id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
          data={this.state.data}
          config={myConfig}
          onClickNode={this.onClickNode}
          onClickLink={this.onClickLink}
        />
      );
    }
  }
  clearNetwork = file => {
    this.setState({ showNetwork: false, data: {} });
  };
  onClickNode = node => {
    console.log(this.state.open);
    var json_data = JSON.stringify(
      this.state.data.nodes.filter(dataNode => dataNode.id === node)
    );
    this.setState({ open: true, message: json_data });
  };
  onClickLink = (source, target) => {
    console.log(source, target);
    var json_data = JSON.stringify(
      this.state.data.links.filter(
        dataLink => dataLink.source === source && dataLink.target === target
      )
    );
    this.setState({ open: true, message: json_data });
  };
  render() {
    if (this.state.open === true) {
      var controlledPopup = (
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          {this.state.message}
        </Popup>
      );
    }

    return (
      <div className="container">
        <FilePond
          allowMultiple={false}
          ref={ref => (this.pond = ref)}
          server={{
            process: "http://127.0.0.1:5000/uploadedFiles",
            fetch: null,
            revert: null
          }}
          onaddfilestart={fileItem =>
            this.setState({
              file: fileItem.file.name,
              jsonObject: {}
            })
          }
          onprocessfile={(error, file) => {
            this.callGmlToJson(this.state.file);
          }}
          onremovefile={this.clearNetwork}
        />
        {this.state.showNetwork === true ? this.renderNetwork() : null}
        {controlledPopup}
      </div>
    );
  }
}

export default App;
