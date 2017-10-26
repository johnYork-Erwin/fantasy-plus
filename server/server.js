'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({path: '../.env'});
}

const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
const cookie = require('cookie-parser');

const app = express()
app.use(bodyParser.json());
app.use(cookie());

// enable static 'public' directory for serving html/css/js files to client
// app.use(express.static(path.join('public')));

const external = require('./routes/external')
const players = require('./routes/players')
const teams = require('./routes/teams')
const userPlayers = require('./routes/userPlayers')
const users = require('./routes/users')
const token = require('./routes/token')

app.use(external)
app.use(players)
app.use(teams)
app.use(userPlayers)
app.use(users)
app.use(token)
// app.use(express.static(path.join(__dirname, "..", "build")));
//
// app.get("/*", function(req, res) {
//   res.sendFile(path.join(__dirname, "../build/index.html"));
// });

app.use((req, res) => {
  res.sendStatus(404);
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('listening on port', port)
})
