const knexConf = require('../../knexfile')[process.env.NODE_ENV || 'development'];
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

const models = modelName => bookshelf.model(modelName);
models.knex = knex;

module.exports = models;
