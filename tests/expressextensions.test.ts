'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var extensionsMiddleware = require('../lib/middleware/express-extension-to-accept');

var acceptJsonRequests = extensionsMiddleware(['json']);

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Express extension middleware', function ( ) {

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Valid json request should be given accept header for application/json', function () {
    var entriesRequest = {
      path: '/api/v1/entries.json',
      url: '/api/v1/entries.json',
      headers: {}
    };

    acceptJsonRequests(entriesRequest, {}, () => {});
    // @ts-expect-error TS(2339) FIXME: Property 'accept' does not exist on type '{}'.
    entriesRequest.headers.accept.should.equal('application/json');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Invalid json request should NOT be given accept header', function () {
    var invalidEntriesRequest = {
      path: '/api/v1/entriesXjson',
      url: '/api/v1/entriesXjson',
      headers: {}
    };

    acceptJsonRequests(invalidEntriesRequest, {}, () => {});
    // @ts-expect-error TS(2339) FIXME: Property 'accept' does not exist on type '{}'.
    should(invalidEntriesRequest.headers.accept).not.be.ok;
  });

});
