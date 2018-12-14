import React, { Component } from 'react';
import { DB_CONFIG } from './Config/config';
import firebase from 'firebase/app';
import 'firebase/database';
import gsoc_logo from './imgs/gsoc.png';
import OrgCard from './OrgCard';
import Loader from 'react-loader';
import Fuse from 'fuse.js';

var Spinner = require('react-spinkit');

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
      match: [],
    }
  }

  componentWillMount() {
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

    this.setState({ orgs_data: temp, loaded: true, filtered: temp, });
  }

  check(org, keyword) {
    var f1 = 0, f2 = 0;
    for(let tech of org.org_tech_list) {
      tech = tech.split("/");
      for(let t of tech) {
        if(t.toLowerCase() == keyword.toLowerCase()) {
          f1 = 1;
          break;
        }
      }
    }
    if(String(org.org_name.toLowerCase()).match(keyword.toLowerCase()) || String(org.year).match(keyword)) {
      f2 = 1;
    }
    if(f1 == 1 || f2 == 1)
      return true;
    return false;
  }

  calc_corr(keyword) {
    let { orgs_data } = this.state;
    var options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "org_name",
        "year"
      ]
    };
    var fuse = new Fuse(orgs_data, options);
    return fuse.search(keyword);
  }

  keyword(e) {
    let { orgs_data } = this.state;
    var keywords = e.target.value;
    keywords = keywords.split(",");
    var best_match = this.calc_corr(keywords[0]);
    console.log(best_match);
    let filtered = [];
    if(keywords.length != 0) {
      for(let org of orgs_data) {
        let flag = 1;
        for(let keyword of keywords) {
          if(this.check(org, keyword.trim()) === true) {
            continue;
          }
          else {
            flag = 0;
            break;
          }
        }
        if(flag === 1) {
          filtered.push(org);
        }
      }
    }
    else {
      filtered = orgs_data;
    }
    if(filtered.length === 0) {
      var match = [];
      match.push(best_match[0]);
      match.push(best_match[1]);
      console.log(match);
    }
    this.setState({ keyword: e.target.value, filtered: filtered, match, })
  }

  filter(option, e) {
    let orgs_data = this.state.filtered;
    if(option == 1) {
      orgs_data.sort((a, b) => {
        return (b.org_selections-a.org_selections);
      });
      this.setState({ filtered: orgs_data });
    }
    else if(option == 2) {
      orgs_data.sort((a, b) => {
        return (a.org_selections-b.org_selections);
      });
      this.setState({ filtered: orgs_data });
    }
  }

  render() {
    let { filtered, loaded, keyword, match } = this.state;
    let filtered_orgs;
    if(loaded === true) {
        filtered_orgs = filtered.map(org => <OrgCard org={org} />);
    }
    else {
        filtered_orgs = <Spinner name='double-bounce' />;
    }
    if(filtered.length > 0) {
      var result = <h4 className="num"><b style={{ letterSpacing: '0.5px' }}>{filtered_orgs.length}</b> results fetched ...</h4>;
    }
    else if(filtered.length == 0 && keyword.length > 0) {
      var result = <h4 className="num"><b style={{ letterSpacing: '0.5px' }}>Uh oh!</b>, couldnt find any results ! <br/> Did you mean: <b>{match[0].org_name}</b> or <b>{match[1].org_name}</b> </h4>;
    }
    return (
      <div className="container">
        <div className="main">
          <div className="row form_part">
            <div className="col-md-3">
              <h3 className="title">PYSOC.JS</h3>
            </div>
            <div className="col-md-7" id="input-wrapper">
              <input placeholder="Search : ( org_name / year / technology )" id="user-input" className="search_bar form-control" onChange={this.keyword.bind(this)} />
              <span className="note"><i>* more than one search params must be comma separated</i></span>
            </div>
            <div className="col-md-2">
              <div className="btn-group">
                <button type="button" className="btn btn-default dropdown-toggle filter" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  FILTER &nbsp;&nbsp;<span className="caret"></span>
                </button>
                <ul className="dropdown-menu">
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 1)}>highest selections</a></li>
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 2)}>lowest selections</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="filtered">
          {result}
          {filtered_orgs}
        </div>
      </div>
    );
  }
}

export default App;
