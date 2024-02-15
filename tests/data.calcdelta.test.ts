'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var calcDelta = require('../lib/data/calcdelta');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Data', function ( ) {

  var now = Date.now();
  var before = now - (5 * 60 * 1000);

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should return original data if there are no changes', function() {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var ddata = require('../lib/data/ddata')();
    ddata.sgvs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    var delta = calcDelta(ddata,ddata);
    delta.should.equal(ddata);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('adding one sgv record should return delta with one sgv', function() {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var ddata = require('../lib/data/ddata')();
    ddata.sgvs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    var newData = ddata.clone();
    newData.sgvs = [{mgdl: 100, mills:101},{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    var delta = calcDelta(ddata,newData);
    delta.delta.should.equal(true);
    delta.sgvs.length.should.equal(1);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should update sgv if changed', function() {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var ddata = require('../lib/data/ddata')();
    ddata.sgvs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    var newData = ddata.clone();
    newData.sgvs = [{mgdl: 110, mills: before},{mgdl: 100, mills: now}];
    var delta = calcDelta(ddata,newData);
    delta.delta.should.equal(true);
    delta.sgvs.length.should.equal(1);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('adding one treatment record should return delta with one treatment', function() {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var ddata = require('../lib/data/ddata')();
    ddata.treatments = [{_id: 'someid_1', mgdl: 100, mills: before},{_id: 'someid_2', mgdl: 100, mills: now}];
    var newData = ddata.clone();
    newData.treatments = [{_id: 'someid_1', mgdl: 100, mills: before},{_id: 'someid_2', mgdl: 100, mills: now},{_id: 'someid_3', mgdl: 100, mills:98}];
    var delta = calcDelta(ddata,newData);
    delta.delta.should.equal(true);
    delta.treatments.length.should.equal(1);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('changes to treatments, mbgs and cals should be calculated even if sgvs is not changed', function() {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var ddata = require('../lib/data/ddata')();
    ddata.sgvs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    ddata.treatments = [{_id: 'someid_1', mgdl: 100, mills: before},{_id: 'someid_2', mgdl: 100, mills: now}];
    ddata.mbgs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    ddata.cals = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    var newData = ddata.clone();
    newData.sgvs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    newData.treatments = [{_id: 'someid_3', mgdl: 100, mills:101},{_id: 'someid_1', mgdl: 100, mills: before},{_id: 'someid_2', mgdl: 100, mills: now}];
    newData.mbgs = [{mgdl: 100, mills:101},{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    newData.cals = [{mgdl: 100, mills:101},{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    var delta = calcDelta(ddata,newData);
    delta.delta.should.equal(true);
    delta.treatments.length.should.equal(1);
    delta.mbgs.length.should.equal(1);
    delta.cals.length.should.equal(1);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('delta should include profile', function() {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var ddata = require('../lib/data/ddata')();
    ddata.sgvs = [{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    ddata.profiles = {foo:true};
    var newData = ddata.clone();
    newData.sgvs = [{mgdl: 100, mills:101},{mgdl: 100, mills: before},{mgdl: 100, mills: now}];
    newData.profiles = {bar:true};
    var delta = calcDelta(ddata,newData);
    delta.profiles.bar.should.equal(true);
  });

});