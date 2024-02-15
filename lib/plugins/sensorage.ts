'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

function init(ctx: any) {
  var moment = ctx.moment;
  var translate = ctx.language.translate;
  var levels = ctx.levels;

  var sage = {
    name: 'sage'
    , label: 'Sensor Age'
    , pluginType: 'pill-minor'
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  sage.getPrefs = function getPrefs(sbx: any) {
    return {
      info: sbx.extendedSettings.info || times.days(6).hours
      , warn: sbx.extendedSettings.warn || (times.days(7).hours - 4)
      , urgent: sbx.extendedSettings.urgent || (times.days(7).hours - 2)
      , enableAlerts: sbx.extendedSettings.enableAlerts || false
    };
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  sage.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('sage', function setProp ( ) {
      // @ts-expect-error TS(2339) FIXME: Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
      return sage.findLatestTimeChange(sbx);
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  sage.checkNotifications = function checkNotifications(sbx: any) {

    var info = sbx.properties.sage;
    var sensorInfo = info[info.min];

    if (sensorInfo.notification) {
      var notification = _.extend({}, sensorInfo.notification, {
        plugin: sage
        , debug: {
          age: sensorInfo.age
        }
      });

      sbx.notifications.requestNotify(notification);
    }

  };

  function minButValid(record: any) {
    var events = [ ];

    var start = record['Sensor Start'];
    if (start && start.found) {
      events.push({eventType: 'Sensor Start', treatmentDate: start.treatmentDate});
    }

    var change = record['Sensor Change'];
    if (change && change.found) {
      events.push({eventType: 'Sensor Change', treatmentDate: change.treatmentDate});
    }

    var sorted = _.sortBy(events, 'treatmentDate');

    var mostRecent = _.last(sorted);

    return (mostRecent && mostRecent.eventType) || 'Sensor Start';
  }

  // @ts-expect-error TS(2339) FIXME: Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
  sage.findLatestTimeChange = function findLatestTimeChange(sbx: any) {

    var returnValue = {
      'Sensor Start': {
        found: false
      }
      , 'Sensor Change': {
        found: false
      }
    };

    var prevDate = {
      'Sensor Start': 0
      , 'Sensor Change': 0
    };

    _.each(sbx.data.sensorTreatments, function eachTreatment (treatment: any) {
      ['Sensor Start', 'Sensor Change'].forEach( function eachEvent(event) {
        var treatmentDate = treatment.mills;
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (treatment.eventType === event && treatmentDate > prevDate[event] && treatmentDate <= sbx.time) {

          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          prevDate[event] = treatmentDate;

          var a = moment(sbx.time);
          var b = moment(treatmentDate);
          var days = a.diff(b,'days');
          var hours = a.diff(b,'hours') - days * 24;
          var age = a.diff(b,'hours');

          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          var eventValue = returnValue[event];
          if (!eventValue.found || (age >= 0 && age < eventValue.age)) {
            eventValue.found = true;
            eventValue.treatmentDate = treatmentDate;
            eventValue.age = age;
            eventValue.days = days;
            eventValue.hours = hours;
            eventValue.notes = treatment.notes;
            eventValue.minFractions = a.diff(b,'minutes') - age * 60;

            eventValue.display = '';
            if (eventValue.age >= 24) {
              eventValue.display += eventValue.days + 'd';
            }
            eventValue.display += eventValue.hours + 'h';

            eventValue.displayLong = '';
            if (eventValue.age >= 24) {
              eventValue.displayLong += eventValue.days + ' ' + translate('days');
            }
            if (eventValue.displayLong.length > 0) {
              eventValue.displayLong += ' ';
            }
            eventValue.displayLong += eventValue.hours + ' ' + translate('hours');
          }
        }
      });
    });

    if (returnValue['Sensor Change'].found && returnValue['Sensor Start'].found &&
        // @ts-expect-error TS(2339) FIXME: Property 'treatmentDate' does not exist on type '{... Remove this comment to see the full error message
        returnValue['Sensor Change'].treatmentDate >= returnValue['Sensor Start'].treatmentDate) {
      returnValue['Sensor Start'].found = false;
    }

    // @ts-expect-error TS(2339) FIXME: Property 'min' does not exist on type '{ 'Sensor S... Remove this comment to see the full error message
    returnValue.min = minButValid(returnValue);

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var sensorInfo = returnValue[returnValue.min];
    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = sage.getPrefs(sbx);

    var sendNotification = false;
    var sound = 'incoming';
    var message;

    sensorInfo.level = levels.NONE;

    if (sensorInfo.age >= prefs.urgent) {
      sendNotification = sensorInfo.age === prefs.urgent;
      message = translate('Sensor change/restart overdue!');
      sound = 'persistent';
      sensorInfo.level = levels.URGENT;
    } else if (sensorInfo.age >= prefs.warn) {
      sendNotification = sensorInfo.age === prefs.warn;
      message = translate('Time to change/restart sensor');
      sensorInfo.level = levels.WARN;
    } else if (sensorInfo.age >= prefs.info) {
      sendNotification = sensorInfo.age === prefs.info;
      message = translate('Change/restart sensor soon');
      sensorInfo.level = levels.INFO;
    }

    //allow for 20 minute period after a full hour during which we'll alert the user
    if (prefs.enableAlerts && sendNotification && sensorInfo.minFractions <= 20) {
      sensorInfo.notification = {
        title: translate('Sensor age %1 days %2 hours', { params: [sensorInfo.days, sensorInfo.hours] })
        , message: message
        , pushoverSound: sound
        , level: sensorInfo.level
        , group: 'SAGE'
      };
    }

    return returnValue;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  sage.updateVisualisation = function updateVisualisation (sbx: any) {

    var latest = sbx.properties.sage;
    var sensorInfo = latest[latest.min];
    var info: any = [];

    ['Sensor Change', 'Sensor Start'].forEach( function eachEvent(event) {
      if (latest[event].found) {
        var label = event === 'Sensor Change' ? 'Sensor Insert' : event;
        info.push( { label: translate(label), value: new Date(latest[event].treatmentDate).toLocaleString() } );
        info.push( { label: translate('Duration'), value: latest[event].displayLong } );
        if (!_.isEmpty(latest[event].notes)) {
          info.push({label: translate('Notes'), value: latest[event].notes});
        }
        if (!_.isEmpty(latest[event].transmitterId)) {
          info.push({label: translate('Transmitter ID'), value: latest[event].transmitterId});
        }
        if (!_.isEmpty(latest[event].sensorCode)) {
          info.push({label: translate('Sensor Code'), value: latest[event].sensorCode});
        }
      }
    });

    var statusClass = null;
    if (sensorInfo.level === levels.URGENT) {
      statusClass = 'urgent';
    } else if (sensorInfo.level === levels.WARN) {
      statusClass = 'warn';
    }

    sbx.pluginBase.updatePillText(sage, {
      value: sensorInfo.display
      , label: translate('SAGE')
      , info: info
      , pillClass: statusClass
    });
  };

  return sage;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

