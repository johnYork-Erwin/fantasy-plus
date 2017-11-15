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
        <h3 id='sideBarTitle'>Favorites</h3>
        <div>
          {this.props.userPlayers.map(function(player, index) {
            return <div key={index}><button className="mainButton"><Link to={`/player/${player.id}`} style={{color: 'black', textDecoration: 'none'}}>{player.player_name_full}</Link></button>
              <button className="deletePlayer" onClick={() => self.removePlayer(player.id)}>Remove Player</button></div>
          })}
        </div>
      </div>
    )
  }
}

export default SideBar;
