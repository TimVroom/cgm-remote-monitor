'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('./const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
  , _ = require('lodash')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'shiroTrie'... Remove this comment to see the full error message
  , shiroTrie = require('shiro-trie')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('./shared/operationTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'forwarded'... Remove this comment to see the full error message
  , forwarded = require('forwarded-for')
  ;


function getRemoteIP (req: any) {
  const address = forwarded(req, req.headers);
  return address.ip;
}


function authenticate (opCtx: any) {
  return new Promise(function promise (resolve, reject) {

    let { app, ctx, req, res } = opCtx;

    if (!app.get('API3_SECURITY_ENABLE')) {
      const adminShiro = shiroTrie.new();
      adminShiro.add('*');
      return resolve({ shiros: [ adminShiro ] });
    }

    let token
    if (req.header('Authorization')) {
      const parts = req.header('Authorization').split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return reject(
        opTools.sendJSONStatus(res, apiConst.HTTP.UNAUTHORIZED, apiConst.MSG.HTTP_401_MISSING_OR_BAD_TOKEN));
    }

    ctx.authorization.resolve({ token, ip: getRemoteIP(req) }, function resolveFinish (err: any, result: any) {
      if (err) {
        return reject(
          opTools.sendJSONStatus(res, apiConst.HTTP.UNAUTHORIZED, apiConst.MSG.HTTP_401_BAD_TOKEN));
      }
      else {
        return resolve(result);
      }
    });
  });
}


/**
 * Checks for the permission from the authorization without error response sending
 * @param {any} auth
 * @param {any} permission
 */
function checkPermission (auth: any, permission: any) {

  if (auth) {
    const found = _.find(auth.shiros, function checkEach (shiro: any) {
      return shiro && shiro.check(permission);
    });
    return _.isObject(found);
  }
  else {
    return false;
  }
}



function demandPermission (opCtx: any, permission: any) {
  return new Promise(function promise (resolve, reject) {
    const { auth, res } = opCtx;

    if (checkPermission(auth, permission)) {
      return resolve(true);
    } else {
      return reject(
        opTools.sendJSONStatus(res, apiConst.HTTP.FORBIDDEN, apiConst.MSG.HTTP_403_MISSING_PERMISSION.replace('{0}', permission)));
    }
  });
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  authenticate,
  checkPermission,
  demandPermission
};
