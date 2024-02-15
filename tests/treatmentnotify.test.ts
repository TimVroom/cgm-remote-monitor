// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var levels = require('../lib/levels');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('treatmentnotify', function ( ) {

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();
  var ctx = {};
  // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);
  // @ts-expect-error TS(2339): Property 'levels' does not exist on type '{}'.
  ctx.levels = levels;
  // @ts-expect-error TS(2339): Property 'language' does not exist on type '{}'.
  ctx.language = require('../lib/language')().set('en');

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var treatmentnotify = require('../lib/plugins/treatmentnotify')(ctx);

  var now = Date.now();

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Request a snooze for a recent treatment and request an info notify', function (done: any) {
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mills: now, mgdl: 100}];
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.treatments = [{eventType: 'BG Check', glucose: '100', mills: now}];

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    treatmentnotify.checkNotifications(sbx);
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm());
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.exist(ctx.notifications.snoozedBy({level: levels.URGENT}));

    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    _.first(ctx.notifications.findUnSnoozeable()).level.should.equal(levels.INFO);

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not Request a snooze for an older treatment and not request an info notification', function (done: any) {
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mills: now, mgdl: 100}];
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.treatments = [{mills: now - (15 * 60 * 1000)}];

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    treatmentnotify.checkNotifications(sbx);
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm());
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.exist(ctx.notifications.snoozedBy({level: levels.URGENT}));

    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(_.first(ctx.notifications.findUnSnoozeable()));

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Request a snooze for a recent calibration and request an info notify', function (done: any) {
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mills: now, mgdl: 100}];
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.mbgs = [{mgdl: '100', mills: now}];

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    treatmentnotify.checkNotifications(sbx);
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm());
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.exist(ctx.notifications.snoozedBy({level: levels.URGENT}));

    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    _.first(ctx.notifications.findUnSnoozeable()).level.should.equal(levels.INFO);

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not Request a snooze for an older calibration treatment and not request an info notification', function (done: any) {
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mills: now, mgdl: 100}];
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.mbgs = [{mgdl: '100', mills: now - (15 * 60 * 1000)}];

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    treatmentnotify.checkNotifications(sbx);
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm());
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.exist(ctx.notifications.snoozedBy({level: levels.URGENT}));

    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(_.first(ctx.notifications.findUnSnoozeable()));

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Request a notification for an announcement even there is an active snooze', function (done: any) {
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.treatments = [{mills: now, mgdl: 40, eventType: 'Announcement', isAnnouncement: true, notes: 'This not an alarm'}];

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);

    var fakeSnooze = {
      level: levels.URGENT
      , title: 'Snoozing alarms for the test'
      , message: 'testing...'
      , lengthMills: 60000
    };

    sbx.notifications.requestSnooze(fakeSnooze);

    treatmentnotify.checkNotifications(sbx);

    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var announcement = _.first(ctx.notifications.findUnSnoozeable());

    should.exist(announcement);
    announcement.title.should.equal('Urgent Announcement');
    announcement.level.should.equal(levels.URGENT);
    announcement.pushoverSound.should.equal('persistent');
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.deepEqual(ctx.notifications.findHighestAlarm('Announcement'), announcement);
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.snoozedBy(announcement).should.equal(false);


    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Request a notification for a non-error announcement', function (done: any) {
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339): Property 'ddata' does not exist on type '{}'.
    ctx.ddata.treatments = [{mills: now, mgdl: 100, eventType: 'Announcement', isAnnouncement: true, notes: 'This not an alarm'}];

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);

    treatmentnotify.checkNotifications(sbx);

    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var announcement = _.first(ctx.notifications.findUnSnoozeable());

    should.exist(announcement);
    announcement.title.should.equal('Announcement');
    announcement.level.should.equal(levels.INFO);
    should.not.exist(announcement.pushoverSound);
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm());
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.snoozedBy(announcement).should.equal(false);

    done();
  });

});