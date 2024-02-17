// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var times = require('../lib/times');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('timeago', function() {
  var ctx = {};
  // @ts-expect-error TS(2339) FIXME: Property 'levels' does not exist on type '{}'.
  ctx.levels = levels;
  // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);
  // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{}'.
  ctx.language = require('../lib/language')();
  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  ctx.settings = require('../lib/settings')();
  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  ctx.settings.heartbeat = 0.5; // short heartbeat to speedup tests

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var timeago = require('../lib/plugins/timeago')(ctx);

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();

  function freshSBX () {
    //set extendedSettings right before calling withExtendedSettings, there's some strange test interference here
    env.extendedSettings = { timeago: { enableAlerts: true } };
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx).withExtendedSettings(timeago);
    return sbx;
  }

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not trigger an alarm when data is current', function(done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{ mills: Date.now(), mgdl: 100, type: 'sgv' }];

    var sbx = freshSBX();
    timeago.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm('Time Ago'));

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not trigger an alarm with future data', function(done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{ mills: Date.now() + times.mins(15).msecs, mgdl: 100, type: 'sgv' }];

    var sbx = freshSBX();
    timeago.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm('Time Ago'));

    done();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a warning when data older than 15m', function(done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{ mills: Date.now() - times.mins(16).msecs, mgdl: 100, type: 'sgv' }];

    var sbx = freshSBX();
    timeago.checkNotifications(sbx);

    var currentTime = new Date().getTime();

    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var highest = ctx.notifications.findHighestAlarm('Time Ago');
    highest.level.should.equal(levels.WARN);
    highest.message.should.equal('Last received: 16 mins ago\nBG Now: 100 mg/dl');
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger an urgent alarm when data older than 30m', function(done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{ mills: Date.now() - times.mins(31).msecs, mgdl: 100, type: 'sgv' }];

    var sbx = freshSBX();
    timeago.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var highest = ctx.notifications.findHighestAlarm('Time Ago');
    highest.level.should.equal(levels.URGENT);
    highest.message.should.equal('Last received: 31 mins ago\nBG Now: 100 mg/dl');
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calc timeago displays', function() {
    var now = Date.now();

    should.deepEqual(
      timeago.calcDisplay({ mills: now + times.mins(15).msecs }, now)
      , { label: 'in the future', shortLabel: 'future' }
    );

    //TODO: current behavior, we can do better
    //just a little in the future, pretend it's ok
    should.deepEqual(
      timeago.calcDisplay({ mills: now + times.mins(4).msecs }, now)
      , { value: 1, label: 'min ago', shortLabel: 'm' }
    );

    should.deepEqual(
      timeago.calcDisplay(null, now)
      , { label: 'time ago', shortLabel: 'ago' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now }, now)
      , { value: 1, label: 'min ago', shortLabel: 'm' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now - 1 }, now)
      , { value: 1, label: 'min ago', shortLabel: 'm' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now - times.sec(30).msecs }, now)
      , { value: 1, label: 'min ago', shortLabel: 'm' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now - times.mins(30).msecs }, now)
      , { value: 30, label: 'mins ago', shortLabel: 'm' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now - times.hours(5).msecs }, now)
      , { value: 5, label: 'hours ago', shortLabel: 'h' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now - times.days(5).msecs }, now)
      , { value: 5, label: 'days ago', shortLabel: 'd' }
    );

    should.deepEqual(
      timeago.calcDisplay({ mills: now - times.days(10).msecs }, now)
      , { label: 'long ago', shortLabel: 'ago' }
    );
  });

});
