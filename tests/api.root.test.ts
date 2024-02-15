'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
const request = require('supertest');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Root REST API', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , semver = require('semver')
    ;

  this.timeout(15000);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({});
    self.app = self.instance.app;
    self.env = self.instance.env;
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function after () {
    self.instance.server.close();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('GET /api/versions', async () => {
    let res = await request(self.app)
      .get('/api/versions')
      .expect(200);

    res.body.length.should.be.aboveOrEqual(3);
    res.body.forEach((obj: any) => {
      const fields = Object.getOwnPropertyNames(obj);
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'string[]... Remove this comment to see the full error message
      fields.sort().should.be.eql(['url', 'version']);

      semver.valid(obj.version).should.be.ok();
      obj.url.should.startWith('/api');
    });
  });

});

