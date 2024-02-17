'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
var THIRTY_MINUTES = 30 * 60 * 1000;
var DEFAULT_GROUPS = ['default'];

var Alarm = function(this: any, level: any, group: any, label: any) {
  this.level = level;
  this.group = group;
  this.label = label;
  this.silenceTime = THIRTY_MINUTES;
  this.lastAckTime = 0;
};

// list of alarms with their thresholds
var alarms = {};

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init (env: any, ctx: any) {

  function notifications () {
    return notifications;
  }

  function getAlarm (level: any, group: any) {
    var key = level + '-' + group;
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var alarm = alarms[key];
    if (!alarm) {
      var display = group === 'default' ? ctx.levels.toDisplay(level) : group + ':' + level;
      // @ts-expect-error TS(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
      alarm = new Alarm(level, group, display);
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      alarms[key] = alarm;
    }

    return alarm;
  }

  //should only be used when auto acking the alarms after going back in range or when an error corrects
  //setting the silence time to 1ms so the alarm will be re-triggered as soon as the condition changes
  //since this wasn't ack'd by a user action
  function autoAckAlarms (group: any) {

    var sendClear = false;

    for (var level = 1; level <= 2; level++) {
      var alarm = getAlarm(level, group);
      if (alarm.lastEmitTime) {
        console.info('auto acking ' + alarm.level, ' - ', group);
        // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
        notifications.ack(alarm.level, group, 1);
        sendClear = true;
      }
    }

    if (sendClear) {
      var notify = { clear: true, title: 'All Clear', message: 'Auto ack\'d alarm(s)', group: group };
      ctx.bus.emit('notification', notify);
      logEmitEvent(notify);
    }
  }

  function emitNotification (notify: any) {
    var alarm = getAlarm(notify.level, notify.group);
    if (ctx.ddata.lastUpdated > alarm.lastAckTime + alarm.silenceTime) {
      ctx.bus.emit('notification', notify);
      alarm.lastEmitTime = ctx.ddata.lastUpdated;
      logEmitEvent(notify);
    } else {
      console.log(alarm.label + ' alarm is silenced for ' + Math.floor((alarm.silenceTime - (ctx.ddata.lastUpdated - alarm.lastAckTime)) / 60000) + ' minutes more');
    }
  }

  var requests = {};

  notifications.initRequests = function initRequests () {
    requests = { notifies: [], snoozes: [] };
  };

  notifications.initRequests();

  /**
   * Find the first URGENT or first WARN
   * @returns a notification or undefined
   */
  notifications.findHighestAlarm = function findHighestAlarm (group: any) {
    group = group || 'default';
    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    var filtered = _.filter(requests.notifies, { group: group });
    return _.find(filtered, { level: ctx.levels.URGENT }) || _.find(filtered, { level: ctx.levels.WARN });
  };

  notifications.findUnSnoozeable = function findUnSnoozeable () {
    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    return _.filter(requests.notifies, function(notify: any) {
      return notify.level <= ctx.levels.INFO || notify.isAnnouncement;
    });
  };

  notifications.snoozedBy = function snoozedBy (notify: any) {
    if (notify.isAnnouncement) { return false; }

    // @ts-expect-error TS(2339) FIXME: Property 'snoozes' does not exist on type '{}'.
    var filtered = _.filter(requests.snoozes, { group: notify.group });

    if (_.isEmpty(filtered)) { return false; }

    var byLevel = _.filter(filtered, function checkSnooze (snooze: any) {
      return snooze.level >= notify.level;
    });
    var sorted = _.sortBy(byLevel, 'lengthMills');

    return _.last(sorted);
  };

  notifications.requestNotify = function requestNotify (notify: any) {
    if (!Object.prototype.hasOwnProperty.call(notify, 'level') || !notify.title || !notify.message || !notify.plugin) {
      console.error(new Error('Unable to request notification, since the notify isn\'t complete: ' + JSON.stringify(notify)));
      return;
    }

    notify.group = notify.group || 'default';

    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    requests.notifies.push(notify);
  };

  notifications.requestSnooze = function requestSnooze (snooze: any) {
    if (!snooze.level || !snooze.title || !snooze.message || !snooze.lengthMills) {
      console.error(new Error('Unable to request snooze, since the snooze isn\'t complete: ' + JSON.stringify(snooze)));
      return;
    }

    snooze.group = snooze.group || 'default';

    // @ts-expect-error TS(2339) FIXME: Property 'snoozes' does not exist on type '{}'.
    requests.snoozes.push(snooze);
  };

  notifications.process = function process () {

    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    var notifyGroups = _.map(requests.notifies, function eachNotify (notify: any) {
      return notify.group;
    });

    var alarmGroups = _.map(_.values(alarms), function eachAlarm (alarm: any) {
      return alarm.group;
    });

    var groups = _.uniq(notifyGroups.concat(alarmGroups));

    if (_.isEmpty(groups)) {
      groups = DEFAULT_GROUPS.slice();
    }

    _.each(groups, function eachGroup (group: any) {
      var highestAlarm = notifications.findHighestAlarm(group);

      if (highestAlarm) {
        // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 2.
        var snoozedBy = notifications.snoozedBy(highestAlarm, group);
        if (snoozedBy) {
          logSnoozingEvent(highestAlarm, snoozedBy);
          notifications.ack(snoozedBy.level, group, snoozedBy.lengthMills, true);
        } else {
          emitNotification(highestAlarm);
        }
      } else {
        autoAckAlarms(group);
      }
    });

    notifications.findUnSnoozeable().forEach(function eachInfo (notify: any) {
      emitNotification(notify);
    });
  };

  notifications.ack = function ack (level: any, group: any, time: any, sendClear: any) {
    var alarm = getAlarm(level, group);
    if (!alarm) {
      console.warn('Got an ack for an unknown alarm time, level:', level, ', group:', group);
      return;
    }

    if (Date.now() < alarm.lastAckTime + alarm.silenceTime) {
      console.warn('Alarm has already been snoozed, don\'t snooze it again, level:', level, ', group:', group);
      return;
    }

    alarm.lastAckTime = Date.now();
    alarm.silenceTime = time ? time : THIRTY_MINUTES;
    delete alarm.lastEmitTime;

    if (level === 2) {
      // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
      notifications.ack(1, group, time);
    }

    /*
    * TODO: modify with a local clear, this will clear all connected clients,
    * globally
    */
    if (sendClear) {
      var notify = {
        clear: true
        , title: 'All Clear'
        , message: group + ' - ' + ctx.levels.toDisplay(level) + ' was ack\'d'
        , group: group
      };
      // When web client sends ack, this translates the websocket message into
      // an event on our internal bus.
      ctx.bus.emit('notification', notify);
      logEmitEvent(notify);
    }

  };

  function ifTestModeThen (callback: any) {
    if (env.testMode) {
      return callback();
    } else {
      throw 'Test only function was called = while not in test mode';
    }
  }

  notifications.resetStateForTests = function resetStateForTests () {
    ifTestModeThen(function doResetStateForTests () {
      console.info('resetting notifications state for tests');
      alarms = {};
    });
  };

  notifications.getAlarmForTests = function getAlarmForTests (level: any, group: any) {
    return ifTestModeThen(function doResetStateForTests () {
      group = group || 'default';
      var alarm = getAlarm(level, group);
      console.info('got alarm for tests: ', alarm);
      return alarm;
    });
  };

  function notifyToView (notify: any) {
    return {
      level: ctx.levels.toDisplay(notify.level)
      , title: notify.title
      , message: notify.message
      , group: notify.group
      , plugin: notify.plugin ? notify.plugin.name : '<none>'
      , debug: notify.debug
    };
  }

  function snoozeToView (snooze: any) {
    return {
      level: ctx.levels.toDisplay(snooze.level)
      , title: snooze.title
      , message: snooze.message
      , group: snooze.group
    };
  }

  function logEmitEvent (notify: any) {
    var type = notify.level >= ctx.levels.WARN ? 'ALARM' : (notify.clear ? 'ALL CLEAR' : 'NOTIFICATION');
    console.info([
      logTimestamp() + '\tEMITTING ' + type + ':'
      , '  ' + JSON.stringify(notifyToView(notify))
    ].join('\n'));
  }

  function logSnoozingEvent (highestAlarm: any, snoozedBy: any) {
    console.info([
      logTimestamp() + '\tSNOOZING ALARM:'
      , '  ' + JSON.stringify(notifyToView(highestAlarm))
      , '  BECAUSE:'
      , '    ' + JSON.stringify(snoozeToView(snoozedBy))
    ].join('\n'));
  }

  //TODO: we need a common logger, but until then...
  function logTimestamp () {
    return (new Date).toISOString();
  }

  return notifications();
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
