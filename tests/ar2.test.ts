'use strict';

import 'should';
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'FIVE_MINS'... Remove this comment to see the full error message
const FIVE_MINS = 300000;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'SIX_MINS'.
const SIX_MINS = 360000;

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ar2', function ( ) {
  var ctx = helper.getctx();

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var ar2 = require('../lib/plugins/ar2')(ctx);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var bgnow = require('../lib/plugins/bgnow')(ctx);

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();

  var now = Date.now();
  var before = now - FIVE_MINS;

  function prepareSandbox(base: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = base || require('../lib/sandbox')().serverInit(env, ctx);
    bgnow.setProperties(sbx);
    ar2.setProperties(sbx);
    return sbx;
  }

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should plot a cone', function () {
    ctx.ddata.sgvs = [{mgdl: 100, mills: before}, {mgdl: 105, mills: now}];
    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    var cone = ar2.forecastCone(sbx);
    cone.length.should.equal(26);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should plot a line if coneFactor is 0', function () {
    ctx.ddata.sgvs = [{mgdl: 100, mills: before}, {mgdl: 105, mills: now}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env0 = require('../lib/server/env')();
    env0.extendedSettings = { ar2: { coneFactor: 0 } };
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env0, ctx).withExtendedSettings(ar2);
    bgnow.setProperties(sbx);
    var cone = ar2.forecastCone(sbx);
    cone.length.should.equal(13);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not trigger an alarm when in range', function (done: any) {
    ctx.notifications.initRequests();
    ctx.ddata.sgvs = [{mgdl: 100, mills: before}, {mgdl: 105, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    ar2.checkNotifications(sbx);
    should.not.exist(ctx.notifications.findHighestAlarm());

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning when going above target', function (done: any) {
    ctx.notifications.initRequests();
    ctx.ddata.sgvs = [{mgdl: 150, mills: before}, {mgdl: 170, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    sbx.offerProperty('iob', function setFakeIOB() {
      return {displayLine: 'IOB: 1.25U'};
    });
    sbx.offerProperty('direction', function setFakeDirection() {
      return {value: 'FortyFiveUp', label: '↗', entity: '&#8599;'};
    });
    ar2.checkNotifications(sbx);
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(helper.ctx.levels.WARN);
    highest.title.should.equal('Warning, HIGH predicted');
    highest.message.should.equal('BG Now: 170 +20 ↗ mg/dl\nBG 15m: 206 mg/dl\nIOB: 1.25U');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a urgent alarm when going high fast', function (done: any) {
    ctx.notifications.initRequests();
    ctx.ddata.sgvs = [{mgdl: 140, mills: before}, {mgdl: 200, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    ar2.checkNotifications(sbx);
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(helper.ctx.levels.URGENT);
    highest.title.should.equal('Urgent, HIGH');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning when below target', function (done: any) {
    ctx.notifications.initRequests();
    ctx.ddata.sgvs = [{mgdl: 90, mills: before}, {mgdl: 80, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    ar2.checkNotifications(sbx);
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(helper.ctx.levels.WARN);
    highest.title.should.equal('Warning, LOW');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning when almost below target', function (done: any) {
    ctx.notifications.initRequests();
    ctx.ddata.sgvs = [{mgdl: 90, mills: before}, {mgdl: 83, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    ar2.checkNotifications(sbx);
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(helper.ctx.levels.WARN);
    highest.title.should.equal('Warning, LOW predicted');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a urgent alarm when falling fast', function (done: any) {
    ctx.notifications.initRequests();
    ctx.ddata.sgvs = [{mgdl: 120, mills: before}, {mgdl: 85, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    ar2.checkNotifications(sbx);
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(helper.ctx.levels.URGENT);
    highest.title.should.equal('Urgent, LOW predicted');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning alarm by interpolating when more than 5mins apart', function (done: any) {
    ctx.notifications.initRequests();

    //same as previous test but prev is 10 mins ago, so delta isn't enough to trigger an urgent alarm
    ctx.ddata.sgvs = [{mgdl: 120, mills: before - SIX_MINS}, {mgdl: 85, mills: now}];

    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();
    ar2.checkNotifications(sbx);
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(helper.ctx.levels.WARN);
    highest.title.should.equal('Warning, LOW predicted');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function (done: any) {
     var now = Date.now();
     var before = now - FIVE_MINS;

    ctx.ddata.sgvs = [{mgdl: 100, mills: before}, {mgdl: 105, mills: now}];
    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    var sbx = prepareSandbox();

    ar2.virtAsst.intentHandlers.length.should.equal(1);

    ar2.virtAsst.intentHandlers[0].intentHandler(function next(title: any, response: any) {
      title.should.equal('AR2 Forecast');
      response.should.equal('According to the AR2 forecast you are expected to be between 109 and 120 over the next in 30 minutes');
      done();
    }, [], sbx);
  });

});