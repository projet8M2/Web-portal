import React, { Component } from "react";
import "./App.css";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Graph } from "react-d3-graph";

class App extends Component {
  state = {
    // Set initial files
    file: "",
    jsonObject: {},
    showNetwork: false,
    data: {}
  };

  callGmlToJson = file => {
    var filePath = "rest-api/uploadedFiles/" + file;
    axios
      .post(`http://127.0.0.1:5000/converter`, { gml_data: filePath })
      .then(res => {
        var jsonData = JSON.parse(res.data);
        var dataCopy = {
          nodes: JSON.parse(res.data).nodes,
          links: []
        };

        jsonData.adjacency.map((edges, id) =>
          edges
            .filter(edge => edge.id !== edges[0].id)
            .map((edge, index) =>
              dataCopy.links.push({ source: edges[0].id, target: edge.id })
            )
        );
        dataCopy.links = dataCopy.links.filter(function(elem, index, self) {
          return index === self.indexOf(elem);
        });
        console.log(dataCopy);
        this.setState({
          jsonObject: JSON.parse(res.data),
          showNetwork: true,
          data: dataCopy
        });
      });
  };
  decorator = props => {
    return (
      <button onClick={() => console.log(`You clicked ${props.label}`)}>
        Click Me
      </button>
    );
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
        />
      );
    }
  }

  render() {
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
              file: fileItem.file.name
            })
          }
          onprocessfile={(error, file) => {
            this.callGmlToJson(this.state.file);
          }}
        />

        {this.state.showNetwork === true ? this.renderNetwork() : null}
      </div>
    );
  }
}

export default App;
