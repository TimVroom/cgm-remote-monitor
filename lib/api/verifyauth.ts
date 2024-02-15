'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');

function configure (ctx: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express'),
      api = express.Router( );

  api.get('/verifyauth', function(req: any, res: any) {
    ctx.authorization.resolveWithRequest(req, function resolved (err: any, result: any) {
      // this is used to see if req has api-secret equivalent authorization
      var canRead = !err && 
        ctx.authorization.checkMultiple('*:*:read', result.shiros);
      var canWrite = !err && 
        ctx.authorization.checkMultiple('*:*:write', result.shiros);
      var isAdmin = !err && 
        ctx.authorization.checkMultiple('*:*:admin', result.shiros);
      var authorized = canRead && !result.defaults;

      var response = {
        canRead,
        canWrite,
        isAdmin,
        message: authorized ? 'OK' : 'UNAUTHORIZED',
        rolefound: result.subject ? 'FOUND' : 'NOTFOUND',
        permissions: result.defaults ? 'DEFAULT' : 'ROLE'
      };


      res.sendJSONStatus(res, consts.HTTP_OK, response);
    });
  });

  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
