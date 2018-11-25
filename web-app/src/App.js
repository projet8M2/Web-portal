import React, { Component } from "react";
import "./App.css";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
import NetworkGraph from "./NetworkGraph.jsx";
import ButtonList from "./ButtonList.jsx";
class App extends Component {
  state = {
    // Set initial files
    file: "",
    jsonObject: {},
    showNetwork: false,
    data: {},
    open: false,
    message: "",
    savedGraphs: []
  };

  closeModal = () => {
    this.setState({ open: false });
  };
  callGmlToJson = file => {
    axios
      .post(`http://127.0.0.1:5000/converter`, { gml_data: file })
      //.post("http://ee7b905d.ngrok.io/converter", { gml_data: filePath })
      .then(res => {
        this.clearNetwork();
        var jsonData = JSON.parse(res.data);
        var dataCopy = {
          nodes: JSON.parse(res.data).nodes,
          links: [],
          label: jsonData.graph.label
        };
        jsonData.links.forEach(element =>
          dataCopy.links.push({
            source: jsonData.nodes[element.source].id,
            target: jsonData.nodes[element.target].id,
            LinkLabel: element.LinkLabel,
            LinkNote: element.LinkNote,
            LinkType: element.LinkType
          })
        );
        this.setState({
          jsonObject: jsonData,
          showNetwork: true,
          data: dataCopy
        });
      });
  };
  componentDidMount() {
    axios.get("http://127.0.0.1:5000/getgraphlist").then(res => {
      res.data.forEach(graph => {
        this.setState((state, props) => ({
          savedGraphs: [...state.savedGraphs, graph.graph.label]
        }));
      });
    });
  }
  clearNetwork = file => {
    this.setState({ showNetwork: false, data: {} });
  };
  onClickNode = node => {
    var json_data = this.state.data.nodes.filter(dataNode => dataNode.id === node);
    this.setState({ open: true, message: json_data[0] });
  };
  onClickLink = (source, target) => {
    var json_data = this.state.data.links.filter(dataLink => dataLink.source === source && dataLink.target === target);
    this.setState({ open: true, message: json_data[0] });
    console.log('TEST' + JSON.stringify(json_data[0], null, 4))
  };
  onClickButton = event => {
    axios
      .post(`http://127.0.0.1:5000/saveGraph`, {
        gml_data: this.state.jsonObject
      })
      .then(res => console.log(res.data));
  };
  getSavedGraph = fileName => {
    axios
      .post("http://127.0.0.1:5000/getsavedgraph", { gml_data: fileName })
      .then(res => {
        this.clearNetwork();
        var json_data = res.data[0];
        var dataCopy = {
          nodes: json_data.nodes,
          links: [],
          label: json_data.graph.label
        };
        json_data.links.forEach(element =>
          dataCopy.links.push({
            source: json_data.nodes[element.source].id,
            target: json_data.nodes[element.target].id,
            LinkLabel: element.LinkLabel,
            LinkNote: element.LinkNote,
            LinkType: element.LinkType
          })
        );
        this.setState({
          jsonObject: json_data,
          showNetwork: true,
          data: dataCopy
        });
      });
  };
  render() {
    if (this.state.open) {
      var rows = [];
      Object.keys(this.state.message).map(k => {
        rows.push(
          <tr>
            <th>{k}</th>
            <td>{this.state.message[k]}</td>
          </tr>);
      })
      var controlledPopup = (
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <table class="table">
            <tbody>
              {rows}
            </tbody>
          </table>
        </Popup>
      );
    }
    if (this.state.savedGraphs.length !== 0) {
      var listDiv = (
        <div className="col col-lg-2">
          <div className="list-group">
            <ButtonList
              saveGraph={this.state.savedGraphs}
              click={this.getSavedGraph}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="row">
          {listDiv}

          <div
            className={
              this.state.savedGraphs === undefined ||
                this.state.savedGraphs.length === 0
                ? "col"
                : "col-10"
            }
          >
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
            />
            {this.state.showNetwork === true ? (
              <NetworkGraph
                data={this.state.data}
                onClickNode={this.onClickNode}
                onClickLink={this.onClickLink}
                onClickButton={this.onClickButton}
              />
            ) : null}

            {controlledPopup}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
