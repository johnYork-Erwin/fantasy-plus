import React from 'react';
var d3 = require('d3');

class GameScript extends React.Component {
  constructor(props) {
    super(props);
    this.cleanData = this.cleanData.bind(this)
    this.createDonutChart = this.createDonutChart.bind(this)
  }

  componentDidMount() {
    let data = this.cleanData();
    this.createDonutChart(data);
  }

  componentDidUpdate(nextProps) {
    if (this.props.currentTeam.id !== nextProps.currentTeam.id || this.props.currentWeek !== nextProps.currentWeek) {
      let data = this.cleanData();
      this.createDonutChart(data);
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
      retVal.push({
        name: 'up by 15',
        count: down15,
      })
      retVal.push({
        name: 'down by 15',
        count: up15,
      })
    } else {
      retVal.push({
        name: 'up by 15',
        count: up15,
      })
      retVal.push({
        name: 'down by 15',
        count: down15,
      })
    }
    retVal.push({
      name: 'evenish',
      count: evenish,
    })
    return retVal;
  }

  createDonutChart(data) {
    let clear = d3.select('#GameScript')
    clear.selectAll('*').remove()
    var height = 300
    var width = 300
    var totalRadius = Math.min(width, height) / 2
    var donutHoleRadius = totalRadius * 0.5
    let array = [];
    for (let key in data) {
      array.push(data[key].name)
    }
    var color = d3.scaleOrdinal()
      .domain(array)
      .range(['green', 'red', 'blue'])


    var svg = d3.select('#GameScript').append('svg').attr('width', width).attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    var arc = d3.arc().innerRadius(totalRadius - donutHoleRadius).outerRadius(totalRadius)

    var pie = d3.pie()
      .value((d) => d.count)
      .sort(null)

    svg
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(d.data.name))

    var legendItemSize = 18
    var legendSpacing = 4

    var legend = svg
      .selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        var height = legendItemSize + legendSpacing
        var offset = height * color.domain().length / 2
        var x = legendItemSize * -2;
        var y = (i * height) - offset
        return `translate(${x}, ${y})`
      })

    legend
      .append('rect')
      .attr('width', legendItemSize)
      .attr('height', legendItemSize)
      .style('fill', color);

    legend
      .append('text')
      .attr('x', legendItemSize + legendSpacing)
      .attr('y', legendItemSize - legendSpacing)
      .text((d) => d)
  }

  render() {
    return (
      <div id="GameScript"> </div>

    )
  }
}

export default GameScript;
