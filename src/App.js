import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Splash from './components/Splash.js';
import SideBar from './components/SideBar.js';
import Player from './components/Player.js';
import Team from './components/Team.js';
import PlayerGame from './components/PlayerGame.js';
import Banner from './components/Banner.js';
import {ToastContainer, toast} from 'react-toastify'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      userInfo: {},
      userPlayers: [],
    }
    this.logIn = this.logIn.bind(this);
    this.update = this.update.bind(this);
    this.logOut = this.logOut.bind(this);
    this.getPlayers = this.getPlayers.bind(this);
  }

  signUp(information) {
    console.log(`reached signup with ${information}`);
    axios.post('/users', information)
      .then(response => {
        return this.logIn(information)
      }).then(response => {
        toast.success('signed up successfully');
      })
      .catch(err => toast.error('username already in use'))
  }

  logIn(information) {
    console.log('logging in');
    axios.post('/token', information)
      .then(response => {
        let object = {
          username: response.data.username,
        }
        this.setState({
          loggedIn: true,
          userInfo: object,
        })
        toast.success('logged you in')
      }).catch(err => {
        toast.error(err.response.data)
      })
  }

  logOut() {
    axios.delete('/token').then(result => {
      this.setState({
        loggedIn: false,
        userInfo: {},
      })
      toast.success('logged out')
      window.location.href = '/'
    }).catch(err => toast.error(err.response.data));
  }

  componentDidMount() {
    this.update();
  }

  update() {
    console.log('updating')
    axios.get('/external').then(result => {
      console.log(result)
    }).catch(err => {
      console.log('error!')
    })
  }

  getPlayers() {
    if (this.state.loggedIn) {
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
    const divStyle = {
      gridColumn: '1/11'
    }
    if (this.state.loggedIn) {
      divStyle.gridColumn = '2/11'
    }
    return (
      <Router>
        <div className='background'>
          <Banner loggedIn={this.state.loggedIn} update={this.update} logOut={this.logOut} signUp={this.signUp} logIn={this.logIn} userInfo={this.state.userInfo}/>
          <div className='container'>
            {this.state.loggedIn &&
              <SideBar getPlayers={this.getPlayers} userPlayers={this.state.userPlayers} userInfo={this.state.userInfo} loggedIn={this.state.loggedIn}/>
            }
            <div className='main' style={divStyle}>
              <Route exact path='/' render={(props) => <Splash {...props} getPlayers={this.getPlayers} loggedIn={this.state.loggedIn} userInfo={this.state.userInfo}/>}/>
              <Route path='/player/:id' render={(props) => <Player {...props} />}/>
              <Route path='/teams/:id' render={(props) => <Team {...props} loggedIn={this.state.loggedIn} userInfo={this.state.userInfo}/>}/>
              <Route path='/playerGame/:playerId/:teamId/:week' render={(props) => <PlayerGame {...props} loggedIn={this.state.loggedIn} userInfo={this.state.userInfo}/>}/>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
