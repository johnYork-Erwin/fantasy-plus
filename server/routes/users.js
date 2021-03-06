'use strict';

const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const knex = require('../../knex');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');

//PROCESS.ENV IS THE PROBLEM! It lost the key to newsAPI and I think it's also what's messing up the authorize function.
//LOOK INTO MORE ABOUT THIS

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Log in in order to store your results'));
    }
    req.claim = payload;
    return next();
  });
};

router.get('/users/username', authorize, (req, res, next) => {
  knex('users').where('users.id', '=', req.claim.userId).select('username').then(result => {
    if (result.length === 1) {
      res.send(result)
    }
  })
  .catch(err => {
    // console.log(err)
  })
})

router.post('/users', (req, res, next) => {
  knex('users').where('username', '=', req.body.username).first()
    .then((row) => {
      if (row !== undefined && row.length !== 0) {
        return next(boom.create(400, 'Username already in use'));
      }
      // console.log('username is not taken');
      return bcrypt.hash(req.body.password, 12)
    }).then((password) => {
      const newUser = {username: req.body.username, hash_pass: password}
      return knex('users').insert(newUser, '*')
    }).then((result) => {
      // console.log('last step in post users')
      result = result[0];
      delete result.hash_pass;
      res.send(result)
    }).catch((err) => console.log('Internal error creating new user'))
})

module.exports = router;
