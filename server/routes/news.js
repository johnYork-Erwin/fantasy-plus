'use strict';

const express = require('express')
const router = express.Router();
const knex = require('../../knex');
let newsKey = process.env.newsKey;
const axios = require('axios');

router.get('/news', (req, res, next) => {
  if (newsKey === undefined) newsKey = 'a4af579244664b468d99db29ebfdbf04'
  axios.get(`https://newsapi.org/v1/articles?source=nfl-news&sortBy=latest&apiKey=${newsKey}`).then(result => {
    res.send(result.data.articles)
  })
  .catch(err => console.log('there was an error when we tried to load news!'))
})

module.exports = router;
