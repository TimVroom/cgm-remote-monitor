/* eslint require-atomic-updates: 0 */
'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'request'.
const request = require('supertest');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jwt'.
const jwt = require('jsonwebtoken');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Security of REST API V1', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject');

  this.timeout(30000);

  var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

  // @ts-expect-error TS(2304): Cannot find name 'before'.
  before(function(this: any, done: any) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var api = require('../lib/api/');
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.env = require('../lib/server/env')();
    self.env.settings.authDefaultRoles = 'denied';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(self.env);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.app = require('express')();
    self.app.enable('api');
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(self.env, language).boot(async function booted (ctx: any) {
      self.app.use('/api/v1', api(self.env, ctx));
      self.app.use('/api/v2/authorization', ctx.authorization.endpoints);
      let authResult = await authSubject(ctx.authorization.storage);
      self.subject = authResult.subject;
      self.token = authResult.accessToken;

      done();
    });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Should fail on false token', function(done: any) {
    request(self.app)
      .get('/api/v2/authorization/request/12345')
      .expect(401)
      .end(function(err: any, res: any) {
        console.log(res.error);
        res.error.status.should.equal(401);
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Data load should fail unauthenticated', function(done: any) {
    request(self.app)
      .get('/api/v1/entries.json')
      .expect(401)
      .end(function(err: any, res: any) {
        console.log(res.error);
        res.error.status.should.equal(401);
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Should return a JWT on token', function(done: any) {
    const now = Math.round(Date.now() / 1000) - 1;
    request(self.app)
      .get('/api/v2/authorization/request/' + self.token.read)
      .expect(200)
      .end(function(err: any, res: any) {
        const decodedToken = jwt.decode(res.body.token);
        decodedToken.accessToken.should.equal(self.token.read);
        decodedToken.iat.should.be.aboveOrEqual(now);
        decodedToken.exp.should.be.above(decodedToken.iat);
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Should return a JWT with default roles on broken role token', function(done: any) {
    const now = Math.round(Date.now() / 1000) - 1;
    request(self.app)
      .get('/api/v2/authorization/request/' + self.token.noneSubject)
      .expect(200)
      .end(function(err: any, res: any) {
        const decodedToken = jwt.decode(res.body.token);
        decodedToken.accessToken.should.equal(self.token.noneSubject);
        decodedToken.iat.should.be.aboveOrEqual(now);
        decodedToken.exp.should.be.above(decodedToken.iat);
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Data load should succeed with API SECRET', function(done: any) {
    request(self.app)
      .get('/api/v1/entries.json')
      .set('api-secret', known)
      .expect(200)
      .end(function(err: any, res: any) {
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Data load should succeed with GET token', function(done: any) {
    request(self.app)
      .get('/api/v1/entries.json?token=' + self.token.read)
      .expect(200)
      .end(function(err: any, res: any) {
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Data load should succeed with token in place of a secret', function(done: any) {
    request(self.app)
      .get('/api/v1/entries.json')
      .set('api-secret', self.token.read)
      .expect(200)
      .end(function(err: any, res: any) {
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Data load should succeed with a bearer token', function(done: any) {
    request(self.app)
      .get('/api/v2/authorization/request/' + self.token.read)
      .expect(200)
      .end(function(err: any, res: any) {
        const token = res.body.token;
        request(self.app)
          .get('/api/v1/entries.json')
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .end(function(err: any, res: any) {
            done();
          });
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Data load fail succeed with a false bearer token', function(done: any) {
    request(self.app)
      .get('/api/v1/entries.json')
      .set('Authorization', 'Bearer 1234567890')
      .expect(401)
      .end(function(err: any, res: any) {
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/verifyauth should return OK for Bearer tokens', function (done: any) {
    request(self.app)
    .get('/api/v2/authorization/request/' + self.token.adminAll)
    .expect(200)
    .end(function(err: any, res: any) {
      const token = res.body.token;
      request(self.app)
      .get('/api/v1/verifyauth')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(function(err: any, res: any) {
        res.body.message.message.should.equal('OK');
        res.body.message.isAdmin.should.equal(true);
        done();
      });
    });
  });

});
