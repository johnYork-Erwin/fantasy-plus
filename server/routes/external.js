'use strict';
const key = process.env.key;
const express = require('express');
const router = express.Router();
const axios = require('axios');
const scrubHelper = require('../../src/scrubHelper.js')
const knex = require('../../knex.js');
const deepcopy = require('deepcopy');

const playerPlate = {
  team_code: '',
  player_name: '',
  jersey_number: '',
  position: '',
  headshot: '',
  height: '',
  college: '',
  birthdate: '',
  weight: '',
  status: '',
  stats: {
    season: '',
    games: [],
  },
}

router.get('/external/update', (req, res, next) => {
  let players = {};
  getCurrent().then(result => {
    //returns an array of game ids for the week
    return getSchedule(result+1);
  })
  .then(result => {
    //gets game data for the given game ids
    return getGame(result[0]);
  })
  .then(game => {
    //scrubs the game data
    return scrubHelper(game);
  })
  .then(gameStats => {
    players = gameStats.players;
    let teams = [];
    for (let team in gameStats.teams) {
      teams.push(buildTeamPatch(gameStats.teams[team]));
    }
    //updates the teams DB based on this game
    return Promise.all(teams);
  }).then(builtTeams => {
    let newArray = [];
    for (let team in builtTeams) {
      newArray.push(patchTeam(builtTeams[team]))
    }
    return Promise.all(newArray);
  }).then(results => {
    let playerArray = [];
    for (let player in players) {
      //merges player data from 2nd api with player data from said game
      playerArray.push(getPlayerInfo(player, players[player].teamCode, players[player]));
    }
    //returns an array of players w/ their data from the game and the api
    return Promise.all(playerArray);
  })
  .then(playerArray => {
    const newArray = [];
    for (let i = 0; i < playerArray.length; i++) {
      //call to my DB to add teamID to each players' data
      newArray.push(addTeamId(playerArray[i]))
    }
    //returns an array of completed player data
    return Promise.all(newArray);
  })
  .then(playerArray => {
    const newArray = [];
    for (let i = 0; i < playerArray.length; i++) {
      //updates player DB for each player
      newArray.push(updatePlayer(playerArray[i]))
    }
    return Promise.all(newArray);
  })
  .then(result => {
    //logs this after the DB has been updated for all these players
    console.log('updated week 1')
  })
  .catch(err => console.log(err, 'error fetching "current" data'))
})

//Gets what week we're up to in RL
function getCurrent() {
  return new Promise(function (resolve, reject) {
    knex('current')
      .then(result => {
        resolve(result[0].upToDateThrough);
      })
      .catch(err => {
        reject(err)
      })
  })
}

//Gets the schedule for that week
function getSchedule(weekNumber) {
  return new Promise(function (resolve, reject) {
    axios.post(`https://profootballapi.com/schedule?api_key=${key}&year=2017&week=${weekNumber}&season_type=REG`).then(result =>{
      let idArray = result.data.map(el => {
        return el.id;
      })
      resolve(idArray);
    })
    .catch(err => {
      reject(console.log('error calling for schedule'))
    })
  })
}

//gets the game ids for that week's schedule
function getGame(gameId) {
  return new Promise(function (resolve, reject) {
    axios.post(`https://profootballapi.com/game?api_key=${key}&game_id=${gameId}`).then(result => {
      resolve(result.data);
    })
    .catch(err => {
      reject(console.log('error calling for game by id on line 15'))
    })
  })
}

//gets info about the player
function getPlayerInfo(player, team, stats) {
  return new Promise(function (resolve, reject) {
    axios.get(`http://api.suredbits.com/nfl/v0/players/${player.slice(2)}`).then(result => {
      result = result.data
      let retVal = deepcopy(playerPlate);
      for (let i = 0; i < result.length; i++) {
        if (player.slice(0, -player.length+1) === result[i].firstName.slice(0, -result[i].firstName.length+1)
          && result[i].lastName === player.slice(2)) {
          if (result[i].team === team || (result[i].team === 'JAC' && team === 'JAX')) {
            retVal.team_code = team;
            retVal.player_name = result[i].fullName;
            retVal.jersey_number = result[i].uniformNumber;
            retVal.height = result[i].height;
            retVal.weight = result[i].weight;
            retVal.birthdate = result[i].birthDate;
            retVal.college = result[i].college;
            retVal.status = result[i].status;
            retVal.position = result[i].position;
            retVal.stats = stats
          }
        }
      }
      resolve(retVal);
    }).catch(err => {
      reject(err)
    })
  })
}

//gets the teamId from the database that should be added to the player
function addTeamId(player) {
  return new Promise(function (resolve, reject) {
    knex('teams').where('team_code', '=', player.team_code).select('id')
      .then(result => {
        if (result.length > 0) {
          player.team_id = result[0].id;
        }
        resolve(player)
      })
      .catch(err => {
        reject(err)
      })
  })
}

