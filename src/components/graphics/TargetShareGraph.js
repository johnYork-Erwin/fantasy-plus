import React from 'react';
var d3 = require('d3');

class TargetShareGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPlayer: this.props.currentPlayer,
      playersTeam: this.props.playersTeam,
    }
    this.createData = this.createData.bind(this)
  }

  createData() {
    let type;
    let outOf;
    let playerType = this.state.currentPlayer.position;
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
        type = 'Tricking the tracker';
        outOf = 'rocka rhyme';
        break;
    }
    let retVal = [];
    for (let key in this.props.currentPlayer.stats.games) {
      let obj = {};
      obj.x = Number(key)
      obj.y = this.state.currentPlayer.stats.games[key][type]/this.state.playersTeam.stats.games[key][outOf].attempts;
      retVal.push(obj)
    }
    return retVal;
  }

  componentDidMount() {
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
      <svg id="TargetShare" width="500" height="200"> </svg>
    )
  }
}

export default TargetShareGraph;
