import React, { Component } from "react";
import { Graph } from "react-d3-graph";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap3/dist/css/bootstrap.min.css";
import Popup from "reactjs-popup";
import { Modal, Button } from "react-bootstrap";
class ServiceGraph extends Component {
  render() {
    const myConfig = {
      width: 600,
      height: 200,
      directed: true,
      nodeHighlightBehavior: false,
      node: {
        color: "lightgreen",
        size: 120,
        highlightStrokeColor: "blue"
      },
      link: {
        highlightColor: "lightblue"
      }
    };

    if (this.props.show !== false) {
      const data = this.props.data;
      const graphProps = {
        id: data.label,
        data,
        config: myConfig,
        onClickNode: this.props.onClickNode,
        onClickLink: this.props.onClickLink
      };
      var graph = (
        <div className="row h-20 justify-content-md-center">
          <div className="col-4">
            <hr />
            <Graph ref="graph" {...graphProps} />
          </div>
        </div>
      );
    }
    if (this.props.showTable === true) {
      var rows = [];
      Object.keys(this.props.message).map(k => {
        rows.push(
          <tr>
            <th>{k}</th>
            <td>{this.props.message[k]}</td>
          </tr>
        );
      });
      var table = (
        <div className="row justify-content-md-center">
          <hr />
          <table className="table">
            <tbody>{rows}</tbody>
          </table>
        </div>
      );
    }
    return (
      <Modal show={this.props.open} onHide={this.props.closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Charger Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FilePond
            allowMultiple={false}
            labelIdle='Glissez et déposez votre fichier GML ou <span class="filepond--label-action"> recherchez sur votre ordinateur </span>'
            server={{
              process: "http://127.0.0.1:5000/uploadedFiles",
              fetch: null,
              revert: null
            }}
            onprocessfile={(error, file) =>
              this.props.serverProcess(file.filename, true)
            }
          />

          {graph}
          {table}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ServiceGraph;
