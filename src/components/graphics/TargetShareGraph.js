import React from 'react';
var d3 = require('d3');

class TargetShareGraph extends React.Component {
  constructor(props) {
    super(props);
    this.createData = this.createData.bind(this)
    this.graph = this.graph.bind(this)
  }

  createData() {
    let type;
    let outOf;
    let playerType = this.props.currentPlayer.position;
    switch(playerType) {
      case 'QB':
        type = 'passAttempts';
        outOf = 'passing';
        break;
      case 'WR':
        type = 'recTargets';
        outOf = 'passing';
        break;
      case 'TE':
        type = 'recTargets';
        outOf = 'passing';
        break;
      case 'RB':
        type = 'rushAttempts';
        outOf = 'rushing';
        break;
      default:
        type = 'Tricky to';
        outOf = 'rocka rhyme';
        break;
    }
    let retVal = [];
    for (let key in this.props.currentPlayer.stats.games) {
      let obj = {};
      obj.x = Number(key)
      obj.y = this.props.currentPlayer.stats.games[key][type]/this.props.playersTeam.stats.games[key][outOf].attempts
      retVal.push(obj)
    }
    return retVal;
  }

  graph() {
    let clear = d3.select("#TargetShare");
    clear.selectAll("*").remove();
    let lineData = this.createData();
    var vis = d3.select('#TargetShare'),
      WIDTH = 500,
      HEIGHT = 200,
      MARGINS = {
        top: 20,
        right: 30,
        bottom: 20,
        left: 30
      },
      xRange = d3.scaleLinear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
        return d.x;
      }), d3.max(lineData, function(d) {
        return d.x;
      })]),
      yRange = d3.scaleLinear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0, 1])
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

  componentDidUpdate(nextProps) {
    if (this.props.currentPlayer.id !== nextProps.currentPlayer.id || this.props.playersTeam.id !== nextProps.playersTeam.id) {
      this.graph();
    }
  }

  componentDidMount() {
    this.graph();
  }

  render() {
    return (
      <svg id="TargetShare" width="500" height="200"> </svg>
    )
  }
}

export default TargetShareGraph;
