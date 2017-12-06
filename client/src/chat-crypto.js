import * as utils from './utils';
import * as primitives from './crypto-primitives';

if (!primitives.isWebCryptoAPISupported) {
  console.log('WebCryptoAPI is not supported');
}


export const generateUserKeyPair = () => {
  window.crypto.subtle.generateKey(
    primitives.alg_RSA_PKCS1,
    false, // whether the key is extractable (i.e. can be used in exportKey)
    ['sign', 'verify'], // can be any combination of "sign" and "verify"
  )

    .then((key) => {
    // returns a keypair object
      console.log('key type');
      console.log(typeof (key));
      console.log(key.publicKey);
      console.log(key.privateKey);

      window.crypto.subtle.exportKey(
        'jwk', // can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
        key.publicKey, // can be a publicKey or privateKey, as long as extractable was true
      )
        .then((keydata) => {
        // returns the exported key data
          console.log('keydata');
          console.log(keydata);

          return keydata;
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
};

export const testingGenerateExportKey = () => {
  window.crypto.subtle.generateKey(primitives.alg_RSA_PKCS1, false, ['sign', 'verify'])
    .then((cryptoKey) => {
      window.crypto.subtle.exportKey(
        'jwk',
        cryptoKey.publicKey,
      )
        .then((exportedKey) => {

        });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const testingUseExportedKey = (message, publicKey) => {
  let ciphertext;

  const data = utils.convertTextToUint8Array(message);
  return window.crypto.subtle.encrypt(
    primitives.alg_RSA_OAEP,
    publicKey, data,
  )
    .then((result) => {
    // Store ciphertext
      ciphertext = new Uint8Array(result);
    })
    .then(() => {
    // Output
      console.log('Encrypted data:');
      console.log(utils.convertUint8ArrayToHexView(ciphertext, 16, ''));
    });
};


export const signMessage = (priKey, message) => {
  window.crypto.subtle.sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
    },
    priKey, // from generateKey or importKey above
    message, // ArrayBuffer of data you want to sign
  )
    .then((signature) => {
      // returns an ArrayBuffer containing the signature
      console.log(new Uint8Array(signature));
    })
    .catch((err) => {
      console.error(err);
    });
};

export const verifyMessage = (pubKey, message, signature) => {
  return 0;
};

export const getRSAKey = (is_public, keyPair) => {
  const use = is_public ? 'verify' : 'sign';
  const extractable = !!is_public;
  const data_n = keyPair.n;
  console.log('keypair n slot');
  console.log(data_n);
  window.crypto.subtle.importKey(
    'jwk', // can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
    { // this is an example jwk key, other key types are Uint8Array objects
      kty: 'RSA',
      e: 'AQAB',
      n: data_n,
      alg: 'RS256',
      ext: extractable,
    },
    { // these are the algorithm options
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' }, // can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
    },
    false, // whether the key is extractable (i.e. can be used in exportKey)
    [use], // "verify" for public key import, "sign" for private key imports
  )
    .then((publicKey) => {
      // returns a publicKey (or privateKey if you are importing a private key)
      console.log(publicKey);
    })
    .catch((err) => {
      console.error(err);
    });
};
