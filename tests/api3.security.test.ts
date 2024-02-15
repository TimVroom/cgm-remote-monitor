/* eslint require-atomic-updates: 0 */
'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
const request = require('supertest')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('../lib/api3/const.json')
  ;
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Security of REST API3', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    ;

  this.timeout(30000);


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.http = await instance.create({ useHttps: false });
    self.https = await instance.create({ });

    let authResult = await authSubject(self.https.ctx.authorization.storage, [
      'denied',
      'read',
      'delete'
    ], self.https.app);
    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(() => {
    self.http.ctx.bus.teardown();
    self.https.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require token', async () => {
    let res = await request(self.https.baseUrl)
      .get('/api/v3/test')
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal(apiConst.MSG.HTTP_401_MISSING_OR_BAD_TOKEN);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require valid token', async () => {
    let res = await request(self.https.baseUrl)
      .get('/api/v3/test')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal(apiConst.MSG.HTTP_401_BAD_TOKEN);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should deny subject denied', async () => {
    let res = await request(self.https.baseUrl)
      .get('/api/v3/test')
      .set('Authorization', `Bearer ${self.jwt.denied}`)
      .expect(403);

    res.body.status.should.equal(403);
    res.body.message.should.equal(apiConst.MSG.HTTP_403_MISSING_PERMISSION.replace('{0}', 'api:entries:read'));
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow subject with read permission', async () => {
    await request(self.https.baseUrl)
      .get('/api/v3/test', self.jwt.read)
      .set('Authorization', `Bearer ${self.jwt.read}`)
      .expect(200);
  });


});
