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

  // @ts-expect-error TS(2339) FIXME: Property 'PORT' does not exist on type '{ settings... Remove this comment to see the full error message
  env.PORT = readENV('PORT', 1337);
  // @ts-expect-error TS(2339) FIXME: Property 'HOSTNAME' does not exist on type '{ sett... Remove this comment to see the full error message
  env.HOSTNAME = readENV('HOSTNAME', null);
  // @ts-expect-error TS(2339) FIXME: Property 'IMPORT_CONFIG' does not exist on type '{... Remove this comment to see the full error message
  env.IMPORT_CONFIG = readENV('IMPORT_CONFIG', null);
  // @ts-expect-error TS(2339) FIXME: Property 'static_files' does not exist on type '{ ... Remove this comment to see the full error message
  env.static_files = readENV('NIGHTSCOUT_STATIC_FILES', '/static');
  // @ts-expect-error TS(2339) FIXME: Property 'debug' does not exist on type '{ setting... Remove this comment to see the full error message
  env.debug = {
    minify: readENVTruthy('DEBUG_MINIFY', true)
  };

  // @ts-expect-error TS(2339) FIXME: Property 'err' does not exist on type '{ settings:... Remove this comment to see the full error message
  env.err = [];
  // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{ sett... Remove this comment to see the full error message
  env.notifies = [];
  // @ts-expect-error TS(2339) FIXME: Property 'enclave' does not exist on type '{ setti... Remove this comment to see the full error message
  env.enclave = enclave();

  setSSL();
  setStorage();
  setAPISecret();
  setVersion();
  updateSettings();

  return env;
}

