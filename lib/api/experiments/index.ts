'use strict';

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure (app: any, wares: any, ctx: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express'),
      api = express.Router( )
  ;

  if (app.enabled('api')) {
    api.use(wares.sendJSONStatus);

    api.get('/test', ctx.authorization.isPermitted('authorization:debug:test'), function (req: any, res: any) {
        return res.json({status: 'ok'});
    });
  }

  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
