// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var levels = require('../lib/levels');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('simplealarms', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();
  var ctx = {
    settings: {}
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , language: require('../lib/language')()
    , levels: levels
  };

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var simplealarms = require('../lib/plugins/simplealarms')(ctx);

  // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var bgnow = require('../lib/plugins/bgnow')(ctx);

  var now = Date.now();
  var before = now - (5 * 60 * 1000);


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not trigger an alarm when in range', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
    ctx.ddata.sgvs = [{mills: now, mgdl: 100}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    simplealarms.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm());

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning when above target', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
    ctx.ddata.sgvs = [{mills: before, mgdl: 171}, {mills: now, mgdl: 181}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    bgnow.setProperties(sbx);
    simplealarms.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var highest = ctx.notifications.findHighestAlarm();
    highest.level.should.equal(levels.WARN);
    highest.message.should.equal('BG Now: 181 +10 mg/dl');
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a urgent alarm when really high', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
    ctx.ddata.sgvs = [{mills: now, mgdl: 400}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    simplealarms.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.findHighestAlarm().level.should.equal(levels.URGENT);

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning when below target', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
    ctx.ddata.sgvs = [{mills: now, mgdl: 70}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    simplealarms.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.findHighestAlarm().level.should.equal(levels.WARN);

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a urgent alarm when really low', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
    ctx.ddata.sgvs = [{mills: now, mgdl: 40}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    simplealarms.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.findHighestAlarm().level.should.equal(levels.URGENT);

    done();
  });


});