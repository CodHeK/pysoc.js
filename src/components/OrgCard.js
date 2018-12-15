import React, { Component } from 'react';

class OrgCard extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    let { org } = this.props;
    let techs = org.org_tech_list;
    let tech_box = techs.map(tech => <div className="tech_box">{tech}</div>);
    return (
      <a href={org.org_link} className="org_link">
        <div className="org_card col-md-3">
          <div className="content">
            <div className="year_cont"><span className="year">{org.year}</span></div>
            <h3 className="name">{org.org_name}</h3>
            <h5 className="desp">{org.org_def}</h5>
            <div className="techs">
              {tech_box}
            </div>
            <div className="selections">
              <div className="row">
                <div className="col-md-9">
                  <h4 className="title" style={{ paddingTop: '0.5em' }}>SELECTIONS</h4>
                </div>
                <div className="col-md-3">
                  <h4 className="selects">{org.org_selections}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    );
  }
}

export default OrgCard;
