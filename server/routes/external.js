'use strict';
let key = '3YGwL0H9Chk71QfcUMKzPjiTx2qBuopl';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const scrubHelper = require('../../src/scrubHelper.js')

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
    axios.post(`https://profootballapi.com/schedule?api_key=${key}&year=2017&week=${weekNumber}`).then(result =>{
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


router.get('/external/update', (req, res, next) => {
  getSchedule(7).then(result => {
    getGame(result[5].toString()).then(game => {
      let thingy = scrubHelper(game)
      let players = thingy.players;
      let teams = thingy.teams;
    })
    .catch(err => console.log('error getting game by id'))
  })
  .catch(err => console.log('error fetching schedule'))
})

module.exports = router;
