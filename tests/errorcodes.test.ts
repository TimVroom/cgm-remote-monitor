// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('errorcodes', function ( ) {

  var now = Date.now();
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();
  var ctx = {};
  // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);
  // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{}'.
  ctx.language = require('../lib/language')();
  // @ts-expect-error TS(2339) FIXME: Property 'levels' does not exist on type '{}'.
  ctx.levels = levels;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var errorcodes = require('../lib/plugins/errorcodes')(ctx);

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Not trigger an alarm when in range', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mgdl: 100, mills: now}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    errorcodes.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm('CGM Error Code'));

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a urgent alarm when ???', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mgdl: 10, mills: now}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    errorcodes.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.findHighestAlarm('CGM Error Code').level.should.equal(levels.URGENT);

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a urgent alarm when hourglass', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mgdl: 9, mills: now}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    errorcodes.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var findHighestAlarm = ctx.notifications.findHighestAlarm('CGM Error Code');
    findHighestAlarm.level.should.equal(levels.URGENT);
    findHighestAlarm.pushoverSound.should.equal('alien');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a low notification when needing calibration', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications.initRequests();
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata.sgvs = [{mgdl: 5, mills: now}];

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    errorcodes.checkNotifications(sbx);
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    should.not.exist(ctx.notifications.findHighestAlarm('CGM Error Code'));
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    var info = _.first(ctx.notifications.findUnSnoozeable());
    info.level.should.equal(levels.INFO);
    info.pushoverSound.should.equal('intermission');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should trigger a low notification when code < 9', function (done: any) {

    for (var i = 1; i < 9; i++) {
      // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
      ctx.notifications.initRequests();
      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      ctx.ddata.sgvs = [{mgdl: i, mills: now}];

      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      var sbx = require('../lib/sandbox')().serverInit(env, ctx);
      errorcodes.checkNotifications(sbx);
      // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
      should.not.exist(ctx.notifications.findHighestAlarm('CGM Error Code'));
      // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
      _.first(ctx.notifications.findUnSnoozeable()).level.should.be.lessThan(levels.WARN);
    }
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('convert a code to display', function () {
    errorcodes.toDisplay(5).should.equal('?NC');
    errorcodes.toDisplay(9).should.equal('?AD');
    errorcodes.toDisplay(10).should.equal('???');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('have default code to level mappings', function () {
    var mapping = errorcodes.buildMappingFromSettings({});
    mapping[1].should.equal(levels.INFO);
    mapping[2].should.equal(levels.INFO);
    mapping[3].should.equal(levels.INFO);
    mapping[4].should.equal(levels.INFO);
    mapping[5].should.equal(levels.INFO);
    mapping[6].should.equal(levels.INFO);
    mapping[7].should.equal(levels.INFO);
    mapping[8].should.equal(levels.INFO);
    mapping[9].should.equal(levels.URGENT);
    mapping[10].should.equal(levels.URGENT);
    _.keys(mapping).length.should.equal(10);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('allow config of custom code to level mappings', function () {
    var mapping = errorcodes.buildMappingFromSettings({
      info: 'off'
      , warn: '9 10'
      , urgent: 'off'
    });
    mapping[9].should.equal(levels.WARN);
    mapping[10].should.equal(levels.WARN);
    _.keys(mapping).length.should.equal(2);
  });

});