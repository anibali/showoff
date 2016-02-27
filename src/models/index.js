const knexConf = require('../../knexfile').development;
const knex = require('knex')(knexConf);

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

require('./Notebook')(bookshelf);

bookshelf.model('Notebook').fetchAll().then((notebooks) => {
  console.log(notebooks.toJSON());
});

module.exports = bookshelf;
