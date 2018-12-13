import React, { Component } from 'react';


class TechBox extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    let { tech } = this.props;
    return (
      <div className="tech_box">
        {props}
      </div>
    );
  }
}

export default TechBox;
