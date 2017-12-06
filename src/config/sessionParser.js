import session from 'express-session';
import KnexSessionStoreFactory from 'connect-session-knex';

import models from '../models';

const KnexSessionStore = KnexSessionStoreFactory(session);


export default session({
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 31 * 24 * 60 * 60 * 1000,
  },
  store: new KnexSessionStore({
    knex: models.knex,
    tablename: 'sessions',
    createtable: false,
  }),
});
