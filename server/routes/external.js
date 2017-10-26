'use strict';
let key = '3YGwL0H9Chk71QfcUMKzPjiTx2qBuopl'

const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/external/game/:id', (req, res, next) => {
  axios.post(`https://profootballapi.com/game?api_key=${key}&game_id=${req.params.id}`).then(result => {
    res.send(result.data)
  })
  .catch(err => {
    console.log(err)
  })
})

router.get('/external/schedule/:week', (req, res, next) => {
  axios.post(`https://profootballapi.com/schedule?api_key=${key}&year=2017&week=${req.params.week}`).then(result =>{
    let idArray = result.data.map(el => {
      return el.id;
    })
    res.send(idArray)
  })
  .catch(err => {
    console.log(err)
  })
})

module.exports = router;
