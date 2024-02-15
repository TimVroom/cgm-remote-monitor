'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jwt'.
const jwt = require('jsonwebtoken');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'shiroTrie'... Remove this comment to see the full error message
const shiroTrie = require('shiro-trie');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'consts'.
const consts = require('./../constants');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const sleep = require('util').promisify(setTimeout);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'forwarded'... Remove this comment to see the full error message
const forwarded = require('forwarded-for');

function getRemoteIP (req: any) {
  const address = forwarded(req, req.headers);
  return address.ip;
}

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (env: any, ctx: any) {

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const ipdelaylist = require('./delaylist')(env, ctx);
  const addFailedRequest = ipdelaylist.addFailedRequest;
  const shouldDelayRequest = ipdelaylist.shouldDelayRequest;
  const requestSucceeded = ipdelaylist.requestSucceeded;

  var authorization = {};
  // @ts-expect-error TS(2339): Property 'storage' does not exist on type '{}'.
  var storage = authorization.storage = require('./storage')(env, ctx);
  var defaultRoles = (env.settings.authDefaultRoles || '').split(/[, :]/);

  /**
   * Loads JWT from request
   * 
   * @param {*} req 
   */
  function extractJWTfromRequest (req: any) {

    if (req.auth_token) return req.auth_token;

    let token;

    if (req.header('Authorization')) {
      const parts = req.header('Authorization').split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      let accessToken = req.query.token;
      if (!accessToken && req.body) {
        if (_.isArray(req.body) && req.body.length > 0 && req.body[0].token) {
          accessToken = req.body[0].token;
          delete req.body[0].token;
        } else if (req.body.token) {
          accessToken = req.body.token;
          delete req.body.token;
        }
      }

      if (accessToken) {
        // validate and parse the token
        // @ts-expect-error TS(2339): Property 'authorize' does not exist on type '{}'.
        const authed = authorization.authorize(accessToken);
        if (authed && authed.token) {
          token = authed.token;
        }
      }
    }

    if (token) { req.auth_token = token; }

    return token;
  }

  // @ts-expect-error TS(2339): Property 'extractToken' does not exist on type '{}... Remove this comment to see the full error message
  authorization.extractToken = extractJWTfromRequest;

  /**
   * Fetches the API_SECRET from the request
   * 
   * @param {*} req Express request object
   */
  function apiSecretFromRequest (req: any) {

    if (req.api_secret) return req.api_secret;

    let secret = req.query && req.query.secret ? req.query.secret : req.header('api-secret');

    if (!secret && req.body) {
      // try to get the secret from the body, but don't leave it there
      if (_.isArray(req.body) && req.body.length > 0 && req.body[0].secret) {
        secret = req.body[0].secret;
        delete req.body[0].secret;
      } else if (req.body.secret) {
        secret = req.body.secret;
        delete req.body.secret;
      }
    }

    // store the secret hash on the request since the req may get processed again
    if (secret) { req.api_secret = secret; }
    return secret;
  }

  function authorizeAdminSecret (secret: any) {
    return env.enclave.isApiKey(secret);
  }

  // @ts-expect-error TS(2339): Property 'seenPermissions' does not exist on type ... Remove this comment to see the full error message
  authorization.seenPermissions = [];

  // @ts-expect-error TS(2339): Property 'expandedPermissions' does not exist on t... Remove this comment to see the full error message
  authorization.expandedPermissions = function expandedPermissions () {
    var permissions = shiroTrie.new();
    // @ts-expect-error TS(2339): Property 'seenPermissions' does not exist on type ... Remove this comment to see the full error message
    permissions.add(authorization.seenPermissions);
    return permissions;
  };

  // @ts-expect-error TS(2339): Property 'resolveWithRequest' does not exist on ty... Remove this comment to see the full error message
  authorization.resolveWithRequest = function resolveWithRequest (req: any, callback: any) {
    const resolveData = {
      api_secret: apiSecretFromRequest(req)
      , token: extractJWTfromRequest(req)
      , ip: getRemoteIP(req)
    };
    // @ts-expect-error TS(2339): Property 'resolve' does not exist on type '{}'.
    authorization.resolve(resolveData, callback);
  };

  /**
   * Check if the Apache Shiro-style permission object includes the permission.
   * 
   * Returns a boolean true / false depending on if the permission is found.
   * 
   * @param {*} permission Desired permission
   * @param {*} shiros Shiros
   */

  // @ts-expect-error TS(2339): Property 'checkMultiple' does not exist on type '{... Remove this comment to see the full error message
  authorization.checkMultiple = function checkMultiple (permission: any, shiros: any) {
    var found = _.find(shiros, function checkEach (shiro: any) {
      return shiro && shiro.check(permission);
    });
    return _.isObject(found);
  };

  /**
   * Resolve an API secret or token and return the permissions associated with
   * the secret / token
   * 
   * @param {*} data 
   * @param {*} callback 
   */
  // @ts-expect-error TS(2339): Property 'resolve' does not exist on type '{}'.
  authorization.resolve = async function resolve (data: any, callback: any) {

    if (!data.ip) {
      console.error('Trying to authorize without IP information');
      return callback(null, { shiros: [] });
    }

    data.api_secret = data.api_secret || null;

    if (data.api_secret == 'null') { // TODO find what's sending this anomaly
      data.api_secret = null;
    }

    const requestDelay = shouldDelayRequest(data.ip);

    if (requestDelay) {
      await sleep(requestDelay);
    }

    const authAttempted = (data.api_secret || data.token) ? true : false;
    const defaultShiros = storage.rolesToShiros(defaultRoles);

    // If there is no token or secret, return default permissions
    if (!authAttempted) {
      const result = { shiros: defaultShiros, defaults: true };
      if (callback) { callback(null, result); }
      return result;
    }

    // Check for API_SECRET first as that allows bailing out fast

    if (data.api_secret && authorizeAdminSecret(data.api_secret)) {
      requestSucceeded(data.ip);
      var admin = shiroTrie.new();
      admin.add(['*']);
      const result = { shiros: [admin] };
      if (callback) { callback(null, result); }
      return result;
    }

    // If we reach this point, we must be dealing with a role based token

    let token = null;

    // Tokens have to be well formed JWTs
    try {
      const verified = env.enclave.verifyJWT(data.token);
      token = verified.accessToken;
    } catch (err) {}

    // Check if there's a token in the secret

    if (!token && data.api_secret) {
      if (storage.doesAccessTokenExist(data.api_secret)) {
        token = data.api_secret;
      }
    }

    if (token) {
      requestSucceeded(data.ip);
      // @ts-expect-error TS(2339): Property 'resolveAccessToken' does not exist on ty... Remove this comment to see the full error message
      const results = authorization.resolveAccessToken(token, null, defaultShiros);
      if (callback) { callback(null, results); }
      return results;
    }

    console.error('Resolving secret/token to permissions failed');
    addFailedRequest(data.ip);

    ctx.bus.emit('admin-notify', {
      title: ctx.language.translate('Failed authentication')
      , message: ctx.language.translate('A device at IP address %1 attempted authenticating with Nightscout with wrong credentials. Check if you have an uploader setup with wrong API_SECRET or token?', data.ip)
    });

    if (callback) { callback('All validation failed', {}); }
    return {};

  };

  // @ts-expect-error TS(2339): Property 'resolveAccessToken' does not exist on ty... Remove this comment to see the full error message
  authorization.resolveAccessToken = function resolveAccessToken (accessToken: any, callback: any, defaultShiros: any) {

    if (!defaultShiros) {
      defaultShiros = storage.rolesToShiros(defaultRoles);
    }

    let resolved = storage.resolveSubjectAndPermissions(accessToken);
    if (!resolved || !resolved.subject) {
      if (callback) { callback('Subject not found', null); }
      return null;
    }

    let shiros = resolved.shiros.concat(defaultShiros);
    const result = { shiros, subject: resolved.subject };
    if (callback) { callback(null, result); }
    return result;
  };

  /**
   * Check if the client has a permission execute an action,
   * based on an API KEY or JWT in the request.
   * 
   * Used to authorize API calls
   * 
   * @param {*} permission Permission being checked
   */
  // @ts-expect-error TS(2339): Property 'isPermitted' does not exist on type '{}'... Remove this comment to see the full error message
  authorization.isPermitted = function isPermitted (permission: any) {

    // @ts-expect-error TS(2339): Property 'seenPermissions' does not exist on type ... Remove this comment to see the full error message
    authorization.seenPermissions = _.chain(authorization.seenPermissions)
      .push(permission)
      .sort()
      .uniq()
      .value();

    async function check (req: any, res: any, next: any) {

      var remoteIP = getRemoteIP(req);
      var secret = apiSecretFromRequest(req);
      var token = extractJWTfromRequest(req);

      const data = { api_secret: secret, token, ip: remoteIP };

      // @ts-expect-error TS(2339): Property 'resolve' does not exist on type '{}'.
      const permissions = await authorization.resolve(data);
      // @ts-expect-error TS(2339): Property 'checkMultiple' does not exist on type '{... Remove this comment to see the full error message
      const permitted = authorization.checkMultiple(permission, permissions.shiros);

      if (permitted) {
        next();
        return;
      }

      res.sendJSONStatus(res, consts.HTTP_UNAUTHORIZED, 'Unauthorized', 'Invalid/Missing');
    }

    return check;

  };

  /**
   * Generates a JWT based on an access token / authorizes an existing token
   * 
   * @param {*} accessToken token to be used for generating a JWT for the client
   */
  // @ts-expect-error TS(2339): Property 'authorize' does not exist on type '{}'.
  authorization.authorize = function authorize (accessToken: any) {


    let userToken = accessToken;
    const decodedToken = env.enclave.verifyJWT(accessToken);

    if (decodedToken && decodedToken.accessToken) {
      userToken = decodedToken.accessToken;
    }

    var subject = storage.findSubject(userToken);
    var authorized = null;

    if (subject) {
      const token = env.enclave.signJWT({ accessToken: subject.accessToken });
      const decoded = env.enclave.verifyJWT(token);

      var roles = subject.roles ? _.uniq(subject.roles.concat(defaultRoles)) : defaultRoles;

      authorized = {
        token
        , sub: subject.name
        , permissionGroups: _.map(roles, storage.roleToPermissions)
        , iat: decoded.iat
        , exp: decoded.exp
      };
    }

    return authorized;
  };

  // @ts-expect-error TS(2339): Property 'endpoints' does not exist on type '{}'.
  authorization.endpoints = require('./endpoints')(env, authorization);

  return authorization;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
