import knexFactory from 'knex';
import bookshelfFactory from 'bookshelf';
import cascadeDelete from 'bookshelf-cascade-delete';
import jsonApiParams from 'bookshelf-jsonapi-params';
import jsonColumns from 'bookshelf-json-columns';

import Notebook from './Notebook';
import Frame from './Frame';
import Tag from './Tag';

const knexConf = require('../../knexfile')[process.env.NODE_ENV || 'development'];

const knex = knexFactory(knexConf);
const bookshelf = bookshelfFactory(knex);

bookshelf.plugin('registry');
bookshelf.plugin(cascadeDelete);
bookshelf.plugin(jsonApiParams);
bookshelf.plugin(jsonColumns);

Notebook(bookshelf);
Frame(bookshelf);
Tag(bookshelf);

const models = modelName => bookshelf.model(modelName);
models.knex = knex;

export default models;
