'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

// var ALL_STATUS_FIELDS = ['status-symbol', 'status-label', 'iob', 'freq', 'rssi']; Unused variable

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (ctx: any) {
  var moment = ctx.moment;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var utils = require('../utils')(ctx);
  var translate = ctx.language.translate;
  var levels = ctx.levels;

  var loop = {
    name: 'loop'
    , label: 'Loop'
    , pluginType: 'pill-status'
  };

  var firstPrefs = true;

  // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  loop.getPrefs = function getPrefs (sbx: any) {

    var prefs = {
      warn: sbx.extendedSettings.warn ? sbx.extendedSettings.warn : 30
      , urgent: sbx.extendedSettings.urgent ? sbx.extendedSettings.urgent : 60
      , enableAlerts: sbx.extendedSettings.enableAlerts
    };

    if (firstPrefs) {
      firstPrefs = false;
      console.info(' Prefs:', prefs);
    }

    return prefs;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  loop.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('loop', function setLoop () {
      // @ts-expect-error TS(2339) FIXME: Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
      return loop.analyzeData(sbx);
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
  loop.analyzeData = function analyzeData (sbx: any) {
    var recentHours = 6;
    var recentMills = sbx.time - times.hours(recentHours).msecs;

    var recentData = _.chain(sbx.data.devicestatus)
      .filter(function(status: any) {
        return ('loop' in status) && sbx.entryMills(status) <= sbx.time && sbx.entryMills(status) >= recentMills;
      }).value();

    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = loop.getPrefs(sbx);
    var recent = moment(sbx.time).subtract(prefs.warn / 2, 'minutes');

    function getDisplayForStatus (status: any) {

      var desc = {
        symbol: '⚠'
        , code: 'warning'
        , label: 'Warning'
      };

      if (!status) {
        return desc;
      }

      if (status.failureReason || (status.enacted && !status.enacted.received)) {
        desc.symbol = 'x';
        desc.code = 'error';
        desc.label = 'Error';
      } else if (status.enacted && moment(status.timestamp).isAfter(recent)) {
        desc.symbol = '⌁';
        desc.code = 'enacted';
        desc.label = 'Enacted';
      } else if (status.recommendedTempBasal && moment(status.recommendedTempBasal.timestamp).isAfter(recent)) {
        desc.symbol = '⏀';
        desc.code = 'recommendation';
        desc.label = 'Recomendation';
      } else if (status.moment && status.moment.isAfter(recent)) {
        desc.symbol = '↻';
        desc.code = 'looping';
        desc.label = 'Looping';
      }
      return desc;
    }

    var result = {
      lastLoop: null
      , lastEnacted: null
      , lastPredicted: null
      , lastOkMoment: null
    };

    function assignLastEnacted (loopStatus: any) {
      var enacted = loopStatus.enacted;
      if (enacted && enacted.timestamp) {
        enacted.moment = moment(enacted.timestamp);
        // @ts-expect-error TS(2339) FIXME: Property 'moment' does not exist on type 'never'.
        if (!result.lastEnacted || enacted.moment.isAfter(result.lastEnacted.moment)) {
          result.lastEnacted = enacted;
        }
      }
    }

    function assignLastPredicted (loopStatus: any) {
      if (loopStatus.predicted && loopStatus.predicted.startDate) {
        result.lastPredicted = loopStatus.predicted;
      }
    }

    function assignLastLoop (loopStatus: any) {
      // @ts-expect-error TS(2339) FIXME: Property 'moment' does not exist on type 'never'.
      if (!result.lastLoop || loopStatus.moment.isAfter(result.lastLoop.moment)) {
        result.lastLoop = loopStatus;
      }
    }

    function assignLastOverride (status: any) {
      var override = status.override;
      if (override && override.timestamp) {
        override.moment = moment(override.timestamp);
        // @ts-expect-error TS(2339) FIXME: Property 'lastOverride' does not exist on type '{ ... Remove this comment to see the full error message
        if (!result.lastOverride || override.moment.isAfter(result.lastOverride.moment)) {
          // @ts-expect-error TS(2339) FIXME: Property 'lastOverride' does not exist on type '{ ... Remove this comment to see the full error message
          result.lastOverride = override;
        }
      }
    }

    function assignLastOkMoment (loopStatus: any) {
      if (!loopStatus.failureReason && (!result.lastOkMoment || loopStatus.moment.isAfter(result.lastOkMoment))) {
        result.lastOkMoment = loopStatus.moment;
      }
    }

    _.forEach(recentData, function eachStatus (status: any) {
      if (status && status.loop && status.loop.timestamp) {
        var loopStatus = status.loop;
        loopStatus.moment = moment(loopStatus.timestamp);
        assignLastEnacted(loopStatus);
        assignLastLoop(loopStatus);
        assignLastPredicted(loopStatus);
        assignLastOverride(status);
        assignLastOkMoment(loopStatus);
      }
    });

    // @ts-expect-error TS(2339) FIXME: Property 'display' does not exist on type '{ lastL... Remove this comment to see the full error message
    result.display = getDisplayForStatus(result.lastLoop);

    return result;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  loop.checkNotifications = function checkNotifications (sbx: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = loop.getPrefs(sbx);

    if (!prefs.enableAlerts) { return; }

    var prop = sbx.properties.loop;

    if (!prop.lastLoop) {
      console.info('Loop hasn\'t reported a loop yet');
      return;
    }

    var now = moment();
    var level = statusLevel(prop, prefs, sbx);
    if (level >= levels.WARN) {
      sbx.notifications.requestNotify({
        level: level
        , title: 'Loop isn\'t looping'
        , message: 'Last Loop: ' + utils.formatAgo(prop.lastOkMoment, now.valueOf())
        , pushoverSound: 'echo'
        , group: 'Loop'
        , plugin: loop
        , debug: prop
      });
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getEventTypes' does not exist on type '{... Remove this comment to see the full error message
  loop.getEventTypes = function getEventTypes (sbx: any) {

    var units = sbx.settings.units;
    console.log('units', units);

    var reasonconf = [];

    if (sbx.data === undefined || sbx.data.profile === undefined || sbx.data.profile.data.length == 0) {
      return [];
    }

    let profile = sbx.data.profile.data[0];

    if (profile.loopSettings === undefined || profile.loopSettings.overridePresets == undefined) {
      return [];
    }

    let presets = profile.loopSettings.overridePresets;

    for (var i = 0; i < presets.length; i++) {
      let preset = presets[i]
      reasonconf.push({ name: preset.name, displayName: preset.symbol + " " + preset.name, duration: preset.duration / 60});
    }

    var postLoopNotification = function (client: any, data: any, callback: any) {

      $.ajax({
        method: "POST"
        , headers: client.headers()
        , url: '/api/v2/notifications/loop'
        , data: data
      })
      .done(function () {
        callback();
      })
      .fail(function (jqXHR: any) {
        callback(jqXHR.responseText);
      });
    }

   // TODO: add OTP entry

    return [
      {
        val: 'Temporary Override'
        , name: 'Temporary Override'
        , bg: false
        , insulin: false
        , carbs: false
        , prebolus: false
        , duration: true
        , percent: false
        , absolute: false
        , profile: false
        , split: false
        , targets: false
        , reasons: reasonconf
        , submitHook: postLoopNotification
      },
      {
        val: 'Temporary Override Cancel'
        , name: 'Temporary Override Cancel'
        , bg: false
        , insulin: false
        , carbs: false
        , prebolus: false
        , duration: false
        , percent: false
        , absolute: false
        , profile: false
        , split: false
        , targets: false
        , submitHook: postLoopNotification
      },
      {
        val: 'Remote Carbs Entry'
        , name: 'Remote Carbs Entry'
        , remoteCarbs: true
        , remoteAbsorption: true
        , otp: true
        , submitHook: postLoopNotification
      },
      {
        val: 'Remote Bolus Entry'
        , name: 'Remote Bolus Entry'
        , remoteBolus: true
        , otp: true
        , submitHook: postLoopNotification
      }
    ];
  };

  // TODO: Add event listener to customize labels


  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  loop.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.loop;

    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = loop.getPrefs(sbx);

    function valueString (prefix: any, value: any) {
      return (value != null) ? prefix + value : '';
    }

    var events = [];

    function addRecommendedTempBasal () {
      if (prop.lastLoop && prop.lastLoop.recommendedTempBasal) {

        var recommendedTempBasal = prop.lastLoop.recommendedTempBasal;

        var valueParts = [
          'Suggested Temp: ' + recommendedTempBasal.rate + 'U/hour for ' +
          recommendedTempBasal.duration + 'm'
        ];

        valueParts = concatIOB(valueParts);
        valueParts = concatCOB(valueParts);
        valueParts = concatEventualBG(valueParts);
        valueParts = concatRecommendedBolus(valueParts);

        events.push({
          time: moment(recommendedTempBasal.timestamp)
          , value: valueParts.join('')
        });
      }
    }

    function addRSSI () {

      var mostRecent = "";
      var pumpRSSI = "";
      var bleRSSI = "";
      var reportRSSI = "";

      _.forEach(sbx.data.devicestatus, function(entry: any) {

        if (entry.radioAdapter) {
          var entryMoment = moment(entry.created_at);

          if (mostRecent == "") {
            mostRecent = entryMoment;
            if (entry.radioAdapter.pumpRSSI) {
              pumpRSSI = entry.radioAdapter.pumpRSSI;
            }
            if (entry.radioAdapter.RSSI) {
              bleRSSI = entry.radioAdapter.RSSI;
            }
          }

          if (mostRecent < entryMoment) {
            mostRecent = entryMoment;
            if (entry.radioAdapter.pumpRSSI) {
              pumpRSSI = entry.radioAdapter.pumpRSSI;
            }
            if (entry.radioAdapter.RSSI) {
              bleRSSI = entry.radioAdapter.RSSI;
            }
          }
        }
      });

      if (bleRSSI != "") {
        reportRSSI = "BLE RSSI: " + bleRSSI + " ";
      }

      if (pumpRSSI != "") {
        reportRSSI = reportRSSI + "Pump RSSI: " + pumpRSSI;
      }

      if (reportRSSI != "") {
        events.push({
          time: mostRecent
          , value: reportRSSI
        });
      }

    }

    function addLastEnacted () {
      if (prop.lastEnacted) {
        var valueParts = []

        if (prop.lastEnacted.bolusVolume) {
          valueParts.push('<b>Automatic Bolus</b>')
          valueParts.push(' ' + prop.lastEnacted.bolusVolume + 'U')
          if (prop.lastEnacted.rate === 0 && prop.lastEnacted.duration === 0) {
            valueParts.push(' (Temp Basal Canceled)')
          }
        } else if (prop.lastEnacted.rate === 0 && prop.lastEnacted.duration === 0) {
          valueParts.push('<b>Temp Basal Canceled</b>')
        } else if (prop.lastEnacted.rate != null) {
          valueParts.push('<b>Temp Basal Started</b>')
          valueParts.push(' ' + prop.lastEnacted.rate.toFixed(2) + 'U/hour for ' + prop.lastEnacted.duration + 'm')
        }
        valueParts.push(valueString(', ', prop.lastEnacted.reason))

        valueParts = concatIOB(valueParts);
        valueParts = concatCOB(valueParts);
        valueParts = concatEventualBG(valueParts);
        valueParts = concatRecommendedBolus(valueParts);

        events.push({
          time: prop.lastEnacted.moment
          , value: valueParts.join('')
        });
      }
    }

    function concatIOB (valueParts: any) {
      if (prop.lastLoop && prop.lastLoop.iob) {
        var iob = prop.lastLoop.iob;
        valueParts = valueParts.concat([
          ', IOB: '

          , sbx.roundInsulinForDisplayFormat(iob.iob) + 'U'

          , iob.basaliob ? ', Basal IOB ' + sbx.roundInsulinForDisplayFormat(iob.basaliob) + 'U' : ''
        ]);
      }

      return valueParts;
    }

    function concatCOB (valueParts: any) {
      if (prop.lastLoop && prop.lastLoop.cob) {
        var cob = prop.lastLoop.cob.cob;
        cob = Math.round(cob);
        valueParts = valueParts.concat([
          ', COB: '
          , cob + 'g'
        ]);
      }

      return valueParts;
    }

    function concatEventualBG (valueParts: any) {
      if (prop.lastLoop && prop.lastLoop.predicted) {
        var predictedBGvalues = prop.lastLoop.predicted.values;
        var eventualBG = predictedBGvalues[predictedBGvalues.length - 1];
        var maxBG = Math.max.apply(null, predictedBGvalues);
        var minBG = Math.min.apply(null, predictedBGvalues);
        var eventualBGscaled = sbx.settings.units === 'mmol' ?
          sbx.roundBGToDisplayFormat(sbx.scaleMgdl(eventualBG)) : eventualBG;
        var maxBGscaled = sbx.settings.units === 'mmol' ?
          sbx.roundBGToDisplayFormat(sbx.scaleMgdl(maxBG)) : maxBG;
        var minBGscaled = sbx.settings.units === 'mmol' ?
          sbx.roundBGToDisplayFormat(sbx.scaleMgdl(minBG)) : minBG;

        valueParts = valueParts.concat([
          ', Predicted Min-Max BG: '
          , minBGscaled
          , '-'
          , maxBGscaled
          , ', Eventual BG: '
          , eventualBGscaled
        ]);
      }

      return valueParts;
    }

    function concatRecommendedBolus (valueParts: any) {
      if (prop.lastLoop && prop.lastLoop.recommendedBolus) {
        var recommendedBolus = prop.lastLoop.recommendedBolus;
        valueParts = valueParts.concat([
          ', Recommended Bolus: '
          , recommendedBolus + 'U'
        ]);
      }

      return valueParts;
    }

    function getForecastPoints () {
      var points: any = [];

      function toPoints (startTime: any, offset: any) {
        return function toPoint (value: any, index: any) {
          return {
            mgdl: value
            , color: '#ff00ff'
            , mills: startTime.valueOf() + times.mins(5 * index).msecs + offset
            , noFade: true
          };
        };
      }

      if (prop.lastPredicted) {
        var predicted = prop.lastPredicted;
        var startTime = moment(predicted.startDate);
        if (predicted.values) {
          points = points.concat(_.map(predicted.values, toPoints(startTime, 0)));
        }
      }

      return points;
    }

    if ('error' === prop.display.code) {
      events.push({
        time: prop.lastLoop.moment
        , value: valueString('Error: ', prop.lastLoop.failureReason)
      });
      addRecommendedTempBasal();
    } else if ('enacted' === prop.display.code) {
      addLastEnacted();
    } else if ('looping' === prop.display.code) {
      addLastEnacted();
    } else {
      addRecommendedTempBasal();
    }

    addRSSI();

    var sorted = _.sortBy(events, function toMill (event: any) {
      return event.time.valueOf();
    }).reverse();

    var info = _.map(sorted, function eventToInfo (event: any) {
      return {
        label: utils.timeAt(false, sbx) + utils.timeFormat(event.time, sbx)
        , value: event.value
      };
    });

    var loopName = 'Loop';

    if (prop.lastLoop && prop.lastLoop.name) {
      loopName = prop.lastLoop.name;
    }

    var eventualBGValue = '';
    if (prop.lastLoop && prop.lastLoop.predicted) {
      var predictedBGvalues = prop.lastLoop.predicted.values;
      var eventualBG = predictedBGvalues[predictedBGvalues.length - 1];
      if (sbx.settings.units === 'mmol') {
        eventualBG = sbx.roundBGToDisplayFormat(sbx.scaleMgdl(eventualBG));
      }
      eventualBGValue = ' ↝ ' + eventualBG;
    }

    var label = loopName + ' ' + prop.display.symbol;

    var lastLoopValue = prop.lastLoop ?
      utils.timeFormat(prop.lastLoop.moment, sbx) + eventualBGValue : null;

    sbx.pluginBase.updatePillText(loop, {
      value: lastLoopValue
      , label: label
      , info: info
      , pillClass: statusClass(prop, prefs, sbx)
    });

    var forecastPoints = getForecastPoints();
    if (forecastPoints && forecastPoints.length > 0) {
      sbx.pluginBase.addForecastPoints(forecastPoints, { type: 'loop', label: 'Loop Forecasts' });
    }
  };

  function virtAsstForecastHandler (next: any, slots: any, sbx: any) {
    var predicted = _.get(sbx, 'properties.loop.lastLoop.predicted');
    if (predicted) {
      var forecast = predicted.values;
      var max = forecast[0];
      var min = forecast[0];
      var maxForecastIndex = Math.min(6, forecast.length);

      var startPrediction = moment(predicted.startDate);
      var endPrediction = startPrediction.clone().add(maxForecastIndex * 5, 'minutes');
      if (endPrediction.valueOf() < sbx.time) {
        next(translate('virtAsstTitleLoopForecast'), translate('virtAsstForecastUnavailable'));
      } else {
        for (var i = 1, len = forecast.slice(0, maxForecastIndex).length; i < len; i++) {
          if (forecast[i] > max) {
            max = forecast[i];
          }
          if (forecast[i] < min) {
            min = forecast[i];
          }
        }
        var response = '';
        if (min === max) {
          response = translate('virtAsstLoopForecastAround', {
            params: [
              max
              , moment(endPrediction).from(moment(sbx.time))
            ]
          });
        } else {
          response = translate('virtAsstLoopForecastBetween', {
            params: [
              min
              , max
              , moment(endPrediction).from(moment(sbx.time))
            ]
          });
        }
        next(translate('virtAsstTitleLoopForecast'), response);
      }
    } else {
      next(translate('virtAsstTitleLoopForecast'), translate('virtAsstUnknown'));
    }
  }

  function virtAsstLastLoopHandler (next: any, slots: any, sbx: any) {
    var lastLoop = _.get(sbx, 'properties.loop.lastLoop')
    if (lastLoop) {
      console.log(JSON.stringify(lastLoop));
      var response = translate('virtAsstLastLoop', {
        params: [
          moment(sbx.properties.loop.lastOkMoment).from(moment(sbx.time))
        ]
      });
      next(translate('virtAsstTitleLastLoop'), response);
    } else {
      next(translate('virtAsstTitleLastLoop'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  loop.virtAsst = {
    intentHandlers: [{
      intent: 'MetricNow'
      , metrics: ['loop forecast', 'forecast']
      , intentHandler: virtAsstForecastHandler
    }, {
      intent: 'LastLoop'
      , intentHandler: virtAsstLastLoopHandler
    }]
  };

  function statusClass (prop: any, prefs: any, sbx: any) {
    var level = statusLevel(prop, prefs, sbx);
    var cls = 'current';

    if (level === levels.WARN) {
      cls = 'warn';
    } else if (level === levels.URGENT) {
      cls = 'urgent';
    }

    return cls;
  }

  function statusLevel (prop: any, prefs: any, sbx: any) {
    var level = levels.NONE;
    var now = moment(sbx.time);

    if (prop.lastOkMoment) {
      var urgentTime = prop.lastOkMoment.clone().add(prefs.urgent, 'minutes');
      var warningTime = prop.lastOkMoment.clone().add(prefs.warn, 'minutes');

      if (urgentTime.isBefore(now)) {
        level = levels.URGENT;
      } else if (warningTime.isBefore(now)) {
        level = levels.WARN;
      }
    }

    return level;
  }

  return loop;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
