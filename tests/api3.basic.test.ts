'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
const request = require('supertest');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Basic REST API3', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , testConst = require('./fixtures/api3/const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
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
    self.instance.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('GET /version', async () => {
    let res = await request(self.app)
      .get('/api/v3/version')
      .expect(200);

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const apiConst = require('../lib/api3/const.json')
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , software = require('../package.json')
      , result = res.body.result;

    res.body.status.should.equal(200);
    result.version.should.equal(software.version);
    result.apiVersion.should.equal(apiConst.API3_VERSION);
    result.srvDate.should.be.within(testConst.YEAR_2019, testConst.YEAR_2050);
  });

});

