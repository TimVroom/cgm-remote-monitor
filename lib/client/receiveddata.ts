'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'TWO_DAYS'.
var TWO_DAYS = 172800000;

function mergeDataUpdate (isDelta: any, cachedDataArray: any, receivedDataArray: any, maxAge: any) {

  function nsArrayDiff (oldArray: any, newArray: any) {
    var knownMills = [];

    var l = oldArray.length;

    for (var i = 0; i < l; i++) {
      /* eslint-disable security/detect-object-injection */ // verified false positive
      if (oldArray[i] !== null) {
        knownMills.push(oldArray[i].mills);
      }
      /* eslint-enable security/detect-object-injection */ // verified false positive
    }

    var result = {
      updates: [],
      new: []
    };

    l = newArray.length;
    for (var j = 0; j < l; j++) {
      /* eslint-disable security/detect-object-injection */ // verified false positive
      var item = newArray[j];
      var millsSeen = knownMills.includes(item.mills);

      if (!millsSeen) {
        // @ts-expect-error TS(2345): Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        result.new.push(item);
      } else {
        // @ts-expect-error TS(2345): Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        result.updates.push(item);
      }
    }
    return result;
  }

  // If there was no delta data, just return the original data
  if (!receivedDataArray) {
    return cachedDataArray || [];
  }

  // If this is not a delta update, replace all data
  if (!isDelta) {
    return receivedDataArray || [];
  }

  // purge old data from cache before updating
  var mAge = (isNaN(maxAge) || maxAge == null) ? TWO_DAYS : maxAge;
  var twoDaysAgo = new Date().getTime() - mAge;

  var i;

  for (i = cachedDataArray.length -1; i >= 0; i--) {
    /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
    var element = cachedDataArray[i];
    if (element !== null && element !== undefined && element.mills <= twoDaysAgo) {
      cachedDataArray.splice(i, 1);
    }
  }

  // If this is delta, calculate the difference, merge and sort
  var diff = nsArrayDiff(cachedDataArray, receivedDataArray);

  // if there's updated elements, replace those in place
  if (diff.updates.length > 0) {
    for (i = 0; i < diff.updates.length; i++) {
      var e = diff.updates[i];
      for (var j = 0; j < cachedDataArray.length; j++) {
        // @ts-expect-error TS(2339): Property 'mills' does not exist on type 'never'.
        if (e.mills == cachedDataArray[j].mills) {
          cachedDataArray.splice(j,1,e);
        }
      }
    }
  }

  // merge new items in
  return cachedDataArray.concat(diff.new).sort(function(a: any, b: any) {
    return a.mills - b.mills;
  });
}

function mergeTreatmentUpdate (isDelta: any, cachedDataArray: any, receivedDataArray: any) {

  // If there was no delta data, just return the original data
  if (!receivedDataArray) {
    return cachedDataArray || [];
  }

  // If this is not a delta update, replace all data
  if (!isDelta) {
    return receivedDataArray || [];
  }

  // check for update, change, remove
  var l = receivedDataArray.length;
  var m = cachedDataArray.length;
  for (var i = 0; i < l; i++) {
    /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
    var no = receivedDataArray[i];
    if (!no.action) {
      cachedDataArray.push(no);
      continue;
    }
    for (var j = 0; j < m; j++) {
      /* eslint-disable security/detect-object-injection */ // verified false positive
      if (no._id === cachedDataArray[j]._id) {
        if (no.action === 'remove') {
          cachedDataArray.splice(j, 1);
          break;
        }
        if (no.action === 'update') {
          delete no.action;
          cachedDataArray.splice(j, 1, no);
          break;
        }
      }
    }
  }

  // If this is delta, calculate the difference, merge and sort
  return cachedDataArray.sort(function(a: any, b: any) {
    return a.mills - b.mills;
  });
}

function receiveDData (received: any, ddata: any, settings: any) {

  if (!received) {
    return;
  }

  // Calculate the diff to existing data and replace as needed
  // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
  ddata.sgvs = mergeDataUpdate(received.delta, ddata.sgvs, received.sgvs);
  // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
  ddata.mbgs = mergeDataUpdate(received.delta, ddata.mbgs, received.mbgs);
  ddata.treatments = mergeTreatmentUpdate(received.delta, ddata.treatments, received.treatments);
  ddata.food = mergeTreatmentUpdate(received.delta, ddata.food, received.food);

  ddata.processTreatments(false);

  // Do some reporting on the console
  // console.log('Total SGV data size', ddata.sgvs.length);
  // console.log('Total treatment data size', ddata.treatments.length);

  if (received.cals) {
    ddata.cals = received.cals;
    ddata.cal = _.last(ddata.cals);
  }

  if (received.devicestatus) {
    if (settings.extendedSettings.devicestatus && settings.extendedSettings.devicestatus.advanced) {
      //only use extra memory in advanced mode
      // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
      ddata.devicestatus = mergeDataUpdate(received.delta, ddata.devicestatus, received.devicestatus);
    } else {
      ddata.devicestatus = received.devicestatus;
    }
  }

  if (received.dbstats && received.dbstats.dataSize) {
    ddata.dbstats = received.dbstats;
  }
}

//expose for tests
// @ts-expect-error TS(2454): Variable 'receiveDData' is used before being assig... Remove this comment to see the full error message
receiveDData.mergeDataUpdate = mergeDataUpdate;
// @ts-expect-error TS(2454): Variable 'receiveDData' is used before being assig... Remove this comment to see the full error message
receiveDData.mergeTreatmentUpdate = mergeTreatmentUpdate;

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = receiveDData;
