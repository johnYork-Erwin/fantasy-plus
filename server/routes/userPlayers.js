'use strict';

const express = require('express')
const router = express.Router();
const knex = require('../../knex');
const jwt = require('jsonwebtoken');

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      console.log('Log in in order to save a player')
      throw(err)
    }
    req.claim = payload;
    return next();
  });
};

router.delete('/userPlayers/:id', authorize, (req, res, next) => {
  knex('users-players').where('user_id', '=', req.claim.userId).andWhere('player_id', '=', req.params.id).del().then(results => {
    if (results === 1) {
      res.send('success')
    } else res.send('failure')
  })
  .catch(err => {
    console.log(err)
  })
})

router.get('/userPlayers', authorize, (req, res, next) => {
  knex('users-players').where('user_id', '=', req.claim.userId).select('player_id')
    .then(results => {
      res.send(results)
    })
    .catch(err => {
      console.log(err);
    })
})

router.post('/userPlayers/:id', authorize, (req, res, next) => {
  let object = {
    user_id: req.claim.userId,
    player_id: req.params.id,
  }
  knex('users-players').where('user_id', '=', object.user_id).andWhere('player_id', '=', object.player_id)
    .then(result => {
      if (result.length !== 0) {
        res.send('player already added for that user')
      } else {
        return knex('users-players').insert(object)
      }
    })
    .then(result => {
      res.send(result)
    }).catch(err => {
      return next(err)
    })
})

module.exports = router;
