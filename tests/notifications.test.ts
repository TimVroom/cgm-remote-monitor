// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Stream = require('stream');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('notifications', function ( ) {

  var env = {testMode: true};

  var ctx = {
    bus: new Stream
    , ddata: {
      lastUpdated: Date.now()
    }
    , levels: levels
  };

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var notifications = require('../lib/notifications')(env, ctx);

  function examplePlugin () {}

  var exampleInfo = {
    title: 'test'
    , message: 'testing'
    , level: levels.INFO
    , plugin: examplePlugin
  };

  var exampleWarn = {
    title: 'test'
    , message: 'testing'
    , level: levels.WARN
    , plugin: examplePlugin
  };

  var exampleUrgent = {
    title: 'test'
    , message: 'testing'
    , level: levels.URGENT
    , plugin: examplePlugin
  };

  var exampleSnooze = {
    level: levels.WARN
    , title: 'exampleSnooze'
    , message: 'exampleSnooze message'
    , lengthMills: 10000
  };

  var exampleSnoozeNone = {
    level: levels.WARN
    , title: 'exampleSnoozeNone'
    , message: 'exampleSnoozeNone message'
    , lengthMills: 1
  };

  var exampleSnoozeUrgent = {
    level: levels.URGENT
    , title: 'exampleSnoozeUrgent'
    , message: 'exampleSnoozeUrgent message'
    , lengthMills: 10000
  };


  function expectNotification (check: any, done: any) {
    //start fresh to we don't pick up other notifications
    ctx.bus = new Stream;
    //if notification doesn't get called test will time out
    ctx.bus.on('notification', function callback (notify: any) {
      if (check(notify)) {
        done();
      }
    });
  }

  function clearToDone (done: any) {
    expectNotification(function expectClear (notify: any) {
      return notify.clear;
    }, done);
  }

  function notifyToDone (done: any) {
    expectNotification(function expectNotClear (notify: any) {
      return ! notify.clear;
    }, done);
  }

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('initAndReInit', function (done: any) {
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.findHighestAlarm().should.equal(exampleWarn);
    notifications.initRequests();
    should.not.exist(notifications.findHighestAlarm());
    done();
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('emitAWarning', function (done: any) {
    //start fresh to we don't pick up other notifications
    ctx.bus = new Stream;
    //if notification doesn't get called test will time out
    ctx.bus.on('notification', function callback ( ) {
      done();
    });

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.findHighestAlarm().should.equal(exampleWarn);
    notifications.process();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('emitAnInfo', function (done: any) {
    notifyToDone(done);

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleInfo);
    should.not.exist(notifications.findHighestAlarm());

    notifications.process();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('emitAllClear 1 time after alarm is auto acked', function (done: any) {
    clearToDone(done);

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.findHighestAlarm().should.equal(exampleWarn);
    notifications.process();

    notifications.initRequests();
    //don't request a notify this time, and an auto ack should be sent
    should.not.exist(notifications.findHighestAlarm());
    notifications.process();

    var alarm = notifications.getAlarmForTests(levels.WARN);
    alarm.level.should.equal(levels.WARN);
    alarm.silenceTime.should.equal(1);
    alarm.lastAckTime.should.be.approximately(Date.now(), 2000);
    should.not.exist(alarm.lastEmitTime);

    //clear last emit time, even with that all clear shouldn't be sent again since there was no alarm cleared
    delete alarm.lastEmitTime;

    //process 1 more time to make sure all clear is only sent once
    notifications.initRequests();
    //don't request a notify this time, and an auto ack should be sent
    should.not.exist(notifications.findHighestAlarm());
    notifications.process();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Can be snoozed', function (done: any) {
    notifyToDone(done); //shouldn't get called

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.requestSnooze(exampleSnooze);
    notifications.snoozedBy(exampleWarn).should.equal(exampleSnooze);
    notifications.process();

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Can be snoozed by last snooze', function (done: any) {
    notifyToDone(done); //shouldn't get called

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.requestSnooze(exampleSnoozeNone);
    notifications.requestSnooze(exampleSnooze);
    notifications.snoozedBy(exampleWarn).should.equal(exampleSnooze);
    notifications.process();

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Urgent alarms can\'t be snoozed by warn', function (done: any) {
    clearToDone(done); //shouldn't get called

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleUrgent);
    notifications.requestSnooze(exampleSnooze);
    should.not.exist(notifications.snoozedBy(exampleUrgent));
    notifications.process();

    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Warnings can be snoozed by urgent', function (done: any) {
    notifyToDone(done); //shouldn't get called

    notifications.resetStateForTests();
    notifications.initRequests();
    notifications.requestNotify(exampleWarn);
    notifications.requestSnooze(exampleSnoozeUrgent);
    notifications.snoozedBy(exampleWarn).should.equal(exampleSnoozeUrgent);
    notifications.process();

    done();
  });

});
