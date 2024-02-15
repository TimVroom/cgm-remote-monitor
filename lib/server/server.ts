/*
* cgm-remote-monitor - web app to broadcast cgm readings
* Copyright (C) 2014 Nightscout contributors.  See the COPYRIGHT file
* at the root directory of this distribution and at
* https://github.com/nightscout/cgm-remote-monitor/blob/master/COPYRIGHT
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published
* by the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Description: Basic web server to display data from Dexcom G4.  Requires a database that contains
// the Dexcom SGV data.
'use strict';

///////////////////////////////////////////////////
// DB Connection setup and utils
///////////////////////////////////////////////////

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'env'.
const env = require('./env')( );
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'language'.
const language = require('../language')();
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'translate'... Remove this comment to see the full error message
const translate = language.set(env.settings.language).translate;
language.loadLocalization(fs);

///////////////////////////////////////////////////
// setup http server
///////////////////////////////////////////////////
// @ts-expect-error TS(2339): Property 'PORT' does not exist on type '{ settings... Remove this comment to see the full error message
var PORT = env.PORT;
// @ts-expect-error TS(2339): Property 'HOSTNAME' does not exist on type '{ sett... Remove this comment to see the full error message
var HOSTNAME = env.HOSTNAME;

function create (app: any) {
  // @ts-expect-error TS(2339): Property 'ssl' does not exist on type '{ settings:... Remove this comment to see the full error message
  var transport = (env.ssl
                // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
                ? require('https') : require('http'));
  // @ts-expect-error TS(2339): Property 'ssl' does not exist on type '{ settings:... Remove this comment to see the full error message
  if (env.ssl) {
    // @ts-expect-error TS(2339): Property 'ssl' does not exist on type '{ settings:... Remove this comment to see the full error message
    return transport.createServer(env.ssl, app);
  }
  return transport.createServer(app);
}

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('./bootevent')(env, language).boot(function booted (ctx: any) {

    console.log('Boot event processing completed');
    
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var app = require('./app')(env, ctx);
    var server = create(app).listen(PORT, HOSTNAME);
    console.log(translate('Listening on port'), PORT, HOSTNAME);

    if (ctx.bootErrors && ctx.bootErrors.length > 0) {
      return;
    }

    ctx.bus.on('teardown', function serverTeardown () {
      server.close();
      clearTimeout(sendStartupAllClearTimer);
      ctx.store.client.close();
    });

    ///////////////////////////////////////////////////
    // setup socket io for data and message transmission
    ///////////////////////////////////////////////////
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var websocket = require('./websocket')(env, ctx, server);

    //after startup if there are no alarms send all clear
    let sendStartupAllClearTimer = setTimeout(function sendStartupAllClear () {
      var alarm = ctx.notifications.findHighestAlarm();
      if (!alarm) {
        ctx.bus.emit('notification', {
          clear: true
          , title: 'All Clear'
          , message: 'Server started without alarms'
        });
      }
    }, 20000);
});
