import React, { Component } from "react";
import "./App.css";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap3/dist/css/bootstrap.min.css";
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
    savedGraphs: [],
    service_data: {},
    showServiceP: false,
    showService: false,
    stringPath: ""
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
    this.setState({
      open: false,
      openServicePopup: false,
      showService: false,
      showServiceP: false
    });
  };

  callGmlToJson = (file, service) => {
    axios
      .post(`http://127.0.0.1:5000/converter`, {
        gml_data: file,
        service: service
      })
      //.post("http://ee7b905d.ngrok.io/converter", { gml_data: filePath })
      .then(res => {
        var jsonData = JSON.parse(res.data);
        var dataCopy = {
          nodes: JSON.parse(res.data).nodes,
          links: [],
          label: jsonData.graph.label
        };
        jsonData.links.forEach(element => {
          dataCopy.links.push(element);
        });
        if (service === false) {
          this.clearNetwork();
          this.setState({
            jsonObject: jsonData,
            showNetwork: true,
            data: dataCopy
          });
        } else {
          this.setState({
            showService: true,
            service_data: dataCopy
          });
          this.showBestPath();
        }
      });
  };

  showBestPath() {
    axios
      .post("http://127.0.0.1:5000/shortestpath", {
        gml_data: this.state.service_data,
        graph_data: this.state.jsonObject
      })
      .then(async res => {
        var path = "";
        res.data.path.map(node => {
          if (path.length === 0) {
            path = node;
          } else {
            path += "-" + node;
          }
        });
        var jsonData = JSON.parse(res.data.graph);
        var highlighted = await this.highlightPath(res.data.path);
        var dataCopy = {
          nodes: jsonData.nodes,
          nodes: highlighted.nodes,
          links: highlighted.links,
          label: jsonData.graph.label
        };

        this.clearNetwork();
        this.setState({
          stringPath: path,
          jsonObject: jsonData,
          showNetwork: true,
          data: dataCopy
        });
      });
  }
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
    this.setState({ showNetwork: false, data: {}, stringPath: "" });
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
  };
  onClickNodeService = node => {
    var json_data = this.state.service_data.nodes.filter(
      dataNode => dataNode.id === node
    );
    this.setState({ showServiceP: true, message: json_data[0] });
  };
  onClickLinkService = (source, target) => {
    var json_data = this.state.service_data.links.filter(
      dataLink => dataLink.source === source && dataLink.target === target
    );
    this.setState({ showServiceP: true, message: json_data[0] });
  };

  onClickButton = buttonName => {
    if (buttonName === "Enregistrer Graphe") {
      axios
        .post(`http://127.0.0.1:5000/saveGraph`, {
          gml_data: this.state.jsonObject
        })
        .then(res => {
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
        json_data.links.forEach(element => {
          dataCopy.links.push(element);
        });
        this.setState({
          jsonObject: json_data,
          showNetwork: true,
          data: dataCopy
        });
      });
  };

  async highlightPath(ids) {
    var nodes = this.state.data.nodes;
    var links = this.state.data.links;
    await nodes.map(node => {
      if (ids.includes(node.id)) {
        node.color = "#1b9fe0";
      }
    })
    await links.map(link => {
      const src = ids.indexOf(link.source);
      const targ = ids.indexOf(link.target);
      if (src !== -1 && targ !== -1) {
        const ecart = Math.abs(src-targ);
        if(ecart == 1){
          link.color = "#fdbf2f";
        }
      }
    })
    this.setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        nodes: nodes,
        links: links
      }
    }));
    var res = {};
    res.nodes = nodes;
    res.links = links
    return res;
  }
  
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
          <table className="table">
            <tbody>{rows}</tbody>
          </table>
        </Popup>
      );
    }
    var servicePopup = (
      <ServiceGraph
        open={this.state.openServicePopup}
        closeModal={this.closeModal}
        server="http://127.0.0.1:5000/uploadedFiles"
        serverProcess={this.callGmlToJson}
        data={this.state.service_data}
        onClickNode={this.onClickNodeService}
        onClickLink={this.onClickLinkService}
        show={this.state.showService}
        showTable={this.state.showServiceP}
        message={this.state.message}
      />
    );

    return (
      <div className="container-fluid">
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
                : "col-md-10"
            }
          >
            <ToastContainer />
            <FilePond
              height={50}
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
                this.callGmlToJson(this.state.file, false);
              }}
            />
            {this.state.showNetwork === true ? (
              <NetworkGraph
                data={this.state.data}
                onClickNode={this.onClickNode}
                onClickLink={this.onClickLink}
                onClickButton={this.onClickButton}
                path={this.state.stringPath}
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
