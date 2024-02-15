'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function init(ctx: any) {
  var moment = ctx.moment;
  var translate = ctx.language.translate;
  var levels = ctx.levels;

  var cage = {
    name: 'cage'
    , label: 'Cannula Age'
    , pluginType: 'pill-minor'
  };

  // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  cage.getPrefs = function getPrefs (sbx: any) {
    // CAGE_INFO = 44 CAGE_WARN=48 CAGE_URGENT=70
    return {
      info: sbx.extendedSettings.info || 44
      , warn: sbx.extendedSettings.warn || 48
      , urgent: sbx.extendedSettings.urgent || 72
      , display: sbx.extendedSettings.display ? sbx.extendedSettings.display : 'hours'
      , enableAlerts: sbx.extendedSettings.enableAlerts || false
    };
  };

  // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  cage.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('cage', function setProp ( ) {
      // @ts-expect-error TS(2339): Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
      return cage.findLatestTimeChange(sbx);
    });
  };

  // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  cage.checkNotifications = function checkNotifications (sbx: any) {
    var cannulaInfo = sbx.properties.cage;

    if (cannulaInfo.notification) {
      var notification = _.extend({}, cannulaInfo.notification, {
        plugin: cage
        , debug: {
          age: cannulaInfo.age
        }
      });
      sbx.notifications.requestNotify(notification);
    }
  };

  // @ts-expect-error TS(2339): Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
  cage.findLatestTimeChange = function findLatestTimeChange (sbx: any) {

    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = cage.getPrefs(sbx);

    var cannulaInfo = {
      found: false
      , age: 0
      , treatmentDate: null
      , checkForAlert: false
    };

    var prevDate = 0;

    _.each(sbx.data.sitechangeTreatments, function eachTreatment (treatment: any) {
      var treatmentDate = treatment.mills;
      if (treatmentDate > prevDate && treatmentDate <= sbx.time) {

        prevDate = treatmentDate;
        cannulaInfo.treatmentDate = treatmentDate;

        var a = moment(sbx.time);
        var b = moment(cannulaInfo.treatmentDate);
        var days = a.diff(b,'days');
        var hours = a.diff(b,'hours') - days * 24;
        var age = a.diff(b,'hours');

        if (!cannulaInfo.found || (age >= 0 && age < cannulaInfo.age)) {
          cannulaInfo.found = true;
          cannulaInfo.age = age;
          // @ts-expect-error TS(2339): Property 'days' does not exist on type '{ found: b... Remove this comment to see the full error message
          cannulaInfo.days = days;
          // @ts-expect-error TS(2339): Property 'hours' does not exist on type '{ found: ... Remove this comment to see the full error message
          cannulaInfo.hours = hours;
          // @ts-expect-error TS(2339): Property 'notes' does not exist on type '{ found: ... Remove this comment to see the full error message
          cannulaInfo.notes = treatment.notes;
          // @ts-expect-error TS(2339): Property 'minFractions' does not exist on type '{ ... Remove this comment to see the full error message
          cannulaInfo.minFractions = a.diff(b,'minutes') - age * 60;
        }
      }
    });

    // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
    cannulaInfo.level = levels.NONE;

    var sound = 'incoming';
    var message;
    var sendNotification = false;

    if (cannulaInfo.age >= prefs.urgent) {
      sendNotification = cannulaInfo.age === prefs.urgent;
      message = translate('Cannula change overdue!');
      sound = 'persistent';
      // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
      cannulaInfo.level = levels.URGENT;
    } else if (cannulaInfo.age >= prefs.warn) {
      sendNotification = cannulaInfo.age === prefs.warn;
      message = translate('Time to change cannula');
      // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
      cannulaInfo.level = levels.WARN;
    } else  if (cannulaInfo.age >= prefs.info) {
      sendNotification = cannulaInfo.age === prefs.info;
      message = 'Change cannula soon';
      // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
      cannulaInfo.level = levels.INFO;
    }

    if (prefs.display === 'days' && cannulaInfo.found) {
      // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
      cannulaInfo.display = '';
      if (cannulaInfo.age >= 24) {
        // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
        cannulaInfo.display += cannulaInfo.days + 'd';
      }
      // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
      cannulaInfo.display += cannulaInfo.hours + 'h';
    } else {
      // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
      cannulaInfo.display = cannulaInfo.found ? cannulaInfo.age + 'h' : 'n/a ';
    }

    //allow for 20 minute period after a full hour during which we'll alert the user
    // @ts-expect-error TS(2339): Property 'minFractions' does not exist on type '{ ... Remove this comment to see the full error message
    if (prefs.enableAlerts && sendNotification && cannulaInfo.minFractions <= 20) {
      // @ts-expect-error TS(2339): Property 'notification' does not exist on type '{ ... Remove this comment to see the full error message
      cannulaInfo.notification = {
        title: translate('Cannula age %1 hours', { params: [cannulaInfo.age] })
        , message: message
        , pushoverSound: sound
        // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
        , level: cannulaInfo.level
        , group: 'CAGE'
      };
    }

    return cannulaInfo;
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  cage.updateVisualisation = function updateVisualisation (sbx: any) {

    var cannulaInfo = sbx.properties.cage;

    var info = [{ label: translate('Inserted'), value: new Date(cannulaInfo.treatmentDate).toLocaleString() }];

    if (!_.isEmpty(cannulaInfo.notes)) {
      info.push({label: translate('Notes') + ':', value: cannulaInfo.notes});
    }

    var statusClass = null;
    if (cannulaInfo.level === levels.URGENT) {
      statusClass = 'urgent';
    } else if (cannulaInfo.level === levels.WARN) {
      statusClass = 'warn';
    }

    sbx.pluginBase.updatePillText(cage, {
      value: cannulaInfo.display
      , label: translate('CAGE')
      , info: info
      , pillClass: statusClass
    });
  };
  return cage;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

