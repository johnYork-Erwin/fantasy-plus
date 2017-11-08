import React from 'react';
import axios from 'axios';
import {Table} from 'react-materialize'

class Splash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerSearch: '',
      userId: this.props.userInfo.id,
      userName: this.props.userInfo.username,
      position: 'QB',
    }
    this.addPlayerToUser = this.addPlayerToUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitSearch = this.handleSubmitSearch.bind(this);
    this.getLeaders = this.getLeaders.bind(this)
  }

  handleChange(e) {
    let object = {}
    let label = e.target.name;
    object[label] = e.target.value;
    this.setState(object, () => {
      if (label === 'position') {
        this.getLeaders();
      }
    })
  }

  handleSubmitSearch(e) {
    e.preventDefault();
    console.log(`searching for ${this.state.playerSearch}`);
    axios.get(`/players/${this.state.playerSearch}`).then(results => {
      if (results.data !== 'player not found') {
        this.setState({
          playerFound: results.data,
        })
      }
    }).catch(err => console.log(err))
  }

  getLeaders() {
    axios.get(`/players/leaders/${this.state.position}`).then(result => {
      result = result.data.map(function(player) {
        let object = {}
        object.player_name_full = player.player_name_full;
        object.total_points = player.total_points;
        object.team_code = player.team_code;
        object.touchdowns = player.stats.seasonStats.totalTd;
        object.position = player.position;
        return object;
      })
      this.setState({
        leaders: result,
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  addPlayerToUser() {
    axios.post(`/userPlayers/${this.state.playerFound.id}`).then(result => {
      this.props.getPlayers();
    }).catch(err => {
    })
  }

  componentWillMount() {
    this.getLeaders();
  }

  render() {
    console.log(this.props)
    return (
      <div className="main">
        {this.props.loggedIn &&
          <form onSubmit={this.handleSubmitSearch}>
            <h2>Search for a player to add to your watch list!</h2>
            <label>
              Player Name :
            </label>
            <input onChange={this.handleChange} name="playerSearch" type="text" placeholder="Player Name"></input>
            <button type="submit">
              Search
            </button>
          </form>
        }
        {this.state.playerFound && this.props.loggedIn &&
        <div className="tableContainer">
          <Table>
            <thead>
              <tr>
                <th data-field='player_name_full'>Name</th>
                <th data-field='team_code'>Team</th>
                <th data-field='position'>Position</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{this.state.playerFound.player_name_full}</td>
                <td>{this.state.playerFound.team_code}</td>
                <td>{this.state.playerFound.position}</td>
                <button onClick={this.addPlayerToUser}>Add Player</button>
              </tr>
            </tbody>
          </Table>
        </div>
        }
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
        <Table id="leaderBoard">
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Position</th>
              <th>Touchdowns</th>
              <th>Total Points</th>
            </tr>
          </thead>
            <tbody>
              {this.state.leaders && this.state.leaders.map(function(player, index) {
                return (<tr key={index}>
                  <td>{player.player_name_full}</td>
                  <td>{player.team_code}</td>
                  <td>{player.position}</td>
                  <td>{player.touchdowns}</td>
                  <td>{player.total_points}</td>
                </tr>)
              })}
            </tbody>
        </Table>
      </div>
    )
  }
}

export default Splash;
