const path = require('path');

module.exports = {
  development: {
    client: 'postgres',
    connection: {
      host: 'db',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: 'showoff_db',
      charset: 'utf8'
    },
    migrations: {
      directory: path.join(__dirname, './src/migrations')
    },
    seeds: {
      directory: path.join(__dirname, './src/seeds')
    }
  }
};
