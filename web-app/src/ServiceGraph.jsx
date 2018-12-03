import React, { Component } from "react";
import { Graph } from "react-d3-graph";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Popup from "reactjs-popup";
class ServiceGraph extends Component {
  render() {
    const myConfig = {
      width: 920,
      heigth: 1000,
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

    return (
      <div>
        <Popup
          open={this.props.open}
          closeOnDocumentClick
          onClose={this.props.closeModal}
        >
          <FilePond
            allowMultiple={false}
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
        </Popup>
      </div>
    );
  }
}

export default ServiceGraph;
