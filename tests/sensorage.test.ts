'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var times = require('../lib/times');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('sage', function ( ) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();
  var ctx = helper.getctx();
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var sage = require('../lib/plugins/sensorage')(ctx);
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var sandbox = require('../lib/sandbox')();

  function prepareSandbox ( ) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    return sbx;
  }

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the current age since start with change', function (done: any) {

    var data = {
      sensorTreatments: [
        {eventType: 'Sensor Change', notes: 'Foo', mills: Date.now() - times.days(2).msecs}
        , {eventType: 'Sensor Start', notes: 'Bar', mills: Date.now() - times.days(1).msecs}
        ]
    };

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
        
          console.log(JSON.stringify(options));
          options.value.should.equal('1d0h');
          options.info[0].label.should.equal('Sensor Insert');
          options.info[1].should.match({ label: 'Duration', value: '2 days 0 hours' });
          options.info[2].should.match({ label: 'Notes', value: 'Foo' });
          options.info[3].label.should.equal('Sensor Start');
          options.info[4].should.match({ label: 'Duration', value: '1 days 0 hours' });
          options.info[5].should.match({ label: 'Notes', value: 'Bar' });
          done();
        }
      }
    };
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();

    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    sage.setProperties(sbx);
    sage.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the current age since start without change', function (done: any) {

    var data = {
      sensorTreatments: [
        {eventType: 'Sensor Start', notes: 'Bar', mills: Date.now() - times.days(3).msecs}
      ]
    };

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('3d0h');
          options.info[0].label.should.equal('Sensor Start');
          options.info[1].should.match({ label: 'Duration', value: '3 days 0 hours' });
          options.info[2].should.match({ label: 'Notes', value: 'Bar' });
          done();
        }
      }
    };
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();

    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    sage.setProperties(sbx);
    sage.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the current age since change without start', function (done: any) {

    var data = {
      sensorTreatments: [
        {eventType: 'Sensor Change', notes: 'Foo', mills: Date.now() - times.days(3).msecs}
      ]
    };

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('3d0h');
          options.info[0].label.should.equal('Sensor Insert');
          options.info[1].should.match({ label: 'Duration', value: '3 days 0 hours' });
          options.info[2].should.match({ label: 'Notes', value: 'Foo' });
          done();
        }
      }
    };
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();

    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    sage.setProperties(sbx);
    sage.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the current age since change after start', function (done: any) {

    var data = {
      sensorTreatments: [
        {eventType: 'Sensor Start', notes: 'Bar', mills: Date.now() - times.days(10).msecs}
        , {eventType: 'Sensor Change', notes: 'Foo', mills: Date.now() - times.days(3).msecs}
      ]
    };

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('3d0h');
          options.info.length.should.equal(3);
          options.info[0].label.should.equal('Sensor Insert');
          options.info[1].should.match({ label: 'Duration', value: '3 days 0 hours' });
          options.info[2].should.match({ label: 'Notes', value: 'Foo' });
          done();
        }
      }
    };
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();

    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    sage.setProperties(sbx);
    sage.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('trigger an alarm when sensor is 6 days and 22 hours old', function (done: any) {
    ctx.notifications.initRequests();

    var before = Date.now() - times.days(6).msecs - times.hours(22).msecs;

    ctx.ddata.sensorTreatments = [{eventType: 'Sensor Start', mills: before}];

    var sbx = prepareSandbox();
    sbx.extendedSettings = { 'enableAlerts': true };
    sage.setProperties(sbx);
    sage.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('SAGE');
    highest.level.should.equal(ctx.levels.URGENT);
    highest.title.should.equal('Sensor age 6 days 22 hours');
    done();
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('not trigger an alarm when sensor is 6 days and 23 hours old', function (done: any) {
    ctx.notifications.initRequests();

    var before = Date.now() - times.days(6).msecs - times.hours(23).msecs;

    ctx.ddata.sensorTreatments = [{eventType: 'Sensor Start', mills: before}];

    var sbx = prepareSandbox();
    sbx.extendedSettings = { 'enableAlerts': true };
    sage.setProperties(sbx);
    sage.checkNotifications(sbx);

    should.not.exist(ctx.notifications.findHighestAlarm('SAGE'));
    done();
  });

});
