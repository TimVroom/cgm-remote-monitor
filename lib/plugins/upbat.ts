'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var times = require('../times');

function init(ctx: any) {
  var translate = ctx.language.translate;

  var upbat = {
    name: 'upbat'
    , label: 'Uploader Battery'
    , pluginType: 'pill-status'
    , pillFlip: true
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  upbat.getPrefs = function getPrefs(sbx: any) {
    return {
      warn: sbx.extendedSettings.warn ? sbx.extendedSettings.warn : 30
      , urgent: sbx.extendedSettings.urgent ? sbx.extendedSettings.urgent : 20
      , enableAlerts: sbx.extendedSettings.enableAlerts
    };
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  upbat.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('upbat', function setUpbat2 ( ) {
      // @ts-expect-error TS(2339) FIXME: Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
      return upbat.analyzeData(sbx);
    });
  };

  function byBattery (status: any) {
    return status.uploader.battery;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
  upbat.analyzeData = function analyzeData (sbx: any) {

    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = upbat.getPrefs(sbx);

    var recentMins = 30;
    var recentMills = sbx.time - times.mins(recentMins).msecs;

    var recentData = _.filter(sbx.data.devicestatus, function eachStatus (status: any) {
      return ('uploader' in status) && sbx.entryMills(status) <= sbx.time && sbx.entryMills(status) >= recentMills;
    });

    var result = {
      level: undefined
      , display: '?%'
      , status: undefined
      , devices: {}
    };

    function getDevice (status: any) {
      var uri = status.device || 'uploader';
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      var device = result.devices[uri];

      if (!device) {
        device = {
          //TODO: regex to look for any uri schemes, such as: xdrip://phone
          name: uri.indexOf('openaps://') === 0 ? uri.substring('openaps://'.length) : uri
          , uri: uri
          , statuses: [ ]
        };

        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result.devices[uri] = device;
      }
      return device;
    }

    function analyzeStatus (status: any) {

      var uploaderStatus = status.uploader;

      var battery = uploaderStatus.battery;
      var voltage = uploaderStatus.batteryVoltage;
      var charging = status.isCharging ? status.isCharging : false;
      var voltageDisplay;

      if (voltage) {
        if (voltage > 1000) {
          voltage = voltage / 1000;
        }
        voltageDisplay = voltage.toFixed(3) + 'v';
      }

      if (battery || voltage) {
        uploaderStatus.value = battery || voltage;

        if (battery) {
          uploaderStatus.battery = battery;
        }

        if (voltage) {
          uploaderStatus.voltage = voltage;
          uploaderStatus.voltageDisplay = voltageDisplay;
        }

        uploaderStatus.display = (battery ? battery + '%' : voltageDisplay) + (charging ? "⚡" : "");

        if (battery >= 95) {
          uploaderStatus.level = 100;
        } else if (battery < 95 && battery >= 55) {
          uploaderStatus.level = 75;
        } else if (battery < 55 && battery >= 30) {
          uploaderStatus.level = 50;
        } else {
          uploaderStatus.level = 25;
        }

        if (battery <= prefs.warn && battery > prefs.urgent) {
          uploaderStatus.notification = ctx.levels.WARN;
        } else if (battery <= prefs.urgent) {
          uploaderStatus.notification = ctx.levels.URGENT;
        }

      }
    }

    _.forEach(recentData, function eachRecentStatus (status: any) {
      analyzeStatus(status);
      var device = getDevice(status);
      device.statuses.push(_.pick(status, ['uploader', 'created_at', 'mills', '_id']));
    });

    var recentLowests: any = [ ];
    _.forEach(result.devices, function eachDevice (device: any) {
      device.statuses = _.sortBy(device.statuses, function (status: any) {
        return sbx.entryMills(status);
      }).reverse();
      var first = _.first(device.statuses);
      var recent = sbx.entryMills(first) - times.mins(10).msecs;
      var recentLowest = _.chain(device.statuses)
        .filter(function isRecent (status: any) {
          return sbx.entryMills(status) > recent;
        })
        .minBy(byBattery)
        .value();

      device.min = recentLowest.uploader;
      recentLowests.push(recentLowest);
    });

    var min = _.minBy(recentLowests, byBattery);

    if (min && min.uploader) {
      result.level = min.uploader.level;
      result.display = min.uploader.display;
      result.status = ctx.levels.toStatusClass(min.uploader.notification);
      // @ts-expect-error TS(2339) FIXME: Property 'min' does not exist on type '{ level: un... Remove this comment to see the full error message
      result.min = min.uploader;
    }

    return result;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  upbat.checkNotifications = function checkNotifications(sbx: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = upbat.getPrefs(sbx);

    var prop = sbx.properties.upbat;
    if (!prop || !prefs.enableAlerts) { return; }

    if (prop.min && prop.min.notification && prop.min.notification >= ctx.levels.WARN) {
      var message = _.map(_.values(prop.devices), function toMessage (device: any) {
        var info = [
          device.name
          , device.min.display
        ];

        if (device.min && device.min.battery && device.min.voltageDisplay) {
          info.push('(' + device.min.voltageDisplay + ')');
        }

        return info.join(' ');
      }).join('; ');

      sbx.notifications.requestNotify({
        level: prop.min.notification
        , title: ctx.levels.toDisplay(prop.min.notification) + ' Uploader Battery is Low'
        , message: message
        , pushoverSound: 'echo'
        , group: 'Uploader Battery'
        , plugin: upbat
        , debug: prop
      });
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  upbat.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.upbat;

    var infos = null;

    if (_.values(prop.devices).length > 1) {
      infos = _.map(_.values(prop.devices), function toInfo (device: any) {
        var info = {
          label: device.name
          , value: device.min.display
        };

        if (device.min && device.min.battery && device.min.voltageDisplay) {
          info.value += ' (' + device.min.voltageDisplay + ')';
        }

        if (device.min && device.min.temperature) {
          info.value += ' ' + device.min.temperature;
        }
        return info;
      });
    } else {
      if (prop.min && prop.min.battery && prop.min.voltageDisplay) {
        infos = [{label: 'Voltage', value: prop.min.voltageDisplay}];
      }
      if (prop.min && prop.min.temperature) {
        // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
        infos.push({label: 'Temp', value : prop.min.temperature});
      }
    }

    sbx.pluginBase.updatePillText(upbat, {
      value: prop && prop.display
      , labelClass: prop && prop.level && 'icon-battery-' + prop.level
      , pillClass: prop && prop.status
      , info: infos
      , hide: !(prop && prop.min && prop.min.value && prop.min.value >= 0)
    });
  };

  function virtAsstUploaderBatteryHandler (next: any, slots: any, sbx: any) {
    var upBat = _.get(sbx, 'properties.upbat.display');
    if (upBat) {
      var response = translate('virtAsstUploaderBattery', {
        params: [
          upBat
        ]
      });
      next(translate('virtAsstTitleUploaderBattery'), response);
    } else {
      next(translate('virtAsstTitleUploaderBattery'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  upbat.virtAsst = {
    intentHandlers: [
      {
        // for backwards compatibility
        intent: 'UploaderBattery'
        , intentHandler: virtAsstUploaderBatteryHandler
      }
      , {
        intent: 'MetricNow'
        , metrics: ['uploader battery']
        , intentHandler: virtAsstUploaderBatteryHandler
      }
    ]
  };

  return upbat;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
