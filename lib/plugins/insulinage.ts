'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function init(ctx: any) {
  var moment = ctx.moment;
  var translate = ctx.language.translate;
  var levels = ctx.levels;

  var iage = {
    name: 'iage'
    , label: 'Insulin Age'
    , pluginType: 'pill-minor'
  };

  // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  iage.getPrefs = function getPrefs(sbx: any) {
    // IAGE_INFO=44 IAGE_WARN=48 IAGE_URGENT=70
    return {
      info: sbx.extendedSettings.info || 44
      , warn: sbx.extendedSettings.warn || 48
      , urgent: sbx.extendedSettings.urgent || 72
      , enableAlerts: sbx.extendedSettings.enableAlerts || false
    };
  };

  // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  iage.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('iage', function setProp ( ) {
      // @ts-expect-error TS(2339): Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
      return iage.findLatestTimeChange(sbx);
    });
  };

  // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  iage.checkNotifications = function checkNotifications(sbx: any) {
    var insulinInfo = sbx.properties.iage;

    if (insulinInfo.notification) {
      var notification = _.extend({}, insulinInfo.notification, {
        plugin: iage
        , debug: {
          age: insulinInfo.age
        }
      });

      sbx.notifications.requestNotify(notification);
    }
  };

  // @ts-expect-error TS(2339): Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
  iage.findLatestTimeChange = function findLatestTimeChange(sbx: any) {

    var insulinInfo = {
      found: false
      , age: 0
      , treatmentDate: null
    };

    var prevDate = 0;

    _.each(sbx.data.insulinchangeTreatments, function eachTreatment (treatment: any) {
      var treatmentDate = treatment.mills;
      if (treatmentDate > prevDate && treatmentDate <= sbx.time) {

        prevDate = treatmentDate;
        insulinInfo.treatmentDate = treatmentDate;

        var a = moment(sbx.time);
        var b = moment(insulinInfo.treatmentDate);
        var days = a.diff(b,'days');
        var hours = a.diff(b,'hours') - days * 24;
        var age = a.diff(b,'hours');

        if (!insulinInfo.found || (age >= 0 && age < insulinInfo.age)) {
          insulinInfo.found = true;
          insulinInfo.age = age;
          // @ts-expect-error TS(2339): Property 'days' does not exist on type '{ found: b... Remove this comment to see the full error message
          insulinInfo.days = days;
          // @ts-expect-error TS(2339): Property 'hours' does not exist on type '{ found: ... Remove this comment to see the full error message
          insulinInfo.hours = hours;
          // @ts-expect-error TS(2339): Property 'notes' does not exist on type '{ found: ... Remove this comment to see the full error message
          insulinInfo.notes = treatment.notes;
          // @ts-expect-error TS(2339): Property 'minFractions' does not exist on type '{ ... Remove this comment to see the full error message
          insulinInfo.minFractions = a.diff(b,'minutes') - age * 60;

          // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
          insulinInfo.display = '';
          if (insulinInfo.age >= 24) {
            // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
            insulinInfo.display += insulinInfo.days + 'd';
          }
          // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
          insulinInfo.display += insulinInfo.hours + 'h';
        }
      }
    });

    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = iage.getPrefs(sbx);

    // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
    insulinInfo.level = levels.NONE;

    var sound = 'incoming';
    var message;
    var sendNotification = false;

    // @ts-expect-error TS(2339): Property 'urgent' does not exist on type '{ found:... Remove this comment to see the full error message
    if (insulinInfo.age >= insulinInfo.urgent) {
      sendNotification = insulinInfo.age === prefs.urgent;
      message = translate('Insulin reservoir change overdue!');
      sound = 'persistent';
      // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
      insulinInfo.level = levels.URGENT;
    } else if (insulinInfo.age >= prefs.warn) {
      sendNotification = insulinInfo.age === prefs.warn;
      message = translate('Time to change insulin reservoir');
      // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
      insulinInfo.level = levels.WARN;
    } else  if (insulinInfo.age >= prefs.info) {
      sendNotification = insulinInfo.age === prefs.info;
      message = translate('Change insulin reservoir soon');
      // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
      insulinInfo.level = levels.INFO;
    }

    //allow for 20 minute period after a full hour during which we'll alert the user
    // @ts-expect-error TS(2339): Property 'minFractions' does not exist on type '{ ... Remove this comment to see the full error message
    if (prefs.enableAlerts && sendNotification && insulinInfo.minFractions <= 20) {
      // @ts-expect-error TS(2339): Property 'notification' does not exist on type '{ ... Remove this comment to see the full error message
      insulinInfo.notification = {
        title: translate('Insulin reservoir age %1 hours', { params: [insulinInfo.age] })
        , message: message
        , pushoverSound: sound
        // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
        , level: insulinInfo.level
        , group: 'IAGE'
      };
    }

    return insulinInfo;
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  iage.updateVisualisation = function updateVisualisation (sbx: any) {

    var insulinInfo = sbx.properties.iage;

    var info = [{ label: translate('Changed'), value: new Date(insulinInfo.treatmentDate).toLocaleString() }];
    if (!_.isEmpty(insulinInfo.notes)) {
      info.push({label: translate('Notes:'), value: insulinInfo.notes});
    }

    var statusClass = null;
    if (insulinInfo.level === levels.URGENT) {
      statusClass = 'urgent';
    } else if (insulinInfo.level === levels.WARN) {
      statusClass = 'warn';
    }
    sbx.pluginBase.updatePillText(iage, {
      value: insulinInfo.display
      , label: translate('IAGE')
      , info: info
      , pillClass: statusClass
    });
  };

  return iage;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

