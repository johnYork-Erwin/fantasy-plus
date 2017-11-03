const teams = [{
  team_code : 'ARI',
  team_name : 'Arizona Cardinals',
  stats : {},
},
{
  team_code : 'ATL',
  team_name : 'Atlanta Falcons',
  stats : {},
},
{
  team_code : 'BAL',
  team_name : 'Baltimore Ravens',
  stats : {},
},
{
  team_code : 'BUF',
  team_name : 'Buffalo Bills',
  stats : {},
},
{
  team_code : 'CAR',
  team_name : 'Carolina Panthers',
  stats : {},
},
{
  team_code : 'CHI',
  team_name : 'Chicago Bears',
  stats : {},
},
{
  team_code : 'CIN',
  team_name : 'Cincinnati Bengals',
  stats : {},
},
{
  team_code : 'CLE',
  team_name : 'Cleveland Browns',
  stats : {},
},
{
  team_code : 'DAL',
  team_name : 'Dallas Cowboys',
  stats : {},
},
{
  team_code : 'DEN',
  team_name : 'Denver Broncos',
  stats : {},
},
{
  team_code : 'DET',
  team_name : 'Detroit Lions',
  stats : {},
},
{
  team_code : 'GB',
  team_name : 'Green Bay Packers',
  stats : {},
},
{
  team_code : 'HOU',
  team_name : 'Houston Texans',
  stats : {},
},
{
  team_code : 'IND',
  team_name : 'Indianapolis Colts',
  stats : {},
},
{
  team_code : 'JAX',
  team_name : 'Jacksonville Jaguars',
  stats : {},
},
{
  team_code : 'KC',
  team_name : 'Kansas City Chiefs',
  stats : {},
},
{
  team_code : 'LAR',
  team_name : 'Los Angeles Rams',
  stats : {},
},
{
  team_code : 'MIA',
  team_name : 'Miami Dolphins',
  stats : {},
},
{
  team_code : 'MIN',
  team_name : 'Minnesota Vikings',
  stats : {},
},
{
  team_code : 'NE',
  team_name : 'New England Patriots',
  stats : {},
},
{
  team_code : 'NO',
  team_name : 'New Orleans Saints',
  stats : {},
},
{
  team_code : 'NYG',
  team_name : 'New York Giants',
  stats : {},
},
{
  team_code : 'NYJ',
  team_name : 'New York Jets',
  stats : {},
},
{
  team_code : 'OAK',
  team_name : 'Oakland Raiders',
  stats : {},
},
{
  team_code : 'PHI',
  team_name : 'Philadelphia Eagles',
  stats : {},
},
{
  team_code : 'PIT',
  team_name : 'Pittsburgh Steelers',
  stats : {},
},
{
  team_code : 'LAC',
  team_name : 'Los Angeles Chargers',
  stats : {},
},
{
  team_code : 'SEA',
  team_name : 'Seattle Seahawks',
  stats : {},
},
{
  team_code : 'SF',
  team_name : 'San Francisco 49ers',
  stats : {},
},
{
  team_code : 'TB',
  team_name : 'Tampa Bay Buccaneers',
  stats : {},
},
{
  team_code : 'TEN',
  team_name : 'Tennessee Titans',
  stats : {},
},
{
  team_code : 'WAS',
  team_name : 'Washington Redskins',
  stats : {},
}]

exports.seed = function(knex, Promise) {
  return knex('teams').del()
    .then(() => {
      return knex.raw(
        "SELECT setval('teams_id_seq', 1, false);"
      )
    })
    .then(() => {
      return knex('teams').insert(teams);
    })
    .then(() => {
      return knex.raw(
        "SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));"
      );
    });
};
