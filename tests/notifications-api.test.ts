'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Stream = require('stream');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var notificationsAPI = require('../lib/api/notifications-api');

function examplePlugin () {}

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Notifications API', function ( ) {

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('ack notifications', function (done: any) {

    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.enclave.isApiKey(known).should.equal(true);
    env.testMode = true;

    var ctx = {
      bus: new Stream
      , ddata: {
        lastUpdated: Date.now()
      }
      , store: {
        collection: function ( ) {
          return { };
        }
      }
      , levels: levels
    };

    // @ts-expect-error TS(2339) FIXME: Property 'authorization' does not exist on type '{... Remove this comment to see the full error message
    ctx.authorization = require('../lib/authorization')(env, ctx);

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var notifications = require('../lib/notifications')(env, ctx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications = notifications;

    //start fresh to we don't pick up other notifications
    ctx.bus = new Stream;
    //if notification doesn't get called test will time out
    ctx.bus.on('notification', function callback (notify: any) {
      if (notify.clear) {
        done();
      }
    });

    var exampleWarn = {
      title: 'test'
      , message: 'testing'
      , level: levels.WARN
      , plugin: examplePlugin
    };

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.findHighestAlarm().should.equal(exampleWarn);
    notifications.process();

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var app = require('express')();
    app.enable('api');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var wares = require('../lib/middleware/')(env);
    app.use('/', notificationsAPI(app, wares, ctx));

    function makeRequest () {
      request(app)
        .get('/notifications/ack?level=1')
        .set('api-secret', known || '')
        .expect(200)
        .end(function (err: any) {
          should.not.exist(err);
          if (err) {
            console.error(err);
          }
        });
    }

    makeRequest();

    //2nd call should have no effect, done should NOT be called again
    makeRequest();
  });
});