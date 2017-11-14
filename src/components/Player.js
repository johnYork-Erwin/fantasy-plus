import React from 'react';
import axios from 'axios';
import {Table} from 'react-materialize';
import FantasyPointsGraph from './graphics/FantasyPointsGraph.js';
import TargetShareGraph from './graphics/TargetShareGraph.js';
import PlayTypes from './graphics/PlayTypes.js';
import {Link} from 'react-router-dom';

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
    this.getPlayer = this.getPlayer.bind(this)
  }

  componentWillMount() {
    this.getPlayer();
  }

  componentDidUpdate(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.getPlayer();
    }
  }

  getPlayer() {
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
          cares = ['Time Period', 'Targets', 'Receptions', 'Completion %', 'Reception Yards', 'Reception TD', 'Fumbles', 'Points']
        } else if (currentPlayer.position === 'RB') {
          cares = ['Time Period', 'Fumbles', 'Receptions', 'Reception Yards', 'Reception TD', 'Rush Attempts', 'Rush Yards', 'Rush TD', 'Points']
        } else if (currentPlayer.position === 'QB') {
          cares = ['Time Period', 'Passes', 'Passes Completed', 'Completion %', 'Passing Yards', 'Pass TD', 'Rush Attempts', 'Rush Yards', 'Rush TD', 'Points']
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
      case 'Time Period':
        if (week === 'seasonStats') {
          let temp = 'Season';
          data = <Link to={`/teams/${this.state.currentPlayer.team_id}`}>{temp}</Link>
        } else {
          let temp = 'Week ' + week;
          data = <Link to={`/playerGame/${this.state.currentPlayer.id}/${this.state.currentPlayer.team_id}/${week}`}>{temp}</Link>;
        }
        break;
      case 'Targets':
        data = playerGame.recTargets;
        break;
      case 'Receptions':
        data = playerGame.rec;
        break;
      case 'Reception Yards':
        data = playerGame.recYards;
        break;
      case 'Reception TD':
        data = playerGame.recTd;
        break;
      case 'Fumbles':
        data = playerGame.fumbles;
        break;
      case 'Rush attempts':
        data = playerGame.rushAttempts;
        break;
      case 'Rush yards':
        data = playerGame.rushYards;
        break;
      case 'Rush TD':
        data = playerGame.rushTd;
        break;
      case 'Points':
        data = playerGame.totalPoints.toFixed(2);
        break;
      case 'Completion %':
        if (playerGame.passYards === 0) {
          data = (playerGame.rec/(playerGame.recTargets)).toFixed(2);
        } else {
          data = (playerGame.passCompletions/(playerGame.passAttempts)).toFixed(2);
        }
        break;
      case 'Passes':
        data = playerGame.passAttempts;
        break;
      case 'Passes Completed':
        data = playerGame.passCompletions;
        break;
      case 'Passing Yards':
        data = playerGame.passYards;
        break;
      case 'Pass TD':
        data = playerGame.passTd;
        break;
      case 'Interceptions':
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
      <div>
        {this.state.cares &&
        <div className="wrapper">
          <h1>{this.state.currentPlayer.player_name_full} / {this.state.currentPlayer.position} / {this.state.currentPlayer.status}</h1>
          <p>Team: <Link style={{marginLeft:0, marginRight:0}} to={`/teams/${this.state.playersTeam.id}`}>{this.state.playersTeam.team_code}</Link>, Jersey Number: {this.state.currentPlayer.jersey_number}, College: {this.state.currentPlayer.college} </p>
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
                return <tr key={index}>{self.state.cares.map(function(care, index) {
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
        </div>
        }
      </div>
    )
  }
}

export default Player;
