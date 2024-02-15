'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// This test is included just so we have an easy to template to intentionally cause
// builds to fail

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('fail', function ( ) {

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not fail', function () {
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'true'.
    true.should.equal(true);
  });

});
