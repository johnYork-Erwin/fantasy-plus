import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

const playerStats = {
  team: '',
  rushAttempts: 0,
  rushYards: 0,
  rushTd: 0,
  rec: 0,
  recTargets: 0,
  recYards: 0,
  recTd: 0,
  returnTd: 0,
  twoPoints: 0,
  fumbles: 0,
  passAttempts: 0,
  passCompletions: 0,
  passYards: 0,
  passTd: 0,
  int: 0,
  plays: []
}

const teamStats = {
  teamCode: '',
  score: 0,
  oppScore: 0,
  result: '',
  opp: '',
  home: false,
  week: 0,
  rush: {
    attempts: 0,
    yards: 0,
    touchdowns: 0,
  },
  pass: {
    attempts: 0,
    completions: 0,
    yards: 0,
    touchdowns: 0,
  },
  gameScript: [],
}

class App extends Component {

  constructor(props) {
    super(props)
    this.scrubGame = this.scrubGame.bind(this)
  }

  componentWillMount() {
    axios.get('/external/schedule/7').then(result => {
      axios.get(`/external/game/${result.data[0]}`).then(result => {
        this.scrubGame(result.data)
      })
    })
  }

  scrubGame(obj) {
    console.log(obj)
    //also need something to track the team's stats
    let players = {};
    let teams = {};
    //merges things so we can have an easier time looping through them
    const drives = Object.assign(obj.away.drives, obj.home.drives)
    const rushing = Object.assign(obj.away.stats.rushing, obj.home.stats.rushing)
    const passing = Object.assign(obj.away.stats.passing, obj.home.stats.passing)
    const receiving = Object.assign(obj.away.stats.receiving, obj.home.stats.receiving)
    let fumbles = {};
    //merges fumbles, there may be no stats for fumbles
    if (obj.away.stats.fumbles && obj.home.stats.fumbles) {
      fumbles = Object.assign(obj.away.stats.fumbles, obj.home.stats.fumbles)
    } else if (obj.away.stats.fumbles) {
      fumbles = obj.away.stats.fumbles;
    } else if (obj.home.stats.fumbles) {
      fumbles = obj.home.stats.fumbles;
    }
    //team tracking
    const homeTeam = Object.assign({}, teamStats);
    homeTeam.home = true;
    const awayTeam = Object.assign({}, teamStats);
    homeTeam.teamCode = obj.home.team;
    awayTeam.teamCode = obj.home.opponent;
    homeTeam.week = obj.week;
    awayTeam.week = obj.week;
    homeTeam.score = obj.home_score;
    homeTeam.oppScore = obj.away_score;
    awayTeam.score = obj.away_score;
    awayTeam.oppScore = obj.home_score;
    if (homeTeam.score > awayTeam.score) {
      homeTeam.result = 'W';
      awayTeam.result = 'L';
    } else if (homeTeam.score === awayTeam.score) {
      homeTeam.result = 'D';
      awayTeam.result = 'D';
    } else {
      homeTeam.result = 'L';
      awayTeam.result = 'W';
    }
    for (let passer in obj.home.stats.passing) {
      passer = obj.home.stats.passing[passer];
      homeTeam.pass.attempts += passer.attempts;
      homeTeam.pass.completions += passer.completions;
      homeTeam.pass.yards += passer.yards;
      homeTeam.pass.touchdowns += passer.touchdowns;
    }
    console.log(awayTeam)
    for (let passer in obj.away.stats.passing) {
      passer = obj.away.stats.passing[passer];
      awayTeam.pass.attempts += passer.attempts;
      awayTeam.pass.completions += passer.completions;
      awayTeam.pass.yards += passer.yards;
      awayTeam.pass.touchdowns += passer.touchdowns;
    }
    for (let runner in obj.home.stats.rushing) {
      runner = obj.home.stats.rushing[runner];
      homeTeam.rush.attempts += runner.attempts;
      homeTeam.rush.yards += runner.yards;
      homeTeam.rush.touchdowns += runner.touchdowns;
    }
    for (let runner in obj.away.stats.rushing) {
      runner = obj.away.stats.rushing[runner];
      awayTeam.rush.attempts += runner.attempts;
      awayTeam.rush.yards += runner.yards;
      awayTeam.rush.touchdowns += runner.touchdowns;
    }
    //Players tracking
    //loop through all the stats in the game for running plays
    for (let run in rushing) {
      run = rushing[run]
      let current = run.name;
      let object = Object.assign({}, playerStats);
      object.rushTargets = run.attempts;
      object.rushYards = run.yards;
      object.rushTd = run.touchdowns;
      object.twoPoints = run.two_point_makes;
      object.plays = [];
      players[current] = object;
    }
    //loop through all the stats in the game for receiving
    for (let reception in receiving) {
      reception = receiving[reception];
      let object;
      if (players.hasOwnProperty(reception.name)) {
        object = players[reception.name];
      } else {
        object = Object.assign({}, playerStats);
      }
      object.recYards = reception.yards;
      object.recTd = reception.touchdowns;
      object.rec = reception.receptions;
      object.twoYards = reception.two_point_makes;
      object.plays = [];
      players[reception.name] = object;
    }
    //loop through all the stats in the game for passing
    for (let pass in passing) {
      pass = passing[pass]
      let object;
      if (players.hasOwnProperty(pass.name)) {
        object = players[pass.name]
      } else {
        object = Object.assign({}, playerStats);
      }
      object.passAttempts = pass.attempts;
      object.passCompletions = pass.completions;
      object.int = pass.interceptions;
      object.passTd = pass.touchdowns;
      object.twoPoints = pass.two_point_makes;
      object.passYards = pass.yards;
      object.plays = [];
      players[pass.name] = object;
    }
    //track fumbles
    for (let fumble in fumbles) {
      if (fumbles[fumble].fumbles_lost && !players.hasOwnProperty(fumbles[fumble].name)) {
        players[fumbles[fumble].name].fumbles ++;
      }
    }
    //loops through all the drives of the game
    let timeLeft = 3600;
    let gameScript = []
    for (let drive in drives) {
      drive = drives[drive];
      //for tracking gameScript
      timeLeft -= drive.postime;
      let score = 0;
      if (drive.result !== 'Punt' || 'Missed FG') {
        if (drive.result === 'Touchdown') {
          score += 6;
          if (drive.plays[drive.plays.length-1].description.includes('extra point is GOOD')) {
            score++;
          }
        } else if (drive.result === 'Field Goal') {
          score += 3;
        }

        let builder = [];
        let homeScore = 0;
        let awayScore = 0;
        builder.push(timeLeft);
        if (drive.posteam === obj.home.team) {
          homeScore += score;
        } else {
          awayScore += score;
        }
        if (gameScript.length > 0) {
          awayScore += gameScript[gameScript.length-1][2]
          homeScore += gameScript[gameScript.length-1][1]
        }
        builder.push(homeScore);
        builder.push(awayScore);
        gameScript.push(builder);
        //ALSO NEED TRAKCING INTERCEPTIONS / FUMBLES FOR TD!
        //NEED SAFETYES!

      }

      //for tracking plays for players
      for (let play in drive.plays) {
        play = drive.plays[play].description
        //Here we have the description of the play
        if (!play.includes('- No Play')) {
          if (!play.match(/(kicks|Holder-|punt)/g)) {
            let offensivePlayers = play.match(/\w\.\w+(\s|\.)/g);
            if (offensivePlayers) {
              offensivePlayers = offensivePlayers.map(el => {
                return el.slice(0, el.length-1);
              })
            }
            if (offensivePlayers) {
              for (let i = 0; i < offensivePlayers.length; i++) {
                if (players.hasOwnProperty(offensivePlayers[i])) {
                  players[offensivePlayers[i]].plays.push(play);
                  if (i === 1) {
                    players[offensivePlayers[i]].recTargets++
                  }
                }
              }
            }
          }
        }
      }
    }
    homeTeam.gameScript = gameScript;
    awayTeam.gameScript = gameScript;
    teams[homeTeam.teamCode] = homeTeam;
    teams[awayTeam.teamCode] = awayTeam;
    console.log(players)
    console.log(teams)
    //write code to track the gameScript
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
