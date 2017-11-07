import React from 'react';
import axios from 'axios';

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userPlayers: [],
    }
    this.getPlayers = this.getPlayers.bind(this);
    this.getPlayers = this.getPlayers.bind(this)
  }

  componentWillMount() {
    this.getPlayers();
  }

  getPlayers() {
    if (this.props.loggedIn) {
      axios.get(`/userPlayers/`)
      .then(result => {
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
        this.setState({
          userPlayers: results,
        })
      })
      .catch(err => console.log(err))
    }
  }

  render() {
    return (
      <div id='sideBar'>
        <h3>Your Players</h3>
        {this.state.userPlayers.map(function(player, index) {
          return <p key={index} onClick={() => {window.location.href=`/player/${player.id}`}}>{player.player_name_full}</p>
        })}
      </div>
    )
  }
}

export default SideBar;
