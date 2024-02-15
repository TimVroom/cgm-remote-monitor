'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Pushover = require('pushover-notifications');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
var request = require('request');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

function init (env: any, ctx: any) {
  var pushover = {
    PRIORITY_NORMAL: 0
    , PRIORITY_EMERGENCY: 2
  };

  var pushoverAPI = setupPushover(env);

  function selectKeys (notify: any) {
    var keys = null;

    if (notify.isAnnouncement) {
      keys = pushoverAPI.announcementKeys;
    } else if (ctx.levels.isAlarm(notify.level)) {
      keys = pushoverAPI.alarmKeys;
    } else {
      keys = pushoverAPI.userKeys;
    }

    return keys;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'send' does not exist on type '{ PRIORITY... Remove this comment to see the full error message
  pushover.send = function wrapSend (notify: any, callback: any) {
    var selectedKeys = selectKeys(notify);

    function prepareMessage() {
      var msg = {
        expire: times.mins(15).secs
        , title: notify.title
        , message: notify.message
        , sound: notify.pushoverSound || 'gamelan'
        , timestamp: new Date()
        //USE PUSHOVER_EMERGENCY for WARN and URGENT so we get the acks
        , priority: notify.level >= ctx.levels.WARN ? pushover.PRIORITY_EMERGENCY : pushover.PRIORITY_NORMAL
      };

      if (ctx.levels.isAlarm(notify.level)) {
        //ADJUST RETRY TIME based on WARN or URGENT
        // @ts-expect-error TS(2339) FIXME: Property 'retry' does not exist on type '{ expire:... Remove this comment to see the full error message
        msg.retry = notify.level === ctx.levels.URGENT ? times.mins(2).secs : times.mins(15).secs;
        if (env.settings && env.settings.baseURL) {
          // @ts-expect-error TS(2339) FIXME: Property 'callback' does not exist on type '{ expi... Remove this comment to see the full error message
          msg.callback = env.settings.baseURL + '/api/v1/notifications/pushovercallback';
        }
      }
      return msg;
    }

    if (selectedKeys.length === 0) {
      if (callback) {
        return callback('no-key-defined');
      }
    }

    var msg = prepareMessage();

    _.each(selectedKeys, function eachKey(key: any) {
      // @ts-expect-error TS(2339) FIXME: Property 'user' does not exist on type '{ expire: ... Remove this comment to see the full error message
      msg.user = key;
      // @ts-expect-error TS(2339) FIXME: Property 'sendAPIRequest' does not exist on type '... Remove this comment to see the full error message
      pushover.sendAPIRequest(msg, callback);
    });

  };

  // @ts-expect-error TS(2339) FIXME: Property 'sendAPIRequest' does not exist on type '... Remove this comment to see the full error message
  pushover.sendAPIRequest = function sendAPIRequest (msg: any, callback: any) {
    pushoverAPI.send(msg, function response (err: any, result: any) {
      if (err) {
        console.error('unable to send pushover notification', msg, err);
      } else {
        console.info('sent pushover notification: ', msg, 'result: ', result);
      }
      callback(err, result);
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'cancelWithReceipt' does not exist on typ... Remove this comment to see the full error message
  pushover.cancelWithReceipt = function cancelWithReceipt (receipt: any, callback: any) {
    request
      .get('https://api.pushover.net/1/receipts/' + receipt + '/cancel.json?token=' + pushoverAPI.apiToken)
      .on('response', function (response: any) {
        callback(null, response);
      })
      .on('error', function (err: any) {
        callback(err);
      });
  };

  if (pushoverAPI) {
    console.info('Pushover is ready to push');
    return pushover;
  } else {
    console.info('Pushover was NOT configured');
    return null;
  }
}

function setupPushover (env: any) {
  var apiToken = env.extendedSettings && env.extendedSettings.pushover && env.extendedSettings.pushover.apiToken;

  function keysByType (type: any, fallback: any) {
    fallback = fallback || [];

    var key = env.extendedSettings && env.extendedSettings.pushover && env.extendedSettings.pushover[type];

    if (key === false) {
      return [];  //don't consider fallback, this type has been disabled
    } else if (key && key.split) {
      return key.split(' ') || fallback;
    } else {
      return fallback;
    }
  }

  var userKeys = keysByType('userKey', []);

  if (userKeys.length === 0) {
    // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
    userKeys = keysByType('groupKey') || [];
  }

  var alarmKeys = keysByType('alarmKey', userKeys);

  var announcementKeys = keysByType('announcementKey', userKeys || alarmKeys);

  if (apiToken && (userKeys.length > 0 || alarmKeys.length > 0 || announcementKeys.length > 0)) {
    var pushoverAPI = new Pushover({
      token: apiToken,
      onerror: function(error: any) {
        console.error('Pushover error', error);
      }
    });

    pushoverAPI.apiToken = apiToken;
    pushoverAPI.userKeys = userKeys;
    pushoverAPI.alarmKeys = alarmKeys;
    pushoverAPI.announcementKeys = announcementKeys;

    return pushoverAPI;
  }
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;