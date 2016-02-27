const path = require('path');

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: 'db',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
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
