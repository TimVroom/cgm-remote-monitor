'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'async'.
var async = require('async');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var request = require('request');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

function init (env: any) {

  var keys = env.extendedSettings && env.extendedSettings.maker &&
    env.extendedSettings.maker.key && env.extendedSettings.maker.key.split(' ');

  var announcementKeys = (env.extendedSettings && env.extendedSettings.maker &&
    env.extendedSettings.maker.announcementKey && env.extendedSettings.maker.announcementKey.split(' ')) || keys;

  var maker = { };

  var lastAllClear = 0;

  // @ts-expect-error TS(2339): Property 'sendAllClear' does not exist on type '{}... Remove this comment to see the full error message
  maker.sendAllClear = function sendAllClear (notify: any, callback: any) {
    if (Date.now() - lastAllClear > times.mins(30).msecs) {
      lastAllClear = Date.now();

      //can be used to prevent maker/twitter deduping (add to IFTTT tweet text)
      var shortTimestamp = Math.round(Date.now() / 1000 / 60);

      // @ts-expect-error TS(2339): Property 'makeKeyRequests' does not exist on type ... Remove this comment to see the full error message
      maker.makeKeyRequests({
        value1: (notify && notify.title) || 'All Clear'
        , value2: notify && notify.message && '\n' + notify.message
        , value3: '\n' + shortTimestamp
      }, 'ns-allclear', function allClearCallback (err: any) {
        if (err) {
          lastAllClear = 0;
          callback(err);
        } else if (callback) {
          callback(null, {sent: true});
        }
      });
    } else if (callback) {
      callback(null, {sent: false});
    }
  };

  // @ts-expect-error TS(2339): Property 'sendEvent' does not exist on type '{}'.
  maker.sendEvent = function sendEvent (event: any, callback: any) {
    if (!event || !event.name) {
      callback('No event name found');
    } else if (!event.level) {
      callback('No event level found');
    } else {
      // @ts-expect-error TS(2339): Property 'makeRequests' does not exist on type '{}... Remove this comment to see the full error message
      maker.makeRequests(event, function sendCallback (err: any, response: any) {
        if (err) {
          callback(err);
        } else {
          lastAllClear = 0;
          callback(null, response);
        }
      });
    }
  };

  //exposed for testing
  // @ts-expect-error TS(2339): Property 'valuesToQuery' does not exist on type '{... Remove this comment to see the full error message
  maker.valuesToQuery = function valuesToQuery (event: any) {
    var query = '';

    for (var i = 1; i <= 3; i++) {
      var name = 'value' + i;
      var value = event[name];
      lastAllClear = 0;
      if (value) {
        if (query) {
          query += '&';
        } else {
          query += '?';
        }
        query += name + '=' + encodeURIComponent(value);
      }
    }

    return query;
  };

  // @ts-expect-error TS(2339): Property 'makeRequests' does not exist on type '{}... Remove this comment to see the full error message
  maker.makeRequests = function makeRequests(event: any, callback: any) {
    function sendGeneric (callback: any) {
      // @ts-expect-error TS(2339): Property 'makeKeyRequests' does not exist on type ... Remove this comment to see the full error message
      maker.makeKeyRequests(event, 'ns-event', callback);
    }

    function sendByLevel (callback: any) {
      // @ts-expect-error TS(2339): Property 'makeKeyRequests' does not exist on type ... Remove this comment to see the full error message
      maker.makeKeyRequests (event, 'ns-' + event.level, callback);
    }

    function sendByLevelAndName (callback: any) {
      // @ts-expect-error TS(2339): Property 'makeKeyRequests' does not exist on type ... Remove this comment to see the full error message
      maker.makeKeyRequests(event, 'ns' + ((event.level && '-' + event.level) || '') + '-' + event.name, callback);
    }

    //since maker events only filter on name, we are sending multiple events and different levels of granularity
    async.series([sendGeneric, sendByLevel, sendByLevelAndName], callback);
  };

  // @ts-expect-error TS(2339): Property 'makeKeyRequests' does not exist on type ... Remove this comment to see the full error message
  maker.makeKeyRequests = function makeKeyRequests(event: any, eventName: any, callback: any) {
    var selectedKeys = event.isAnnouncement ? announcementKeys : keys;

    _.each(selectedKeys, function eachKey(key: any) {
      // @ts-expect-error TS(2339): Property 'makeKeyRequest' does not exist on type '... Remove this comment to see the full error message
      maker.makeKeyRequest(key, event, eventName, callback);
    });
  };

  // @ts-expect-error TS(2339): Property 'makeKeyRequest' does not exist on type '... Remove this comment to see the full error message
  maker.makeKeyRequest = function makeKeyRequest(key: any, event: any, eventName: any, callback: any) {
    // @ts-expect-error TS(2339): Property 'valuesToQuery' does not exist on type '{... Remove this comment to see the full error message
    var url = 'https://maker.ifttt.com/trigger/' + eventName + '/with/key/' + key + maker.valuesToQuery(event);
    request
      .get(url)
      .on('response', function (response: any) {
        console.info('sent maker request: ', url);
        callback(null, response);
      })
      .on('error', function (err: any) {
        callback(err);
      });
  };

  if (keys && keys.length > 0) {
    return maker;
  } else {
    return null;
  }

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;