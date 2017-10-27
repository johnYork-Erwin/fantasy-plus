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

function getPlayerInfo(player, team, stats) {
  return new Promise(function (resolve, reject) {
    axios.get(`http://api.suredbits.com/nfl/v0/players/${player.slice(2)}`).then(result => {
      result = result.data
      let retVal = deepcopy(playerPlate);
      for (let i = 0; i < result.length; i++) {
        if (player === result[i].gsisName) {
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
    player.stats = {
      seasonStats: seasonStats,
      games: {},
    }
    player.stats.games[week] = game;
    delete player.week;
    knex('players').insert(player).then(result => {

    })
    .catch(err => {
      console.log(err)
    })
  }
}

function patchPlayer(player) {
  console.log('patching', player)
}

function updatePlayer(player) {
  return new Promise(function (resolve, reject) {
    knex('players').where('player_name', '=', player.player_name).andWhere('team_code', '=', player.team_code).then(result => {
      if (result.length === 0) {
        postPlayer(player);
      } else {
        patchPlayer(player);
      }
    })
    .catch(err => {
      console.log(err);
    })
  })
}

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

router.get('/external/update', (req, res, next) => {
  getCurrent().then(result => {
    return getSchedule(result+1);
  })
  .then(result => {
    return getGame(result[0]);
  })
  .then(game => {
    return scrubHelper(game);
  })
  .then(gameStats => {
    let players = gameStats.players;
    let playerArray = [];
    for (let player in players) {
      const playerInfo = getPlayerInfo(player, players[player].team, players[player])
      playerArray.push(playerInfo);
    }
    return Promise.all(playerArray);
  })
  .then(playerArray => {
    const newArray = [];
    for (let i = 0; i < playerArray.length; i++) {
      newArray.push(addTeamId(playerArray[i]))
    }
    return Promise.all(newArray);
  })
  .then(playerArray => {
    const newArray = [];
    for (let i = 0; i < playerArray.length; i++) {
      newArray.push(updatePlayer(playerArray[i]))
    }
    return Promise.all(newArray);
  })
  .then(result => {
    console.log('updated week 1')
  })
  .catch(err => console.log(err, 'error fetching "current" data'))
})

module.exports = router;
