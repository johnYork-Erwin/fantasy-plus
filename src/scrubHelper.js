const deepcopy = require('deepcopy');

const playerStats = {
  team: '',
  rushAttempts: 0,
  rushYards: 0,
  rushTd: 0,
  rec: 0,
  recTargets: 0,
  recYards: 0,
  recTd: 0,
  returnTd: 0,
  twoPoints: 0,
  fumbles: 0,
  passAttempts: 0,
  passCompletions: 0,
  passYards: 0,
  passTd: 0,
  int: 0,
  plays: [],
  week: '',
}

const teamStats = {
  teamCode: '',
  score: 0,
  oppScore: 0,
  result: '',
  opp: '',
  home: false,
  week: 0,
  rush: {
    attempts: 0,
    yards: 0,
    touchdowns: 0,
  },
  pass: {
    attempts: 0,
    completions: 0,
    yards: 0,
    touchdowns: 0,
  },
  gameScript: [],
}

const scrubForTeams = function(obj) {
  const homeTeam = deepcopy(teamStats);
  homeTeam.home = true;
  const awayTeam = deepcopy(teamStats);
  homeTeam.teamCode = obj.home.team;
  homeTeam.opp = obj.home.opponent;
  awayTeam.teamCode = obj.home.opponent;
  awayTeam.opp = obj.home.team;
  homeTeam.week = obj.week;
  awayTeam.week = obj.week;
  homeTeam.score = obj.home_score;
  homeTeam.oppScore = obj.away_score;
  awayTeam.score = obj.away_score;
  awayTeam.oppScore = obj.home_score;
  if (homeTeam.score > awayTeam.score) {
    homeTeam.result = 'W';
    awayTeam.result = 'L';
  } else if (homeTeam.score === awayTeam.score) {
    homeTeam.result = 'D';
    awayTeam.result = 'D';
  } else {
    homeTeam.result = 'L';
    awayTeam.result = 'W';
  }
  for (let passer in obj.home.stats.passing) {
    passer = obj.home.stats.passing[passer];
    homeTeam.pass.attempts += passer.attempts;
    homeTeam.pass.completions += passer.completions;
    homeTeam.pass.yards += passer.yards;
    homeTeam.pass.touchdowns += passer.touchdowns;
  }
  for (let passer in obj.away.stats.passing) {
    passer = obj.away.stats.passing[passer];
    awayTeam.pass.attempts += passer.attempts;
    awayTeam.pass.completions += passer.completions;
    awayTeam.pass.yards += passer.yards;
    awayTeam.pass.touchdowns += passer.touchdowns;
  }
  for (let runner in obj.home.stats.rushing) {
    runner = obj.home.stats.rushing[runner];
    homeTeam.rush.attempts += runner.attempts;
    homeTeam.rush.yards += runner.yards;
    homeTeam.rush.touchdowns += runner.touchdowns;
  }
  for (let runner in obj.away.stats.rushing) {
    runner = obj.away.stats.rushing[runner];
    awayTeam.rush.attempts += runner.attempts;
    awayTeam.rush.yards += runner.yards;
    awayTeam.rush.touchdowns += runner.touchdowns;
  }
  let teams = {};
  teams[homeTeam.teamCode] = homeTeam;
  teams[awayTeam.teamCode] = awayTeam;
  return teams;
}

