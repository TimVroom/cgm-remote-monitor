'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_each'.
const _each = require('lodash/each');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const _trim = require('lodash/trim');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const _forIn = require('lodash/forIn');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const _startsWith = require('lodash/startsWith');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const _camelCase = require('lodash/camelCase');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const enclave = require('./enclave');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const mongoParser = require('mongo-url-parser');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const stringEntropy = require('fast-password-entropy')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'crypto'.
const crypto = require('crypto');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
const consts = require('../constants');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'env'.
const env = {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  settings: require('../settings')()
};

var shadowEnv: any;

// Module to constrain all config and environment parsing to one spot.
// See README.md for info about all the supported ENV VARs
// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'config'.
function config () {

  // Assume users will typo whitespaces into keys and values

  shadowEnv = {};

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  Object.keys(process.env).forEach((key, index) => {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    shadowEnv[_trim(key)] = _trim(process.env[key]);
  });

  env.PORT = readENV('PORT', 1337);
  env.HOSTNAME = readENV('HOSTNAME', null);
  env.IMPORT_CONFIG = readENV('IMPORT_CONFIG', null);
  env.static_files = readENV('NIGHTSCOUT_STATIC_FILES', '/static');
  env.debug = {
    minify: readENVTruthy('DEBUG_MINIFY', true)
  };

  env.err = [];
  env.notifies = [];
  env.enclave = enclave();

  setSSL();
  setStorage();
  setAPISecret();
  setVersion();
  updateSettings();

  return env;
}

function setSSL () {
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  env.SSL_KEY = readENV('SSL_KEY');
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  env.SSL_CERT = readENV('SSL_CERT');
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  env.SSL_CA = readENV('SSL_CA');
  env.ssl = false;
  if (env.SSL_KEY && env.SSL_CERT) {
    env.ssl = {
      key: fs.readFileSync(env.SSL_KEY)
      , cert: fs.readFileSync(env.SSL_CERT)
    };
    if (env.SSL_CA) {
      env.ca = fs.readFileSync(env.SSL_CA);
    }
  }

  env.insecureUseHttp = readENVTruthy("INSECURE_USE_HTTP", false);
  env.secureHstsHeader = readENVTruthy("SECURE_HSTS_HEADER", true);
  env.secureHstsHeaderIncludeSubdomains = readENVTruthy("SECURE_HSTS_HEADER_INCLUDESUBDOMAINS", false);
  env.secureHstsHeaderPreload = readENVTruthy("SECURE_HSTS_HEADER_PRELOAD", false);
  env.secureCsp = readENVTruthy("SECURE_CSP", false);
  env.secureCspReportOnly = readENVTruthy("SECURE_CSP_REPORT_ONLY", false);
}

// A little ugly, but we don't want to read the secret into a var
function setAPISecret () {
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  var useSecret = (readENV('API_SECRET') && readENV('API_SECRET').length > 0);
  //TODO: should we clear API_SECRET from process env?
  env.api_secret = null;
  // if a passphrase was provided, get the hex digest to mint a single token
  if (useSecret) {
    // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
    if (readENV('API_SECRET').length < consts.MIN_PASSPHRASE_LENGTH) {
      var msg = ['API_SECRET should be at least', consts.MIN_PASSPHRASE_LENGTH, 'characters'].join(' ');
      console.error(msg);
      env.err.push({ desc: msg });
    } else {

      // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
      const apiSecret = readENV('API_SECRET');
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      delete process.env.API_SECRET;

      env.enclave.setApiKey(apiSecret);
      var testresult = stringEntropy(apiSecret);

      console.log('API_SECRET has', testresult, 'bits of entropy');

      if (testresult < 60) {
        env.notifies.push({ persistent: true, title: 'Security issue', message: 'Weak API_SECRET detected. Please use a mix of small and CAPITAL letters, numbers and non-alphanumeric characters such as !#%&/ to reduce the risk of unauthorized access. The minimum length of the API_SECRET is 12 characters.' });
      }

      if (env.storageURI) {
        const parsedURL = mongoParser(env.storageURI);
        if (parsedURL.auth && parsedURL.auth.password == apiSecret) {
          env.notifies.push({ persistent: true, title: 'Security issue', message: 'MongoDB password and API_SECRET match. This is a really bad idea. Please change both and do not reuse passwords across the system.' });
        }
      }

    }
  }
}

function setVersion () {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var software = require('../../package.json');
  env.version = software.version;
  env.name = software.name;
}

