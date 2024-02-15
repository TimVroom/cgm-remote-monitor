'use strict';

function configure (app: any, wares: any, env: any, ctx: any) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express'),
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    forwarded = require('forwarded-for'),
    api = express.Router( )
    ;

  api.use(wares.sendJSONStatus);
  api.use(wares.extensions([
    'json', 'svg', 'csv', 'txt', 'png', 'html', 'js'
  ]));

  api.use(ctx.authorization.isPermitted('api:status:read'));

  // Status badge/text/json
  api.get('/status', function (req: any, res: any) {
    
    let extended = env.settings.filteredSettings(app.extendedClientSettings);
    let settings = env.settings.filteredSettings(env.settings);

    var authToken = req.query.token || req.query.secret || '';

    function getRemoteIP (req: any) {
      const address = forwarded(req, req.headers);
      return address.ip;
    }

    var date = new Date();
    var info = { status: 'ok'
      , name: app.get('name')
      , version: app.get('version')
      , serverTime: date.toISOString()
      , serverTimeEpoch: date.getTime()
      , apiEnabled: app.enabled('api')
      , careportalEnabled: app.enabled('api') && env.settings.enable.indexOf('careportal') > -1
      , boluscalcEnabled: app.enabled('api') && env.settings.enable.indexOf('boluscalc') > -1
      , settings: settings
      , extendedSettings: extended
      , authorized: ctx.authorization.authorize(authToken, getRemoteIP(req))
      , runtimeState: ctx.runtimeState
    };

    var badge = 'http://img.shields.io/badge/Nightscout-OK-green';
    return res.format({
      html: function ( ) {
        res.send('<h1>STATUS OK</h1>');
      },
      png: function ( ) {
        res.redirect(302, badge + '.png');
      },
      svg: function ( ) {
        res.redirect(302, badge + '.svg');
      },
      js: function ( ) {
        var parts = ['this.serverSettings =', JSON.stringify(info), ';'];

        res.send(parts.join(' '));
      },
      text: function ( ) {
        res.send('STATUS OK');
      },
      json: function ( ) {
        res.json(info);
      }
    });
  });

  return api;
}
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
