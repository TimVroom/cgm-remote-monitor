'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('utils', function ( ) {

  const ctx = helper.getctx();
  
  ctx.settings = {
    alarmTimeagoUrgentMins: 30
    , alarmTimeagoWarnMins: 15
  };

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var utils = require('../lib/utils')(ctx);

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('format numbers', function () {
    utils.toFixed(5.499999999).should.equal('5.50');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('format numbers short', function () {
    var undef;
    utils.toRoundedStr(3.345, 2).should.equal('3.35');
    utils.toRoundedStr(5.499999999, 0).should.equal('5');
    utils.toRoundedStr(5.499999999, 1).should.equal('5.5');
    utils.toRoundedStr(5.499999999, 3).should.equal('5.5');
    utils.toRoundedStr(123.45, -2).should.equal('100');
    utils.toRoundedStr(-0.001, 2).should.equal('0');
    utils.toRoundedStr(-2.47, 1).should.equal('-2.5');
    utils.toRoundedStr(-2.44, 1).should.equal('-2.4');

    utils.toRoundedStr(undef, 2).should.equal('0');
    utils.toRoundedStr(null, 2).should.equal('0');
    utils.toRoundedStr('text', 2).should.equal('0');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('merge date and time', function () {
    var result = utils.mergeInputTime('22:35', '2015-07-14');
    result.hours().should.equal(22);
    result.minutes().should.equal(35);
    result.year().should.equal(2015);
    result.format('MMM').should.equal('Jul');
    result.date().should.equal(14);
  });

});
