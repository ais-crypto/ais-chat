import axios from 'axios';
/* import * as utils from './utils';
import * as primitives from './crypto-primitives';

if (!primitives.isWebCryptoAPISupported) {
  console.log('WebCryptoAPI is not supported');
}
*/
// generateUserKeyPair.((key) => {this.key = key})

const enc = new TextEncoder('utf-8');
const dec = new TextDecoder('utf-8');

export function getCurrTime() {
  axios
    .get('/api/time')
    .then((res) => {
      console.log(res.data.currTime);
    })
    .catch(err => console.log(err));
}

// returns keyPair object
export function generateSignatureKeyPair() {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-384' },
    },
    false,
    ['sign', 'verify'],
  );
}

// returns ArrayBuffer containing signature
export function sign(privateKey, message) {
  const data = enc.encode(message);
  return window.crypto.subtle.sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
    },
    privateKey,
    data,
  );
}

// returns boolean
export function verify(publicKey, message, signature) {
  const data = enc.encode(message);
  return window.crypto.subtle.verify(
    {
      name: 'RSASSA-PKCS1-v1_5',
    },
    publicKey,
    signature,
    data,
  );
}

// returns keyPair object
export function generateEncryptionKeyPair() {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-384' },
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

// returns an ArrayBuffer containing the encrypted data
export function encrypt(publicKey, message) {
  const data = enc.encode(message);
  return window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
      // label: Uint8Array([...]) //optional
    },
    publicKey,
    data,
  );
}

// returns an ArrayBuffer containing the encrypted data
export function decrypt(privateKey, message) {
  return window.crypto.subtle
    .decrypt(
      {
        name: 'RSA-OAEP',
        // label: Uint8Array([...]) //optional
      },
      privateKey,
      message,
    )
    .then(data => dec.decode(data));
}

/*
export function processIncomingMessage(personalKeys, userID, signatureKey, msg) {
  verify(keys.signatureKey, msg.body, msg.signature).then((verified) => {
    if (verified) {
      decrypt(dk, msg).then(msg => {
        msg.key
      });
    } else {
      throw new Error('Verification failed');
    }
  });
}

processIncomingMessage(sdadasdas).then(...).catch(...)
*/