//Entering player data into the database
function updatePlayer(player) {
  return new Promise(function (resolve, reject) {
    knex('players').where('player_name', '=', player.player_name)
      .andWhere('team_code', '=', player.team_code).then(result => {
      if (result.length === 0) {
        resolve(postPlayer(player));
      } else {
        resolve(patchPlayer(player, result[0]));
      }
    })
    .catch(err => {
      reject(err)
    })
  })
}

function postPlayer(player) {
  if (player.player_name) {
    let seasonStats = {
      rushAttempts: player.stats.rushAttempts,
      rushYards: player.stats.rushYards,
      rushTd: player.stats.rushTd,
      rec: player.stats.rec,
      recTargets: player.stats.recTargets,
      recYards: player.stats.recYards,
      recTd: player.stats.recTd,
      returnTd: player.stats.returnTd,
      twoPoints: player.stats.twoPoints,
      fumbles: player.stats.fumbles,
      passAttempts: player.stats.passAttempts,
      passCompletions: player.stats.passCompletions,
      passYards: player.stats.passYards,
      passTd: player.stats.passTd,
      int: player.stats.int,
      totalTd: (player.stats.recTd + player.stats.rushTd + player.stats.returnTd + player.stats.passTd),
    }
    let game = deepcopy(seasonStats);
    game.plays = player.stats.plays;
    let week = player.stats.week
    delete player.stats;
    player.total_points = (seasonStats.rushYards + seasonStats.recYards)/10
      + (seasonStats.passYards)/25 + (seasonStats.recTd + seasonStats.rushTd + seasonStats.returnTd)*6 + (seasonStats.passTd * 4)
      - (seasonStats.int + seasonStats.fumbles)*2 + (seasonStats.twoPoints)*2;
    seasonStats.totalPoints = player.total_points;
    game.totalPoints = player.total_points;
    player.stats = {
      seasonStats: seasonStats,
      games: {},
    }
    player.stats.games[week] = game;
    delete player.stats.week;
    return new Promise(function (resolve, reject) {
      knex('players').insert(player).then(result => {
        resolve('success')//Do I need to do anything here?
      })
      .catch(err => {
        reject(err);
      })
    })
  } else {
    reject('player not found')
  }
}

function patchPlayer(player, current) {
  return new Promise(function (resolve, reject) {
    if (!current.stats.games.hasOwnProperty(player.stats.week)) {
      player.stats.totalPoints = (player.stats.rushYards + player.stats.recYards)/10
        + (player.stats.passYards)/25 + (player.stats.recTd + player.stats.rushTd + player.stats.returnTd)*6 + (player.stats.passTd * 4)
        - (player.stats.int + player.stats.fumbles)*2 + (player.stats.twoPoints)*2;
      player.stats.totalTd = (player.stats.rushTd + player.stats.passTd + player.stats.returnTd + player.stats.recTd)
      for (let key in current.stats.seasonStats) {
        current.stats.seasonStats[key] += player.stats[key];
      }
      delete player.stats.teamCode;
      const week = player.stats.week;
      delete player.stats.week;
      current.stats.games[week] = player.stats;
      current.total_points = Number(player.stats.totalPoints) + Number(current.total_points);
      knex('players').where('id', '=', current.id)
        .update({
          total_points: current.total_points,
          stats: current.stats,
        }).then(result => {
          resolve(result)
        }).catch(err => reject(err))
    } else {
      resolve('game already in database')
    }
  })
}

//builds patch for team to the database
function buildTeamPatch(team) {
  return new Promise(function (resolve, reject) {
    knex('teams').where('team_code', '=', team.teamCode).then(result => {
      if (Object.keys(result[0].stats).length === 0) {
        result[0].stats.record = {
          wins: 0,
          losses: 0,
          ties: 0,
        }
        result[0].stats.seasonStats = {
          rushing: {
            attempts: 0,
            yards: 0,
            touchdowns: 0,
          },
          passing: {
            attempts: 0,
            completions: 0,
            yards: 0,
            touchdowns: 0,
          },
        }
        result[0].stats.games = {}
      }
      if (!result[0].stats.games.hasOwnProperty(team.week)) {
        if (team.result === 'W') result[0].stats.record.wins++
        else if (team.result === 'L') result[0].stats.record.losses++
        else if (team.result === 'D') result[0].stats.record.ties++
        for (let key in team.rush) {
          result[0].stats.seasonStats.rushing[key] += team.rush[key];
        }
        for (let key in team.pass) {
          result[0].stats.seasonStats.passing[key] += team.pass[key];
        }
        let game = {
          opp: team.opp,
          score: team.score,
          oppScore: team.oppScore,
          result: team.result,
          home: team.home,
          rushing: team.rush,
          passing: team.pass,
          gameScript: team.gameScript,
        }
        result[0].stats.games[team.week] = game;
        resolve(result[0])
      } else {
        resolve('No Work To Do')
      }
    })
    .catch(err => reject(err))
  })
}

function patchTeam(team) {
  return new Promise(function (resolve, reject) {
    if (team === 'No Work To Do') {
      resolve('done')
    } else {
      knex('teams').where('id', '=', team.id).update({
        stats: team.stats
      }).then(result => {
        resolve(result)
      }).catch(err => {
        reject(err)
      })
    }
  })
}


module.exports = router;
