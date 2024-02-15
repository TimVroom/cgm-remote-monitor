'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'levels'.
const levels = helper.ctx.levels;

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('cage', function ( ) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();
  var ctx = helper.getctx();

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);
  
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var cage = require('../lib/plugins/cannulaage')(ctx);
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var sandbox = require('../lib/sandbox')(ctx);
  function prepareSandbox ( ) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sbx = require('../lib/sandbox')().serverInit(env, ctx);
    sbx.offerProperty('iob', function () {
      return {iob: 0};
    });
    return sbx;
  }

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the current cannula age', function (done: any) {

    var data = {
      sitechangeTreatments: [
        {eventType: 'Site Change', notes: 'Foo', mills: Date.now() - 48 * 60 * 60000}
        , {eventType: 'Site Change', notes: 'Bar', mills: Date.now() - 24 * 60 * 60000}
        ]
    };

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('24h');
          options.info[1].value.should.equal('Bar');
          done();
        }
      }
    };

    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();
    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    cage.setProperties(sbx);
    cage.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the current cannula age', function (done: any) {

    var data = {
      sitechangeTreatments: [
        {eventType: 'Site Change', notes: 'Foo', mills: Date.now() - 48 * 60 * 60000}
        , {eventType: 'Site Change', notes: '', mills: Date.now() - 59 * 60000}
        ]
    };

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('0h');
          options.info.length.should.equal(1);
          done();
        }
      }
    };
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();
    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    cage.setProperties(sbx);
    cage.updateVisualisation(sbx);

  });

  
 // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
 it('trigger a warning when cannula is 48 hours old', function (done: any) {
    ctx.notifications.initRequests();

    var before = Date.now() - (48 * 60 * 60 * 1000);

    ctx.ddata.sitechangeTreatments = [{eventType: 'Site Change', mills: before}];

    var sbx = prepareSandbox();
    sbx.extendedSettings = { 'enableAlerts': 'TRUE' };
    cage.setProperties(sbx);
    cage.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('CAGE');
    highest.level.should.equal(levels.WARN);
    highest.title.should.equal('Cannula age 48 hours');
    done();
  });

});
