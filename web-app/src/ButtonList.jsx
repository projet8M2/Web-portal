import React, { Component } from "react";
class ButtonList extends Component {
  render() {
    return (
      <div className="col col-lg-2">
        <div className="list-group">
          {this.props.saveGraph.map(label => (
            <button
              key={label}
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => this.props.click(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default ButtonList;
