'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');

function configure (app: any, ctx: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express')
    , api = express.Router( )
    ;

  api.use(ctx.wares.compression());
  api.use(ctx.wares.rawParser);
  api.use(ctx.wares.bodyParser.json({
      limit: '50Mb'
  }));
  api.use(ctx.wares.urlencodedParser);
  
  api.post('/loop', ctx.authorization.isPermitted('notifications:loop:push'), function (req: any, res: any) {
    ctx.loop.sendNotification(req.body, req.connection.remoteAddress, function (error: any) {
      if (error) {
        res.status(consts.HTTP_INTERNAL_ERROR).send(error)
        console.log("error sending notification to Loop: ", error);
      } else {
        res.sendStatus(consts.HTTP_OK);
      }
    });
  });

  return api;
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
