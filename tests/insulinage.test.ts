'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
const levels = helper.ctx.levels;

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('insulinage', function ( ) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    var ctx = helper.getctx();
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.ddata = require('../lib/data/ddata')();
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.notifications = require('../lib/notifications')(env, ctx);

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var iage = require('../lib/plugins/insulinage')(ctx);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')(ctx);
    function prepareSandbox ( ) {
        // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var sbx = require('../lib/sandbox')().serverInit(env, ctx);
        sbx.offerProperty('iob', function () {
            return {iob: 0};
        });
        return sbx;
    }

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('set a pill to the current insulin age', function (done: any) {

        var data = {
            insulinchangeTreatments: [
                {eventType: 'Insulin Change', notes: 'Foo', mills: Date.now() - 48 * 60 * 60000}
                , {eventType: 'Insulin Change', notes: 'Bar', mills: Date.now() - 24 * 60 * 60000}
            ]
        };

        var ctx = {
            settings: {}
            , pluginBase: {
                updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
                    options.value.should.equal('1d0h');
                    options.info[1].value.should.equal('Bar');
                    done();
                }
            }
        };
       // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
       ctx.language = require('../lib/language')();

        var sbx = sandbox.clientInit(ctx, Date.now(), data);
        iage.setProperties(sbx);
        iage.updateVisualisation(sbx);

    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('set a pill to the current insulin age', function (done: any) {

        var data = {
            insulinchangeTreatments: [
                {eventType: 'Insulin Change', notes: 'Foo', mills: Date.now() - 48 * 60 * 60000}
                , {eventType: 'Insulin Change', notes: '', mills: Date.now() - 59 * 60000}
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
       // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
       ctx.language = require('../lib/language')();

        var sbx = sandbox.clientInit(ctx, Date.now(), data);
        iage.setProperties(sbx);
        iage.updateVisualisation(sbx);

    });


    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('trigger a warning when insulin is 48 hours old', function (done: any) {
        ctx.notifications.initRequests();

        var before = Date.now() - (48 * 60 * 60 * 1000);

        ctx.ddata.insulinchangeTreatments = [{eventType: 'Insulin Change', mills: before}];

        var sbx = prepareSandbox();
        sbx.extendedSettings = { 'enableAlerts': 'TRUE' };
        iage.setProperties(sbx);
        iage.checkNotifications(sbx);

        var highest = ctx.notifications.findHighestAlarm('IAGE');
        highest.level.should.equal(levels.WARN);
        highest.title.should.equal('Insulin reservoir age 48 hours');
        done();
    });

});
