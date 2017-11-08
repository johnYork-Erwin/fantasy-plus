import React from 'react'
import {Link} from 'react-router-dom'

class SideBar extends React.Component {
  componentWillMount() {
    this.props.getPlayers();
  }

  render() {
    return (
      <div id='sideBar'>
        <h3>Your Players</h3>
        {this.props.userPlayers.map(function(player, index) {
          return <p key={index}><Link to={`/player/${player.id}`}>{player.player_name_full}</Link></p>
        })}
      </div>
    )
  }
}

export default SideBar;
