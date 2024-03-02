'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('levels', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var levels = require('../lib/levels');

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('have levels', function () {
    levels.URGENT.should.equal(2);
    levels.WARN.should.equal(1);
    levels.INFO.should.equal(0);
    levels.LOW.should.equal(-1);
    levels.LOWEST.should.equal(-2);
    levels.NONE.should.equal(-3);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('convert to display', function () {
    levels.toDisplay(levels.URGENT).should.equal('Urgent');
    levels.toDisplay(levels.WARN).should.equal('Warning');
    levels.toDisplay(levels.INFO).should.equal('Info');
    levels.toDisplay(levels.LOW).should.equal('Low');
    levels.toDisplay(levels.LOWEST).should.equal('Lowest');
    levels.toDisplay(levels.NONE).should.equal('None');
    levels.toDisplay(42).should.equal('Unknown');
    levels.toDisplay(99).should.equal('Unknown');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('convert to lowercase', function () {
    levels.toLowerCase(levels.URGENT).should.equal('urgent');
    levels.toLowerCase(levels.WARN).should.equal('warning');
    levels.toLowerCase(levels.INFO).should.equal('info');
    levels.toLowerCase(levels.LOW).should.equal('low');
    levels.toLowerCase(levels.LOWEST).should.equal('lowest');
    levels.toLowerCase(levels.NONE).should.equal('none');
    levels.toLowerCase(42).should.equal('unknown');
    levels.toLowerCase(99).should.equal('unknown');
  });

});
