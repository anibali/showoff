const knexConf = require('../../knexfile').development;
const knex = require('knex')(knexConf);

const bookshelf = require('bookshelf')(knex);

const cascadeDelete = require('bookshelf-cascade-delete');
const jsonColumns = require('bookshelf-json-columns');

bookshelf.plugin('registry');
bookshelf.plugin(cascadeDelete);
bookshelf.plugin(jsonColumns);

require('./Notebook')(bookshelf);
require('./Frame')(bookshelf);
require('./Tag')(bookshelf);

module.exports = (modelName) => bookshelf.model(modelName);
