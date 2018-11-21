import React, { Component } from "react";
class ButtonList extends Component {
  render() {
    return (
      <div>
        {console.log(this.props.saveGraph)}
        {this.props.saveGraph.map(label => (
          <button
            type="button"
            className="list-group-item list-group-item-action"
            onClick={()=>this.props.click(label)}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }
}

export default ButtonList;
