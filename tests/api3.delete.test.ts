/* eslint require-atomic-updates: 0 */
'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API3 UPDATE', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    ;

  self.timeout(15000);


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.url = '/api/v3/treatments';

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'delete'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
    self.cache = self.instance.cacheMonitor;
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(() => {
    self.instance.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2552) FIXME: Cannot find name 'beforeEach'. Did you mean '_forE... Remove this comment to see the full error message
  beforeEach(() => {
    self.cache.clear();
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    self.cache.shouldBeEmpty();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require authentication', async () => {
    let res = await self.instance.delete(`${self.url}/FAKE_IDENTIFIER`)
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal('Missing or bad access token or JWT');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing collection', async () => {
    let res = await self.instance.delete(`/api/v3/NOT_EXIST`, self.jwt.delete)
      .send(self.validDoc)
      .expect(404);

    res.body.status.should.equal(404);
  });

});

