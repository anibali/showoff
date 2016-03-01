const knexConf = require('../../knexfile').development;
const knex = require('knex')(knexConf);

const bookshelf = require('bookshelf')(knex);

const jsonColumns = require('bookshelf-json-columns');

bookshelf.plugin('registry');
bookshelf.plugin(jsonColumns);

require('./Notebook')(bookshelf);
require('./Frame')(bookshelf);

module.exports = (modelName) => bookshelf.model(modelName);
