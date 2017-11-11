'use strict';

const express = require('express')
const router = express.Router();
const knex = require('../../knex');

router.get('/teams/players/:position/:teamId', (req, res, next) => {
  knex('teams').where('teams.id', '=', req.params.teamId).innerJoin('players', 'players.team_id', 'teams.id').andWhere('players.position', '=', req.params.position)
    .then(result => {
      res.send(result)
    })
    .catch(err => next(err))
})

router.get('/teamsByCode/:code', (req, res, next) => {
  knex('teams').where('team_code', '=', req.params.code).then(result => {
    if (result.length === 1) {
      res.send(result)
    } else {
      next()
    }
  })
  .catch(err => next(err))
})

router.get('/teams/:id', (req, res, next) => {
  knex('teams').where('id', '=', req.params.id).then(result => {
    res.send(result)
  })
  .catch(err => next(err))
})

module.exports = router;
