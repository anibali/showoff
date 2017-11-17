import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { BasicStrategy } from 'passport-http';
import KnexSessionStoreFactory from 'connect-session-knex';

import jsonApi from '../helpers/jsonApiClient';
import { resetInternalApiKey, verifyHash, verifyApiKey } from '../helpers/authHelpers';
import models from '../models';


const KnexSessionStore = KnexSessionStoreFactory(session);

// The "local" strategy is for user log in using the web form.
passport.use(new LocalStrategy(
  (username, password, done) => {
    models('User').where({ username }).fetch({ require: true })
      .then(user =>
        verifyHash(password, user.get('passwordSalt'), user.get('passwordHash'))
          .then(correctPassword => {
            done(null, correctPassword && user);
            return null;
          })
      )
      .catch(err => done(err));
  }
));

// The "basic" strategy is for client program access to the REST API.
passport.use(new BasicStrategy(
  (keyId, secretKey, done) => {
    models('ApiKey').where({ id: keyId }).fetch({ require: true, withRelated: ['user'] })
      .then(apiKey =>
        verifyApiKey(secretKey, apiKey.get('publicKey'))
          .then(correctSecret => {
            done(null, correctSecret && apiKey.related('user'));
            return null;
          })
      )
      .catch(err => done(err));
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
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Generate an API key pair for internal use on server start up.
  return resetInternalApiKey().then(({ apiKey, secretKey }) => {
    // These credentials should never leave server RAM.
    jsonApi.auth = {
      username: apiKey.id,
      password: secretKey,
    };

    app.auth = jsonApi.auth;
    return app;
  });
};
