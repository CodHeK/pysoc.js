import React, { Component } from 'react';
import { DB_CONFIG } from './Config/config';
import firebase from 'firebase/app';
import 'firebase/database';
import gsoc_logo from './imgs/gsoc.png';
import OrgCard from './OrgCard';
import Loader from 'react-loader';
import Fuse from 'fuse.js';
import $ from 'jquery';

var Spinner = require('react-spinkit');

class App extends Component {
  constructor(props) {
    super(props);
    this.app = firebase.initializeApp(DB_CONFIG);
    this.database = this.app.database().ref().child('orgs');
    this.state = {
      keyword: '',
      orgs_data: [],
      orgs_data_copy: [],
      filtered: [],
      loaded: false,
      match: [],
      map: null,
    }
  }

  componentDidMount() {
    let { orgs_data } = this.state;
    let temp = [], temp_copy = [];
    var map = new Map();
    this.database.on('child_added', snap => {
      let data = {
        id: snap.key,
        year: snap.val().year,
        org_name: snap.val().org_name,
        org_def: snap.val().org_def,
        org_link: snap.val().org_link,
        org_tech_list: snap.val().org_tech_list,
        org_selections: snap.val().org_selections
      };
      if(data.org_name.indexOf("AOSSIE") != -1) {
        data.org_name = "AOSSIE";
      }
      let data_copy = {
        id: snap.key,
        year: snap.val().year,
        org_name: snap.val().org_name,
        org_def: snap.val().org_def,
        org_link: snap.val().org_link,
        org_tech_list: snap.val().org_tech_list,
        org_selections: snap.val().org_selections
      };
      if(map.has(data_copy.org_name)) {
        var obj = map.get(data_copy.org_name);
        var year_list = obj.year;
        obj.total_selections += data_copy.org_selections;
        year_list.push(data_copy.year);
      }
      else {
        var obj = {
          org_info: data_copy,
          year: [],
          total_selections: 0,
        }
        obj.year.push(data_copy.year);
        obj.total_selections += data_copy.org_selections;
        map.set(data_copy.org_name, obj);
      }
      temp.push(data);
      temp_copy.push(data_copy);
    });
    setTimeout(() => {
      this.setState({ orgs_data: temp, loaded: true, filtered: temp,  map, orgs_data_copy: temp_copy });
    }, 3000);
    setTimeout(() => {
      $(".main").fadeIn(1000);
    }, 3500);
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
    else if(option == 3) {
      this.searchAgain("2018", "on_filtered");
    }
    else if(option == 4) {
      this.searchAgain("2017", "on_filtered");
    }
    else if(option == 5) {
      this.searchAgain("2016", "on_filtered");
    }
    else if(option == 6) {
      let { map } = this.state;
      let filtered = [];
      map.forEach(function(value, key, map) {
        var years = value.year;
        value.org_info.org_tech_list = years;
        value.org_info.year = "";
        value.org_info.org_selections = value.total_selections;
        filtered.push(value.org_info);
      });
      this.setState({ filtered, });
    }
    else if(option == 7) {
      this.searchAgain("all", "on_total");
    }
  }

  searchAgain(param, data) {
    let { orgs_data, orgs_data_copy } = this.state;
    if(data == "on_filtered")
      orgs_data = this.state.filtered;
    if(param == "all" && data == "on_total") {
      console.log(orgs_data);
      this.setState({ filtered: orgs_data });
      return;
    }
    var keywords = param;
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
    this.setState({ keyword: param, filtered: filtered, match, })
  }

  search(name, e) {
    console.log(name);
    var inputVal = document.getElementById("user-input");
    inputVal.value = name;
    this.searchAgain(name, "on_total");
  }

  render() {
    let { filtered, loaded, keyword, match } = this.state;
    let filtered_orgs;
    console.log(loaded);
    if(loaded == true) {
        filtered_orgs = filtered.map(org => <OrgCard org={org} />);
    }
    else {
        filtered_orgs = <h4 className="num"><b style={{ letterSpacing: '0.5px' }}>Loading Scraped Data ...</b></h4>;
    }
    if(filtered.length > 0) {
      var result = <h4 className="num"><b style={{ letterSpacing: '0.5px' }}>{filtered_orgs.length}</b> results fetched ...</h4>;
    }
    else if(filtered.length == 0 && keyword.length > 0) {
      var result = <h4 className="num"><b style={{ letterSpacing: '0.5px' }}>Uh oh!</b>, couldnt find any results ! <hr/> Did you mean:&nbsp;&nbsp; <b><a className="sugg" onClick={this.search.bind(this, match[0].org_name)}>{match[0].org_name}</a></b> or <b><a className="sugg" onClick={this.search.bind(this, match[1].org_name)}>{match[1].org_name}</a></b> </h4>;
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
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 3)}>2018</a></li>
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 4)}>2017</a></li>
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 5)}>2016</a></li>
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 6)}>ORG SELECTIONS</a></li>
                  <li role="separator" class="divider"></li>
                  <li><a href="#" className="item" onClick={this.filter.bind(this, 7)}>VIEW ALL ORGS</a></li>
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
