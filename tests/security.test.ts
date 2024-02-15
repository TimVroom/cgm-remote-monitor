'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'request'.
const request = require('supertest');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'should'.
const should = require('should');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'language'.
const language = require('../lib/language')();
//const io = require('socket.io-client');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API_SECRET', function(this: any) {
  var api: any;
  var scope = this;
  var websocket;
  var app;
  var server;
  var listener: any;

  this.timeout(7000);

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(function(done: any) {
    if (listener) {
      listener.close(done);
    }
    done();
  });

  // @ts-expect-error TS(2304): Cannot find name 'after'.
  after(function(done: any) {
    if (listener) {
      listener.close(done);
    }
    done();
  });

  function setup_app (env: any, fn: any) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    api = require('../lib/api/');
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(env, language).boot(function booted (ctx: any) {
      ctx.app = api(env, ctx);
      scope.app = ctx.app;
      scope.entries = ctx.entries;
      fn(ctx);
    });
  }

  function setup_big_app (env: any, fn: any) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    api = require('../lib/api/');
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(env, language).boot(function booted (ctx: any) {
      ctx.app = api(env, ctx);
      scope.app = ctx.app;
      scope.entries = ctx.entries;

      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      app = require('../lib/server/app')(env, ctx);
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      server = require('http').createServer(app);
      listener = server.listen(1337, 'localhost');
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      websocket = require('../lib/server/websocket')(env, ctx, server);

      fn(ctx);
    });
  }

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should fail when unauthorized', function(done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();

    env.enclave.isApiKey(known).should.equal(true);

    setup_app(env, function(ctx: any) {
      ctx.app.enabled('api').should.equal(true);
      ping_status(ctx.app, again);

      function again () {
        ctx.app.api_secret = '';
        ping_authorized_endpoint(ctx.app, 401, done);
      }
    });

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should work fine set', function(done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    env.enclave.isApiKey(known).should.equal(true);
    setup_app(env, function(ctx: any) {
      ctx.app.enabled('api').should.equal(true);
      ping_status(ctx.app, again);

      function again () {
        ctx.app.api_secret = known;
        ping_authorized_endpoint(ctx.app, 200, done);
      }
    });

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not work short', function() {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'tooshort';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    should.not.exist(env.api_secret);
    env.err[0].desc.should.startWith('API_SECRET should be at least');
  });

  function ping_status (app: any, fn: any) {
    request(app)
      .get('/status.json')
      .expect(200)
      .end(function(err: any, res: any) {
        res.body.status.should.equal('ok');
        fn();
      });
  }

  function ping_authorized_endpoint (app: any, fails: any, fn: any) {
    request(app)
      .get('/experiments/test')
      .set('api-secret', app.api_secret || '')
      .expect(fails)
      .end(function(err: any, res: any) {
        if (fails < 400) {
          res.body.status.should.equal('ok');
        }
        fn();
      });
  }

  /*
  it('socket IO should connect', function(done) {

    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    process.env.API_SECRET = 'this is my long pass phrase';
    var env = require('../lib/server/env')();

    setup_big_app(env, function(ctx) {

      const socket2 = io.connect('ws://localhost:1337/');

      socket2.on('connect', function() {
        console.log('Socket 2 authorizing');
        socket2.emit("authorize", {
          secret: known
        });
      });

      socket2.on('disconnect', function() {
        //socket.emit("authorize");
        console.log('Client 2 disconnected');
        done();
      });

      socket2.on('connected', function(msg) {
        console.log('Connected');

        // Disconnect both client connections
        socket2.disconnect();

        const socket = io.connect('ws://localhost:1337/');

        socket.on('connect', function() {
          console.log('Socket 1 authorizing');
          socket.emit("authorize");
        });

        socket.on('disconnect', function() {
          //socket.emit("authorize");
          console.log('Client 1 disconnected');
          done();
        });

      });

    });

  });
  */

});