function setSSL () {
  // @ts-expect-error TS(2339) FIXME: Property 'SSL_KEY' does not exist on type '{ setti... Remove this comment to see the full error message
  env.SSL_KEY = readENV('SSL_KEY');
  // @ts-expect-error TS(2339) FIXME: Property 'SSL_CERT' does not exist on type '{ sett... Remove this comment to see the full error message
  env.SSL_CERT = readENV('SSL_CERT');
  // @ts-expect-error TS(2339) FIXME: Property 'SSL_CA' does not exist on type '{ settin... Remove this comment to see the full error message
  env.SSL_CA = readENV('SSL_CA');
  // @ts-expect-error TS(2339) FIXME: Property 'ssl' does not exist on type '{ settings:... Remove this comment to see the full error message
  env.ssl = false;
  // @ts-expect-error TS(2339) FIXME: Property 'SSL_KEY' does not exist on type '{ setti... Remove this comment to see the full error message
  if (env.SSL_KEY && env.SSL_CERT) {
    // @ts-expect-error TS(2339) FIXME: Property 'ssl' does not exist on type '{ settings:... Remove this comment to see the full error message
    env.ssl = {
      // @ts-expect-error TS(2339) FIXME: Property 'SSL_KEY' does not exist on type '{ setti... Remove this comment to see the full error message
      key: fs.readFileSync(env.SSL_KEY)
      // @ts-expect-error TS(2339) FIXME: Property 'SSL_CERT' does not exist on type '{ sett... Remove this comment to see the full error message
      , cert: fs.readFileSync(env.SSL_CERT)
    };
    // @ts-expect-error TS(2339) FIXME: Property 'SSL_CA' does not exist on type '{ settin... Remove this comment to see the full error message
    if (env.SSL_CA) {
      // @ts-expect-error TS(2339) FIXME: Property 'ca' does not exist on type '{ settings: ... Remove this comment to see the full error message
      env.ca = fs.readFileSync(env.SSL_CA);
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'insecureUseHttp' does not exist on type ... Remove this comment to see the full error message
  env.insecureUseHttp = readENVTruthy("INSECURE_USE_HTTP", false);
  // @ts-expect-error TS(2339) FIXME: Property 'secureHstsHeader' does not exist on type... Remove this comment to see the full error message
  env.secureHstsHeader = readENVTruthy("SECURE_HSTS_HEADER", true);
  // @ts-expect-error TS(2339) FIXME: Property 'secureHstsHeaderIncludeSubdomains' does ... Remove this comment to see the full error message
  env.secureHstsHeaderIncludeSubdomains = readENVTruthy("SECURE_HSTS_HEADER_INCLUDESUBDOMAINS", false);
  // @ts-expect-error TS(2339) FIXME: Property 'secureHstsHeaderPreload' does not exist ... Remove this comment to see the full error message
  env.secureHstsHeaderPreload = readENVTruthy("SECURE_HSTS_HEADER_PRELOAD", false);
  // @ts-expect-error TS(2339) FIXME: Property 'secureCsp' does not exist on type '{ set... Remove this comment to see the full error message
  env.secureCsp = readENVTruthy("SECURE_CSP", false);
  // @ts-expect-error TS(2339) FIXME: Property 'secureCspReportOnly' does not exist on t... Remove this comment to see the full error message
  env.secureCspReportOnly = readENVTruthy("SECURE_CSP_REPORT_ONLY", false);
}

// A little ugly, but we don't want to read the secret into a var
function setAPISecret () {
  // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
  var useSecret = (readENV('API_SECRET') && readENV('API_SECRET').length > 0);
  //TODO: should we clear API_SECRET from process env?
  // @ts-expect-error TS(2339) FIXME: Property 'api_secret' does not exist on type '{ se... Remove this comment to see the full error message
  env.api_secret = null;
  // if a passphrase was provided, get the hex digest to mint a single token
  if (useSecret) {
    // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
    if (readENV('API_SECRET').length < consts.MIN_PASSPHRASE_LENGTH) {
      var msg = ['API_SECRET should be at least', consts.MIN_PASSPHRASE_LENGTH, 'characters'].join(' ');
      console.error(msg);
      // @ts-expect-error TS(2339) FIXME: Property 'err' does not exist on type '{ settings:... Remove this comment to see the full error message
      env.err.push({ desc: msg });
    } else {

      // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
      const apiSecret = readENV('API_SECRET');
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      delete process.env.API_SECRET;

      // @ts-expect-error TS(2339) FIXME: Property 'enclave' does not exist on type '{ setti... Remove this comment to see the full error message
      env.enclave.setApiKey(apiSecret);
      var testresult = stringEntropy(apiSecret);

      console.log('API_SECRET has', testresult, 'bits of entropy');

      if (testresult < 60) {
        // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{ sett... Remove this comment to see the full error message
        env.notifies.push({ persistent: true, title: 'Security issue', message: 'Weak API_SECRET detected. Please use a mix of small and CAPITAL letters, numbers and non-alphanumeric characters such as !#%&/ to reduce the risk of unauthorized access. The minimum length of the API_SECRET is 12 characters.' });
      }

      // @ts-expect-error TS(2339) FIXME: Property 'storageURI' does not exist on type '{ se... Remove this comment to see the full error message
      if (env.storageURI) {
        // @ts-expect-error TS(2339) FIXME: Property 'storageURI' does not exist on type '{ se... Remove this comment to see the full error message
        const parsedURL = mongoParser(env.storageURI);
        if (parsedURL.auth && parsedURL.auth.password == apiSecret) {
          // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{ sett... Remove this comment to see the full error message
          env.notifies.push({ persistent: true, title: 'Security issue', message: 'MongoDB password and API_SECRET match. This is a really bad idea. Please change both and do not reuse passwords across the system.' });
        }
      }

    }
  }
}

function setVersion () {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var software = require('../../package.json');
  // @ts-expect-error TS(2339) FIXME: Property 'version' does not exist on type '{ setti... Remove this comment to see the full error message
  env.version = software.version;
  // @ts-expect-error TS(2339) FIXME: Property 'name' does not exist on type '{ settings... Remove this comment to see the full error message
  env.name = software.name;
}

function setStorage () {
  // @ts-expect-error TS(2339) FIXME: Property 'storageURI' does not exist on type '{ se... Remove this comment to see the full error message
  env.storageURI = readENV('STORAGE_URI') || readENV('MONGO_CONNECTION') || readENV('MONGO') || readENV('MONGOLAB_URI') || readENV('MONGODB_URI');
  // @ts-expect-error TS(2339) FIXME: Property 'entries_collection' does not exist on ty... Remove this comment to see the full error message
  env.entries_collection = readENV('ENTRIES_COLLECTION') || readENV('MONGO_COLLECTION', 'entries');
  // @ts-expect-error TS(2339) FIXME: Property 'authentication_collections_prefix' does ... Remove this comment to see the full error message
  env.authentication_collections_prefix = readENV('MONGO_AUTHENTICATION_COLLECTIONS_PREFIX', 'auth_');
  // @ts-expect-error TS(2339) FIXME: Property 'treatments_collection' does not exist on... Remove this comment to see the full error message
  env.treatments_collection = readENV('MONGO_TREATMENTS_COLLECTION', 'treatments');
  // @ts-expect-error TS(2339) FIXME: Property 'profile_collection' does not exist on ty... Remove this comment to see the full error message
  env.profile_collection = readENV('MONGO_PROFILE_COLLECTION', 'profile');
  // @ts-expect-error TS(2339) FIXME: Property 'settings_collection' does not exist on t... Remove this comment to see the full error message
  env.settings_collection = readENV('MONGO_SETTINGS_COLLECTION', 'settings');
  // @ts-expect-error TS(2339) FIXME: Property 'devicestatus_collection' does not exist ... Remove this comment to see the full error message
  env.devicestatus_collection = readENV('MONGO_DEVICESTATUS_COLLECTION', 'devicestatus');
  // @ts-expect-error TS(2339) FIXME: Property 'food_collection' does not exist on type ... Remove this comment to see the full error message
  env.food_collection = readENV('MONGO_FOOD_COLLECTION', 'food');
  // @ts-expect-error TS(2339) FIXME: Property 'activity_collection' does not exist on t... Remove this comment to see the full error message
  env.activity_collection = readENV('MONGO_ACTIVITY_COLLECTION', 'activity');

  var DB = { url: null, collection: null }
    // @ts-expect-error TS(2339) FIXME: Property 'storageURI' does not exist on type '{ se... Remove this comment to see the full error message
    , DB_URL = DB.url ? DB.url : env.storageURI
    // @ts-expect-error TS(2339) FIXME: Property 'entries_collection' does not exist on ty... Remove this comment to see the full error message
    , DB_COLLECTION = DB.collection ? DB.collection : env.entries_collection;
  // @ts-expect-error TS(2339) FIXME: Property 'storageURI' does not exist on type '{ se... Remove this comment to see the full error message
  env.storageURI = DB_URL;
  // @ts-expect-error TS(2339) FIXME: Property 'entries_collection' does not exist on ty... Remove this comment to see the full error message
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
  // @ts-expect-error TS(2339) FIXME: Property 'extendedSettings' does not exist on type... Remove this comment to see the full error message
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
