// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/fantasy-plus'
  },
  //
  // test: {
  //   client: 'pg',
  //   connection: 'postgres://localhost/candle_dev'
  // },
  //
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  }
};
