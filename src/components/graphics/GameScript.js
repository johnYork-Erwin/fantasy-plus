import React from 'react';
var d3 = require('d3');

class GameScript extends React.Component {
  constructor(props) {
    super(props);
    this.graph = this.graph.bind(this);
    this.cleanData = this.cleanData.bind(this)
  }

  componentDidMount() {
    let data = this.cleanData();
    this.graph(data);
  }

  componentDidUpdate(nextProps) {
    if (this.props.currentTeam.id !== nextProps.currentTeam.id || this.props.currentWeek !== nextProps.currentWeek) {
      let data = this.cleanData();
      this.graph(data);
    }
  }

  cleanData() {
    let data = this.props.script
    data.unshift([3600,0,0]);
    let perspective = this.props.currentTeam.stats.games[this.props.currentWeek].home;
    let retVal = [];
    let down15 = 0;
    let up15 = 0;
    let evenish = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i-1][1] - data[i-1][2] >= 15) {
        up15 += (data[i-1][0] - data[i][0]);
      } else if (data[i-1][1] - data[i-1][2] <= -15) {
        down15 += (data[i-1][0] - data[i][0]);
      } else {
        evenish += (data[i-1][0] - data[i][0]);
      }
    }
    if (!perspective) {
      if (up15 !== 0) {
        retVal.push({
          key: 'down by 15',
          value: up15,
        })
      }
      if (down15 !== 0) {
        retVal.push({
          key: 'up by 15',
          value: down15,
        })
      }
    } else {
      if (up15 !== 0) {
        retVal.push({
          key: 'up by 15',
          value: up15,
        })
      }
      if (down15 !== 0) {
        retVal.push({
          key: 'down by 15',
          value: down15,
        })
      }
    }
    retVal.push({
      key: 'evenish',
      value: evenish,
    })
    return retVal;
  }

  graph(data) {
    let clear = d3.select("#GameScript")
    clear.selectAll("*").remove();
    var svg = d3.select("#GameScript"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height)/2 - 30;
    var g = svg.append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);
    var pie = d3.pie().value(function(d) {
          return d.value;
        });
    var path = d3.arc()
       .outerRadius(radius - 10)
       .innerRadius(0);
    var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius - 80);
    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");
    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return color(d.data.key); });
    arc.append("text")
        .attr("transform", function(d) {
                 return "translate(" + label.centroid(d) + ")";
         })
        .text(function(d) { return d.data.key; });
    svg.append("g")
        .attr("transform", "translate(" + (width / 2 - 120) + "," + 20 + ")")
        .append("text")
        .attr("class", "title")
  }

  render() {
    return (
      <svg id="GameScript" width="300" height="300"> </svg>

    )
  }
}

export default GameScript;
