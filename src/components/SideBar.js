import React from 'react';
import axios from 'axios';

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.getPlayers = this.getPlayers.bind(this);
    this.state = {
      userPlayers: [],
    }
    this.getPlayers = this.getPlayers.bind(this)
  }

  getPlayers() {
    if (this.props.loggedIn) {
      axios.get(`/userPlayers/`)
      .then(result => {
        console.log(result)
        let array = [];
        for (let i = 0; i < result.data.length; i++) {
          array.push(axios(`/players/byId/${result.data[i].player_id}`))
        }
        return Promise.all(array)
      })
      .then(results => {
        results = results.map(function(item) {
          return item.data[0];
        })
        console.log(results);
        this.setState({
          userPlayers: results,
        })
      })
      .catch(err => console.log(err))
    }
  }

  componentWillMount() {
    this.getPlayers();
  }

  render() {
    return (
      <div id='sideBar'>
        <h3>Your Players</h3>
        {this.state.userPlayers.map(function(player) {
          console.log(player)
          return <div>{player.player_name_full}</div>
        })}
      </div>
    )
  }
}

export default SideBar;
