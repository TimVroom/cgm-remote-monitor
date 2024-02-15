'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

function init(ctx: any) {

  var simplealarms = {
    name: 'simplealarms'
    , label: 'Simple Alarms'
    , pluginType: 'notification'
  };
  
  var levels = ctx.levels;

  // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  simplealarms.checkNotifications = function checkNotifications(sbx: any) {

    var lastSGVEntry = sbx.lastSGVEntry()
      , scaledSGV = sbx.scaleEntry(lastSGVEntry)
      ;

    if (scaledSGV && lastSGVEntry && lastSGVEntry.mgdl > 39 && sbx.time - lastSGVEntry.mills < times.mins(10).msecs) {
      // @ts-expect-error TS(2339): Property 'compareBGToTresholds' does not exist on ... Remove this comment to see the full error message
      var result = simplealarms.compareBGToTresholds(scaledSGV, sbx);
      if (levels.isAlarm(result.level)) {
        sbx.notifications.requestNotify({
          level: result.level
          , title: result.title
          , message: sbx.buildDefaultMessage()
          , eventName: result.eventName
          , plugin: simplealarms
          , pushoverSound: result.pushoverSound
          , debug: {
            lastSGV: scaledSGV, thresholds: sbx.settings.thresholds
          }
        });
      }
    }
  };

  // @ts-expect-error TS(2339): Property 'compareBGToTresholds' does not exist on ... Remove this comment to see the full error message
  simplealarms.compareBGToTresholds = function compareBGToTresholds(scaledSGV: any, sbx: any) {
    var result = { level: levels.INFO };

    if (sbx.settings.alarmUrgentHigh && scaledSGV > sbx.scaleMgdl(sbx.settings.thresholds.bgHigh)) {
      result.level = levels.URGENT;
      // @ts-expect-error TS(2339): Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
      result.title = levels.toDisplay(levels.URGENT) + ' HIGH';
      // @ts-expect-error TS(2339): Property 'pushoverSound' does not exist on type '{... Remove this comment to see the full error message
      result.pushoverSound = 'persistent';
      // @ts-expect-error TS(2339): Property 'eventName' does not exist on type '{ lev... Remove this comment to see the full error message
      result.eventName = 'high';
    } else
      if (sbx.settings.alarmHigh && scaledSGV > sbx.scaleMgdl(sbx.settings.thresholds.bgTargetTop)) {
        result.level = levels.WARN;
        // @ts-expect-error TS(2339): Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
        result.title = levels.toDisplay(levels.WARN) + ' HIGH';
        // @ts-expect-error TS(2339): Property 'pushoverSound' does not exist on type '{... Remove this comment to see the full error message
        result.pushoverSound = 'climb';
        // @ts-expect-error TS(2339): Property 'eventName' does not exist on type '{ lev... Remove this comment to see the full error message
        result.eventName = 'high';
      }

    if (sbx.settings.alarmUrgentLow && scaledSGV < sbx.scaleMgdl(sbx.settings.thresholds.bgLow)) {
      result.level = levels.URGENT;
      // @ts-expect-error TS(2339): Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
      result.title = levels.toDisplay(levels.URGENT) + ' LOW';
      // @ts-expect-error TS(2339): Property 'pushoverSound' does not exist on type '{... Remove this comment to see the full error message
      result.pushoverSound = 'persistent';
      // @ts-expect-error TS(2339): Property 'eventName' does not exist on type '{ lev... Remove this comment to see the full error message
      result.eventName = 'low';
    } else if (sbx.settings.alarmLow && scaledSGV < sbx.scaleMgdl(sbx.settings.thresholds.bgTargetBottom)) {
      result.level = levels.WARN;
      // @ts-expect-error TS(2339): Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
      result.title = levels.toDisplay(levels.WARN) + ' LOW';
      // @ts-expect-error TS(2339): Property 'pushoverSound' does not exist on type '{... Remove this comment to see the full error message
      result.pushoverSound = 'falling';
      // @ts-expect-error TS(2339): Property 'eventName' does not exist on type '{ lev... Remove this comment to see the full error message
      result.eventName = 'low';
    }

    return result;
  };

  return simplealarms;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;