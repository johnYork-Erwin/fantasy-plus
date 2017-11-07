'use strict';

const express = require('express')
const router = express.Router();
const knex = require('../../knex');

router.get('/teams/:id', (req, res, next) => {
  knex('teams').where('id', '=', req.params.id).then(result => {
    res.send(result)
  })
  .catch(err => next(err))
})

module.exports = router;
