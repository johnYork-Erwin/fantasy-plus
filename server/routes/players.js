'use strict';

const express = require('express')
const router = express.Router();
const knex = require('../../knex');

router.get('/players/:playerName', (req, res, next) => {
  knex('players').where('player_name_full', '=', req.params.playerName)
    .then(results => {
      if (results.length !== 1) {
        res.send('player not found')
      } else {
        res.send(results[0])
      }
    }).catch(err => {
      next(err)
    })
})

router.get('/players/leaders/:position', (req, res, next) => {
  knex('players').innerJoin('teams', 'teams.id', 'players.team_id').where('position', '=', req.params.position).orderBy('total_points', 'desc')
    .select('players.position', 'players.player_name_full', 'teams.team_code', 'players.total_points', 'players.stats')
    .then(results => {
      res.send(results.slice(0,5))
    })
    .catch(err => next(err))
})

router.get('/players/byId/:id', (req, res, next) => {
  knex('players').where('id', '=', req.params.id)
    .then(result => {
      if (result.length) {
        res.send(result);
      } else {
        res.send('player not found')
      }
    }).catch(err => {
      next(err)
    })
})

module.exports = router;
