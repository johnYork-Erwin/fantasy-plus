import React from 'react';
var d3 = require('d3');

class FantasyPointsGraph extends React.Component {
  constructor(props) {
    super(props);
    this.cleanPlayer = this.cleanPlayer.bind(this)
  }

  cleanPlayer() {
    let retVal = [];
    for (let key in this.props.currentPlayer.stats.games) {
      let obj = {};
      obj.x = Number(key)
      obj.y = Number(this.props.currentPlayer.stats.games[key].totalPoints.toFixed(1));
      retVal.push(obj)
    }
    return retVal;
  }

  componentDidMount() {
    let lineData = this.cleanPlayer();
    var vis = d3.select('#FantasyPoints'),
    WIDTH = 500,
    HEIGHT = 200,
    MARGINS = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    xRange = d3.scaleLinear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
      return d.x;
    }), d3.max(lineData, function(d) {
      return d.x;
    })]),
    yRange = d3.scaleLinear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function(d) {
      return d.y;
    }), d3.max(lineData, function(d) {
      return d.y;
    })])
    let xAxis = d3.axisBottom(xRange)
    let yAxis = d3.axisLeft(yRange)

    vis.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
      .call(xAxis.ticks(lineData.length));

    vis.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
      .call(yAxis.ticks(5));

    var lineFunc = d3.line()
      .x(function(d) {
        return xRange(d.x);
      })
      .y(function(d) {
        return yRange(d.y);
      });

    vis.append('svg:path')
      .attr('d', lineFunc(lineData))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  }

  render() {
    return (
      <svg id="FantasyPoints" width="500" height="200"> </svg>
    )
  }
}

export default FantasyPointsGraph;