const scrubForPlayers = function(obj) {
  let players = {};
  //merges things so we can have an easier time looping through them
  const rushing = Object.assign(obj.away.stats.rushing, obj.home.stats.rushing)
  const passing = Object.assign(obj.away.stats.passing, obj.home.stats.passing)
  const receiving = Object.assign(obj.away.stats.receiving, obj.home.stats.receiving)
  const homeStats = Object.assign(obj.home.stats.receiving, obj.home.stats.passing, obj.home.stats.rushing);
  const awayStats = Object.assign(obj.away.stats.receiving, obj.away.stats.passing, obj.away.stats.rushing);
  let fumbles = {};
  //merges fumbles, there may be no stats for fumbles
  if (obj.away.stats.fumbles && obj.home.stats.fumbles) {
    fumbles = Object.assign(obj.away.stats.fumbles, obj.home.stats.fumbles)
  } else if (obj.away.stats.fumbles) {
    fumbles = obj.away.stats.fumbles;
  } else if (obj.home.stats.fumbles) {
    fumbles = obj.home.stats.fumbles;
  }
  //loop through all the stats in the game for running plays
  for (let key in rushing) {
    run = rushing[key]
    let current = run.name;
    let object = deepcopy(playerStats);
    object.rushTargets = run.attempts;
    object.rushYards = run.yards;
    object.rushTd = run.touchdowns;
    object.twoPoints = run.two_point_makes;
    players[current] = object;
  }
  //loop through all the stats in the game for receiving
  for (let key in receiving) {
    reception = receiving[key];
    let object;
    if (players.hasOwnProperty(reception.name)) {
      object = players[reception.name];
    } else {
      object = deepcopy(playerStats);
    }
    object.recYards = reception.yards;
    object.recTd = reception.touchdowns;
    object.rec = reception.receptions;
    object.twoPoints = reception.two_point_makes;
    players[reception.name] = object;
  }
  //loop through all the stats in the game for passing
  for (let key in passing) {
    pass = passing[key]
    let object;
    if (players.hasOwnProperty(pass.name)) {
      object = players[pass.name]
    } else {
      object = deepcopy(playerStats);
    }
    object.passAttempts = pass.attempts;
    object.passCompletions = pass.completions;
    object.int = pass.interceptions;
    object.passTd = pass.touchdowns;
    object.twoPoints = pass.two_point_makes;
    object.passYards = pass.yards;
    players[pass.name] = object;
  }
  //track fumbles
  for (let fumble in fumbles) {
    if (fumbles[fumble].fumbles_lost && !players.hasOwnProperty(fumbles[fumble].name)) {
      players[fumbles[fumble].name].fumbles ++;
    }
  }
  for (key in awayStats) {
    players[awayStats[key].name].team = obj.away.team;
    players[awayStats[key].name].week = obj.week;
  }
  for (key in homeStats) {
    players[homeStats[key].name].team = obj.home.team;
    players[homeStats[key].name].week = obj.week;
  }
  return players;
}

const scrubGame = function(obj) {
  const drives = Object.assign(obj.away.drives, obj.home.drives)
  let teams = scrubForTeams(obj);
  let players = scrubForPlayers(obj);
  //loops through all the drives of the game
  let timeLeft = 3600;
  let gameScript = []
  for (let drive in drives) {
    drive = drives[drive];
    //for tracking gameScript
    timeLeft -= drive.postime;
    let score = 0;
    if (drive.result !== 'Punt' || 'Missed FG') {
      if (drive.result === 'Touchdown') {
        score += 6;
        if (drive.plays[drive.plays.length-1].description.includes('extra point is GOOD')) {
          score++;
        }
      } else if (drive.result === 'Field Goal') {
        score += 3;
      }
      let builder = [];
      let homeScore = 0;
      let awayScore = 0;
      builder.push(timeLeft);
      if (drive.posteam === obj.home.team) {
        homeScore += score;
      } else {
        awayScore += score;
      }
      if (gameScript.length > 0) {
        awayScore += gameScript[gameScript.length-1][2]
        homeScore += gameScript[gameScript.length-1][1]
      }
      builder.push(homeScore);
      builder.push(awayScore);
      gameScript.push(builder);
      //ALSO NEED TRAKCING INTERCEPTIONS / FUMBLES FOR TD!
      //NEED SAFETYES!
    }
    //for tracking plays for players
    for (let play in drive.plays) {
      play = drive.plays[play].description
      //Here we have the description of the play
      if (!play.includes('- No Play')) {
        if (!play.match(/(kicks|Holder-|punt)/g)) {
          let offensivePlayers = play.match(/\w\.\w+(\s|\.)/g);
          if (offensivePlayers) {
            offensivePlayers = offensivePlayers.map(el => {
              return el.slice(0, el.length-1);
            })
          }
          if (offensivePlayers) {
            for (let i = 0; i < offensivePlayers.length; i++) {
              if (players.hasOwnProperty(offensivePlayers[i])) {
                players[offensivePlayers[i]].plays.push(play);
                if (i === 1) {
                  players[offensivePlayers[i]].recTargets++
                }
              }
            }
          }
        }
      }
    }
  }
  teams[obj.home.team].gameScript = gameScript;
  teams[obj.away.team].gameScript = gameScript;
  return {players: players, teams: teams}
}

module.exports = scrubGame;
