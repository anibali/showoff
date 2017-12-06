import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { BasicStrategy } from 'passport-http';

import apiClient from '../helpers/apiClient';
import { resetInternalApiKey, verifyHash, verifyApiKey } from '../helpers/authHelpers';
import models from '../models';
import sessionParser from './sessionParser';


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
  app.use(sessionParser);
  app.use(passport.initialize());
  app.use(passport.session());

  // Generate an API key pair for internal use on server start up.
  return resetInternalApiKey().then(({ apiKey, secretKey }) => {
    // These credentials should never leave server RAM.
    const auth = {
      username: apiKey.id,
      password: secretKey,
    };
    apiClient.updateConfig({ auth });

    app.auth = auth;
    return app;
  });
};
