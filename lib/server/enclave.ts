'use strict;'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'crypto'.
const crypto = require('crypto');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'jwt'.
const jwt = require('jsonwebtoken');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');

// this is a class for holding potentially sensitive data in the app
// the class also implement functions to use the data, so the data is not shared outside the class

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
const init = function init () {

  const enclave = {};
  const secrets = {};
  const apiKey = Symbol('api-secret');
  const apiKeySHA1 = Symbol('api-secretSHA1');
  const apiKeySHA512 = Symbol('api-secretSHA512');
  const jwtKey = Symbol('jwtkey');
  let apiKeySet = false;

  function readKey (filename: any) {
    // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
    let filePath = path.resolve(__dirname + '/../../node_modules/.cache/_ns_cache/' + filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath).toString().trim();
    }
    console.error('Key file ', filePath, 'not found');
    return null;
  }

  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  secrets[jwtKey] = readKey('randomString');

  function genHash(data: any, algorihtm: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    const hash = crypto.createHash(algorihtm);
    data = hash.update(data, 'utf-8');
    return data.digest('hex').toLowerCase();
  }

  // @ts-expect-error TS(2339) FIXME: Property 'setApiKey' does not exist on type '{}'.
  enclave.setApiKey = function setApiKey (keyValue: any) {
    if (keyValue.length < 12) return;
    apiKeySet = true;
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    secrets[apiKey] = keyValue;
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    secrets[apiKeySHA1] = genHash(keyValue,'sha1');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    secrets[apiKeySHA512] = genHash(keyValue,'sha512');
  }

  // @ts-expect-error TS(2339) FIXME: Property 'isApiKeySet' does not exist on type '{}'... Remove this comment to see the full error message
  enclave.isApiKeySet = function isApiKeySet () {
    return isApiKeySet;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'isApiKey' does not exist on type '{}'.
  enclave.isApiKey = function isApiKey (keyValue: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return keyValue.toLowerCase() == secrets[apiKeySHA1] || keyValue == secrets[apiKeySHA512];
  }

  // @ts-expect-error TS(2339) FIXME: Property 'setJWTKey' does not exist on type '{}'.
  enclave.setJWTKey = function setJWTKey (keyValue: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    secrets[jwtKey] = keyValue;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'signJWT' does not exist on type '{}'.
  enclave.signJWT = function signJWT(token: any, lifetime: any) {
    const lt = lifetime ? lifetime : '8h';
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return jwt.sign(token, secrets[jwtKey], { expiresIn: lt });
  }

  // @ts-expect-error TS(2339) FIXME: Property 'verifyJWT' does not exist on type '{}'.
  enclave.verifyJWT = function verifyJWT(tokenString: any) {
    try {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return jwt.verify(tokenString, secrets[jwtKey]);
    } catch(err) {
      return null;
    }    
  }

  // @ts-expect-error TS(2339) FIXME: Property 'getSubjectHash' does not exist on type '... Remove this comment to see the full error message
  enclave.getSubjectHash = function getSubjectHash(id: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    var shasum = crypto.createHash('sha1');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    shasum.update(secrets[apiKeySHA1]);
    shasum.update(id);
    return shasum.digest('hex').toLowerCase();
  }

  return enclave;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
