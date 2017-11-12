const deepcopy = require('deepcopy');

const playerStats = {
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
  //loop through all the stats in the game for running plays
  for (let key in obj.away.stats.rushing) {
    run = obj.away.stats.rushing[key];
    let current = run.name;
    current = current.split(' ')
    current = current[0];
    let object = deepcopy(playerStats);
    object.week = obj.week;
    object.teamCode = obj.away.team;
    object.rushAttempts = run.attempts;
    object.rushYards = run.yards;
    object.rushTd = run.touchdowns;
    object.twoPoints = run.two_point_makes;
    players[current] = object;
  }
  for (let key in obj.home.stats.rushing) {
    run = obj.home.stats.rushing[key]
    let current = run.name;
    current = current.split(' ')
    current = current[0];
    let object = deepcopy(playerStats);
    object.week = obj.week;
    object.teamCode = obj.home.team;
    object.rushAttempts = run.attempts;
    object.rushYards = run.yards;
    object.rushTd = run.touchdowns;
    object.twoPoints = run.two_point_makes;
    players[current] = object;
  }
  //loop through all the stats in the game for receiving
  for (let key in obj.home.stats.receiving) {
    reception = obj.home.stats.receiving[key];
    let current = reception.name;
    current = current.split(' ')
    if (current[0].length === 2) {
      current = current.join('')
    } else {
      current = current[0]
    }
    let object;
    if (players.hasOwnProperty(current)) {
      object = players[current];
    } else {
      object = deepcopy(playerStats);
      object.teamCode = obj.home.team;
      object.week = obj.week;
    }
    object.recYards = reception.yards;
    object.recTd = reception.touchdowns;
    if (reception.receptions) {
      object.rec = reception.receptions;
    } else object.rec = 0;
    object.twoPoints = reception.two_point_makes;
    players[current] = object;
  }
  for (let key in obj.away.stats.receiving) {
    reception = obj.away.stats.receiving[key];
    let current = reception.name;
    current = current.split(' ')
    if (current[0].length === 2) {
      current = current.join('')
    } else {
      current = current[0]
    }
    let object;
    if (players.hasOwnProperty(current)) {
      object = players[current];
    } else {
      object = deepcopy(playerStats);
      object.teamCode = obj.away.team;
      object.week = obj.week;
    }
    object.recYards = reception.yards;
    object.recTd = reception.touchdowns;
    if (reception.receptions) {
      object.rec = reception.receptions;
    } else object.rec = 0;
    object.twoPoints = reception.two_point_makes;
    players[current] = object;
  }
  //loop through all the stats in the game for passing
  for (let key in obj.away.stats.passing) {
    pass = obj.away.stats.passing[key]
    let current = pass.name;
    current = current.split(' ')
    current = current[0]
    let object;
    if (players.hasOwnProperty(current)) {
      object = players[current]
    } else {
      object = deepcopy(playerStats);
      object.teamCode = obj.away.team;
      object.week = obj.week;
    }
    object.passAttempts = pass.attempts;
    object.passCompletions = pass.completions;
    object.int = pass.interceptions;
    object.passTd = pass.touchdowns;
    object.twoPoints = pass.two_point_makes;
    object.passYards = pass.yards;
    players[current] = object;
  }
  for (let key in obj.home.stats.passing) {
    pass = obj.home.stats.passing[key]
    let current = pass.name
    current = current.split(' ')
    current = current[0]
    let object;
    if (players.hasOwnProperty(current)) {
      object = players[current]
    } else {
      object = deepcopy(playerStats);
      object.teamCode = obj.home.team;
      object.week = obj.week;
    }
    object.passAttempts = pass.attempts;
    object.passCompletions = pass.completions;
    object.int = pass.interceptions;
    object.passTd = pass.touchdowns;
    object.twoPoints = pass.two_point_makes;
    object.passYards = pass.yards;
    players[current] = object;
  }
  // there may be no stats for fumbles
  for (let fumble in obj.home.stats.fumbles) {
    fumble = obj.home.stats.fumbles[fumble];
    let current = fumble.name;
    current = current.split(' ')
    current = current[0]
    if (fumble.fumbles_lost === 1) {
      if (players.hasOwnProperty(current)) {
        players[current].fumbles++;
      }
    }
  }
  for (let fumble in obj.away.stats.fumbles) {
    fumble = obj.away.stats.fumbles[fumble];
    let current = fumble.name
    current = current.split(' ')
    current = current[0]
    if (fumble.fumbles_lost === 1) {
      if (players.hasOwnProperty(current)) {
        players[current].fumbles++;
      }
    }
  }
  return players;
}

const scrubGame = function(obj) {
  if (obj.home.team === 'LA') {
    obj.home.team = 'LAR';
    obj.away.opponent = 'LAR';
  }
  if (obj.home.team === 'SD') {
    obj.home.team = 'LAC';
    obj.away.opponent = 'LAC';
  }
  if (obj.away.team === 'LA') {
    obj.away.team = 'LAR';
    obj.home.opponent = 'LAR';
  }
  if (obj.away.team === 'SD') {
    obj.away.team = 'LAC';
    obj.home.opponent = 'LAC';
  }
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
    }
    //bad data so i have to scrub it in Here
    let newDrive = {};
    let playChecker = [];
    for (let play in drive.plays) {
      let playDescription = drive.plays[play].description
      if (!playChecker.includes(playDescription)) {
        playChecker.push(playDescription)
        newDrive[play] = drive.plays[play]
      }
    }
    //for tracking plays for players
    for (let play in newDrive) {
      play = newDrive[play].description
      //Here we have the description of the play
      if (!play.includes('- No Play') && !play.match(/(kicks|Holder-|punt)/g)) {
        let offensivePlayers = play.match(/\w\.\w+(\s|\.)/g);
        if (offensivePlayers) {
          offensivePlayers = offensivePlayers.map(el => {
            return el.slice(0, el.length-1);
          })
          for (let i = 0; i < offensivePlayers.length; i++) {
            if (players.hasOwnProperty(offensivePlayers[i])) {
              players[offensivePlayers[i]].plays.push(play);
              if (i === 1) {
                players[offensivePlayers[i]].recTargets++;
              }
            }
          }
        }
      }
    }
  }
  teams[obj.home.team].gameScript = gameScript;
  teams[obj.away.team].gameScript = gameScript;
  return {players: players, teams: teams, drives: drives}
}

module.exports = scrubGame;
