'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('times', function ( ) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var times = require('../lib/times');

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('hours to mins, secs, and msecs', function () {
    times.hour().mins.should.equal(60);
    times.hour().secs.should.equal(3600);
    times.hour().msecs.should.equal(3600000);
    times.hours(3).mins.should.equal(180);
    times.hours(3).secs.should.equal(10800);
    times.hours(3).msecs.should.equal(10800000);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('mins to secs and msecs', function () {
    times.min().secs.should.equal(60);
    times.min().msecs.should.equal(60000);
    times.mins(2).secs.should.equal(120);
    times.mins(2).msecs.should.equal(120000);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('secs as msecs', function () {
    times.sec().msecs.should.equal(1000);
    times.secs(15).msecs.should.equal(15000);
  });


});
