import React from 'react';
import axios from 'axios';
import {Table} from 'react-materialize'
import News from './News.js'
import {toast} from 'react-toastify'

class Splash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerSearch: '',
      userId: this.props.userInfo.id,
      loggedIn: this.props.loggedIn,
      position: 'QB',
    }
    this.addPlayerToUser = this.addPlayerToUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitSearch = this.handleSubmitSearch.bind(this);
    this.getLeaders = this.getLeaders.bind(this)
    this.handleClickName = this.handleClickName.bind(this)
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
    if (this.state.playerSearch) {
      axios.get(`/players/${this.state.playerSearch.trim()}`).then(results => {
        console.log(results);
        if (results.data !== 'player not found') {
          this.setState({
            playerFound: results.data,
          })
        }
      }).catch(err => toast.warn(err.response.data))
    }
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
        object.id = player.id;
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

  handleClickName(e) {
    if (this.props.loggedIn) {
      let id;
      let target = this.state.leaders.filter(function(player) {
        if (player.player_name_full === e.target.text) return player
        else return null;
      }, [])
      id = target[0].id;
      axios.post(`/userPlayers/${id}`).then(result => {
        this.props.getPlayers();
      }).catch(err => {
      })
    }
  }

  addPlayerToUser(player) {
    axios.post(`/userPlayers/${player.id}`).then(result => {
      this.props.getPlayers();
      this.setState({
        playerFound: null,
        playerSearch: '',
      })
    }).catch(err => {
    })
  }

  componentWillMount() {
    this.getLeaders();
  }

  render() {
    const self = this;
    return (
      <div>
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
              {this.state.playerFound.map(function(player, index) {
                return <tr key={index}>
                  <td>{player.player_name_full}</td>
                  <td>{player.team_code}</td>
                  <td>{player.position}</td>
                  <td><button onClick={() => self.addPlayerToUser(player)}>Add Player</button></td>
                </tr>
              })}
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
                if (self.props.loggedIn) {
                  return (<tr key={index}>
                    <td><a onClick={self.handleClickName}>{player.player_name_full}</a></td>
                    <td>{player.team_code}</td>
                    <td>{player.position}</td>
                    <td>{player.touchdowns}</td>
                    <td>{player.total_points}</td>
                  </tr>)
                } else {
                  return (<tr key={index}>
                    <td>{player.player_name_full}</td>
                    <td>{player.team_code}</td>
                    <td>{player.position}</td>
                    <td>{player.touchdowns}</td>
                    <td>{player.total_points}</td>
                  </tr>)
                }
              })}
            </tbody>
        </Table>
        <News/>
      </div>
    )
  }
}

export default Splash;
