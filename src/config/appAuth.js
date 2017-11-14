import session from 'express-session';
import passport from 'passport';
import crypto from 'crypto';
import { Strategy as LocalStrategy } from 'passport-local';
import { BasicStrategy } from 'passport-http';

import jsonApi from '../helpers/jsonApiClient';
import models from '../models';


// The "local" strategy is for user log in using the web form.
passport.use(new LocalStrategy(
  (username, password, done) => {
    models('User').where({ username }).fetch({ require: true })
      .then(user => {
        const { passwordSalt, passwordHash } = user.attributes;
        const queryPasswordHash =
          crypto.pbkdf2Sync(password, passwordSalt, 100000, 72, 'sha512').toString('base64');
        if(queryPasswordHash !== passwordHash) {
          throw new Error('incorrect password');
        }
        done(null, user);
        return null;
      })
      .catch(() => done(null, false));
  }
));

// Basic HTTP auth is used to authenticate internal (server-side) API requests.
// These credentials should never leave server RAM.
jsonApi.auth = {
  username: 'api-user',
  password: crypto.randomBytes(64).toString('base64'),
};

// The "basic" strategy is for client program access to the REST API.
passport.use(new BasicStrategy(
  (username, password, done) => {
    // TODO: Generalize this when there are tokens for each user
    models('User').where({ username: '_internal' }).fetch({ require: true })
      .then(user => {
        if(username !== jsonApi.auth.username || password !== jsonApi.auth.password) {
          throw new Error('incorrect credentials');
        }
        done(null, user);
        return null;
      })
      .catch(() => done(null, false));
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  models('User').where({ id }).fetch({ require: true })
    .then(user => { done(null, user); return null; })
    .catch(err => { done(err); });
});


export default (app) => {
  app.use(session({
    // FIXME: Use connect-session-knex to store sessions in DB
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 31 * 24 * 60 * 60 * 1000,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());
};
