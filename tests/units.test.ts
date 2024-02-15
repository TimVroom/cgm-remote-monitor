'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('units', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var units = require('../lib/units')();

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should convert 99 to 5.5', function () {
    units.mgdlToMMOL(99).should.equal('5.5');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should convert 180 to 10.0', function () {
    units.mgdlToMMOL(180).should.equal('10.0');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should convert 5.5 to 99', function () {
    units.mmolToMgdl(5.5).should.equal(99);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should convert 10.0 to 180', function () {
    units.mmolToMgdl(10.0).should.equal(180);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should convert 5.5 mmol and then convert back to 5.5 mmol', function () {
    units.mgdlToMMOL(units.mmolToMgdl(5.5)).should.equal('5.5');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should convert 99 mgdl and then convert back to 99 mgdl', function () {
    units.mmolToMgdl(units.mgdlToMMOL(99)).should.equal(99);
  });

});
