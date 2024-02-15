'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var times = require('../times');

function init(ctx: any) {
  var moment = ctx.moment;
  var levels = ctx.levels;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var utils = require('../utils')(ctx);
  var firstPrefs = true;
  var lastStateNotification: any = null;
  var translate = ctx.language.translate;

  var sensorState = {
    name: 'xdripjs'
    , label: 'CGM Status'
    , pluginType: 'pill-status'
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  sensorState.getPrefs = function getPrefs(sbx: any) {
    var prefs = {
      enableAlerts: sbx.extendedSettings.enableAlerts || false
      , warnBatV: sbx.extendedSettings.warnBatV || 300
      , stateNotifyIntrvl: sbx.extendedSettings.stateNotifyIntrvl || 0.5
    };

    if (firstPrefs) {
      firstPrefs = false;
      console.info('xdripjs Prefs:', prefs);
    }

    return prefs;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  sensorState.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('sensorState', function setProp ( ) {
      // @ts-expect-error TS(2339) FIXME: Property 'getStateString' does not exist on type '... Remove this comment to see the full error message
      return sensorState.getStateString(sbx);
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  sensorState.checkNotifications = function checkNotifications(sbx: any) {

    var info = sbx.properties.sensorState;

    if (info && info.notification) {
      var notification = _.extend({}, info.notification, {
        plugin: sensorState
        , debug: {
          stateString: info.lastStateString
        }
      });

      sbx.notifications.requestNotify(notification);
    }

  };

  // @ts-expect-error TS(2339) FIXME: Property 'getStateString' does not exist on type '... Remove this comment to see the full error message
  sensorState.getStateString = function findLatestState(sbx: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = sensorState.getPrefs(sbx);

    var recentHours = 24; 
    var recentMills = sbx.time - times.hours(recentHours).msecs;

    var result = {
      seenDevices: { }
      , latest: null
      , lastDevice: null
      , lastState: null
      , lastStateString: null
      , lastStateStringShort: null
      , lastSessionStart: null
      , lastStateTime: null
      , lastTxId: null
      , lastTxStatus: null
      , lastTxStatusString: null
      , lastTxStatusStringShort: null
      , lastTxActivation: null
      , lastMode: null
      , lastRssi: null
      , lastUnfiltered: null
      , lastFiltered: null
      , lastNoise: null
      , lastNoiseString: null
      , lastSlope: null
      , lastIntercept: null
      , lastCalType: null
      , lastCalibrationDate: null
      , lastBatteryTimestamp: null
      , lastVoltageA: null
      , lastVoltageB: null
      , lastTemperature: null
      , lastResistance: null
    };

    function toMoments (status: any) {
      return {
        when:  moment(status.mills)
        , timestamp: status.xdripjs && status.xdripjs.timestamp && moment(status.xdripjs.timestamp)
      };
    }

    function getDevice(status: any) {
      var uri = status.device || 'device';
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      var device = result.seenDevices[uri];

      if (!device) {
        device = {
          name: utils.deviceName(uri)
          , uri: uri
        };

        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result.seenDevices[uri] = device;
      }
      return device;
    }

    var recentData = _.chain(sbx.data.devicestatus)
      .filter(function (status: any) {
        return ('xdripjs' in status) && sbx.entryMills(status) <= sbx.time && sbx.entryMills(status) >= recentMills;
      })
      .value( );

    recentData = _.sortBy(recentData, 'xdripjs.timestamp');

    _.forEach(recentData, function eachStatus (status: any) {
      getDevice(status);

      var moments = toMoments(status);

      if (status.xdripjs && (!result.latest || moments.timestamp && moments.timestamp.isAfter(result.lastStateTime))) {
        result.latest = status;
        result.lastStateTime = moment(status.xdripjs.timestamp);
      }
    });

    var sendNotification = false;
    var sound = 'incoming';
    var message;
    var title;

    var sensorInfo = result.latest;

    // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ seenDev... Remove this comment to see the full error message
    result.level = levels.NONE;

    // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
    if (sensorInfo && sensorInfo.xdripjs) {

      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      if (sensorInfo.xdripjs.state != 0x6) {
        // Send warning notification for all states that are not 'OK'
        // but only send state notifications at interval preference
        // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
        if (!lastStateNotification || (lastStateNotification.state != sensorInfo.xdripjs.state) || !prefs.stateNotifyIntrvl || (moment().diff(lastStateNotification.timestamp, 'minutes') > (prefs.stateNotifyIntrvl*60))) {
          sendNotification = true;
          lastStateNotification = {
            timestamp: moment()
            // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
            , state: sensorInfo.xdripjs.state
          };
        }

        // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
        message = 'CGM Transmitter state: ' + sensorInfo.xdripjs.stateString;
        // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
        title = 'CGM Transmitter state: ' + sensorInfo.xdripjs.stateString;

        // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
        if (sensorInfo.xdripjs.state == 0x7) {
          // If it is a calibration request, only use INFO
          // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ seenDev... Remove this comment to see the full error message
          result.level = levels.INFO;
        } else {
          // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ seenDev... Remove this comment to see the full error message
          result.level = levels.WARN;
        }
      }

      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      if (sensorInfo.xdripjs.voltagea && (sensorInfo.xdripjs.voltagea < prefs.warnBatV)) {
        sendNotification = true;
        // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
        message = 'CGM Transmitter Battery A Low Voltage: ' + sensorInfo.xdripjs.voltagea;
        title = 'CGM Transmitter Battery Low';
        // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ seenDev... Remove this comment to see the full error message
        result.level = levels.WARN;
      }

      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      if (sensorInfo.xdripjs.voltageb && (sensorInfo.xdripjs.voltageb < (prefs.warnBatV - 10))) {
        sendNotification = true;
        // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
        message = 'CGM Transmitter Battery B Low Voltage: ' + sensorInfo.xdripjs.voltageb;
        title = 'CGM Transmitter Battery Low';
        // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ seenDev... Remove this comment to see the full error message
        result.level = levels.WARN;
      }

      if (prefs.enableAlerts && sendNotification) {
        // @ts-expect-error TS(2339) FIXME: Property 'notification' does not exist on type '{ ... Remove this comment to see the full error message
        result.notification = {
          title: title
          , message: message
          , pushoverSound: sound
          // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ seenDev... Remove this comment to see the full error message
          , level: result.level
          , group: 'xDrip-js'
        };
      }

      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastState = sensorInfo.xdripjs.state;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastStateString = sensorInfo.xdripjs.stateString;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastStateStringShort = sensorInfo.xdripjs.stateStringShort;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastSessionStart = sensorInfo.xdripjs.sessionStart;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastTxId = sensorInfo.xdripjs.txId;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastTxStatus = sensorInfo.xdripjs.txStatus;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastTxStatusString = sensorInfo.xdripjs.txStatusString;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastTxStatusStringShort = sensorInfo.xdripjs.txStatusStringShort;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastTxActivation = sensorInfo.xdripjs.txActivation;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastMode = sensorInfo.xdripjs.mode;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastRssi = sensorInfo.xdripjs.rssi;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastUnfiltered = sensorInfo.xdripjs.unfiltered;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastFiltered = sensorInfo.xdripjs.filtered;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastNoise = sensorInfo.xdripjs.noise;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastNoiseString = sensorInfo.xdripjs.noiseString;
      // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'null'.
      result.lastSlope = Math.round(sensorInfo.xdripjs.slope * 100) / 100.0;
      // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'null'.
      result.lastIntercept = Math.round(sensorInfo.xdripjs.intercept * 100) / 100.0;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastCalType = sensorInfo.xdripjs.calType;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastCalibrationDate = sensorInfo.xdripjs.lastCalibrationDate;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastBatteryTimestamp = sensorInfo.xdripjs.batteryTimestamp;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastVoltageA = sensorInfo.xdripjs.voltagea;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastVoltageB = sensorInfo.xdripjs.voltageb;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastTemperature = sensorInfo.xdripjs.temperature;
      // @ts-expect-error TS(2339) FIXME: Property 'xdripjs' does not exist on type 'never'.
      result.lastResistance = sensorInfo.xdripjs.resistance;
    }

    return result;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  sensorState.updateVisualisation = function updateVisualisation (sbx: any) {

    var sensor = sbx.properties.sensorState;
    var sessionDuration = 'Unknown';
    var info = [];

    _.forIn(sensor.seenDevices, function seenDevice (device: any) {
      info.push( { label: 'Seen: ', value: device.name } );
    });

    info.push( { label: 'State Time: ', value: (sensor && sensor.lastStateTime && moment().diff(sensor.lastStateTime, 'minutes') + ' minutes ago') || 'Unknown' } );
    info.push( { label: 'Mode: ', value: (sensor && sensor.lastMode) || 'Unknown' } );
    info.push( { label: 'Status: ', value: (sensor && sensor.lastStateString) || 'Unknown' } );

    // session start is only valid if in a session
    if (sensor && sensor.lastSessionStart && (sensor.lastState != 0x1)) {
      var diffTime = moment().diff(moment(sensor.lastSessionStart));
      var duration = moment.duration(diffTime);

      sessionDuration = duration.days() + ' days ' + duration.hours() + ' hours';

      info.push( { label: 'Session Age: ', value: sessionDuration } );
    }

    info.push( { label: 'Tx ID: ', value: (sensor && sensor.lastTxId) || 'Unknown' } );
    info.push( { label: 'Tx Status: ', value: (sensor && sensor.lastTxStatusString) || 'Unknown' } );

    if (sensor) {
      if (sensor.lastTxActivation) {
        info.push( { label: 'Tx Age: ', value: moment().diff(moment(sensor.lastTxActivation), 'days') + ' days' } );
      }

      if (sensor.lastRssi) {
        info.push( { label: 'RSSI: ', value: sensor.lastRssi } );
      }

      if (sensor.lastUnfiltered) {
        info.push( { label: 'Unfiltered: ', value: sensor.lastUnfiltered } );
      }

      if (sensor.lastFiltered) {
        info.push( { label: 'Filtered: ', value: sensor.lastFiltered } );
      }

      if (sensor.lastNoiseString) {
        info.push( { label: 'Noise: ', value: sensor.lastNoiseString } );
      }

      if (sensor.lastSlope) {
        info.push( { label: 'Slope: ', value: sensor.lastSlope } );
      }

      if (sensor.lastIntercept) {
        info.push( { label: 'Intercept: ', value: sensor.lastIntercept } );
      }

      if (sensor.lastCalType) {
        info.push( { label: 'CalType: ', value: sensor.lastCalType } );
      }

      if (sensor.lastCalibrationDate) {
        info.push( { label: 'Calibration: ', value: moment().diff(moment(sensor.lastCalibrationDate), 'hours') + ' hours ago' } );
      }

      if (sensor.lastBatteryTimestamp) {
        info.push( { label: 'Battery: ', value: moment().diff(moment(sensor.lastBatteryTimestamp), 'minutes') + ' minutes ago' } );
      }

      if (sensor.lastVoltageA) {
        info.push( { label: 'VoltageA: ', value: sensor.lastVoltageA } );
      }

      if (sensor.lastVoltageB) {
        info.push( { label: 'VoltageB: ', value: sensor.lastVoltageB } );
      }

      if (sensor.lastTemperature) {
        info.push( { label: 'Temperature: ', value: sensor.lastTemperature } );
      }

      if (sensor.lastResistance) {
        info.push( { label: 'Resistance: ', value: sensor.lastResistance } );
      }

      var statusClass = null;
      if (sensor.level === levels.URGENT) {
        statusClass = 'urgent';
      } else if (sensor.level === levels.WARN) {
        statusClass = 'warn';
      } else if (sensor.level === levels.INFO) {
        // Still highlight even the 'INFO' events for now
        statusClass = 'warn';
      }

      sbx.pluginBase.updatePillText(sensorState, {
        value: (sensor && sensor.lastStateStringShort) || (sensor && sensor.lastStateString) || 'Unknown'
        , label: 'CGM'
        , info: info
        , pillClass: statusClass
      });
    }
  };

  function virtAsstGenericCGMHandler(translateItem: any, field: any, next: any, sbx: any) {
    var response;
    var state = _.get(sbx, 'properties.sensorState.'+field);
    if (state) {
      response = translate('virtAsstCGM'+translateItem, {
        params:[
          state
          , moment(sbx.properties.sensorState.lastStateTime).from(moment(sbx.time))
        ]
      });
    } else {
      response = translate('virtAsstUnknown');
    }

    next(translate('virtAsstTitleCGM'+translateItem), response);
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  sensorState.virtAsst = {
    intentHandlers: [
      {
        intent: 'MetricNow'
        , metrics: ['cgm mode']
        , intentHandler: function(next: any, slots: any, sbx: any){virtAsstGenericCGMHandler('Mode', 'lastMode', next, sbx);}
      }
      , {
        intent: 'MetricNow'
        , metrics: ['cgm status']
        , intentHandler: function(next: any, slots: any, sbx: any){virtAsstGenericCGMHandler('Status', 'lastStateString', next, sbx);}
      }
      , {
        intent: 'MetricNow'
        , metrics: ['cgm session age']
        , intentHandler: function(next: any, slots: any, sbx: any){
          var response;
          var lastSessionStart = _.get(sbx, 'properties.sensorState.lastSessionStart');
          // session start is only valid if in a session
          if (lastSessionStart) {
            if (_.get(sbx, 'properties.sensorState.lastState') != 0x1) {
              var duration = moment.duration(moment().diff(moment(lastSessionStart)));
              response = translate('virtAsstCGMSessAge', {
                params: [
                  duration.days(),
                  duration.hours()
                ]
              });
            } else {
              response = translate('virtAsstCGMSessNotStarted');
            }
          } else {
            response = translate('virtAsstUnknown');
          }

          next(translate('virtAsstTitleCGMSessAge'), response);
        }
      }
      , {
        intent: 'MetricNow'
        , metrics: ['cgm tx status']
        , intentHandler: function(next: any, slots: any, sbx: any){virtAsstGenericCGMHandler('TxStatus', 'lastTxStatusString', next, sbx);}
      }
      , {
        intent: 'MetricNow'
        , metrics: ['cgm tx age']
        , intentHandler: function(next: any, slots: any, sbx: any){
          var lastTxActivation = _.get(sbx, 'properties.sensorState.lastTxActivation');
          next(
            translate('virtAsstTitleCGMTxAge'),
            lastTxActivation
              ? translate('virtAsstCGMTxAge', {params:[moment().diff(moment(lastTxActivation), 'days')]})
              : translate('virtAsstUnknown')
          );
        }
      }
      , {
        intent: 'MetricNow'
        , metrics: ['cgm noise']
        , intentHandler: function(next: any, slots: any, sbx: any){virtAsstGenericCGMHandler('Noise', 'lastNoiseString', next, sbx);}
      }
      , {
        intent: 'MetricNow'
        , metrics: ['cgm battery']
        , intentHandler: function(next: any, slots: any, sbx: any){
          var response;
          var lastVoltageA = _.get(sbx, 'properties.sensorState.lastVoltageA');
          var lastVoltageB = _.get(sbx, 'properties.sensorState.lastVoltageB');
          var lastBatteryTimestamp = _.get(sbx, 'properties.sensorState.lastBatteryTimestamp');
          if (lastVoltageA || lastVoltageB) {
            if (lastVoltageA && lastVoltageB) {
              response = translate('virtAsstCGMBattTwo', {
                params:[
                  (lastVoltageA / 100)
                  , (lastVoltageB / 100)
                  , moment(lastBatteryTimestamp).from(moment(sbx.time))
                ]
              });
            } else {
              var finalValue = lastVoltageA ? lastVoltageA : lastVoltageB;
              response = translate('virtAsstCGMBattOne', {
                params:[
                  (finalValue / 100)
                  , moment(lastBatteryTimestamp).from(moment(sbx.time))
                ]
              });
            }
          } else {
            response = translate('virtAsstUnknown');
          }
      
          next(translate('virtAsstTitleCGMBatt'), response);
        }
      }
    ]
  };

  return sensorState;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

