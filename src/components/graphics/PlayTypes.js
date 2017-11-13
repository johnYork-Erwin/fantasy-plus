import React from 'react';
var d3 = require('d3');

class PlayTypes extends React.Component {
  constructor(props) {
    super(props);
    this.createData = this.createData.bind(this)
    this.graph = this.graph.bind(this)
  }

  componentDidUpdate(nextProps) {
    if (this.props.playTypesValue !== nextProps.playTypesValue || this.props.playersTeam.id !== nextProps.playersTeam.id) {
      const data = this.createData();
      this.graph(data)
    }
  }

  componentDidMount() {
    const data = this.createData();
    this.graph(data);
  }

  createData() {
    const retVal = [];
    let passing = {}
    passing.name = 'Passing';
    let rushing = {};
    rushing.name = 'Rushing';
    if (this.props.playTypesValue === 'Season') {
      rushing.count = this.props.playersTeam.stats.seasonStats.rushing.attempts;
      passing.count = this.props.playersTeam.stats.seasonStats.passing.attempts;
    } else {
      rushing.count = this.props.playersTeam.stats.games[this.props.playTypesValue].rushing.attempts;
      passing.count = this.props.playersTeam.stats.games[this.props.playTypesValue].passing.attempts;
    }
    retVal.push(passing);
    retVal.push(rushing);
    return retVal;
  }

  graph(data) {
    let clear = d3.select('#PlayTypes')
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
      .range(['purple', 'green'])


    var svg = d3.select('#PlayTypes').append('svg').attr('width', width).attr('height', height)
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
      <div id="PlayTypes"> </div>
    )
  }
}

export default PlayTypes;
