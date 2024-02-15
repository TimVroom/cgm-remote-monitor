'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
var times = require('../times');
var lastChecked = new Date();
var lastRecoveryTimeFromSuspend = new Date("1900-01-01");

function init(ctx: any) {
  var translate = ctx.language.translate;
  var levels = ctx.levels;

  var timeago = {
    name: 'timeago',
    label: 'Timeago',
    pluginType: 'pill-status',
    pillFlip: true
  };

  // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  timeago.checkNotifications = function checkNotifications(sbx: any) {

    if (!sbx.extendedSettings.enableAlerts) {
      return;
    }

    var lastSGVEntry = sbx.lastSGVEntry();

    if (!lastSGVEntry || lastSGVEntry.mills >= sbx.time) {
      return;
    }

    function buildMessage(agoDisplay: any) {
      var lines = sbx.prepareDefaultLines();
      lines.unshift(translate('Last received:') + ' ' + [agoDisplay.value, agoDisplay.label].join(' '));
      return lines.join('\n');
    }

    function sendAlarm(opts: any) {
      // @ts-expect-error TS(2339): Property 'calcDisplay' does not exist on type '{ n... Remove this comment to see the full error message
      var agoDisplay = timeago.calcDisplay(lastSGVEntry, sbx.time);

      sbx.notifications.requestNotify({
        level: opts.level,
        title: translate('Stale data, check rig?'),
        message: buildMessage(agoDisplay),
        eventName: timeago.name,
        plugin: timeago,
        group: 'Time Ago',
        pushoverSound: opts.pushoverSound,
        debug: agoDisplay
      });
    }

    // @ts-expect-error TS(2339): Property 'checkStatus' does not exist on type '{ n... Remove this comment to see the full error message
    var status = timeago.checkStatus(sbx);
    if (status === 'urgent') {
      sendAlarm({
        level: levels.URGENT,
        pushoverSound: 'echo'
      });
    } else if (status === 'warn') {
      sendAlarm({
        level: levels.WARN,
        pushoverSound: 'echo'
      });
    }

  };

  // @ts-expect-error TS(2339): Property 'checkStatus' does not exist on type '{ n... Remove this comment to see the full error message
  timeago.checkStatus = function checkStatus(sbx: any) {
    // Check if the app has been suspended; if yes, snooze data missing alarmn for 15 seconds
    var now = new Date();
    var delta = now.getTime() - lastChecked.getTime();
    lastChecked = now;

    function isHibernationDetected() {
      if (sbx.runtimeEnvironment === 'client') {
        if (delta > 20 * 1000) { // Looks like we've been hibernating
          lastRecoveryTimeFromSuspend = now;
        }
        var timeSinceLastRecovered = now.getTime() - lastRecoveryTimeFromSuspend.getTime();
        return timeSinceLastRecovered < (10 * 1000);
      }

      // Assume server never hibernates, or if it does, it's alarm-worthy
      return false;

    }

    if (isHibernationDetected()) {
      console.log('Hibernation detected, suspending timeago alarm');
      return 'current';
    }

    var lastSGVEntry = sbx.lastSGVEntry(),
      warn = sbx.settings.alarmTimeagoWarn,
      warnMins = sbx.settings.alarmTimeagoWarnMins || 15,
      urgent = sbx.settings.alarmTimeagoUrgent,
      urgentMins = sbx.settings.alarmTimeagoUrgentMins || 30;

    function isStale(mins: any) {
      return sbx.time - lastSGVEntry.mills > times.mins(mins).msecs;
    }

    var status = 'current';

    if (!lastSGVEntry) {
      //assume current
    } else if (urgent && isStale(urgentMins)) {
      status = 'urgent';
    } else if (warn && isStale(warnMins)) {
      status = 'warn';
    }

    return status;

  };

  // @ts-expect-error TS(2339): Property 'isMissing' does not exist on type '{ nam... Remove this comment to see the full error message
  timeago.isMissing = function isMissing(opts: any) {
    if (!opts || !opts.entry || isNaN(opts.entry.mills) || isNaN(opts.time) || isNaN(opts.timeSince)) {
      return {
        label: translate('time ago'),
        shortLabel: translate('ago')
      };
    }
  };

  // @ts-expect-error TS(2339): Property 'inTheFuture' does not exist on type '{ n... Remove this comment to see the full error message
  timeago.inTheFuture = function inTheFuture(opts: any) {
    if (opts.entry.mills - times.mins(5).msecs > opts.time) {
      return {
        label: translate('in the future'),
        shortLabel: translate('future')
      };
    }
  };

  // @ts-expect-error TS(2339): Property 'almostInTheFuture' does not exist on typ... Remove this comment to see the full error message
  timeago.almostInTheFuture = function almostInTheFuture(opts: any) {
    if (opts.entry.mills > opts.time) {
      return {
        value: 1,
        label: translate('min ago'),
        shortLabel: 'm'
      };
    }
  };

  // @ts-expect-error TS(2339): Property 'isLessThan' does not exist on type '{ na... Remove this comment to see the full error message
  timeago.isLessThan = function isLessThan(limit: any, divisor: any, label: any, shortLabel: any) {
    return function checkIsLessThan(opts: any) {
      if (opts.timeSince < limit) {
        return {
          value: Math.max(1, Math.round(opts.timeSince / divisor)),
          label: label,
          shortLabel: shortLabel
        };
      }
    };
  };

  // @ts-expect-error TS(2339): Property 'resolvers' does not exist on type '{ nam... Remove this comment to see the full error message
  timeago.resolvers = [
    // @ts-expect-error TS(2339): Property 'isMissing' does not exist on type '{ nam... Remove this comment to see the full error message
    timeago.isMissing, timeago.inTheFuture, timeago.almostInTheFuture, timeago.isLessThan(times.mins(2).msecs, times.min().msecs, 'min ago', 'm'), timeago.isLessThan(times.hour().msecs, times.min().msecs, 'mins ago', 'm'), timeago.isLessThan(times.hours(2).msecs, times.hour().msecs, 'hour ago', 'h'), timeago.isLessThan(times.day().msecs, times.hour().msecs, 'hours ago', 'h'), timeago.isLessThan(times.days(2).msecs, times.day().msecs, 'day ago', 'd'), timeago.isLessThan(times.week().msecs, times.day().msecs, 'days ago', 'd'),
    function () {
      return {
        label: 'long ago',
        shortLabel: 'ago'
      }
    }
  ];

  // @ts-expect-error TS(2339): Property 'calcDisplay' does not exist on type '{ n... Remove this comment to see the full error message
  timeago.calcDisplay = function calcDisplay(entry: any, time: any) {
    var opts = {
      time: time,
      entry: entry
    };

    if (time && entry && entry.mills) {
      // @ts-expect-error TS(2339): Property 'timeSince' does not exist on type '{ tim... Remove this comment to see the full error message
      opts.timeSince = time - entry.mills;
    }

    // @ts-expect-error TS(2339): Property 'resolvers' does not exist on type '{ nam... Remove this comment to see the full error message
    for (var i = 0; i < timeago.resolvers.length; i++) {
      // @ts-expect-error TS(2339): Property 'resolvers' does not exist on type '{ nam... Remove this comment to see the full error message
      var value = timeago.resolvers[i](opts);
      if (value) {
        return value;
      }
    }
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  timeago.updateVisualisation = function updateVisualisation(sbx: any) {
    // @ts-expect-error TS(2339): Property 'calcDisplay' does not exist on type '{ n... Remove this comment to see the full error message
    var agoDisplay = timeago.calcDisplay(sbx.lastSGVEntry(), sbx.time);
    var inRetroMode = sbx.data.inRetroMode;

    sbx.pluginBase.updatePillText(timeago, {
      value: inRetroMode ? null : agoDisplay.value,
      label: inRetroMode ? translate('RETRO') : translate(agoDisplay.label)
        //no warning/urgent class when in retro mode
        ,
      // @ts-expect-error TS(2339): Property 'checkStatus' does not exist on type '{ n... Remove this comment to see the full error message
      pillClass: inRetroMode ? 'current' : timeago.checkStatus(sbx)
    });
  };

  return timeago;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;