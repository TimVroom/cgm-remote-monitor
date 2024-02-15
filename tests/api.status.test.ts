'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Status REST api', function ( ) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api = require('../lib/api/');
  // @ts-expect-error TS(2304): Cannot find name 'before'.
  before(function(this: any, done: any) {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.settings.enable = ['careportal', 'rawbg'];
    env.settings.authDefaultRoles = 'readable';
    env.api_secret = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(env);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.app = require('express')( );
    this.app.enable('api');
    var self = this;
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(env, language).boot(function booted (ctx: any) {
      self.app.use('/api', api(env, ctx));
      done();
    });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/status.json', function(this: any, done: any) {
    request(this.app)
      .get('/api/status.json')
      .expect(200)
      .end(function (err: any, res: any)  {
        res.body.apiEnabled.should.equal(true);
        res.body.careportalEnabled.should.equal(true);
        res.body.settings.enable.length.should.equal(2);
        res.body.settings.enable.should.containEql('careportal');
        res.body.settings.enable.should.containEql('rawbg');
        done( );
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/status.html', function(this: any, done: any) {
    request(this.app)
      .get('/api/status.html')
      .end(function(err: any, res: any) {
        res.type.should.equal('text/html');
        res.statusCode.should.equal(200);
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/status.svg', function(this: any, done: any) {
    request(this.app)
      .get('/api/status.svg')
      .end(function(err: any, res: any) {
        res.statusCode.should.equal(302);
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/status.txt', function(this: any, done: any) {
    request(this.app)
      .get('/api/status.txt')
      .expect(200, 'STATUS OK')
      .end(function(err: any, res: any) {
        res.type.should.equal('text/plain');
        res.statusCode.should.equal(200);
        done();
      });
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/status.js', function(this: any, done: any) {
    request(this.app)
      .get('/api/status.js')
      .end(function(err: any, res: any) {
        res.type.should.equal('application/javascript');
        res.statusCode.should.equal(200);
        res.text.should.startWith('this.serverSettings =');
        done();
      });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/status.png', function(this: any, done: any) {
    request(this.app)
      .get('/api/status.png')
      .end(function(err: any, res: any) {
        res.headers.location.should.equal('http://img.shields.io/badge/Nightscout-OK-green.png');
        res.statusCode.should.equal(302);
        done();
      });
  });


});

