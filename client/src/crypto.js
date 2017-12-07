/* import * as utils from './utils';
import * as primitives from './crypto-primitives';

if (!primitives.isWebCryptoAPISupported) {
  console.log('WebCryptoAPI is not supported');
}
*/
// generateUserKeyPair.((key) => {this.key = key})
import { TextEncoder, TextDecoder } from 'text-encoding';

const enc = new TextEncoder('utf-8');
const dec = new TextDecoder('utf-8');

// returns keyPair object
// RSA PSS recommended over RSA PKCS1v1_5
export function generateSignatureKeyPair() {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    true,
    ['sign', 'verify'],
  );
}

// returns ArrayBuffer containing signature
export function createSignature(privateKey, message) {
  const data = enc.encode(message);
  return window.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 128,
    },
    privateKey,
    data,
  );
}

// returns boolean
// string message, arrayBuffer signature
export function verify(publicKey, message, signature) {
  const data = enc.encode(message);
  return window.crypto.subtle.verify(
    {
      name: 'RSA-PSS',
      saltLength: 128,
    },
    publicKey,
    signature,
    data,
  );
}

export function signAndVerifyTest(message) {
  generateSignatureKeyPair().then((keyPair) => {
    createSignature(keyPair.privateKey, message).then((signature) => {
      verify(keyPair.publicKey, message, signature).then((validity) => {
        console.log(`verified:${validity}`);
      });
    });
  });
}

// returns keyPair object
export function generateAsymmetricEncryptionKeyPair() {
  return window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-256' },
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

// returns an ArrayBuffer containing the encrypted data
export function asymmetricEncrypt(publicKey, message) {
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

// returns decrypted message as string
export function asymmetricDecrypt(privateKey, message) {
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

export function asymmetricKeyTest(message) {
  console.log(`your message: ${message}`);
  generateAsymmetricEncryptionKeyPair().then((keyPair) => {
    asymmetricEncrypt(keyPair.publicKey, message).then((encrypted) => {
      asymmetricDecrypt(keyPair.privateKey, encrypted).then(decrypted =>
        console.log(decrypted));
    });
  });
}

// returns key object
export function generateSymmetricKey() {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

// parameter string message
// returns an ArrayBuffer containing the encrypted data
export function symmetricEncrypt(key, message) {
  const data = enc.encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  console.log(`iv:${iv}`);
  return window.crypto.subtle
    .encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data,
    )
    .then((encrypted) => {
      console.log(`encrypted: ${message.body}`);
      console.log(`iv:${message.iv}`);
      console.log(`message:${message}`);
      return { iv, body: encrypted };
    });
}

// message: ArrayBuffer of the data
// returns string
export function symmetricDecrypt(key, message) {
  const { iv, body } = message;
  console.log(`in Decrypt: iv:${iv}, message body: ${body}`);
  return window.crypto.subtle
    .decrypt(
      {
        name: 'AES-GCM',
        iv, // The initialization vector you used to encrypt
      },
      key,
      body,
    )
    .then((data) => {
      const decoded = dec.decode(data);
      console.log(decoded);
      return decoded;
    });
}

export function symmetricKeyTest(text) {
  console.log(`your message: ${text}`);
  generateSymmetricKey().then((key) => {
    symmetricEncrypt(key, {
      iv: new Uint8Array(12),
      body: text,
    }).then((encrypted) => {
      console.log('encrypted successfully');
      console.log(encrypted);
      symmetricDecrypt(key, encrypted).then((decrypted) => {
        console.log(decrypted);
      });
    });
  });
}

export function generateMessage(currUser, users, message) {
  const encryptedKeys = {};
  return generateSymmetricKey().then((key) => {
    return Promise.all(users.valueSeq().map(user =>
      window.crypto.subtle
        .importKey(
          'jwk',
          user.keys.encryption,
          {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-256' },
          },
          true,
          ['encrypt'],
        )
        .then((userKey) => {
          window.crypto.subtle.exportKey('raw', key).then((rawKey) => {
            return asymmetricEncrypt(userKey, rawKey).then((encKey) => {
              encryptedKeys[user.socketId] = encKey;
            });
          });
        }))).then(() => {
      console.log('encrypting');
      return symmetricEncrypt(key, message).then((body) => {
        return {
          sender: currUser.socketId,
          encryptedKeys,
          body,
        };
      });
    });
  });
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
