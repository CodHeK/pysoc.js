import React, { Component } from 'react';
import { DB_CONFIG } from './Config/config';
import firebase from 'firebase/app';
import 'firebase/database';
import gsoc_logo from './imgs/gsoc.png';
import OrgCard from './OrgCard';
import Loader from 'react-loader';

class App extends Component {
  constructor(props) {
    super(props);
    this.app = firebase.initializeApp(DB_CONFIG);
    this.database = this.app.database().ref().child('orgs');
    this.state = {
      keyword: '',
      orgs_data: [],
      filtered: [],
      loaded: false,
    }
  }

  componentDidMount() {
    let { orgs_data } = this.state;
    let temp = [];
    this.database.on('child_added', snap => {
      let data = {
        id: snap.key,
        year: snap.val().year,
        org_name: snap.val().org_name,
        org_def: snap.val().org_def,
        org_link: snap.val().org_link,
        org_tech_list: snap.val().org_tech_list,
        org_selections: snap.val().org_selections
      }
      if(data.org_name.indexOf("AOSSIE") != -1) {
        data.org_name = "AOSSIE";
      }
      temp.push(data);
    })
    this.setState({ orgs_data: temp, loaded: true });
  }

  keyword(e) {
    let { orgs_data } = this.state;
    var keyword = e.target.value;
    let filtered = [];
    for(let org of orgs_data) {
      for(let tech of org.org_tech_list) {
        if(tech.toLowerCase() == keyword.toLowerCase()) {
          filtered.push(org);
        }
      }
      if(String(org.org_name.toLowerCase()).match(keyword.toLowerCase()) || String(org.year).match(keyword)) {
        filtered.push(org);
      }
    }
    this.setState({ keyword: e.target.value, filtered: filtered })
  }


  render() {
    let { filtered } = this.state;
    const filtered_orgs = filtered.map(org => <OrgCard org={org} />)
    return (
      <div className="container">
        <div className="main">
          <div className="row form_part">
            <div className="col-md-3">
              <h3 className="title">PYSOC.JS</h3>
            </div>
            <div className="col-md-9">
              <input placeholder="Search for any keyword ( org_name / year / technology )" className="search_bar form-control" onChange={this.keyword.bind(this)}/>
            </div>
          </div>
        </div>
        <Loader loaded={this.state.loaded}>
          <div className="filtered">
            {filtered_orgs}
          </div>
        </Loader>
      </div>
    );
  }
}

export default App;
