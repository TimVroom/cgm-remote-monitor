'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');

var DEVICE_TYPE_FIELDS = ['uploader', 'pump', 'openaps', 'loop', 'xdripjs'];

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init () {

  var ddata = {
    sgvs: []
    , treatments: []
    , mbgs: []
    , cals: []
    , profiles: []
    , devicestatus: []
    , food: []
    , activity: []
    , dbstats: {}
    , lastUpdated: 0
  };

  /**
   * Convert Mongo ids to strings and ensure all objects have the mills property for
   * significantly faster processing than constant date parsing, plus simplified
   * logic
   */
  // @ts-expect-error TS(2339) FIXME: Property 'processRawDataForRuntime' does not exist... Remove this comment to see the full error message
  ddata.processRawDataForRuntime = (data: any) => {

    let obj = _.cloneDeep(data);

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key]) {
        if (Object.prototype.hasOwnProperty.call(obj[key], '_id')) {
          obj[key]._id = obj[key]._id.toString();
        }
        if (Object.prototype.hasOwnProperty.call(obj[key], 'created_at')
            && !Object.prototype.hasOwnProperty.call(obj[key], 'mills')) {
          obj[key].mills = new Date(obj[key].created_at).getTime();
        }
        if (Object.prototype.hasOwnProperty.call(obj[key], 'sysTime')
            && !Object.prototype.hasOwnProperty.call(obj[key], 'mills')) {       
          obj[key].mills = new Date(obj[key].sysTime).getTime();
        }
      }
    });

    return obj;
  };

  /**
   * Merge two arrays based on _id string, preferring new objects when a collision is found
   * @param {array} oldData 
   * @param {array} newData 
   */
  // @ts-expect-error TS(2339) FIXME: Property 'idMergePreferNew' does not exist on type... Remove this comment to see the full error message
  ddata.idMergePreferNew = (oldData: any, newData: any) => {

    if (!newData && oldData) return oldData;
    if (!oldData && newData) return newData;

    const merged = _.cloneDeep(newData);

    for (let i = 0; i < oldData.length; i++) {
      const oldElement = oldData[i];
      let found = false;
      for (let j = 0; j < newData.length; j++) {
        if (oldElement._id == newData[j]._id) {
          found = true;
          break;
        }
      }
      if (!found) merged.push(oldElement); // Merge old object in, if it wasn't found in the new data
    }

    return merged;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'clone' does not exist on type '{ sgvs: n... Remove this comment to see the full error message
  ddata.clone = function clone () {
    return _.clone(ddata, function(value: any) {
      //special handling of mongo ObjectID's
      //see https://github.com/lodash/lodash/issues/602#issuecomment-47414964

      //instead of requiring Mongo.ObjectID here and having it get pulled into the bundle
      //we'll look for the toHexString function and then assume it's an ObjectID
      if (value && value.toHexString && value.toHexString.call && value.toString && value.toString.call) {
        return value.toString();
      }
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'dataWithRecentStatuses' does not exist o... Remove this comment to see the full error message
  ddata.dataWithRecentStatuses = function dataWithRecentStatuses () {
    var results = {};
    // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
    results.devicestatus = ddata.recentDeviceStatus(Date.now());
    // @ts-expect-error TS(2339) FIXME: Property 'sgvs' does not exist on type '{}'.
    results.sgvs = ddata.sgvs;
    // @ts-expect-error TS(2339) FIXME: Property 'cals' does not exist on type '{}'.
    results.cals = ddata.cals;

    var profiles = _.cloneDeep(ddata.profiles);
    if (profiles && profiles[0] && profiles[0].store) {
      Object.keys(profiles[0].store).forEach(k => {
        if (k.indexOf('@@@@@') > 0) {
          delete profiles[0].store[k];
        }
      })
    }
    // @ts-expect-error TS(2339) FIXME: Property 'profiles' does not exist on type '{}'.
    results.profiles = profiles;
    // @ts-expect-error TS(2339) FIXME: Property 'mbgs' does not exist on type '{}'.
    results.mbgs = ddata.mbgs;
    // @ts-expect-error TS(2339) FIXME: Property 'food' does not exist on type '{}'.
    results.food = ddata.food;
    // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
    results.treatments = ddata.treatments;
    // @ts-expect-error TS(2339) FIXME: Property 'dbstats' does not exist on type '{}'.
    results.dbstats = ddata.dbstats;

    return results;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'recentDeviceStatus' does not exist on ty... Remove this comment to see the full error message
  ddata.recentDeviceStatus = function recentDeviceStatus (time: any) {

    var deviceAndTypes =
      _.chain(ddata.devicestatus)
      .map(function eachStatus (status: any) {
        return _.chain(status)
          .keys()
          .filter(function isExcluded (key: any) {
            return _.includes(DEVICE_TYPE_FIELDS, key);
          })
          .map(function toDeviceTypeKey (key: any) {
            return {
              device: status.device
              , type: key
            };
          })
          .value();
      })
      .flatten()
      .uniqWith(_.isEqual)
      .value();

    //console.info('>>>deviceAndTypes', deviceAndTypes);

    var rv = _.chain(deviceAndTypes)
      .map(function findMostRecent (deviceAndType: any) {
        return _.chain(ddata.devicestatus)
          .filter(function isSameDeviceType (status: any) {
            return status.device === deviceAndType.device && _.has(status, deviceAndType.type)
          })
          .filter(function notInTheFuture (status: any) {
            return status.mills <= time;
          })
          .sortBy('mills')
          .takeRight(10)
          .value();
      }).value();

    var merged = [].concat.apply([], rv);

    rv = _.chain(merged)
      .filter(_.isObject)
      .uniq('_id')
      .sortBy('mills')
      .value();

    return rv;

  };

  // @ts-expect-error TS(2339) FIXME: Property 'processDurations' does not exist on type... Remove this comment to see the full error message
  ddata.processDurations = function processDurations (treatments: any, keepzeroduration: any) {

    treatments = _.uniqBy(treatments, 'mills');

    // cut temp basals by end events
    // better to do it only on data update
    var endevents = treatments.filter(function filterEnd (t: any) {
      return !t.duration;
    });

    function cutIfInInterval (base: any, end: any) {
      if (base.mills < end.mills && base.mills + times.mins(base.duration).msecs > end.mills) {
        base.duration = times.msecs(end.mills - base.mills).mins;
        if (end.profile) {
          base.cuttedby = end.profile;
          end.cutting = base.profile;
        }
      }
    }

    // cut by end events
    treatments.forEach(function allTreatments (t: any) {
      if (t.duration) {
        endevents.forEach(function allEndevents (e: any) {
          cutIfInInterval(t, e);
        });
      }
    });

    // cut by overlaping events
    treatments.forEach(function allTreatments (t: any) {
      if (t.duration) {
        treatments.forEach(function allEndevents (e: any) {
          cutIfInInterval(t, e);
        });
      }
    });

    if (keepzeroduration) {
      return treatments;
    } else {
      return treatments.filter(function filterEnd (t: any) {
        return t.duration;
      });
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'processTreatments' does not exist on typ... Remove this comment to see the full error message
  ddata.processTreatments = function processTreatments (preserveOrignalTreatments: any) {

    // filter & prepare 'Site Change' events
    // @ts-expect-error TS(2339) FIXME: Property 'sitechangeTreatments' does not exist on ... Remove this comment to see the full error message
    ddata.sitechangeTreatments = ddata.treatments.filter(function filterSensor (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType.indexOf('Site Change') > -1;
    // @ts-expect-error TS(2345) FIXME: Argument of type '(a: never, b: never) => boolean'... Remove this comment to see the full error message
    }).sort(function(a, b) {
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type 'never'.
      return a.mills > b.mills;
    });

    // filter & prepare 'Insulin Change' events
    // @ts-expect-error TS(2339) FIXME: Property 'insulinchangeTreatments' does not exist ... Remove this comment to see the full error message
    ddata.insulinchangeTreatments = ddata.treatments.filter(function filterInsulin (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType.indexOf('Insulin Change') > -1;
    // @ts-expect-error TS(2345) FIXME: Argument of type '(a: never, b: never) => boolean'... Remove this comment to see the full error message
    }).sort(function(a, b) {
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type 'never'.
      return a.mills > b.mills;
    });

    // filter & prepare 'Pump Battery Change' events
    // @ts-expect-error TS(2339) FIXME: Property 'batteryTreatments' does not exist on typ... Remove this comment to see the full error message
    ddata.batteryTreatments = ddata.treatments.filter(function filterSensor (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType.indexOf('Pump Battery Change') > -1;
    // @ts-expect-error TS(2345) FIXME: Argument of type '(a: never, b: never) => boolean'... Remove this comment to see the full error message
    }).sort(function(a, b) {
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type 'never'.
      return a.mills > b.mills;
    });

    // filter & prepare 'Sensor' events
    // @ts-expect-error TS(2339) FIXME: Property 'sensorTreatments' does not exist on type... Remove this comment to see the full error message
    ddata.sensorTreatments = ddata.treatments.filter(function filterSensor (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType.indexOf('Sensor') > -1;
    // @ts-expect-error TS(2345) FIXME: Argument of type '(a: never, b: never) => boolean'... Remove this comment to see the full error message
    }).sort(function(a, b) {
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type 'never'.
      return a.mills > b.mills;
    });

    // filter & prepare 'Profile Switch' events
    var profileTreatments = ddata.treatments.filter(function filterProfiles (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType === 'Profile Switch';
    // @ts-expect-error TS(2345) FIXME: Argument of type '(a: never, b: never) => boolean'... Remove this comment to see the full error message
    }).sort(function(a, b) {
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type 'never'.
      return a.mills > b.mills;
    });
    if (preserveOrignalTreatments)
      profileTreatments = _.cloneDeep(profileTreatments);
    // @ts-expect-error TS(2339) FIXME: Property 'profileTreatments' does not exist on typ... Remove this comment to see the full error message
    ddata.profileTreatments = ddata.processDurations(profileTreatments, true);

    // filter & prepare 'Combo Bolus' events
    // @ts-expect-error TS(2339) FIXME: Property 'combobolusTreatments' does not exist on ... Remove this comment to see the full error message
    ddata.combobolusTreatments = ddata.treatments.filter(function filterComboBoluses (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType === 'Combo Bolus';
    // @ts-expect-error TS(2345) FIXME: Argument of type '(a: never, b: never) => boolean'... Remove this comment to see the full error message
    }).sort(function(a, b) {
      // @ts-expect-error TS(2339) FIXME: Property 'mills' does not exist on type 'never'.
      return a.mills > b.mills;
    });

    // filter & prepare temp basals
    var tempbasalTreatments = ddata.treatments.filter(function filterBasals (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType && t.eventType.indexOf('Temp Basal') > -1;
    });
    if (preserveOrignalTreatments)
      tempbasalTreatments = _.cloneDeep(tempbasalTreatments);
    // @ts-expect-error TS(2339) FIXME: Property 'tempbasalTreatments' does not exist on t... Remove this comment to see the full error message
    ddata.tempbasalTreatments = ddata.processDurations(tempbasalTreatments, false);

    // filter temp target
    var tempTargetTreatments = ddata.treatments.filter(function filterTargets (t) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type 'never... Remove this comment to see the full error message
      return t.eventType && t.eventType.indexOf('Temporary Target') > -1;
    });

    function convertTempTargetTreatmentUnites (_treatments: any) {

      let treatments = _.cloneDeep(_treatments);

      for (let i = 0; i < treatments.length; i++) {

        let t = treatments[i];
        let converted = false;
        
        // if treatment is in mmol, convert to mg/dl
        if (Object.prototype.hasOwnProperty.call(t,'units')) {
          if (t.units == 'mmol') {
            //convert to mgdl
            t.targetTop = t.targetTop * consts.MMOL_TO_MGDL;
            t.targetBottom = t.targetBottom * consts.MMOL_TO_MGDL;
            t.units = 'mg/dl';
            converted = true;
          }
        }

        //if we have a temp target thats below 20, assume its mmol and convert to mgdl for safety.
        if (!converted && (t.targetTop < 20 || t.targetBottom < 20)) {
          t.targetTop = t.targetTop * consts.MMOL_TO_MGDL;
          t.targetBottom = t.targetBottom * consts.MMOL_TO_MGDL;
          t.units = 'mg/dl';
        }
      }
      return treatments;
    }

    if (preserveOrignalTreatments) tempTargetTreatments = _.cloneDeep(tempTargetTreatments);
    tempTargetTreatments = convertTempTargetTreatmentUnites(tempTargetTreatments);
    // @ts-expect-error TS(2339) FIXME: Property 'tempTargetTreatments' does not exist on ... Remove this comment to see the full error message
    ddata.tempTargetTreatments = ddata.processDurations(tempTargetTreatments, false);

  };

  return ddata;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
