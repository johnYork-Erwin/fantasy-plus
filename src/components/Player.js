import React from 'react';
import axios from 'axios';
import {Table} from 'react-materialize';
import FantasyPointsGraph from './graphics/FantasyPointsGraph.js';
import TargetShareGraph from './graphics/TargetShareGraph.js';
import PlayTypes from './graphics/PlayTypes.js';
import { Link} from 'react-router-dom';

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPlayer: '',
      playTypesValue: 'Season',
    }
    this.formattingForTable = this.formattingForTable.bind(this);
    this.format = this.format.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentWillMount() {
    let playerId = this.props.match.params.id
    let currentPlayer = '';
    axios.get(`/players/byId/${playerId}`)
      .then(result => {
        currentPlayer = result.data[0];
        return axios.get(`/teams/${currentPlayer.team_id}`)
      })
      .then(result => {
        let cares;
        if (currentPlayer.position === 'WR' || currentPlayer.position === 'TE') {
          cares = ['time period', 'targets', 'receptions', 'completion percentage', 'reception yards', 'reception TD', 'fumbles', 'points']
        } else if (currentPlayer.position === 'RB') {
          cares = ['time period', 'fumbles', 'receptions', 'reception yards', 'reception TD', 'rush attempts', 'rush yards', 'rush TD', 'points']
        } else if (currentPlayer.position === 'QB') {
          cares = ['time period', 'passes', 'passes completed', 'completion percentage', 'passing yards', 'pass TD', 'rush attempts', 'rush yards', 'rush TD', 'points']
        }
        this.setState({
          currentPlayer: currentPlayer,
          cares: cares,
          playersTeam: result.data[0],
        })
      })
      .catch(err => {
        console.log(err)
      })
  }

  format(value) {
    if (value === 'Season') {
      return 'the 2017 Season'
    } else {
      return 'Week ' + value;
    }
  }

  handleChange(e) {
    this.setState({
      playTypesValue: e.target.value,
    })
  }

  formattingForTable(week, care, index) {
    let playerGame;
    if (week === 'seasonStats') {
      playerGame = this.state.currentPlayer.stats[week]
    } else {
      playerGame = this.state.currentPlayer.stats.games[week];
    }
    let data;
    switch(care){
      case 'time period':
        if (week === 'seasonStats') {
          data = 'Season';
        } else {
          data = 'Week ' + week;
        }
        break;
      case 'targets':
        data = playerGame.recTargets;
        break;
      case 'receptions':
        data = playerGame.rec;
        break;
      case 'reception yards':
        data = playerGame.recYards;
        break;
      case 'reception TD':
        data = playerGame.recTd;
        break;
      case 'fumbles':
        data = playerGame.fumbles;
        break;
      case 'rush attempts':
        data = playerGame.rushAttempts;
        break;
      case 'rush yards':
        data = playerGame.rushYards;
        break;
      case 'rush TD':
        data = playerGame.rushTd;
        break;
      case 'points':
        data = playerGame.totalPoints.toFixed(2);
        break;
      case 'completion percentage':
        if (playerGame.passYards === 0) {
          data = (playerGame.rec/(playerGame.recTargets)).toFixed(2);
        } else {
          data = (playerGame.passCompletions/(playerGame.passAttempts)).toFixed(2);
        }
        break;
      case 'passes':
        data = playerGame.passAttempts;
        break;
      case 'passes completed':
        data = playerGame.passCompletions;
        break;
      case 'passing yards':
        data = playerGame.passYards;
        break;
      case 'pass TD':
        data = playerGame.passTd;
        break;
      case 'interceptions':
        data = playerGame.int;
        break;
      default:
        data = 0;
    }
    return <td key={index}>{data}</td>;
  }

  render() {
    const self = this;
    return (
      <div className="main">
        {this.state.cares &&
        <div className="wrapper">
          <h1>{this.state.currentPlayer.player_name_full} / {this.state.currentPlayer.position} / {this.state.currentPlayer.status}</h1>
          <p>Team: {this.state.currentPlayer.team_code}, Jersey Number: {this.state.currentPlayer.jersey_number}, College: {this.state.currentPlayer.college} </p>
          <p>Height: {Math.round(this.state.currentPlayer.height/12)}'{this.state.currentPlayer.height%12}'', Weight: {this.state.currentPlayer.weight}lbs, Birthdate: {this.state.currentPlayer.birthdate}</p>
          <h3 className="center">Weekly Stats</h3>
          <Table id="record">
            <thead>
              <tr>
                {this.state.cares.map(function(care, index) {
                  return (
                    <th key={index}>{care}</th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.state.currentPlayer.stats.games).map(function(week, index) {
                return <tr onClick={() => self.props.history.push(`/playerGame/${self.state.currentPlayer.id}/${self.state.currentPlayer.team_id}/${week}`)} key={index}>{self.state.cares.map(function(care, index) {
                  return self.formattingForTable(week, care, index)
                })}
              </tr>
              })}
              <tr>
                {this.state.cares.map(function(care, index) {
                  return self.formattingForTable('seasonStats', care, index)
                })}
              </tr>
            </tbody>
          </Table>
          <h3 className="center">Fantasy Points By Week</h3>
          <FantasyPointsGraph currentPlayer={this.state.currentPlayer}/>
          <h3 className="center">Target Share By Week</h3>
          <TargetShareGraph playersTeam={this.state.playersTeam} currentPlayer={this.state.currentPlayer}/>
          <h3 className="center">Team Play Choices for {this.format(this.state.playTypesValue)}</h3>
          <select className="center" onChange={this.handleChange} value={this.state.playTypesValue}>
            <option value='Season'>Season</option>
            {Object.keys(this.state.currentPlayer.stats.games).map(function(key, index) {
              return <option key={index} value={key}>Week {key}</option>
            })}
          </select>
          <PlayTypes playTypesValue={this.state.playTypesValue} playersTeam={this.state.playersTeam}/>
          <Link to="/"><button>Back to Splash</button></Link>
        </div>
        }
      </div>
    )
  }
}

export default Player;
