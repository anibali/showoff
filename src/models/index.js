import knexFactory from 'knex';
import bookshelfFactory from 'bookshelf';
import cascadeDelete from 'bookshelf-cascade-delete';
import upsert from 'bookshelf-upsert';
import jsonApiParams from 'bookshelf-jsonapi-params';
import jsonColumns from 'bookshelf-json-columns';

import Notebook from './Notebook';
import Frame from './Frame';
import Tag from './Tag';
import File from './File';
import User from './User';
import ApiKey from './ApiKey';

const knexConf = require('../../knexfile')[process.env.NODE_ENV || 'development'];

const knex = knexFactory(knexConf);
const bookshelf = bookshelfFactory(knex);

bookshelf.plugin('registry');
bookshelf.plugin(cascadeDelete);
bookshelf.plugin(upsert);
bookshelf.plugin(jsonApiParams);
bookshelf.plugin(jsonColumns);

Notebook(bookshelf);
Frame(bookshelf);
Tag(bookshelf);
File(bookshelf);
User(bookshelf);
ApiKey(bookshelf);

const models = modelName => bookshelf.model(modelName);
models.knex = knex;
models.bookshelf = bookshelf;

export default models;
