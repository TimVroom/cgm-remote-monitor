'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Uploader Battery', function ( ) {
  var data = {devicestatus: [{mills: Date.now(), uploader: {battery: 20}}]};

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display uploader battery status', function (done: any) {
    var ctx = {
      settings: {}
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')(fs)
    };
    ctx.language.set('en');
    // @ts-expect-error TS(2339) FIXME: Property 'levels' does not exist on type '{ settin... Remove this comment to see the full error message
    ctx.levels = levels;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')(ctx);
    
    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('upbat');
      var result = setter();
      result.display.should.equal('20%');
      result.status.should.equal('urgent');
      result.min.value.should.equal(20);
      result.min.level.should.equal(25);
      done();
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var upbat = require('../lib/plugins/upbat')(ctx);
    upbat.setProperties(sbx);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the uploader battery status', function (done: any) {
    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('20%');
          options.labelClass.should.equal('icon-battery-25');
          options.pillClass.should.equal('urgent');
          done();
        }
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')(fs)
      , levels: levels
    };
    ctx.language.set('en');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var upbat = require('../lib/plugins/upbat')(ctx);
    upbat.setProperties(sbx);
    upbat.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('hide the pill if there is no uploader battery status', function (done: any) {
    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.hide.should.equal(true);
          done();
        }
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')(fs)
      , levels: levels
    };
    ctx.language.set('en');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), {});
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var upbat = require('../lib/plugins/upbat')(ctx);
    upbat.setProperties(sbx);
    upbat.updateVisualisation(sbx);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('hide the pill if there is uploader battery status is -1', function (done: any) {
    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.hide.should.equal(true);
          done();
        }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      }, language: require('../lib/language')(fs)
      , levels: levels
    };
    ctx.language.set('en');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), {devicestatus: [{uploader: {battery: -1}}]});
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var upbat = require('../lib/plugins/upbat')(ctx);
    upbat.setProperties(sbx);
    upbat.updateVisualisation(sbx);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function (done: any) {

    var ctx = {
      settings: {}
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')(fs)
      , levels: levels
    };
    ctx.language.set('en');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), data);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var upbat = require('../lib/plugins/upbat')(ctx);
    upbat.setProperties(sbx);

    upbat.virtAsst.intentHandlers.length.should.equal(2);

    upbat.virtAsst.intentHandlers[0].intentHandler(function next(title: any, response: any) {
      title.should.equal('Uploader Battery');
      response.should.equal('Your uploader battery is at 20%');
      
      upbat.virtAsst.intentHandlers[1].intentHandler(function next(title: any, response: any) {
        title.should.equal('Uploader Battery');
        response.should.equal('Your uploader battery is at 20%');

        done();
      }, [], sbx);
      
    }, [], sbx);

  });

});
