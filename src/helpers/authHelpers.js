import crypto from 'crypto';
import * as sodium from 'sodium-native';

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

export const resetApiKeyPair = (userId) => {
  const publicKeyBuf = sodium.sodium_malloc(sodium.crypto_sign_PUBLICKEYBYTES);
  const secretKeyBuf = sodium.sodium_malloc(sodium.crypto_sign_SECRETKEYBYTES);
  sodium.crypto_sign_keypair(publicKeyBuf, secretKeyBuf);

  const publicKey = publicKeyBuf.toString('base64');
  const secretKey = secretKeyBuf.toString('base64');
  const secretKeySalt = crypto.randomBytes(24).toString('base64');

  return models('ApiKeyPair').where({ userId }).destroy()
    .then(() => calculateHash(secretKey, secretKeySalt))
    .then((secretKeyHash) =>
      models('ApiKeyPair').forge({ publicKey, secretKeyHash, secretKeySalt, userId }).save())
    .then(() => ({ publicKey, secretKey }));
};

export const resetInternalApiKeyPair = () =>
  models('User').where({ username: '_internal' }).fetch({ require: true })
    .then(internalUser => resetApiKeyPair(internalUser.id));
