'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('pushnotify', function ( ) {

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('send a pushover alarm, but only 1 time', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    var ctx = {};

    // @ts-expect-error TS(2339) FIXME: Property 'levels' does not exist on type '{}'.
    ctx.levels = levels;
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications = require('../lib/notifications')(env, ctx);

    var notify = {
      title: 'Warning, this is a test!'
      , message: 'details details details details'
      , level: levels.WARN
      , pushoverSound: 'climb'
      , plugin: {name: 'test'}
    };

    // @ts-expect-error TS(2339) FIXME: Property 'pushover' does not exist on type '{}'.
    ctx.pushover = {
      PRIORITY_NORMAL: 0
      , PRIORITY_EMERGENCY: 2
      , send: function mockedSend (notify2: any, callback: any) {
          should.deepEqual(notify, notify2);
          callback(null, JSON.stringify({receipt: 'abcd12345'}));
          done();
        }
    };

    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify = require('../lib/server/pushnotify')(env, ctx);

    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify.emitNotification(notify);

    //call again, but should be deduped, or fail with 'done() called multiple times'
    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify.emitNotification(notify);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('send a pushover notification, but only 1 time', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    var ctx = {};
    // @ts-expect-error TS(2339) FIXME: Property 'levels' does not exist on type '{}'.
    ctx.levels = levels;
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications = require('../lib/notifications')(env, ctx);

    var notify = {
      title: 'Sent from a test'
      , message: 'details details details details'
      , level: levels.INFO
      , plugin: {name: 'test'}
    };

    // @ts-expect-error TS(2339) FIXME: Property 'pushover' does not exist on type '{}'.
    ctx.pushover = {
      PRIORITY_NORMAL: 0
      , PRIORITY_EMERGENCY: 2
      , send: function mockedSend (notify2: any, callback: any) {
        should.deepEqual(notify, notify2);
          callback(null, JSON.stringify({}));
          done();
        }
    };

    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify = require('../lib/server/pushnotify')(env, ctx);

    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify.emitNotification(notify);

    //call again, but should be deduped, or fail with 'done() called multiple times'
    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify.emitNotification(notify);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('send a pushover alarm, and then cancel', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    var ctx = {};
    // @ts-expect-error TS(2339) FIXME: Property 'levels' does not exist on type '{}'.
    ctx.levels = levels;

    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications = require('../lib/notifications')(env, ctx);

    var notify = {
      title: 'Warning, this is a test!'
      , message: 'details details details details'
      , level: levels.WARN
      , pushoverSound: 'climb'
      , plugin: {name: 'test'}
    };

    // @ts-expect-error TS(2339) FIXME: Property 'pushover' does not exist on type '{}'.
    ctx.pushover = {
      PRIORITY_NORMAL: 0
      , PRIORITY_EMERGENCY: 2
      , send: function mockedSend (notify2: any, callback: any) {
        should.deepEqual(notify, notify2);
        callback(null, JSON.stringify({receipt: 'abcd12345'}));
      }
      , cancelWithReceipt: function mockedCancel (receipt: any) {
        receipt.should.equal('abcd12345');
        done();
      }
    };

    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify = require('../lib/server/pushnotify')(env, ctx);

    //first send the warning
    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify.emitNotification(notify);

    //then pretend is was acked from the web
    // @ts-expect-error TS(2339) FIXME: Property 'pushnotify' does not exist on type '{}'.
    ctx.pushnotify.emitNotification({clear: true});

  });



});
