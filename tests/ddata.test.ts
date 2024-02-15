
'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');


// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ddata', function ( ) {
  // var sandbox = require('../lib/sandbox')();
  // var env = require('../lib/server/env')();
  var ctx = {};
  // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
  ctx.ddata = require('../lib/data/ddata')();

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should be a module', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var libddata = require('../lib/data/ddata');
    var ddata = libddata( );
    should.exist(ddata);
    should.exist(libddata);
    should.exist(libddata.call);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ddata = ctx.ddata.clone( );
    should.exist(ddata);
    done( );
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has #clone( )', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.treatments);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.sgvs);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.mbgs);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.cals);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.profiles);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.devicestatus);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    should.exist(ctx.ddata.lastUpdated);
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    var ddata = ctx.ddata.clone( );
    should.exist(ddata);
    should.exist(ddata.treatments);
    should.exist(ddata.sgvs);
    should.exist(ddata.mbgs);
    should.exist(ddata.cals);
    should.exist(ddata.profiles);
    should.exist(ddata.devicestatus);
    should.exist(ddata.lastUpdated);
    done( );
  });

  // TODO: ensure partition function gets called via:
  // Properties
  // * ddata.devicestatus
  // * ddata.mbgs
  // * ddata.sgvs
  // * ddata.treatments
  // * ddata.profiles
  // * ddata.lastUpdated
  // Methods
  // * ddata.processTreatments
  // * ddata.processDurations
  // * ddata.clone
  // * ddata.split
 

});

