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
        <button onClick={this.props.onClickButton}>Enregistrer</button>
      </div>
    );
  }
}

export default NetworkGraph;
