import { Graph } from "react-d3-graph";
import React, { Component } from "react";
import "bootstrap3/dist/css/bootstrap.min.css";

class NetworkGraph extends Component {
  render() {
    const myConfig = {
      width: 920,
      height: 500,
      directed: false,
      nodeHighlightBehavior: false,
      node: {
        color: "lightgreen",
        size: 120,
        highlightFontWeight: "bold"
      },
      link: {
        highlightColor: "lightgreen",
        strokeWidth: 1.5,
        mouseCursor: "pointer",
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
      <div class ="graph">
        <Graph ref="graph" {...graphProps} />
        {path}
        <div className="col-12 text-center actions">
          <button
            className="btn btn-success"
            onClick={() => this.props.onClickButton("Enregistrer Graphe")}
          >
          <span class="glyphicon glyphicon-saved" aria-hidden="true"></span>
            Enregistrer Graphe
          </button>
          &nbsp;
          <button
            className="btn btn-danger"
            onClick={() => this.props.onClickButton("Effacer Graphe")}
          >
          <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> 
            Effacer Graphe
          </button>
          &nbsp;
          <button
            className="btn btn-info"
            onClick={() => this.props.onClickButton("Charger Service")}
          >
          <span class="glyphicon glyphicon-plus" aria-hidden="true"></span> 
            Charger Service
          </button>
          &nbsp;
          <button
            className="btn btn-info"
            onClick={() => this.props.onClickButton("Calculer Latence")}
          >
          <span class="glyphicon glyphicon-plus" aria-hidden="true"></span> 
            Calculer Latence
          </button>
        </div>
      </div>
    );
  }
}

export default NetworkGraph;
