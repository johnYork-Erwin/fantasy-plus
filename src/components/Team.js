import React from 'react';
import axios from 'axios';
import {Table} from 'react-materialize';
import PlayTypes from './graphics/PlayTypes.js'
import {Link} from 'react-router-dom'

class Team extends React.Component {

  constructor(props) {
    super(props);
    this.getTeamInfo = this.getTeamInfo.bind(this)
    this.formatForTable = this.formatForTable.bind(this)
    this.getTeamId = this.getTeamId.bind(this)
    this.prepareData = this.prepareData.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getPlayersPosition = this.getPlayersPosition.bind(this)
    this.state = {
      userInfo: this.props.userInfo,
      position: 'RB',
    }
  }

  componentWillMount() {
    this.prepareData();
    this.getPlayersPosition();
  }

  componentDidUpdate(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.prepareData();
      this.getPlayersPosition();
    }
  }

  prepareData() {
    let playerCares;
    if (this.state.position === 'RB') {
      playerCares = ['Name', 'Jersey Number', 'Fumbles', 'Pass Targets', 'Pass Receptions', 'Receiving Yards', 'Rush Attempts', 'Rush Yards', 'Yards per Carry', 'Total Yards', 'Touchdowns', 'Total Points']
    } else if (this.state.position === 'WR' || this.state.position === 'TE') {
      playerCares = ['Name', 'Jersey Number', 'Fumbles', 'Pass Targets', 'Pass Receptions', 'Receiving Yards', 'Total Yards', 'Touchdowns', 'Total Points']
    } else if (this.state.position === 'QB'){
      playerCares = ['Name', 'Jersey Number', 'Fumbles', 'Int', 'Rush Attempts', 'Rush Yards', 'Pass Attempts', 'Pass Completions', 'Completion %', 'Pass Yards', 'Touchdowns', 'Total Points']
    }
    let cares = ['Time Period', 'Location', 'Opponent', 'Result', 'Score', 'Rush Attempts', 'Rush Yards', 'Pass Attempts', 'Pass Completions', 'Completion %', 'Pass Yards', 'Total Yards'];
    let team;
    this.getTeamInfo(this.props.match.params.id).then(results => {
      team = results;
      let array = [];
      for (let key of Object.keys(team.stats.games)) {
        array.push(this.getTeamId(team.stats.games[key].opp))
      }
      return Promise.all(array);
    })
    .then(results => {
      let map = {}
      for (let i = 0; i < results.length; i++) {
        let key = Object.keys(results[i])[0]
        map[key] = results[i][key]
      }
      this.setState({
        playerCares: playerCares,
        cares: cares,
        teamData: team,
        map: map,
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  formatPlayerForTable(care, player, index) {
    let data;
    let info = player.stats.seasonStats
    switch (care) {
      case 'Name':
        data = player.player_name_full;
        break;
      case 'Fumbles':
        data = info.fumbles;
        break;
      case 'Int':
        data = info.int;
        break;
      case 'Rush Attempts':
        data = info.rushAttempts;
        break;
      case 'Rush Yards':
        data = info.rushYards;
        break;
      case 'Pass Targets':
        data = info.recTargets;
        break;
      case 'Pass Receptions':
        data = info.rec;
        break;
      case 'Receiving Yards':
        data = info.recYards;
        break;
      case 'Pass Attempts':
        data = info.passAttempts;
        break;
      case 'Pass Completions':
        data = info.passCompletions;
        break;
      case 'Pass Yards':
        data = info.passYards;
        break;
      case 'Completion %':
        data = (info.passCompletions/info.passAttempts).toFixed(1)
        break;
      case 'Touchdowns':
        data = info.totalTd;
        break;
      case 'Total Yards':
        data = info.recYards + info.rushYards;
        break;
      case 'Total Points':
        data = info.totalPoints.toFixed(1);
        break;
      case 'Jersey Number':
        data = '#' + player.jersey_number;
        break;
      case 'Yards per Carry':
        data = (info.rushYards/info.rushAttempts).toFixed(1);
        break;
      default:
        break;
    }
    return <td key={index}>{data}</td>
  }

  getTeamId(code) {
    return new Promise(function (resolve, reject) {
      axios.get(`/teamsByCode/${code}`).then(results => {
        let obj = {}
        obj[code] = results.data[0].id;
        resolve(obj)
      })
      .catch(err => {
        console.log(code)
        reject(err)
      })
    })
  }

  formatForTable(week, care, index) {
    let game;
    let data;
    if (week === 'seasonStats') game = this.state.teamData.stats[week]
    else game = this.state.teamData.stats.games[week]
    switch (care) {
      case 'Time Period':
        if (week === 'seasonStats') {
          data = 'Season'
        } else {
          data = 'Week ' + week;
        }
        break;
      case 'Opponent':
        data = game.opp;
        break;
      case 'Location':
        if (game.home) data = 'Home'
        else data = 'Away'
        break;
      case 'Result':
        data = game.result
        break;
      case 'Score':
        if (game.home) data = `${game.score} - ${game.oppScore}`
        else data = `${game.oppScore} - ${game.score}`
        break;
      case 'Rush Attempts':
        data = game.rushing.attempts;
        break;
      case 'Rush Yards':
        data = game.rushing.yards;
        break;
      case 'Pass Attempts':
        data = game.passing.attempts;
        break;
      case 'Pass Completions':
        data = game.passing.completions;
        break;
      case 'Completion %':
        data = (game.passing.completions/game.passing.attempts*100).toFixed(1) + '%'
        break;
      case 'Pass Yards':
        data = game.passing.yards
        break;
      case 'Total Yards':
        data = game.passing.yards + game.rushing.yards;
        break;
      default:
        break;
    }
    if (care === 'Opponent') {
      let id = this.state.map[data];
      return <td key={index}><Link to={`/teams/${id}`}>{data}</Link></td>
    } else {
      return <td key={index}>{data}</td>
    }
  }

  getPlayersPosition() {
    axios.get(`/players/team/${this.props.match.params.id}/${this.state.position}`).then(result => {
      this.setState({
        teamPlayers: result.data,
      })
    }).catch(err => console.log(err))
  }

  handleChange(e) {
    let object = {}
    let label = e.target.name;
    object[label] = e.target.value;
    let playerCares;
    if (e.target.value === 'RB') {
      playerCares = ['Name', 'Jersey Number', 'Fumbles', 'Pass Targets', 'Pass Receptions', 'Receiving Yards', 'Rush Attempts', 'Rush Yards', 'Total Yards', 'Touchdowns', 'Total Points']
    } else if (e.target.value === 'WR' || e.target.value === 'TE') {
      playerCares = ['Name', 'Jersey Number', 'Fumbles', 'Pass Targets', 'Pass Receptions', 'Receiving Yards', 'Total Yards', 'Touchdowns', 'Total Points']
    } else if (e.target.value === 'QB'){
      playerCares = ['Name', 'Jersey Number', 'Fumbles', 'Int', 'Rush Attempts', 'Rush Yards', 'Pass Attempts', 'Pass Completions', 'Completion %', 'Pass Yards', 'Touchdowns', 'Total Points']
    }
    this.setState(object, () => {
      if (label === 'position') {
        this.getPlayersPosition();
      }
    })
    this.setState({
      playerCares: playerCares,
    })
  }

  getTeamInfo(id) {
    return new Promise(function (resolve, reject) {
      axios.get(`/teams/${id}`).then(results => {
        resolve(results.data[0])
      })
      .catch(err => reject(err))
    })
  }

  render() {
    const self = this;
    return (
      <div className="wrapper">
        {this.state.teamData &&
          <div>
            <h1>{this.state.teamData.team_name} / {this.state.teamData.team_code} </h1>
            <h3>({this.state.teamData.stats.record.wins} - {this.state.teamData.stats.record.losses} - {this.state.teamData.stats.record.ties}) = (Wins - Losses - Draws) </h3>
            <div>
              <h4 className="noMargins">Games Played</h4>
              <Table id="teamRecord">
                <thead>
                  <tr>
                    {this.state.cares.map(function(care, index) {
                      return <td key={index}>{care}</td>
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(this.state.teamData.stats.games).map(function(week, index) {
                    return <tr key={index}>{self.state.cares.map(function(care, index) {
                      return self.formatForTable(week, care, index);
                    })}
                    </tr>
                  })}
                </tbody>
              </Table>
              <div className="center">
                <label>
                  Position:
                </label>
                <select name="position" value={this.state.position} onChange={this.handleChange}>
                  <option>QB</option>
                  <option>RB</option>
                  <option>WR</option>
                  <option>TE</option>
                </select>
              </div>
              <Table id="teamPlayers">
                <thead>
                  <tr>
                    {this.state.playerCares && this.state.playerCares.map(function(care, index) {
                      return <td key={index}>{care}</td>
                    })}
                  </tr>
                </thead>
                  <tbody>
                    {this.state.teamPlayers.map(function(player, index) {
                      return <tr key={index}>
                        {self.state.playerCares.map(function(care, index) {
                          return self.formatPlayerForTable(care, player, index)
                        })}
                      </tr>
                    })}
                  </tbody>
              </Table>
              <h3> Play Choices over the Season </h3>
              <PlayTypes playTypesValue='Season' playersTeam={this.state.teamData}/>
            </div>
            <Link to="/" className="center"><button className="back">Back to Home</button></Link>
          </div>
        }
      </div>
    )
  }
}

export default Team;
