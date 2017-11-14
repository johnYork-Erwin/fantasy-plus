import React from 'react';
import axios from 'axios';
import GameScript from './graphics/GameScript.js';
import PlayTypes from './graphics/PlayTypes.js';
import {Table} from 'react-materialize';
import {Link} from 'react-router-dom'

class PlayerGame extends React.Component {
  constructor(props) {
    super(props);
    this.formatForTable = this.formatForTable.bind(this);
  }

  formatForTable(player, care, index) {
    let data;
    switch(care){
      case 'Player Name':
        data = <Link to={`/player/${player.id}`}>{player.player_name_full}</Link>
        break;
      case 'Targets':
        data = player.stats.games[this.state.currentWeek].recTargets;
        break;
      case 'Receptions':
        data = player.stats.games[this.state.currentWeek].rec;
        break;
      case 'Reception Yards':
        data = player.stats.games[this.state.currentWeek].recYards;
        break;
      case 'Reception TDs':
        data = player.stats.games[this.state.currentWeek].recTd;
        break;
      case 'Fumbles':
        data = player.stats.games[this.state.currentWeek].fumbles;
        break;
      case 'Rush Attempts':
        data = player.stats.games[this.state.currentWeek].rushAttempts;
        break;
      case 'Rush Yards':
        data = player.stats.games[this.state.currentWeek].rushYards;
        break;
      case 'Rush TD':
        data = player.stats.games[this.state.currentWeek].rushTd;
        break;
      case 'Total Points':
        data = player.stats.games[this.state.currentWeek].totalPoints.toFixed(2);
        break;
      case 'Completion %':
        if (player.stats.games[this.state.currentWeek].passYards === 0) {
          data = (player.stats.games[this.state.currentWeek].rec/(player.stats.games[this.state.currentWeek].recTargets)).toFixed(2);
        } else {
          data = (player.stats.games[this.state.currentWeek].passCompletions/(player.stats.games[this.state.currentWeek].passAttempts)).toFixed(2);
        }
        break;
      case 'Pass Attempts':
        data = player.stats.games[this.state.currentWeek].passAttempts;
        break;
      case 'Pass Completions':
        data = player.stats.games[this.state.currentWeek].passCompletions;
        break;
      case 'Pass Yards':
        data = player.stats.games[this.state.currentWeek].passYards;
        break;
      case 'Pass TDs':
        data = player.stats.games[this.state.currentWeek].passTd;
        break;
      case 'Ints':
        data = player.stats.games[this.state.currentWeek].int;
        break;
      default:
        data = 0;
    }
    return <td key={index}>{data}</td>;
  }

  componentWillMount() {
    let url = window.location.href
    url = url.split('/')
    let playerId = url[4];
    let teamId = url[5];
    let weekNumber = url[6];
    let currentPlayer;
    let currentTeam;
    let playersAtPosition;
    let cares = []
    axios.get(`/players/byId/${playerId}`)
      .then(result => {
        currentPlayer = result.data[0];
        let array;
        if (currentPlayer.position === 'WR' || currentPlayer.position === 'TE') {
          array = ['Player Name', 'Fumbles', 'Targets', 'Receptions', 'Reception Yards', 'Reception TDs', 'Total Points'];
        } else if (currentPlayer.position === 'RB') {
          array = ['Player Name', 'Fumbles', 'Targets', 'Receptions', 'Reception Yards', 'Reception TDs', 'Rush Attempts', 'Rush Yards', 'Rush TDs', 'Total Points']
        } else if (currentPlayer.position === 'QB') {
          array = ['Player Name', 'Fumbles', 'Ints', 'Rush Attempts', 'Rush Yards', 'Rush TDs', 'Pass Attempts', 'Pass Completions', 'Pass Yards', 'Pass TDs', 'Total Points']
        }
        cares = cares.concat(array);
      })
      .then(() => {
        return axios.get(`/teams/${teamId}`)
      })
      .then(result => {
        currentTeam = result.data[0];
        return axios.get(`/teams/players/${currentPlayer.position}/${teamId}`)
      })
      .then(result => {
        let array = [];
        for (let i = 0; i < result.data.length; i++) {
          if (result.data[i].stats.games[weekNumber] !== undefined) {
            array.push(result.data[i])
          }
        }
        playersAtPosition = array;
      })
      .then(result => {
        return axios.get(`/teamsByCode/${currentTeam.stats.games[weekNumber].opp}`)
      })
      .then(result => {
        console.log(result)
        this.setState({
          cares: cares,
          currentTeam: currentTeam,
          currentPlayer: currentPlayer,
          currentWeek: weekNumber,
          playersAtPosition: playersAtPosition,
          oppTeam: result.data[0],
        })
      })
      .catch(err => console.log(err))
  }

  render() {
    const self = this;
    return (
      <div>
        {this.state &&
        <div className="wrapper">
          <h1>{this.state.currentPlayer.player_name_full} Week {this.state.currentWeek}, {this.state.currentTeam.stats.games[this.state.currentWeek].home ? 'Home': 'Away'} </h1>
          <h2><Link to={`/teams/${this.state.currentTeam.id}`}>{this.state.currentTeam.team_code}</Link> vs. <Link to={`/teams/${this.state.oppTeam.id}`}>{this.state.oppTeam.team_code}</Link> ( {this.state.currentTeam.stats.games[this.state.currentWeek].result} {this.state.currentTeam.stats.games[this.state.currentWeek].score} - {this.state.currentTeam.stats.games[this.state.currentWeek].oppScore} )</h2>
          <div className="holdPlays">
            <h2>Plays This Game Involving {this.state.currentPlayer.player_name_full}</h2>
            {this.state.currentPlayer.stats.games[this.state.currentWeek].plays.map(function(play, index) {
              return <h5 key={index}>{play}</h5>
            })}
          </div>
          <div className="tableContainer">
            <h3 className="center">{this.state.currentTeam.team_code} Players at {this.state.currentPlayer.player_name_full}'s Position in Week {this.state.currentWeek}</h3>
            <Table id="atPosition">
              <thead>
                <tr>
                  {this.state.cares.map(function(care, index) {
                    return <th key={index}>{care}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {this.state.playersAtPosition.map(function(player, index) {
                  if (player.id === self.state.currentPlayer.id) {
                    return <tr id='currentPlayer' key={index}>{self.state.cares.map(function(care, index) {
                      return self.formatForTable(player, care, index)
                    })}</tr>
                  } else {
                    return <tr key={index}>{self.state.cares.map(function(care, index) {
                      return self.formatForTable(player, care, index)
                    })}</tr>
                  }

                })}
              </tbody>
            </Table>
          </div>
          <div id="PlayGameStats">
            <div className="leftHalf">
              <h4>Percentage of Game Spent...</h4>
              <GameScript currentTeam={this.state.currentTeam} currentWeek={this.state.currentWeek} script={this.state.currentTeam.stats.games[this.state.currentWeek].gameScript}/>
            </div>
            <div className="rightHalf">
              <h4>Play Types Called</h4>
              <PlayTypes playTypesValue={this.state.currentWeek} playersTeam={this.state.currentTeam}/>
            </div>
          </div>
        </div>
        }
      </div>
    )
  }
}

export default PlayerGame;
