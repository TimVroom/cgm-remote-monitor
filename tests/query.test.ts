'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
var moment = require('moment');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('query', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var query = require('../lib/server/query');

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should provide default options', function ( ) {
    var opts = query();

    var low = moment().utc().subtract(4, 'days').subtract(1, 'minutes').format();
    var high = moment().utc().subtract(4, 'days').add(1, 'minutes').format();

    opts.date['$gte'].should.be.greaterThan(low);
    opts.date['$gte'].should.be.lessThan(high);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not override non default options', function ( ) {
    var opts = query({}, {
      deltaAgo: 2 * 24 * 60 * 60000,
      dateField: 'created_at'
    });

    var low = moment().utc().subtract(2, 'days').subtract(1, 'minutes').format();
    var high = moment().utc().subtract(2, 'days').add(1, 'minutes').format();

    opts.created_at['$gte'].should.greaterThan(low);
    opts.created_at['$gte'].should.lessThan(high);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not enforce date filter if query includes id', function ( ) {
    var opts = query({ find: { _id: 1234 } });

    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type '"string"... Remove this comment to see the full error message
    (typeof opts.date).should.equal('undefined')
  });
}); 
