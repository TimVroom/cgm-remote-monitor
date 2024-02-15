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
  // also support url-encoded content-type
  api.use(wares.urlencodedParser);
  // text body types get handled as raw buffer stream

  ctx.virtAsstBase.setupVirtAsstHandlers(ctx.alexa);

  api.post('/alexa', ctx.authorization.isPermitted('api:*:read'), function (req: any, res: any, next: any) {
    console.log('Incoming request from Alexa');
    var locale = _.get(req, 'body.request.locale');
    if(locale){
      if(locale.length > 2) {
        locale = locale.substr(0, 2);
      }
      ctx.language.set(locale);
      moment.locale(locale);
    }

    switch (req.body.request.type) {
      case 'SessionEndedRequest':
        onSessionEnded(function () {
          res.json('');
          next( );
        });
        break;
      case 'LaunchRequest':
        if (!req.body.request.intent) {
          onLaunch(function () {
            res.json(ctx.alexa.buildSpeechletResponse(
                translate('virtAsstTitleLaunch'),
                translate('virtAsstLaunch'),
                translate('virtAsstLaunch'),
                false
            ));
            next( );
          });
          break;
        }
        // if intent is set then fallback to IntentRequest
      case 'IntentRequest': // eslint-disable-line no-fallthrough
        onIntent(req.body.request.intent, function (title: any, response: any) {
          res.json(ctx.alexa.buildSpeechletResponse(title, response, '', true));
          next( );
        });
        break;
    }
  });

  ctx.virtAsstBase.setupMutualIntents(ctx.alexa);

  function onLaunch(next: any) {
    console.log('Session launched');
    next( );
  }

  function onIntent(intent: any, next: any) {
    console.log('Received intent request');
    console.log(JSON.stringify(intent));
    handleIntent(intent.name, intent.slots, next);
  }

  function onSessionEnded(next: any) {
    console.log('Session ended');
    next( );
  }

  function handleIntent(intentName: any, slots: any, next: any) {
    var metric;
    if (slots) {
      var slotStatus = _.get(slots, 'metric.resolutions.resolutionsPerAuthority[0].status.code');
      var slotName = _.get(slots, 'metric.resolutions.resolutionsPerAuthority[0].values[0].value.name');
      if (slotStatus == "ER_SUCCESS_MATCH" && slotName) {
        metric = slotName;
      } else {
        next(translate('virtAsstUnknownIntentTitle'), translate('virtAsstUnknownIntentText'));
        return;
      }
    }

    var handler = ctx.alexa.getIntentHandler(intentName, metric);
    if (handler){
      var sbx = ctx.sbx;
      handler(next, slots, sbx);
      return;
    } else {
      next(translate('virtAsstUnknownIntentTitle'), translate('virtAsstUnknownIntentText'));
      return;
    }
  }

  return api;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
