'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Verifyauth REST api', function(this: any) {
  var self = this;
  
  this.timeout(10000);
  var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api = require('../lib/api/');
  // @ts-expect-error TS(2304): Cannot find name 'before'.
  before(function(this: any, done: any) {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.env = require('../lib/server/env')( );
    self.env.settings.authDefaultRoles = 'denied';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(self.env);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.app = require('express')( );
    self.app.enable('api');
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(self.env, language).boot(function booted (ctx: any) {
      self.app.use('/api', api(self.env, ctx));
      done();
    });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/verifyauth should return UNAUTHORIZED', function (done: any) {
    request(self.app)
      .get('/api/verifyauth')
      .expect(200)
      .end(function(err: any, res: any) {
        res.body.message.message.should.equal('UNAUTHORIZED');
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/verifyauth should return OK', function (done: any) {
    request(self.app)
      .get('/api/verifyauth')
      .set('api-secret', known || '')
      .expect(200)
      .end(function(err: any, res: any) {
        res.body.message.message.should.equal('OK');
        done();
      });
  });


});

