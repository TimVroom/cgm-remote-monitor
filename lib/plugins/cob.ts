'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
  , times = require('../times');

function init (ctx: any) {
  var moment = ctx.moment;
  var translate = ctx.language.translate;
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var iob = require('./iob')(ctx);

  var cob = {
    name: 'cob'
    , label: 'Carbs-on-Board'
    , pluginType: 'pill-minor'
  };

  // @ts-expect-error TS(2339): Property 'RECENCY_THRESHOLD' does not exist on typ... Remove this comment to see the full error message
  cob.RECENCY_THRESHOLD = times.mins(30).msecs;

  // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  cob.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('cob', function setCOB () {
      // @ts-expect-error TS(2339): Property 'cobTotal' does not exist on type '{ name... Remove this comment to see the full error message
      return cob.cobTotal(sbx.data.treatments, sbx.data.devicestatus, sbx.data.profile, sbx.time);
    });
  };

  // @ts-expect-error TS(2339): Property 'cobTotal' does not exist on type '{ name... Remove this comment to see the full error message
  cob.cobTotal = function cobTotal (treatments: any, devicestatus: any, profile: any, time: any, spec_profile: any) {

    if (!profile || !profile.hasData()) {
      console.warn('For the COB plugin to function you need a treatment profile');
      return {};
    }

    if (!profile.getSensitivity(time, spec_profile) || !profile.getCarbRatio(time, spec_profile)) {
      console.warn('For the COB plugin to function your treatment profile must have both sens and carbratio fields');
      return {};
    }

    if (typeof time === 'undefined') {
      time = Date.now();
    } else if (time && time.getTime) {
      time = time.getTime();
    }

    // @ts-expect-error TS(2339): Property 'lastCOBDeviceStatus' does not exist on t... Remove this comment to see the full error message
    var devicestatusCOB = cob.lastCOBDeviceStatus(devicestatus, time);
    var result = devicestatusCOB;

    const TEN_MINUTES = 10 * 60 * 1000;

    if (_.isEmpty(result) || _.isNil(result.cob) || (Date.now() - result.mills) > TEN_MINUTES) {

      // @ts-expect-error TS(2339): Property 'fromTreatments' does not exist on type '... Remove this comment to see the full error message
      var treatmentCOB = (treatments !== undefined && treatments.length) ? cob.fromTreatments(treatments, devicestatus, profile, time, spec_profile) : {};

      result = _.cloneDeep(treatmentCOB);
      result.source = 'Care Portal';
      result.treatmentCOB = _.cloneDeep(treatmentCOB);
    }

    return addDisplay(result);
  };

  function addDisplay (cob: any) {
    if (_.isEmpty(cob) || cob.cob === undefined) {
      return {};
    }

    var display = Math.round(cob.cob * 10) / 10;
    return _.merge(cob, {
      display: display
      , displayLine: 'COB: ' + display + 'g'
    });
  }

  // @ts-expect-error TS(2339): Property 'isDeviceStatusAvailable' does not exist ... Remove this comment to see the full error message
  cob.isDeviceStatusAvailable = function isDeviceStatusAvailable (devicestatus: any) {

    return _.chain(devicestatus)
      // @ts-expect-error TS(2339): Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
      .map(cob.fromDeviceStatus)
      .reject(_.isEmpty)
      .value()
      .length > 0;
  };

  // @ts-expect-error TS(2339): Property 'lastCOBDeviceStatus' does not exist on t... Remove this comment to see the full error message
  cob.lastCOBDeviceStatus = function lastCOBDeviceStatus (devicestatus: any, time: any) {

    var futureMills = time + times.mins(5).msecs; //allow for clocks to be a little off
    // @ts-expect-error TS(2339): Property 'RECENCY_THRESHOLD' does not exist on typ... Remove this comment to see the full error message
    var recentMills = time - cob.RECENCY_THRESHOLD;

    return _.chain(devicestatus)
      .filter(function(cobStatus: any) {
        return cobStatus.mills <= futureMills && cobStatus.mills >= recentMills;
      })
      // @ts-expect-error TS(2339): Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
      .map(cob.fromDeviceStatus)
      .reject(_.isEmpty)
      .sortBy('mills')
      .last()
      .value();
  };

  // @ts-expect-error TS(2339): Property 'COBDeviceStatusesInTimeRange' does not e... Remove this comment to see the full error message
  cob.COBDeviceStatusesInTimeRange = function COBDeviceStatusesInTimeRange (devicestatus: any, from: any, to: any) {

    return _.chain(devicestatus)
      .filter(function(cobStatus: any) {
        return cobStatus.mills > from && cobStatus.mills < to;
      })
      // @ts-expect-error TS(2339): Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
      .map(cob.fromDeviceStatus)
      .reject(_.isEmpty)
      .sortBy('mills')
      .value();
  };

  // @ts-expect-error TS(2339): Property 'fromDeviceStatus' does not exist on type... Remove this comment to see the full error message
  cob.fromDeviceStatus = function fromDeviceStatus (devicestatusEntry: any) {

    var cobObj;
    if (_.get(devicestatusEntry, 'openaps') !== undefined) {
      var suggested = devicestatusEntry.openaps.suggested;
      var enacted = devicestatusEntry.openaps.enacted;

      var lastCOB = null;
      var lastMoment = null;

      if (suggested && enacted) {
        var suggestedMoment = moment(suggested.timestamp);
        var enactedMoment = moment(enacted.timestamp);
        if (enactedMoment.isAfter(suggestedMoment)) {
          lastCOB = enacted.COB;
          lastMoment = enactedMoment;
        } else {
          lastCOB = suggested.COB;
          lastMoment = suggestedMoment;
        }
      } else if (enacted) {
        lastCOB = enacted.COB;
        lastMoment = moment(enacted.timestamp);
      } else if (suggested) {
        lastCOB = suggested.COB;
        lastMoment = moment(suggested.timestamp);
      }

      if (lastCOB === null || !lastMoment) {
        return {};
      }

      return {
        cob: lastCOB
        , source: 'OpenAPS'
        , device: devicestatusEntry.device
        , mills: lastMoment.valueOf()
      };
    } else if (_.get(devicestatusEntry, 'loop.cob') !== undefined) {
      cobObj = devicestatusEntry.loop.cob;
      return {
        cob: cobObj.cob
        , source: 'Loop'
        , device: devicestatusEntry.device
        , mills: moment(cobObj.timestamp).valueOf()
      };
    } else {
      return {};
    }
  };

  // @ts-expect-error TS(2339): Property 'fromTreatments' does not exist on type '... Remove this comment to see the full error message
  cob.fromTreatments = function fromTreatments (treatments: any, devicestatus: any, profile: any, time: any, spec_profile: any) {
    // TODO: figure out the liverSensRatio that gives the most accurate purple line predictions
    var liverSensRatio = 8;
    var totalCOB = 0;
    var lastCarbs = null;

    var isDecaying = 0;
    var lastDecayedBy = 0;

    _.each(treatments, function eachTreatment (treatment: any) {
      if (treatment.carbs && treatment.mills < time) {
        lastCarbs = treatment;
        // @ts-expect-error TS(2339): Property 'cobCalc' does not exist on type '{ name:... Remove this comment to see the full error message
        var cCalc = cob.cobCalc(treatment, profile, lastDecayedBy, time, spec_profile);
        var decaysin_hr = (cCalc.decayedBy - time) / 1000 / 60 / 60;
        if (decaysin_hr > -10) {
          // units: BG
          var actStart = iob.calcTotal(treatments, devicestatus, profile, lastDecayedBy, spec_profile).activity;
          var actEnd = iob.calcTotal(treatments, devicestatus, profile, cCalc.decayedBy, spec_profile).activity;
          var avgActivity = (actStart + actEnd) / 2;
          // units:  g     =       BG      *      scalar     /          BG / U                           *     g / U
          var delayedCarbs = (avgActivity * liverSensRatio / profile.getSensitivity(treatment.mills, spec_profile)) * profile.getCarbRatio(treatment.mills, spec_profile);
          var delayMinutes = Math.round(delayedCarbs / profile.getCarbAbsorptionRate(treatment.mills, spec_profile) * 60);
          if (delayMinutes > 0) {
            cCalc.decayedBy.setMinutes(cCalc.decayedBy.getMinutes() + delayMinutes);
            decaysin_hr = (cCalc.decayedBy - time) / 1000 / 60 / 60;
          }
        }

        if (cCalc) {
          lastDecayedBy = cCalc.decayedBy;
        }

        if (decaysin_hr > 0) {
          //console.info('Adding ' + delayMinutes + ' minutes to decay of ' + treatment.carbs + 'g bolus at ' + treatment.mills);
          totalCOB += Math.min(Number(treatment.carbs), decaysin_hr * profile.getCarbAbsorptionRate(treatment.mills, spec_profile));
          //console.log('cob:', Math.min(cCalc.initialCarbs, decaysin_hr * profile.getCarbAbsorptionRate(treatment.mills)),cCalc.initialCarbs,decaysin_hr,profile.getCarbAbsorptionRate(treatment.mills));
          isDecaying = cCalc.isDecaying;
        } else {
          totalCOB = 0;
        }

      }
    });

    var rawCarbImpact = isDecaying * profile.getSensitivity(time, spec_profile) / profile.getCarbRatio(time, spec_profile) * profile.getCarbAbsorptionRate(time, spec_profile) / 60;

    return {
      decayedBy: lastDecayedBy
      , isDecaying: isDecaying
      , carbs_hr: profile.getCarbAbsorptionRate(time, spec_profile)
      , rawCarbImpact: rawCarbImpact
      , cob: totalCOB
      , lastCarbs: lastCarbs
    };
  };

  // @ts-expect-error TS(2339): Property 'carbImpact' does not exist on type '{ na... Remove this comment to see the full error message
  cob.carbImpact = function carbImpact (rawCarbImpact: any, insulinImpact: any) {
    var liverSensRatio = 1.0;
    var liverCarbImpactMax = 0.7;
    var liverCarbImpact = Math.min(liverCarbImpactMax, liverSensRatio * insulinImpact);
    //var liverCarbImpact = liverSensRatio*insulinImpact;
    var netCarbImpact = Math.max(0, rawCarbImpact - liverCarbImpact);
    var totalImpact = netCarbImpact - insulinImpact;
    return {
      netCarbImpact: netCarbImpact
      , totalImpact: totalImpact
    };
  };

  // @ts-expect-error TS(2339): Property 'cobCalc' does not exist on type '{ name:... Remove this comment to see the full error message
  cob.cobCalc = function cobCalc (treatment: any, profile: any, lastDecayedBy: any, time: any, spec_profile: any) {

    var delay = 20;
    var isDecaying = 0;
    var initialCarbs;

    if (treatment.carbs) {
      var carbTime = new Date(treatment.mills);

      var carbs_hr = profile.getCarbAbsorptionRate(treatment.mills, spec_profile);
      var carbs_min = carbs_hr / 60;

      var decayedBy = new Date(carbTime);
      // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
      var minutesleft = (lastDecayedBy - carbTime) / 1000 / 60;
      decayedBy.setMinutes(decayedBy.getMinutes() + Math.max(delay, minutesleft) + treatment.carbs / carbs_min);
      if (delay > minutesleft) {
        initialCarbs = parseInt(treatment.carbs);
      } else {
        initialCarbs = parseInt(treatment.carbs) + minutesleft * carbs_min;
      }
      var startDecay = new Date(carbTime);
      startDecay.setMinutes(carbTime.getMinutes() + delay);
      if (time < lastDecayedBy || time > startDecay) {
        isDecaying = 1;
      } else {
        isDecaying = 0;
      }
      return {
        initialCarbs: initialCarbs
        , decayedBy: decayedBy
        , isDecaying: isDecaying
        , carbTime: carbTime
      };
    } else {
      return '';
    }
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  cob.updateVisualisation = function updateVisualisation (sbx: any) {

    var prop = sbx.properties.cob;

    if (prop === undefined || prop.cob === undefined) { return; }

    var displayCob = Math.round(prop.cob * 10) / 10;

    var info = [];
    if (prop.treatmentCOB !== undefined && prop.treatmentCOB.cob) {
      info.push({ label: translate('Careportal COB'), value: Math.round(prop.treatmentCOB.cob * 10) / 10 });
    }

    var lastCarbs = prop.lastCarbs || (prop.treatmentCOB && prop.treatmentCOB.lastCarbs);
    if (lastCarbs) {
      var when = new Date(lastCarbs.mills).toLocaleString();
      var amount = lastCarbs.carbs + 'g';
      info.push({ label: translate('Last Carbs'), value: amount + ' @ ' + when });
    }

    sbx.pluginBase.updatePillText(sbx, {
      value: displayCob + 'g'
      , label: translate('COB')
      , info: info
    });
  };

  function virtAsstCOBHandler (next: any, slots: any, sbx: any) {
    var response = '';
    var cob = _.get(sbx, 'properties.cob.cob');
    var pwd = _.get(slots, 'pwd.value');
    var value = cob ? cob : 0;
    if (pwd) {
      response = translate('virtAsstCob3person', {
        params: [
          pwd.replace('\'s', '')
          , value
        ]
      });
    } else {
      response = translate('virtAsstCob', {
        params: [
          value
        ]
      });
    }
    next(translate('virtAsstTitleCurrentCOB'), response);
  }

  // @ts-expect-error TS(2339): Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  cob.virtAsst = {
    intentHandlers: [{
      intent: 'MetricNow'
      , metrics: ['cob', 'carbs on board', 'carbohydrates on board']
      , intentHandler: virtAsstCOBHandler
    }]
  };

  return cob;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
