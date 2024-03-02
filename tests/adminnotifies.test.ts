
'use strict';

import 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();

const ctx = {};

// @ts-expect-error TS(2339) FIXME: Property 'bus' does not exist on type '{}'.
ctx.bus = {};
// @ts-expect-error TS(2339) FIXME: Property 'bus' does not exist on type '{}'.
ctx.bus.on = function mockOn(channel: any, f: any) { };
// @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
ctx.settings = {};
// @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
ctx.settings.adminNotifiesEnabled = true;

const mockJqueryResults = {};
const mockButton = {};

// @ts-expect-error TS(2339) FIXME: Property 'click' does not exist on type '{}'.
mockButton.click = function() {};
// @ts-expect-error TS(2339) FIXME: Property 'css' does not exist on type '{}'.
mockButton.css = function() {};
// @ts-expect-error TS(2339) FIXME: Property 'show' does not exist on type '{}'.
mockButton.show = function() {};

const mockDrawer = {};

const mockJQuery = function mockJquery(p: any) {
    if (p == '#adminnotifies') return mockButton;
    if (p == '#adminNotifiesDrawer') return mockDrawer;
    return mockJqueryResults;
};

const mockClient = {};

// @ts-expect-error TS(2339) FIXME: Property 'translate' does not exist on type '{}'.
mockClient.translate = language.translate;
// @ts-expect-error TS(2339) FIXME: Property 'headers' does not exist on type '{}'.
mockClient.headers = function () {return {};}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const adminnotifies = require('../lib/adminnotifies')(ctx);

// @ts-expect-error TS(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var window = {};
//global.window = window;

// @ts-expect-error TS(2322) FIXME: Type '() => void' is not assignable to type '((han... Remove this comment to see the full error message
window.setTimeout = function () { return; }

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('adminnotifies', function ( ) {

    // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
    after( function tearDown(done: any) {
        // @ts-expect-error TS(2304) FIXME: Cannot find name 'global'.
        delete global.window;
        done();
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should aggregate a message', function () {

        const notify = {
            title: 'Foo'
            , message: 'Bar'
        };

        adminnotifies.addNotify(notify);
        adminnotifies.addNotify(notify);

        const notifies = adminnotifies.getNotifies();

        notifies.length.should.equal(1);
      });

      /*
      it('should display a message', function (done) {

        const notify2 = {
            title: 'FooFoo'
            , message: 'BarBar'
        };

        adminnotifies.addNotify(notify2);
        adminnotifies.addNotify(notify2);

        const notifies = adminnotifies.getNotifies();

        mockJQuery.ajax = function mockAjax() {

            const rVal = notifies;

            rVal.done = function(callback) {
                callback({
                    message: {
                        notifies,
                        notifyCount: notifies.length
                        }
                    });
                return rVal;
            }

            rVal.fail = function() {};

            return rVal;
        }

        const adminnotifiesClient = require('../lib/client/adminnotifiesclient')(mockClient,mockJQuery);

        mockDrawer.html = function (html) {
            console.log(html);
            html.indexOf('You have administration messages').should.be.greaterThan(0);
            html.indexOf('Event repeated 2 times').should.be.greaterThan(0);
            done();
        }

        adminnotifiesClient.prepare();

      });
*/

});