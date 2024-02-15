'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
const times = require('../times');

function init(ctx: any) {
  var moment = ctx.moment;
  var translate = ctx.language.translate;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var utils = require('../utils')(ctx);
  
  var iob = {
    name: 'iob'
    , label: 'Insulin-on-Board'
    , pluginType: 'pill-major'
  };

  // @ts-expect-error TS(2339) FIXME: Property 'RECENCY_THRESHOLD' does not exist on typ... Remove this comment to see the full error message
  iob.RECENCY_THRESHOLD = times.mins(30).msecs;

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  iob.setProperties = function setProperties(sbx: any) {
    sbx.offerProperty('iob', function setIOB ( ) {
      // @ts-expect-error TS(2339) FIXME: Property 'calcTotal' does not exist on type '{ nam... Remove this comment to see the full error message
      return iob.calcTotal(sbx.data.treatments, sbx.data.devicestatus, sbx.data.profile, sbx.time);
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'calcTotal' does not exist on type '{ nam... Remove this comment to see the full error message
  iob.calcTotal = function calcTotal(treatments: any, devicestatus: any, profile: any, time: any, spec_profile: any) {
    if (time === undefined) {
      time = Date.now();
    }

    // @ts-expect-error TS(2339) FIXME: Property 'lastIOBDeviceStatus' does not exist on t... Remove this comment to see the full error message
    var result = iob.lastIOBDeviceStatus(devicestatus, time);
    
    // @ts-expect-error TS(2339) FIXME: Property 'fromTreatments' does not exist on type '... Remove this comment to see the full error message
    var treatmentResult = (treatments !== undefined && treatments.length) ? iob.fromTreatments(treatments, profile, time, spec_profile) : {};

    if (_.isEmpty(result)) {
      result = treatmentResult;
    } else if (treatmentResult.iob) {
      // @ts-expect-error TS(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      result.treatmentIob = +(Math.round(treatmentResult.iob + "e+3")  + "e-3");
    }
    // @ts-expect-error TS(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
    if (result.iob) result.iob = +(Math.round(result.iob + "e+3")  + "e-3");
    return addDisplay(result);
  };

  function addDisplay(iob: any) {
    if (_.isEmpty(iob) || iob.iob === undefined) {
      return {};
    }
    var display = utils.toFixed(iob.iob);
    return _.merge(iob, {
      display: display
      , displayLine: 'IOB: ' + display + 'U'
    });
  }

  // @ts-expect-error TS(2339) FIXME: Property 'isDeviceStatusAvailable' does not exist ... Remove this comment to see the full error message
  iob.isDeviceStatusAvailable = function isDeviceStatusAvailable (devicestatus: any) {

    return _.chain(devicestatus)
        // @ts-expect-error TS(2339) FIXME: Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
        .map(iob.fromDeviceStatus)
        .reject(_.isEmpty)
        .value()
        .length > 0;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'lastIOBDeviceStatus' does not exist on t... Remove this comment to see the full error message
  iob.lastIOBDeviceStatus = function lastIOBDeviceStatus(devicestatus: any, time: any) {
    if (time && time.getTime) {
      time = time.getTime();
    }
    var futureMills = time + times.mins(5).msecs; //allow for clocks to be a little off
    // @ts-expect-error TS(2339) FIXME: Property 'RECENCY_THRESHOLD' does not exist on typ... Remove this comment to see the full error message
    var recentMills = time - iob.RECENCY_THRESHOLD;

    // All IOBs
    var iobs = _.chain(devicestatus)
      .filter(function (iobStatus: any) {
        return iobStatus.mills <= futureMills && iobStatus.mills >= recentMills;
      })
      // @ts-expect-error TS(2339) FIXME: Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
      .map(iob.fromDeviceStatus)
      .reject(_.isEmpty)
      .sortBy('mills');

    // Loop IOBs 
    var loopIOBs = iobs.filter(function (iobStatus: any) {
      return iobStatus.source === 'Loop';
    });

    // Loop uploads both Loop IOB and pump-reported IOB, prioritize Loop IOB if available
    return loopIOBs.last().value() || iobs.last().value();
  };

  // @ts-expect-error TS(2339) FIXME: Property 'IOBDeviceStatusesInTimeRange' does not e... Remove this comment to see the full error message
  iob.IOBDeviceStatusesInTimeRange = function IOBDeviceStatusesInTimeRange (devicestatus: any, from: any, to: any) {

    return _.chain(devicestatus)
      .filter(function (iobStatus: any) {
        return iobStatus.mills > from && iobStatus.mills < to;
      })
      // @ts-expect-error TS(2339) FIXME: Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
      .map(iob.fromDeviceStatus)
      .reject(_.isEmpty)
      .sortBy('mills')
      .value();
  };

  // @ts-expect-error TS(2339) FIXME: Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
  iob.fromDeviceStatus = function fromDeviceStatus(devicestatusEntry: any) {
    var iobOpenAPS = _.get(devicestatusEntry, 'openaps.iob');
    var iobLoop = _.get(devicestatusEntry, 'loop.iob');
    var iobPump = _.get(devicestatusEntry, 'pump.iob');

    if (_.isObject(iobOpenAPS)) {

      //hacks to support AMA iob array with time fields instead of timestamp fields
      iobOpenAPS = _.isArray(iobOpenAPS) ? iobOpenAPS[0] : iobOpenAPS;

      // array could still be empty, handle as null
      if (_.isEmpty(iobOpenAPS)) {
        return {};
      }

      if (iobOpenAPS.time) {
        iobOpenAPS.timestamp = iobOpenAPS.time;
      }

      return {
        iob: iobOpenAPS.iob
        , basaliob: iobOpenAPS.basaliob
        , activity: iobOpenAPS.activity
        , source: 'OpenAPS'
        , device: devicestatusEntry.device
        , mills: moment(iobOpenAPS.timestamp).valueOf( )
      };
    } else if (_.isObject(iobLoop)) {
      return {
        iob: iobLoop.iob
        , source: 'Loop'
        , device: devicestatusEntry.device
        , mills: moment(iobLoop.timestamp).valueOf( )
      };
    } else if (_.isObject(iobPump)) {
      return {
        iob: iobPump.iob || iobPump.bolusiob
        , source: devicestatusEntry.connect !== undefined ? 'MM Connect' : undefined
        , device: devicestatusEntry.device
        , mills: devicestatusEntry.mills
      };
    } else {
      return {};
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'fromTreatments' does not exist on type '... Remove this comment to see the full error message
  iob.fromTreatments = function fromTreatments(treatments: any, profile: any, time: any, spec_profile: any) {
    var totalIOB = 0
      , totalActivity = 0;

    var lastBolus = null;

    _.each(treatments, function eachTreatment(treatment: any) {
      if (treatment.mills <= time) {
        // @ts-expect-error TS(2339) FIXME: Property 'calcTreatment' does not exist on type '{... Remove this comment to see the full error message
        var tIOB = iob.calcTreatment(treatment, profile, time, spec_profile);
        if (tIOB.iobContrib > 0) {
          lastBolus = treatment;
        }
        if (tIOB && tIOB.iobContrib) { totalIOB += tIOB.iobContrib; }
        // units: BG (mg/dL or mmol/L)
        if (tIOB && tIOB.activityContrib) { totalActivity += tIOB.activityContrib; }
      }
    });

    return {
      // @ts-expect-error TS(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      iob: +(Math.round(totalIOB + "e+3")  + "e-3")
      , activity: totalActivity
      , lastBolus: lastBolus
      , source: translate('Care Portal')
    };
  };

  // @ts-expect-error TS(2339) FIXME: Property 'calcTreatment' does not exist on type '{... Remove this comment to see the full error message
  iob.calcTreatment = function calcTreatment(treatment: any, profile: any, time: any, spec_profile: any) {

    var dia = 3
      , sens = 0;

    if (profile !== undefined) {
      dia = profile.getDIA(time, spec_profile) || 3;
      sens = profile.getSensitivity(time, spec_profile);
    }

    var scaleFactor = 3.0 / dia
      , peak = 75
      , result = {
          iobContrib: 0
          , activityContrib: 0
        };

    if (treatment.insulin) {
      var bolusTime = treatment.mills;
      var minAgo = scaleFactor * (time - bolusTime) / 1000 / 60;

      if (minAgo < peak) {
        var x1 = minAgo / 5 + 1;
        result.iobContrib = treatment.insulin * (1 - 0.001852 * x1 * x1 + 0.001852 * x1);
        // units: BG (mg/dL)  = (BG/U) *    U insulin     * scalar
        result.activityContrib = sens * treatment.insulin * (2 / dia / 60 / peak) * minAgo;

      } else if (minAgo < 180) {
        var x2 = (minAgo - 75) / 5;
        result.iobContrib = treatment.insulin * (0.001323 * x2 * x2 - 0.054233 * x2 + 0.55556);
        result.activityContrib = sens * treatment.insulin * (2 / dia / 60 - (minAgo - peak) * 2 / dia / 60 / (60 * 3 - peak));
      }

    }

    return result;

  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  iob.updateVisualisation = function updateVisualisation(sbx: any) {
    var info = [];

    var prop = sbx.properties.iob;

    if (prop.lastBolus) {
      var when = new Date(prop.lastBolus.mills).toLocaleTimeString();
      var amount = sbx.roundInsulinForDisplayFormat(Number(prop.lastBolus.insulin)) + 'U';
      info.push({ label: translate('Last Bolus'), value: amount + ' @ ' + when });
    }
    if (prop.basaliob !== undefined) {
      info.push({ label: translate('Basal IOB'), value: prop.basaliob.toFixed(2) });
    }
    if (prop.source !== undefined) {
      info.push({ label: translate('Source'), value: prop.source });
    }
    if (prop.device !== undefined) {
      info.push({ label: translate('Device'), value: prop.device });
    }

    if (prop.treatmentIob !== undefined) {
      info.push({label: '------------', value: ''});
      info.push({ label: translate('Careportal IOB'), value: prop.treatmentIob.toFixed(2) });
    }

    var value = (prop.display !== undefined ? sbx.roundInsulinForDisplayFormat(prop.display) : '---') + 'U';

    sbx.pluginBase.updatePillText(iob, {
      value: value
      , label: translate('IOB')
      , info: info
    });

  };

  function virtAsstIOBIntentHandler (callback: any, slots: any, sbx: any) {

    var message = translate('virtAsstIobIntent', {
      params: [
          getIob(sbx)
      ]
    });
    callback(translate('virtAsstTitleCurrentIOB'), message);
  }

  function virtAsstIOBRollupHandler (slots: any, sbx: any, callback: any) {
    var iob = getIob(sbx);
    var message = translate('virtAsstIob', {
      params: [iob]
    });
    callback(null, {results: message, priority: 2});
  }

  function getIob(sbx: any) {
    var iob = _.get(sbx, 'properties.iob.iob');
    if (iob !== 0) {
      return translate('virtAsstIobUnits', {
        params: [
            utils.toFixed(iob)
        ]
      });
    }
    return translate('virtAsstNoInsulin');
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  iob.virtAsst = {
    rollupHandlers: [{
      rollupGroup: 'Status'
      , rollupName: 'current iob'
      , rollupHandler: virtAsstIOBRollupHandler
    }]
    , intentHandlers: [{
      intent: 'MetricNow'
      , metrics: ['iob', 'insulin on board']
      , intentHandler: virtAsstIOBIntentHandler
    }]
  };

  return iob;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
