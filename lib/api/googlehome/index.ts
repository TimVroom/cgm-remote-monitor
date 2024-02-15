'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'moment'.
var moment = require('moment');

function configure (app: any, wares: any, ctx: any, env: any) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express')
    , api = express.Router( );
  var translate = ctx.language.translate;

  // invoke common middleware
  api.use(wares.sendJSONStatus);
  // text body types get handled as raw buffer stream
  api.use(wares.rawParser);
  // json body types get handled as parsed json
  api.use(wares.jsonParser);


  ctx.virtAsstBase.setupVirtAsstHandlers(ctx.googleHome);

  api.post('/googlehome', ctx.authorization.isPermitted('api:*:read'), function (req: any, res: any, next: any) {
    console.log('Incoming request from Google Home');
    var locale = _.get(req, 'body.queryResult.languageCode');
    if(locale){
      if(locale.length > 2) {
        locale = locale.substr(0, 2);
      }
      ctx.language.set(locale);
      moment.locale(locale);
    }

    var handler = ctx.googleHome.getIntentHandler(req.body.queryResult.intent.displayName, req.body.queryResult.parameters.metric);
    if (handler){
      var sbx = ctx.sbx;
      handler(function (title: any, response: any) {
        res.json(ctx.googleHome.buildSpeechletResponse(response, false));
        next( );
        return;
      }, req.body.queryResult.parameters, sbx);
    } else {
      res.json(ctx.googleHome.buildSpeechletResponse(translate('virtAsstUnknownIntentText'), true));
      next( );
      return;
    }
  });

  ctx.virtAsstBase.setupMutualIntents(ctx.googleHome);

  return api;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
