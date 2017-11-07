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
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: true,
      userInfo: {},
    }
    this.logIn = this.logIn.bind(this);
    this.update = this.update.bind(this);
    this.logOut = this.logOut.bind(this);
  }


  signUp(information) {
    console.log(`reached signup with ${information}`);
    axios.post('/users', information)
      .then(response => {
        console.log('posted to users successfully now trying to get a token')
        return axios.post('/token', information)
      }).then(response => {
        this.setState({
          loggedIn: true,
        })
      })
      .catch(err => console.log('sign up failed'))
  }

  logIn(information) {
    console.log(`reached login with ${information}`)
    axios.post('/token', information)
      .then(response => {
        let object = {
          username: response.data.username,
        }
        this.setState({
          loggedIn: true,
          userInfo: object,
        })
        console.log(this.state)
      }).catch(err => console.log('could not get you a token'))
  }

  logOut() {
    axios.delete('/token').then(result => {
      this.setState({
        loggedIn: false,
        userInfo: {},
      })
    }).catch(err => console.log('could not log out'));
  }

  update() {
    console.log('updating')
    axios.get('/external/update').then(result => {
      console.log(result)
    }).catch(err => {
      console.log('error!')
    })
  }

  render() {
    return (
      <MuiThemeProvider>
        <Router>
          <div className='background'>
            <Banner loggedIn={this.state.loggedIn} update={this.update} logOut={this.logOut} signUp={this.signUp} logIn={this.logIn} userInfo={this.state.userInfo}/>
            <div className='container'>
              {this.state.loggedIn &&
                <SideBar userInfo={this.state.userInfo} loggedIn={this.state.loggedIn}/>
              }
              <Route exact path='/' render={() => <Splash loggedIn={this.state.loggedIn} userInfo={this.state.userInfo}/>}/>
              <Route exact path='/player/:id' render={() => <Player/>}/>
              <Route exact path='/:team' render={() => <Team loggedIn={this.state.loggedIn} userInfo={this.state.userInfo}/>}/>
              <Route exact path='/specificGame/:game/:player' render={() => <PlayerGame loggedIn={this.state.loggedIn} userInfo={this.state.userInfo}/>}/>
            </div>
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
