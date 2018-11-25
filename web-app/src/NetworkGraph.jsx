import { Graph } from "react-d3-graph";
import React, { Component } from "react";

class NetworkGraph extends Component {
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
    const data = this.props.data;

    const graphProps = {
      id: data.label,
      data,
      config: myConfig,
      onClickNode: this.props.onClickNode,
      onClickLink: this.props.onClickLink
    };
    return (
      <div>
        <Graph ref="graph" {...graphProps} />
        <div className="align-self-center">
          <button
            className="btn btn-outline-success"
            onClick={() => this.props.onClickButton("Enregistrer Graphe")}
          >
            Enregistrer Graphe
          </button>
          &nbsp;
          <button
            className="btn btn-outline-success"
            onClick={() => this.props.onClickButton("Effacer Graphe")}
          >
            Effacer Graphe
          </button>
          &nbsp;
          <button
            className="btn btn-outline-success"
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
