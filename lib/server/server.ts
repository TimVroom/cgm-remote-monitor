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

import fs from 'fs';
import envImport from './env';
import languageImport from '../language';
import websocketImport from './websocket';
import booteventImport from './bootevent';
import appImport from './app';

const env = envImport();
const language = languageImport(fs);
const translate = language.set(env.settings.language).translate;
language.loadLocalization(fs);

///////////////////////////////////////////////////
// setup http server
///////////////////////////////////////////////////
const PORT = env.PORT;
const HOSTNAME = env.HOSTNAME;

function create (app) {
  const transport = (env.ssl
                ? require('https') : require('http'));
  if (env.ssl) {
    return transport.createServer(env.ssl, app);
  }
  return transport.createServer(app);
}

booteventImport(env, language).boot(function booted (ctx) {
    console.log('Boot event processing completed');
    
    const app = appImport(env, ctx);
    const server = create(app).listen(PORT, HOSTNAME);
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
    websocketImport(env, ctx, server);

    //after startup if there are no alarms send all clear
    const sendStartupAllClearTimer = setTimeout(function sendStartupAllClear () {
      const alarm = ctx.notifications.findHighestAlarm();
      if (!alarm) {
        ctx.bus.emit('notification', {
          clear: true
          , title: 'All Clear'
          , message: 'Server started without alarms'
        });
      }
    }, 20000);
});
