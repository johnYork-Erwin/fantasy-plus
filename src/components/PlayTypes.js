import React from 'react';
var d3 = require('d3');

class PlayTypes extends React.Component {
  constructor(props) {
    super(props);
    this.createData = this.createData.bind(this)
    this.graph = this.graph.bind(this)
  }

  componentDidUpdate() {
    const data = this.createData();
    this.graph(data);
  }

  componentDidMount() {
    const data = this.createData();
    this.graph(data);
  }

  createData() {
    const retVal = [];
    let passing = {}
    passing.key = 'Passing';
    let rushing = {};
    rushing.key = 'Rushing';
    if (this.props.playTypesValue === 'Season') {
      rushing.value = this.props.playersTeam.stats.seasonStats.rushing.attempts;
      passing.value = this.props.playersTeam.stats.seasonStats.passing.attempts;
    } else {
      rushing.value = this.props.playersTeam.stats.games[this.props.playTypesValue].rushing.attempts;
      passing.value = this.props.playersTeam.stats.games[this.props.playTypesValue].passing.attempts;
    }
    retVal.push(passing);
    retVal.push(rushing);
    return retVal;
  }

  graph(data) {
    var svg = d3.select("#PlayTypes"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height)/2 - 20;

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
      <svg id="PlayTypes" width="300" height="300"> </svg>
    )
  }
}

export default PlayTypes;