function setStorage () {
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  env.storageURI = readENV('STORAGE_URI') || readENV('MONGO_CONNECTION') || readENV('MONGO') || readENV('MONGOLAB_URI') || readENV('MONGODB_URI');
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  env.entries_collection = readENV('ENTRIES_COLLECTION') || readENV('MONGO_COLLECTION', 'entries');
  env.authentication_collections_prefix = readENV('MONGO_AUTHENTICATION_COLLECTIONS_PREFIX', 'auth_');
  env.treatments_collection = readENV('MONGO_TREATMENTS_COLLECTION', 'treatments');
  env.profile_collection = readENV('MONGO_PROFILE_COLLECTION', 'profile');
  env.settings_collection = readENV('MONGO_SETTINGS_COLLECTION', 'settings');
  env.devicestatus_collection = readENV('MONGO_DEVICESTATUS_COLLECTION', 'devicestatus');
  env.food_collection = readENV('MONGO_FOOD_COLLECTION', 'food');
  env.activity_collection = readENV('MONGO_ACTIVITY_COLLECTION', 'activity');

  var DB = { url: null, collection: null }
    , DB_URL = DB.url ? DB.url : env.storageURI
    , DB_COLLECTION = DB.collection ? DB.collection : env.entries_collection;
  env.storageURI = DB_URL;
  env.entries_collection = DB_COLLECTION;
}

function updateSettings () {

  var envNameOverrides = {
    UNITS: 'DISPLAY_UNITS'
  };

  var envDefaultOverrides = {
    DISPLAY_UNITS: 'mg/dl'
  };

  env.settings.eachSettingAsEnv(function settingFromEnv (name: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var envName = envNameOverrides[name] || name;
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return readENV(envName, envDefaultOverrides[envName]);
  });

  //should always find extended settings last
  env.extendedSettings = findExtendedSettings(shadowEnv);

  if (!readENVTruthy('TREATMENTS_AUTH', true)) {
    env.settings.authDefaultRoles = env.settings.authDefaultRoles || "";
    env.settings.authDefaultRoles += ' careportal';
  }
}

function readENV (varName: any, defaultValue: any) {
  //for some reason Azure uses this prefix, maybe there is a good reason
  var value = shadowEnv['CUSTOMCONNSTR_' + varName] ||
    shadowEnv['CUSTOMCONNSTR_' + varName.toLowerCase()] ||
    shadowEnv[varName] ||
    shadowEnv[varName.toLowerCase()];

  if (varName == 'DISPLAY_UNITS') {
    if (value && value.toLowerCase().includes('mmol')) {
      value = 'mmol';
    } else {
      value = defaultValue;
    }
  }

  return value != null ? value : defaultValue;
}

function readENVTruthy (varName: any, defaultValue: any) {
  var value = readENV(varName, defaultValue);
  if (typeof value === 'string' && (value.toLowerCase() === 'on' || value.toLowerCase() === 'true')) { value = true; } else if (typeof value === 'string' && (value.toLowerCase() === 'off' || value.toLowerCase() === 'false')) { value = false; } else { value = defaultValue }
  return value;
}

function findExtendedSettings (envs: any) {
  var extended = {};

  // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
  extended.devicestatus = {};
  // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
  extended.devicestatus.advanced = true;
  // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
  extended.devicestatus.days = 1;
  // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
  if (shadowEnv['DEVICESTATUS_DAYS'] && shadowEnv['DEVICESTATUS_DAYS'] == '2') extended.devicestatus.days = 1;

  function normalizeEnv (key: any) {
    return key.toUpperCase().replace('CUSTOMCONNSTR_', '');
  }

  _each(env.settings.enable, function eachEnable (enable: any) {
    if (_trim(enable)) {
      _forIn(envs, function eachEnvPair (value: any, key: any) {
        var env = normalizeEnv(key);
        if (_startsWith(env, enable.toUpperCase() + '_')) {
          var split = env.indexOf('_');
          if (split > -1 && split <= env.length) {
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            var exts = extended[enable] || {};
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            extended[enable] = exts;
            var ext = _camelCase(env.substring(split + 1).toLowerCase());
            if (!isNaN(value)) { value = Number(value); }
            if (typeof value === 'string' && (value.toLowerCase() === 'on' || value.toLowerCase() === 'true')) { value = true; }
            if (typeof value === 'string' && (value.toLowerCase() === 'off' || value.toLowerCase() === 'false')) { value = false; }
            exts[ext] = value;
          }
        }
      });
    }
  });
  return extended;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = config;
