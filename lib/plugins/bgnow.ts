'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

var offset = times.mins(2.5).msecs;
var bucketFields = ['index', 'fromMills', 'toMills'];

function init (ctx: any) {

  var moment = ctx.moment;
  var translate = ctx.language.translate;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var utils = require('../utils')(ctx);

  var bgnow = {
    name: 'bgnow'
    , label: 'BG Now'
    , pluginType: 'pill-primary'
  };

  // @ts-expect-error TS(2339) FIXME: Property 'mostRecentBucket' does not exist on type... Remove this comment to see the full error message
  bgnow.mostRecentBucket = function mostRecentBucket (buckets: any) {
    return _.find(buckets, function notEmpty(bucket: any) {
      return bucket && !bucket.isEmpty;
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'previousBucket' does not exist on type '... Remove this comment to see the full error message
  bgnow.previousBucket = function previousBucket(recent: any, buckets: any) {
    var previous = null;

    if (_.isObject(recent)) {
      previous = _.chain(buckets).find(function afterFirstNotEmpty(bucket: any) {
        return bucket.mills < recent.mills && !bucket.isEmpty;
      }).value();
    }

    return previous;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  bgnow.setProperties = function setProperties (sbx: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'fillBuckets' does not exist on type '{ n... Remove this comment to see the full error message
    var buckets = bgnow.fillBuckets(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'mostRecentBucket' does not exist on type... Remove this comment to see the full error message
    var recent = bgnow.mostRecentBucket(buckets);
    // @ts-expect-error TS(2339) FIXME: Property 'previousBucket' does not exist on type '... Remove this comment to see the full error message
    var previous = bgnow.previousBucket(recent, buckets);
    // @ts-expect-error TS(2339) FIXME: Property 'calcDelta' does not exist on type '{ nam... Remove this comment to see the full error message
    var delta = bgnow.calcDelta(recent, previous, sbx);

    sbx.offerProperty('bgnow', function setBGNow ( ) {
      return _.omit(recent, bucketFields);
    });

    sbx.offerProperty('delta', function setBGNow ( ) {
      return delta;
    });

    sbx.offerProperty('buckets', function setBGNow ( ) {
      return buckets;
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'fillBuckets' does not exist on type '{ n... Remove this comment to see the full error message
  bgnow.fillBuckets = function fillBuckets (sbx: any, opts: any) {

    var bucketCount = (opts && opts.bucketCount) || 4;
    var bucketMins = (opts && opts.bucketMins) || 5;
    var bucketMsecs = times.mins(bucketMins).msecs;

    var lastSGVMills = sbx.lastSGVMills();

    var buckets = _.times(bucketCount, function createBucket (index: any) {
      var fromMills = lastSGVMills - offset - (index * bucketMsecs);
      return {
        index: index
        , fromMills: fromMills
        , toMills: fromMills + bucketMsecs
        , sgvs: [ ]
      };
    });

    _.takeRightWhile(sbx.data.sgvs, function addToBucket (sgv: any) {

      //if in the future, return true and keep taking right
      if (sgv.mills > sbx.time) {
        return true;
      }

      var bucket = _.find(buckets, function containsSGV (bucket: any) {
        return sgv.mills >= bucket.fromMills && sgv.mills <= bucket.toMills;
      });

      if (bucket) {
        sbx.scaleEntry(sgv);
        bucket.sgvs.push(sgv);
      }

      return bucket;
    });

    // @ts-expect-error TS(2339) FIXME: Property 'analyzeBucket' does not exist on type '{... Remove this comment to see the full error message
    return _.map(buckets, bgnow.analyzeBucket);
  };

  function notError (entry: any) {
    return entry && entry.mgdl > 39; //TODO maybe lower instead of expecting dexcom?
  }

  function isError (entry: any) {
    return !entry || !entry.mgdl || entry.mgdl < 39;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'analyzeBucket' does not exist on type '{... Remove this comment to see the full error message
  bgnow.analyzeBucket = function analyzeBucket (bucket: any) {

    if (_.isEmpty(bucket.sgvs)) {
      bucket.isEmpty = true;
      return bucket;
    }

    var details = { };

    var sgvs = _.filter(bucket.sgvs, notError);

    function calcMean ( ) {
      var sum = 0;
      _.forEach(sgvs, function eachSGV (sgv: any) {
        sum += Number(sgv.mgdl);
      });

      return sum / sgvs.length;
    }

    // @ts-expect-error TS(2554) FIXME: Expected 0 arguments, but got 1.
    var mean = calcMean(sgvs);

    if (mean && _.isNumber(mean)) {
      // @ts-expect-error TS(2339) FIXME: Property 'mean' does not exist on type '{}'.
      details.mean = mean;
    }

    var mostRecent = _.maxBy(sgvs, 'mills');

    if (mostRecent) {
      // @ts-expect-error TS(2339) FIXME: Property 'last' does not exist on type '{}'.
      details.last = mostRecent.mgdl;
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type '{}'.
      details.mills = mostRecent.mills;
    }

    var errors = _.filter(bucket.sgvs, isError);
    if (!_.isEmpty(errors)) {
      // @ts-expect-error TS(2339) FIXME: Property 'errors' does not exist on type '{}'.
      details.errors = errors;
    }

    return _.merge(details, bucket);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'calcDelta' does not exist on type '{ nam... Remove this comment to see the full error message
  bgnow.calcDelta = function calcDelta (recent: any, previous: any, sbx: any) {

    if (_.isEmpty(recent)) {
      //console.info('No recent CGM data is available');
      return null;
    }

    if (_.isEmpty(previous)) {
      //console.info('previous bucket not found, not calculating delta');
      return null;
    }

    var delta = {
      absolute: recent.mean - previous.mean
      , elapsedMins: (recent.mills - previous.mills) / times.min().msecs
    };

    // @ts-expect-error TS(2339) FIXME: Property 'interpolated' does not exist on type '{ ... Remove this comment to see the full error message
    delta.interpolated = delta.elapsedMins > 9;

    // @ts-expect-error TS(2339) FIXME: Property 'mean5MinsAgo' does not exist on type '{ ... Remove this comment to see the full error message
    delta.mean5MinsAgo = delta.interpolated ?
      recent.mean - delta.absolute / delta.elapsedMins * 5 : recent.mean - delta.absolute;

    // @ts-expect-error TS(2339) FIXME: Property 'times' does not exist on type '{ absolut... Remove this comment to see the full error message
    delta.times = {
      recent: recent.mills
      , previous: previous.mills
    };

    // @ts-expect-error TS(2339) FIXME: Property 'mgdl' does not exist on type '{ absolute... Remove this comment to see the full error message
    delta.mgdl = Math.round(recent.mean - delta.mean5MinsAgo);

    // @ts-expect-error TS(2339) FIXME: Property 'scaled' does not exist on type '{ absolu... Remove this comment to see the full error message
    delta.scaled = sbx.settings.units === 'mmol' ?
      // @ts-expect-error TS(2339) FIXME: Property 'mean5MinsAgo' does not exist on type '{ ... Remove this comment to see the full error message
      sbx.roundBGToDisplayFormat(sbx.scaleMgdl(recent.mean) - sbx.scaleMgdl(delta.mean5MinsAgo)) : delta.mgdl;

    // @ts-expect-error TS(2339) FIXME: Property 'display' does not exist on type '{ absol... Remove this comment to see the full error message
    delta.display = (delta.scaled >= 0 ? '+' : '') + delta.scaled;

    // @ts-expect-error TS(2339) FIXME: Property 'previous' does not exist on type '{ abso... Remove this comment to see the full error message
    delta.previous = _.omit(previous, bucketFields);

    return delta;

  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  bgnow.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.bgnow;
    var delta = sbx.properties.delta;

    var info = [];
    var display = delta && delta.display;

    if (delta && delta.interpolated) {
      display += ' *';
      info.push({label: translate('Elapsed Time'), value: Math.round(delta.elapsedMins) + ' ' + translate('mins')});
      info.push({label: translate('Absolute Delta'), value: sbx.roundBGToDisplayFormat(sbx.scaleMgdl(delta.absolute)) + ' ' + sbx.unitsLabel});
      info.push({label: translate('Interpolated'), value: sbx.roundBGToDisplayFormat(sbx.scaleMgdl(delta.mean5MinsAgo)) + ' ' + sbx.unitsLabel});
    }

    var deviceInfos = { };

    if (prop.sgvs) {
      _.forEach(prop.sgvs, function deviceAndValue(entry: any) {
        var device = utils.deviceName(entry.device);
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        deviceInfos[device] = {
          time: utils.timeFormat(moment(entry.mills), sbx)
          , value: sbx.scaleEntry(entry)
          , recent: entry
        };
      });
    }

    if (delta && delta.previous && delta.previous.sgvs) {
      _.forEach(delta.previous.sgvs, function deviceAndValue(entry: any) {
        var device = utils.deviceName(entry.device);
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var deviceInfo = deviceInfos[device];
        if (deviceInfo && deviceInfo.recent) {
          // @ts-expect-error TS(2339) FIXME: Property 'calcDelta' does not exist on type '{ nam... Remove this comment to see the full error message
          var deviceDelta = bgnow.calcDelta(
            { mills: deviceInfo.recent.mills , mean: deviceInfo.recent.mgdl}
            , { mills: entry.mills, mean: entry.mgdl}
            , sbx
          );

          if (deviceDelta) {
            deviceInfo.delta = deviceDelta.display
          }
        } else {
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          deviceInfos[device] = {
            time: utils.timeFormat(moment(entry.mills), sbx)
            , value: sbx.scaleEntry(entry)
          };
        }
      });

      if (_.keys(deviceInfos).length > 1) {
        _.forIn(deviceInfos, function addInfo(deviceInfo: any, name: any) {
          var display = deviceInfo.value;
          if (deviceInfo.delta) {
            display += ' ' + deviceInfo.delta;
          }

          display += ' (' + deviceInfo.time + ')';

          info.push({label: name, value: display});
        });
      }
    }

    sbx.pluginBase.updatePillText({
      name: 'delta'
      , label: translate('BG Delta')
      , pluginType: 'pill-major'
      , pillFlip: true
    }, {
      value: display
      , label: sbx.unitsLabel
      , info: _.isEmpty(info) ? null : info
    });
  };

  function virtAsstDelta(next: any, slots: any, sbx: any) {
    var delta = sbx.properties.delta;

    next(
      translate('virtAsstTitleDelta')
      , translate(delta.interpolated ? 'virtAsstDeltaEstimated' : 'virtAsstDelta'
      , {
          params: [
            delta.display == '+0' ? '0' : delta.display
            , moment(delta.times.recent).from(moment(sbx.time))
            , moment(delta.times.previous).from(moment(sbx.time))
          ]
        }
      )
    );
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  bgnow.virtAsst = {
    intentHandlers: [{
      intent: "MetricNow"
      , metrics: ["delta"]
      , intentHandler: virtAsstDelta
    }]
  };

  return bgnow;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
