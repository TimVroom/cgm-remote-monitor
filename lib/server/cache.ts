'use strict';

/* This is a simple cache intended to reduce the amount of load
 * Nightscout puts on MongoDB. The cache is based on identifying
 * elements based on the MongoDB _id field and implements simple
 * semantics for adding data to the cache in the runtime, intended
 * to be accessed by the persistence layer as data is inserted, updated
 * or deleted, as well as the periodic dataloader, which polls Mongo
 * for new inserts.
 *
 * Longer term, the cache is planned to allow skipping the Mongo polls
 * altogether.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'constants'... Remove this comment to see the full error message
const constants = require('../constants');

function cache (env: any, ctx: any) {

  const data = {
    treatments: []
    , devicestatus: []
    , entries: []
  };

  const retentionPeriods = {
    treatments: constants.ONE_HOUR * 60
    , devicestatus: env.extendedSettings.devicestatus && env.extendedSettings.devicestatus.days && env.extendedSettings.devicestatus.days == 2 ? constants.TWO_DAYS : constants.ONE_DAY
    , entries: constants.TWO_DAYS
  };

  function getObjectAge(object: any) {
    let age = object.mills || object.date;
    if (isNaN(age) && object.created_at) age = Date.parse(object.created_at).valueOf();
    return age;
  }

  function mergeCacheArrays (oldData: any, newData: any, retentionPeriod: any) {

    const ageLimit = Date.now() - retentionPeriod;

    var filteredOld = filterForAge(oldData, ageLimit);
    var filteredNew = filterForAge(newData, ageLimit);

    const merged = ctx.ddata.idMergePreferNew(filteredOld, filteredNew);

    return _.sortBy(merged, function(item: any) {
      const age = getObjectAge(item);
      return -age;
    });

    function filterForAge(data: any, ageLimit: any) {
      return _.filter(data, function hasId(object: any) {
        const hasId = !_.isEmpty(object._id);
        const age = getObjectAge(object);
        const isFresh = age >= ageLimit;
        return isFresh && hasId;
      });
    }

  }

  // @ts-expect-error TS(2339): Property 'isEmpty' does not exist on type '{ treat... Remove this comment to see the full error message
  data.isEmpty = (datatype: any) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return data[datatype].length < 20;
  }

  // @ts-expect-error TS(2339): Property 'getData' does not exist on type '{ treat... Remove this comment to see the full error message
  data.getData = (datatype: any) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return _.cloneDeep(data[datatype]);
  }

  // @ts-expect-error TS(2339): Property 'insertData' does not exist on type '{ tr... Remove this comment to see the full error message
  data.insertData = (datatype: any, newData: any) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    data[datatype] = mergeCacheArrays(data[datatype], newData, retentionPeriods[datatype]);
    // @ts-expect-error TS(2339): Property 'getData' does not exist on type '{ treat... Remove this comment to see the full error message
    return data.getData(datatype);
  }

  function dataChanged (operation: any) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!data[operation.type]) return;

    if (operation.op == 'remove') {
      // if multiple items were deleted, flush entire cache
      if (!operation.changes) {
        data.treatments = [];
        data.devicestatus = [];
        data.entries = [];
      } else {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        removeFromArray(data[operation.type], operation.changes);
      }
    }

    if (operation.op == 'update') {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      data[operation.type] = mergeCacheArrays(data[operation.type], operation.changes, retentionPeriods[operation.type]);
    }
  }

  ctx.bus.on('data-update', dataChanged);

  function removeFromArray (array: any, id: any) {
    for (let i = 0; i < array.length; i++) {
      const o = array[i];
      if (o._id == id) {
        //console.log('Deleting object from cache', id);
        array.splice(i, 1);
        break;
      }
    }
  }

  return data;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = cache;
