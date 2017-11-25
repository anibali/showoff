import crypto from 'crypto';
import * as sodium from 'sodium';
import httpErrors from 'http-errors';

import models from '../models';


export const calculateHash = (secret, salt) => new Promise((resolve, reject) => {
  crypto.pbkdf2(secret, salt, 5000, 72, 'sha512', (err, hashBuf) => {
    if(err) {
      reject(err);
      return;
    }
    const hash = hashBuf.toString('base64');
    resolve(hash);
  });
});

export const verifyHash = (secret, salt, expectedHash) =>
  calculateHash(secret, salt).then(actualHash => actualHash === expectedHash);

export const verifyApiKey = (secretKey, expectedPublicKey) =>
  Promise.resolve()
    .then(() => {
      const secretKeyBuf = Buffer.from(secretKey, 'base64', 5);
      if(secretKeyBuf.byteLength !== sodium.api.crypto_sign_SECRETKEYBYTES) {
        throw httpErrors.BadRequest('wrong secret key length');
      }
      const publicKeyBuf = sodium.api.crypto_sign_ed25519_sk_to_pk(secretKeyBuf);
      const actualPublicKey = publicKeyBuf.toString('base64');
      return actualPublicKey === expectedPublicKey;
    });

export const createApiKey = (userId) => {
  const { secretKey: secretKeyBuf, publicKey: publicKeyBuf } =
    sodium.api.crypto_sign_keypair();
  const publicKey = publicKeyBuf.toString('base64');
  const secretKey = secretKeyBuf.toString('base64');

  const id = crypto.randomBytes(12).toString('base64');

  return Promise.resolve(models('ApiKey').forge({ id, publicKey, userId }))
    .then((apiKey) => apiKey.save(null, { method: 'insert' }))
    .then((apiKey) => ({ apiKey, secretKey }));
};

export const destroyApiKeys = (userId) =>
  models('ApiKey').where({ userId }).destroy();

export const resetInternalApiKey = () =>
  models('User').where({ username: '_internal' }).fetch({ require: true })
    .then(user => destroyApiKeys(user.id).then(() => createApiKey(user.id)));

export const changePassword = (user, { oldPassword, newPassword }) =>
  verifyHash(oldPassword, user.get('passwordSalt'), user.get('passwordHash'))
    .then(correctPassword => {
      if(!correctPassword) {
        throw httpErrors.Unauthorized('old password is incorrect');
      }
    })
    .then(() => calculateHash(newPassword, user.get('passwordSalt')))
    .then(passwordHash => user.save({ passwordHash }));
