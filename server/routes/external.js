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

//Gets what week we're up to in our database
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

//Gets what week we're up to in RL
function getReal() {
  return new Promise(function (resolve, reject) {
    axios.get('http://api.suredbits.com/nfl/v0/info').then(result => {
      resolve(result.data.week.slice(7))
    }).catch(err => reject(err))
  })
}

router.get('/external', (req, res, next) => {
  let upToDateThrough;
  getCurrent().then(result => {
    upToDateThrough = result;
    return getReal();
  }).then(result => {
    let array = [];
    for (let i = upToDateThrough+1; i < result; i++) {
      array.push(update(i));
      upToDateThrough = i;
    }
    return Promise.all(array);
  }).then(result => {
    console.log(result)
    let obj = {upToDateThrough: upToDateThrough}
    return knex('current').first().update(obj)
  }).then(result => {
    res.send('successfully updated our DB!')
  }).catch(err => next(err))
})

function update(weekToUpdate) {
  console.log(`updating week ${weekToUpdate}`)
  return new Promise(function (resolve, reject) {
    let players = [];
    getSchedule(weekToUpdate)
    .then(result => {
      //gets game data for the given game ids
      let array = [];
      for (let i = 0; i < result.length; i++) {
        array.push(getGame(result[i]));
      }
      return Promise.all(array);
    }).then(games => {
      let array = [];
      for (let i = 0; i < games.length; i++) {
        if (games[i] !== undefined) {
          array.push(scrubHelper(games[i]))
        }
      }
      //scrubs the game data
      return Promise.all(array);
    }).then(gameStats => {
      let array = [];
      for (let i = 0; i < gameStats.length; i++) {
        players.push(gameStats[i].players);
        let teams = [];
        for (let team in gameStats[i].teams) {
          teams.push(buildTeamPatch(gameStats[i].teams[team]));
        }
        array.push(Promise.all(teams));
      }
      return Promise.all(array);
    }).then(builtTeams => {
      let array = [];
      for (let i = 0; i < builtTeams.length; i++) {
        let newArray = [];
        for (let team in builtTeams[i]) {
          newArray.push(patchTeam(builtTeams[i][team]))
        }
        array.push(Promise.all(newArray));
      }
      return Promise.all(array);

      //switching to work on players
    }).then(results => {
      let playersArray = [];
      for (let i = 0; i < players.length; i++) {
        for (let player in players[i]) {
          players[i][player].player_name = player;
          playersArray.push(addTeamId(players[i][player]))
        }
      }
      return Promise.all(playersArray)
    }).then(playersArray => {
      return finishPlayers(playersArray)
    }).then(result => {
      resolve( 'successfully updated the week' );
    }).catch(err => reject(err))
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
  if (gameId !== 2017091006) {
    return new Promise(function (resolve, reject) {
      axios.post(`https://profootballapi.com/game?api_key=${key}&game_id=${gameId}`).then(result => {
        resolve(result.data);
      })
      .catch(err => {
        reject(console.log('error calling for game by id'))
      })
    })
  }
}

async function finishPlayers(playersArray) {
  let finishedArray = [];
  while(playersArray.length !== 0) {
    let player = playersArray.splice(0,1);
    let temp = await updatePlayer(player)
    finishedArray = finishedArray.concat([temp])
  }
  return finishedArray;
}

//gets the teamId from the database that should be added to the player
function addTeamId(player) {
  if (player.teamCode === 'LA') player.teamCode = 'LAR'
  return new Promise(function (resolve, reject) {
    knex('teams').where('team_code', '=', player.teamCode).select('id')
      .then(result => {
        if (result.length === 1) {
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
    knex('players').where('player_name', '=', player[0].player_name)
      .andWhere('team_id', '=', player[0].team_id).then(result => {
      if (result.length === 0) {
        resolve(getPlayerInfo(player[0].player_name, player[0].teamCode, player[0]));
      } else {
        resolve(patchPlayer(player[0], result[0]));
      }
    })
    .catch(err => {
      reject(err)
    })
  })
}

//gets info about the player
function getPlayerInfo(player, team, stats) {
  return new Promise(function (resolve, reject) {
    axios.get(`http://api.suredbits.com/nfl/v0/players/${player.slice(2)}`).then(result => {
      result = result.data
      let retVal = deepcopy(playerPlate);
      let found = false;
      for (let i = 0; i < result.length; i++) {
        if (player.slice(0, -player.length+1) === result[i].firstName.slice(0, -result[i].firstName.length+1)
        && result[i].lastName === player.slice(2)) {
          if (result[i].team === team || (result[i].team === 'JAC' && team === 'JAX')) {
            found = true;
            if (result[i].team === 'JAC') retVal.team_code = 'JAX';
            else retVal.team_code = team;
            retVal.player_name = player;
            retVal.player_name_full = result[i].fullName;
            retVal.jersey_number = result[i].uniformNumber;
            retVal.height = result[i].height;
            retVal.weight = result[i].weight;
            retVal.birthdate = result[i].birthDate;
            retVal.college = result[i].college;
            retVal.status = result[i].status;
            retVal.position = result[i].position;
            retVal.stats = stats;
            retVal.team_id = stats.team_id;
            i = result.length;
          }
        }
      }
      if (found) {
        resolve(postPlayer(retVal));
      } else {
        resolve(postPlayer({
          player_name: player,
          stats: stats,
          team_id: stats.team_id,
        }))
      }
    }).catch(err => {
      console.log('player not found')
    })
  })
}

function postPlayer(player) {
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
      resolve('success!')
    }).catch(err => {
      reject(err)
    })
  })
}

function patchPlayer(player, current) {
  return new Promise(function (resolve, reject) {
    if (!current.stats.games.hasOwnProperty(player.week)) {
      player.totalPoints = (player.rushYards + player.recYards)/10
        + (player.passYards)/25 + (player.recTd + player.rushTd + player.returnTd)*6 + (player.passTd * 4)
        - (player.int + player.fumbles)*2 + (player.twoPoints)*2;
      player.totalTd = (player.rushTd + player.passTd + player.returnTd + player.recTd)
      for (let key in current.stats.seasonStats) {
        current.stats.seasonStats[key] += player[key];
      }
      delete player.teamCode;
      const week = player.week;
      delete player.week;
      delete player.player_name;
      delete player.team_id;
      delete player.totalTd;
      current.stats.games[week] = player;
      current.total_points = Number(player.totalPoints) + Number(current.total_points);
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
  let teamFinder;
  if (team.teamCode === 'LA') {
    teamFinder = 'LAR';
  } else {
    teamFinder = team.teamCode
  }
  return new Promise(function (resolve, reject) {
    knex('teams').where('team_code', '=', teamFinder).then(result => {
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
