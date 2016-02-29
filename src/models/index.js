const knexConf = require('../../knexfile').development;
const knex = require('knex')(knexConf);

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');

require('./Notebook')(bookshelf);
require('./Frame')(bookshelf);

module.exports = (modelName) => bookshelf.model(modelName);
