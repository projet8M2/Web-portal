import { Graph } from "react-d3-graph";
import React, { Component } from "react";
import "bootstrap3/dist/css/bootstrap.min.css";

class NetworkGraph extends Component {
  render() {
    const myConfig = {
      width: 920,
      height: 500,
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

    const data = this.props.data;

    const graphProps = {
      id: data.label,
      data,
      config: myConfig,
      onClickNode: this.props.onClickNode,
      onClickLink: this.props.onClickLink
    };
    if (this.props.path.length > 0) {
      var path = (
        <div>
          <h3>Chemin le plus court</h3>
          <span />
          <p className="lead">{this.props.path}</p>
        </div>
      );
    }
    return (
      <div>
        <Graph ref="graph" {...graphProps} />
        {path}
        <div className="col-12 text-center">
          <button
            className="btn btn-primary"
            onClick={() => this.props.onClickButton("Enregistrer Graphe")}
          >
            Enregistrer Graphe
          </button>
          &nbsp;
          <button
            className="btn btn-primary"
            onClick={() => this.props.onClickButton("Effacer Graphe")}
          >
            Effacer Graphe
          </button>
          &nbsp;
          <button
            className="btn btn-primary"
            onClick={() => this.props.onClickButton("Charger Service")}
          >
            Charger Service
          </button>
        </div>
      </div>
    );
  }
}

export default NetworkGraph;
