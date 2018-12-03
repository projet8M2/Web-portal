import React, { Component } from "react";
import "./App.css";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "reactjs-popup";
import NetworkGraph from "./NetworkGraph.jsx";
import ButtonList from "./ButtonList.jsx";
import ServiceGraph from "./ServiceGraph";
class App extends Component {
  state = {
    // Set initial files
    file: "",
    jsonObject: {},
    showNetwork: false,
    data: {},
    open: false,
    openServicePopup: false,
    message: "",
    savedGraphs: []
  };
  success = message =>
    toast.success(message, {
      position: toast.POSITION.TOP_RIGHT
    });

  error = message => {
    toast.error(message, {
      position: toast.POSITION.TOP_RIGHT
    });
  };

  closeModal = () => {
    this.setState({ open: false, openServicePopup: false });
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
        jsonData.links.forEach(element => {
          element.source = jsonData.nodes[element.source].id;
          element.target = jsonData.nodes[element.target].id;
          dataCopy.links.push(element);
        });
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
    var json_data = this.state.data.nodes.filter(
      dataNode => dataNode.id === node
    );
    this.setState({ open: true, message: json_data[0] });
  };
  onClickLink = (source, target) => {
    var json_data = this.state.data.links.filter(
      dataLink => dataLink.source === source && dataLink.target === target
    );
    this.setState({ open: true, message: json_data[0] });
    console.log("TEST" + JSON.stringify(json_data[0], null, 4));
  };
  onClickButton = buttonName => {
    if (buttonName === "Enregistrer Graphe") {
      axios
        .post(`http://127.0.0.1:5000/saveGraph`, {
          gml_data: this.state.jsonObject
        })
        .then(res => {
          console.log(res);
          if (res.data !== "error") {
            this.setState((state, props) => ({
              savedGraphs: [
                ...state.savedGraphs,
                this.state.jsonObject.graph.label
              ]
            }));
            this.success("Votre Graphe a été enregistré avec succès");
          } else {
            this.error(
              "Votre Graphe n'a pas été enregistré, vérifiez s'il est déjà enregistré"
            );
          }
        });
    } else if (buttonName === "Effacer Graphe") {
      this.deleteGraph();
    } else if (buttonName === "Charger Service") {
      this.setState({ openServicePopup: true });
    }
  };
  deleteGraph = label => {
    axios
      .post(`http://127.0.0.1:5000/deletegraph`, {
        gml_data: this.state.jsonObject.graph.label
      })
      .then(res => {
        if (res.data.n !== 0) {
          const label_list = this.state.savedGraphs;
          const erasedGraph = this.state.jsonObject.graph.label;
          this.setState({
            savedGraphs: label_list.filter(label => label !== erasedGraph)
          });
          console.log(this.state.savedGraphs);
          this.success("Votre Graphe a été effacé avec succès!");
        } else {
          this.error(
            "Votre Graphe n'a pas été effacé, vérifiez s'il est déjà effacé"
          );
        }
      });
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
          </tr>
        );
      });
      var controlledPopup = (
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <table class="table">
            <tbody>{rows}</tbody>
          </table>
        </Popup>
      );
    }
    var servicePopup = (
      <ServiceGraph
        open={this.state.openServicePopup}
        closeModal={this.closeModal}
      />
    );
    if (this.state.savedGraphs.length !== 0) {
      var listDiv = (
        <div className="col col-lg-2">
          <ButtonList
            saveGraph={this.state.savedGraphs}
            click={this.getSavedGraph}
          />
        </div>
      );
    }

    return (
      <div className="container">
        <div className="row">
          {this.state.savedGraphs.length !== 0 && (
            <ButtonList
              saveGraph={this.state.savedGraphs}
              click={this.getSavedGraph}
            />
          )}

          <div
            className={
              this.state.savedGraphs === undefined ||
              this.state.savedGraphs.length === 0
                ? "col"
                : "col-10"
            }
          >
            <ToastContainer />
            <FilePond
              allowMultiple={false}
              ref={ref => (this.pond = ref)}
              labelIdle='Glissez et déposez votre fichier GML ou <span class="filepond--label-action"> recherchez sur votre ordinateur </span>'
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
            {servicePopup}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
