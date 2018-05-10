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
        if (player.player_name_full === e.target.value) return player
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
      console.log(err)
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
            <h2>Search for a player to add to your favorites!</h2>
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
          <Table id="searched">
            <thead>
              <tr>
                <th data-field='player_name_full'>Name</th>
                <th data-field='team_code'>Team</th>
                <th data-field='position'>Position</th>
                <th>Touchdowns</th>
                <th>Total Points</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.playerFound.map(function(player, index) {
                return <tr key={index}>
                  <td>{player.player_name_full}</td>
                  <td>{player.team_code}</td>
                  <td>{player.position}</td>
                  <td>{player.stats.seasonStats.totalTd}</td>
                  <td>{player.stats.seasonStats.totalPoints.toFixed(1)}</td>
                  <td><button onClick={() => self.addPlayerToUser(player)}>Add To Favorites</button></td>
                </tr>
              })}
            </tbody>
          </Table>
        </div>
        }
        <h4>Leaderboard based on position.</h4>
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
        <div className="tableContainer">
          <Table id="leaderBoard">
            <thead>
              <tr>
                <th>Name</th>
                <th>Team</th>
                <th>Position</th>
                <th>Touchdowns</th>
                <th>Total Points</th>
                <th>Action</th>
              </tr>
            </thead>
              <tbody>
                {this.state.leaders && this.state.leaders.map(function(player, index) {
                  if (self.props.loggedIn) {
                    return (<tr key={index}>
                      <td>{player.player_name_full}</td>
                      <td>{player.team_code}</td>
                      <td>{player.position}</td>
                      <td>{player.touchdowns}</td>
                      <td>{player.total_points}</td>
                      <td><button onClick={self.handleClickName} value={player.player_name_full}>Add To Favorites</button></td>
                    </tr>)
                  } else {
                    return (<tr key={index}>
                      <td>{player.player_name_full}</td>
                      <td>{player.team_code}</td>
                      <td>{player.position}</td>
                      <td>{player.touchdowns}</td>
                      <td>{player.total_points}</td>
                      <td>Log in first</td>
                    </tr>)
                  }
                })}
              </tbody>
          </Table>
        </div>
        <News/>
      </div>
    )
  }
}

export default Splash;
