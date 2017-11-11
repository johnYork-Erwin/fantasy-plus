'use strict';

const express = require('express')
const router = express.Router();
const knex = require('../../knex');
const newsKey = process.env.newsKey;
const axios = require('axios');

router.get('/news', (req, res, next) => {
  axios.get(`https://newsapi.org/v1/articles?source=nfl-news&sortBy=latest&apiKey=${newsKey}`).then(result => {
    res.send(result.data.articles)
  })
  .catch(err => console.log(err))
})

module.exports = router;
