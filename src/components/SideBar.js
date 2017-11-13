import React from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios'

class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.removePlayer = this.removePlayer.bind(this)
  }

  componentWillMount() {
    this.props.getPlayers();
  }

  removePlayer(id) {
    axios.delete(`/userPlayers/${id}`).then(results => {
      if (results.data === 'success') {
        this.props.getPlayers();
      }
    }).catch(err => {
      console.log(err)
    });
  }

  render() {
    const self = this;
    return (
      <div id='sideBar'>
        <h3>Favorites</h3>
        {this.props.userPlayers.map(function(player, index) {
          return <p key={index}><Link to={`/player/${player.id}`} style={{color: 'white'}}>{player.player_name_full}</Link><button className="deletePlayer" onClick={() => self.removePlayer(player.id)}>X</button></p>
        })}
      </div>
    )
  }
}

export default SideBar;
