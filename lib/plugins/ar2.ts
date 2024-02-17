'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

var BG_REF = 140; //Central tendency
var BG_MIN = 36; //Not 39, but why?
var BG_MAX = 400;
var WARN_THRESHOLD = 0.05;
var URGENT_THRESHOLD = 0.10;

var AR = [-0.723, 1.716];

//TODO: move this to css
var AR2_COLOR = 'cyan';

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (ctx: any) {
  var translate = ctx.language.translate;
  var moment = ctx.moment;

  var ar2 = {
    name: 'ar2'
    , label: 'AR2'
    , pluginType: 'forecast'
  };

  function buildTitle (prop: any, sbx: any) {
    var rangeLabel = prop.eventName ? sbx.translate(prop.eventName, { ci: true }).toUpperCase() : sbx.translate('Check BG');
    var title = sbx.levels.toDisplay(prop.level) + ', ' + rangeLabel;

    var sgv = sbx.lastScaledSGV();
    if (sgv > sbx.scaleMgdl(sbx.settings.thresholds.bgTargetBottom) && sgv < sbx.scaleMgdl(sbx.settings.thresholds.bgTargetTop)) {
      title += ' ' + sbx.translate('predicted');
    }
    return title;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  ar2.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('ar2', function setAR2 () {

      var prop = {
        // @ts-expect-error TS(2339) FIXME: Property 'forecast' does not exist on type '{ name... Remove this comment to see the full error message
        forecast: ar2.forecast(sbx)
      };

      var result = checkForecast(prop.forecast, sbx);

      if (result) {
        // @ts-expect-error TS(2339) FIXME: Property 'level' does not exist on type '{ forecas... Remove this comment to see the full error message
        prop.level = result.level;
        // @ts-expect-error TS(2339) FIXME: Property 'eventName' does not exist on type '{ for... Remove this comment to see the full error message
        prop.eventName = result.eventName;
      }

      var predicted = prop.forecast && prop.forecast.predicted;
      var scaled = predicted && _.map(predicted, function(p: any) { return sbx.scaleEntry(p) });

      if (scaled && scaled.length >= 3) {
        // @ts-expect-error TS(2339) FIXME: Property 'displayLine' does not exist on type '{ f... Remove this comment to see the full error message
        prop.displayLine = 'BG 15m: ' + scaled[2] + ' ' + sbx.unitsLabel;
      }

      return prop;
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  ar2.checkNotifications = function checkNotifications (sbx: any) {
    if (sbx.time - sbx.lastSGVMills() > times.mins(10).msecs) {
      return;
    }

    var prop = sbx.properties.ar2;

    if (prop && prop.level) {
      const notify = {
        level: prop.level
        , title: buildTitle(prop, sbx)
        , message: sbx.buildDefaultMessage()
        , eventName: prop.eventName
        , pushoverSound: pushoverSound(prop, sbx.levels)
        , plugin: ar2
        , debug: buildDebug(prop, sbx)
      };
      sbx.notifications.requestNotify(notify);
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'forecast' does not exist on type '{ name... Remove this comment to see the full error message
  ar2.forecast = function forecast (sbx: any) {

    var result = {
      predicted: []
      , avgLoss: 0
    };

    if (!okToForecast(sbx)) {
      return result;
    }

    //fold left, each time update the accumulator
    result.predicted = _.reduce(
      new Array(6) //only 6 points are used for calculating avgLoss
      , pushPoint
      , initAR2(sbx)
    ).points;

    // compute current loss
    var size = Math.min(result.predicted.length - 1, 6);
    for (var j = 0; j <= size; j++) {
      // @ts-expect-error TS(2339) FIXME: Property 'mgdl' does not exist on type 'never'.
      result.avgLoss += 1 / size * Math.pow(log10(result.predicted[j].mgdl / 120), 2);
    }

    return result;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  ar2.updateVisualisation = function updateVisualisation (sbx: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'forecastCone' does not exist on type '{ ... Remove this comment to see the full error message
    sbx.pluginBase.addForecastPoints(ar2.forecastCone(sbx), { type: 'ar2', label: 'AR2 Forecast' });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'forecastCone' does not exist on type '{ ... Remove this comment to see the full error message
  ar2.forecastCone = function forecastCone (sbx: any) {

    if (!okToForecast(sbx)) {
      return [];
    }

    var coneFactor = getConeFactor(sbx);

    function pushConePoints (result: any, step: any) {
      var next = incrementAR2(result);

      //offset from points so they are at a unique time
      if (coneFactor > 0) {
        next.points.push(ar2Point(next
          , { offset: 2000, coneFactor: -coneFactor, step: step }
        ));
      }

      next.points.push(ar2Point(next
        , { offset: 4000, coneFactor: coneFactor, step: step }
      ));

      return next;
    }

    //fold left over cone steps, each time update the accumulator
    var result = _.reduce(
      [0.020, 0.041, 0.061, 0.081, 0.099, 0.116, 0.132, 0.146, 0.159, 0.171, 0.182, 0.192, 0.201]
      , pushConePoints
      , initAR2(sbx)
    );

    return result.points;
  };

  function virtAsstAr2Handler (next: any, slots: any, sbx: any) {
    var predicted = _.get(sbx, 'properties.ar2.forecast.predicted');
    if (predicted) {
      var forecast = predicted;
      var max = forecast[0].mgdl;
      var min = forecast[0].mgdl;
      var maxForecastMills = forecast[0].mills;
      for (var i = 1, len = forecast.length; i < len; i++) {
        if (forecast[i].mgdl > max) {
          max = forecast[i].mgdl;
        }
        if (forecast[i].mgdl < min) {
          min = forecast[i].mgdl;
        }
        if (forecast[i].mills > maxForecastMills) {
          maxForecastMills = forecast[i].mills;
        }
      }
      var response = '';
      if (min === max) {
        response = translate('virtAsstAR2ForecastAround', {
          params: [
            max
            , moment(maxForecastMills).from(moment(sbx.time))
          ]
        });
      } else {
        response = translate('virtAsstAR2ForecastBetween', {
          params: [
            min
            , max
            , moment(maxForecastMills).from(moment(sbx.time))
          ]
        });
      }
      next(translate('virtAsstTitleAR2Forecast'), response);
    } else {
      next(translate('virtAsstTitleAR2Forecast'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  ar2.virtAsst = {
    intentHandlers: [{
      intent: 'MetricNow'
      , metrics: ['ar2 forecast', 'forecast']
      , intentHandler: virtAsstAr2Handler
    }]
  };

  return ar2;
}

function checkForecast (forecast: any, sbx: any) {
  var result = undefined;

  if (forecast && forecast.avgLoss > URGENT_THRESHOLD) {
    result = { level: sbx.levels.URGENT };
  } else if (forecast && forecast.avgLoss > WARN_THRESHOLD) {
    result = { level: sbx.levels.WARN };
  }

  if (result) {
    // @ts-expect-error TS(2339) FIXME: Property 'forecast' does not exist on type '{ leve... Remove this comment to see the full error message
    result.forecast = forecast;
    // @ts-expect-error TS(2339) FIXME: Property 'eventName' does not exist on type '{ lev... Remove this comment to see the full error message
    result.eventName = selectEventType(result, sbx);
  }

  return result;
}

function selectEventType (prop: any, sbx: any) {
  var predicted = prop.forecast && _.map(prop.forecast.predicted, function(p: any) { return sbx.scaleEntry(p) });

  var in20mins = predicted && predicted.length >= 4 ? predicted[3] : undefined;

  //if not set to high or low the default eventType will be assumed
  var eventName = '';

  if (in20mins !== undefined) {
    if (sbx.settings.alarmHigh && in20mins > sbx.scaleMgdl(sbx.settings.thresholds.bgTargetTop)) {
      eventName = 'high';
    } else if (sbx.settings.alarmLow && in20mins < sbx.scaleMgdl(sbx.settings.thresholds.bgTargetBottom)) {
      eventName = 'low';
    }
  }

  return eventName;
}

function pushoverSound (prop: any, levels: any) {
  var sound;

  if (prop.level === levels.URGENT) {
    sound = 'persistent';
  } else if (prop.eventName === 'low') {
    sound = 'falling';
  } else if (prop.eventName === 'high') {
    sound = 'climb';
  }

  return sound;
}

function getConeFactor (sbx: any) {
  var value = Number(sbx.extendedSettings.coneFactor);
  if (isNaN(value) || value < 0) {
    value = 2;
  }
  return value;
}

function okToForecast (sbx: any) {

  var bgnow = sbx.properties.bgnow;
  var delta = sbx.properties.delta;

  if (!bgnow || !delta) {
    return false;
  }

  return bgnow.mean >= BG_MIN && delta.mean5MinsAgo && _.isNumber(delta.mean5MinsAgo);
}

function initAR2 (sbx: any) {
  var bgnow = sbx.properties.bgnow;
  var delta = sbx.properties.delta;
  var mean5MinsAgo = delta.mean5MinsAgo;

  return {
    forecastTime: bgnow.mills || sbx.time
    , points: []
    , prev: Math.log(mean5MinsAgo / BG_REF)
    , curr: Math.log(bgnow.mean / BG_REF)
  };
}

function incrementAR2 (result: any) {
  return {
    forecastTime: result.forecastTime + times.mins(5).msecs
    , points: result.points || []
    , prev: result.curr
    , curr: AR[0] * result.prev + AR[1] * result.curr
  };
}

function pushPoint (result: any) {
  var next = incrementAR2(result);

  next.points.push(ar2Point(
    next
    , { offset: 2000 }
  ));

  return next;
}

function ar2Point (next: any, options: any) {
  var step = options.step || 0;
  var coneFactor = options.coneFactor || 0;
  var offset = options.offset || 0;

  var mgdl = Math.round(BG_REF * Math.exp(
    next.curr + coneFactor * step
  ));

  return {
    mills: next.forecastTime + offset
    , mgdl: Math.max(BG_MIN, Math.min(BG_MAX, mgdl))
    , color: AR2_COLOR
  };
}

function buildDebug (prop: any, sbx: any) {
  return prop.forecast && {
    forecast: {
      avgLoss: prop.forecast.avgLoss
      , predicted: _.map(prop.forecast.predicted, function(p: any) { return sbx.scaleEntry(p) }).join(', ')
    }
  };
}

function log10 (val: any) { return Math.log(val) / Math.LN10; }

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
