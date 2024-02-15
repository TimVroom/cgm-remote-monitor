'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'bodyParser... Remove this comment to see the full error message
var bodyParser = require('body-parser');

function configure (app: any, wares: any, ctx: any) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express')
    , api = express.Router( )
    ;

  app.use(bodyParser.urlencoded({extended : true}));
  app.use(bodyParser.json());

  api.post('/notifications/pushovercallback', function (req: any, res: any) {
    if (ctx.pushnotify.pushoverAck(req.body)) {
      res.sendStatus(consts.HTTP_OK);
    } else {
      res.sendStatus(consts.HTTP_INTERNAL_ERROR);
    }
  });

  if (app.enabled('api')) {
    // Create and store new sgv entries
    api.get('/notifications/ack', ctx.authorization.isPermitted('notifications:*:ack'), function (req: any, res: any) {
      var level = Number(req.query.level);
      var group = req.query.group || 'default';
      var time = req.query.time && Number(req.query.time);
      console.info('got api ack, level: ', level, ', time: ', time, ', query: ', req.query);
      ctx.notifications.ack(level, group, time, true);
      res.sendStatus(consts.HTTP_OK);
    });
  }

  return api;
}
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
