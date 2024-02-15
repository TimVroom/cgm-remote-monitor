'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('verifyauth', function(this: any) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api = require('../lib/api/');

  this.timeout(25000);

  var scope = this;
  function setup_app (env: any, fn: any) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(env, language).boot(function booted (ctx: any) {
      ctx.app = api(env, ctx);
      scope.app = ctx.app;
      fn(ctx);
    });
  }

  // @ts-expect-error TS(2304): Cannot find name 'after'.
  after(function (done: any) {
    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should return defaults when called without secret', function (done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    var known512 = '8c8743d38cbe00debe4b3ba8d0ffbb85e4716c982a61bb9e57bab203178e3718b2965831c1a5e42b9da16f082fdf8a6cecf993b49ed67e3a8b1cd475885d8070';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.enclave.isApiKey(known).should.equal(true);
    env.enclave.isApiKey(known512).should.equal(true);
    setup_app(env, function (ctx: any) {
      ctx.app.enabled('api').should.equal(true);
      ctx.app.api_secret = '';
      // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
      ping_authorized_endpoint(ctx.app, 200, done);
    });
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should fail when calling with wrong secret', function (done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.enclave.isApiKey(known).should.equal(true);
    setup_app(env, function (ctx: any) {
      ctx.app.enabled('api').should.equal(true);
      ctx.app.api_secret = 'wrong secret';

      function check(res: any) {
        res.body.message.message.should.equal('UNAUTHORIZED');
        done();
      }

      ping_authorized_endpoint(ctx.app, 200, check, true);
    });
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should fail unauthorized and delay subsequent attempts', function (done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.enclave.isApiKey(known).should.equal(true);
    setup_app(env, function (ctx: any) {
      ctx.app.enabled('api').should.equal(true);
      ctx.app.api_secret = 'wrong secret';
      const time = Date.now();

      function checkTimer(res: any) {
        res.body.message.message.should.equal('UNAUTHORIZED');
        const delta = Date.now() - time;
        // @ts-expect-error TS(2339): Property 'should' does not exist on type 'number'.
        delta.should.be.greaterThan(49);
        done();
      }

      function pingAgain (res: any) {
        res.body.message.message.should.equal('UNAUTHORIZED');
        ping_authorized_endpoint(ctx.app, 200, checkTimer, true);
      }

      ping_authorized_endpoint(ctx.app, 200, pingAgain, true);
    });
  });



  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should work fine authorized', function (done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.enclave.isApiKey(known).should.equal(true);
    setup_app(env, function (ctx: any) {
      ctx.app.enabled('api').should.equal(true);
      ctx.app.api_secret = env.api_secret;
      // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
      ping_authorized_endpoint(ctx.app, 200, done);
    });

  });


  function ping_authorized_endpoint (app: any, httpResponse: any, fn: any, passres: any) {
      request(app)
        .get('/verifyauth')
        .set('api-secret', app.api_secret || '')
        .expect(httpResponse)
        .end(function (err: any, res: any)  {
          res.body.status.should.equal(httpResponse);
          if (passres) { fn(res); } else {  fn(); }
          // console.log('err', err, 'res', res);
        });
  }

});

