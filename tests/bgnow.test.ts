'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FIVE_MINS'... Remove this comment to see the full error message
var FIVE_MINS = 300000;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'SIX_MINS'.
var SIX_MINS = 360000;

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BG Now', function ( ) {

  const ctx = helper.ctx;

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var bgnow = require('../lib/plugins/bgnow')(ctx);
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var sandbox = require('../lib/sandbox')(ctx);

  var now = Date.now();
  var before = now - FIVE_MINS;

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should calculate BG Delta', function (done: any) {
    var ctx = {
      settings: { units: 'mg/dl' }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.label.should.equal(ctx.settings.units);
          options.value.should.equal('+5');
          should.not.exist(options.info);
          done();
        }
      , language: { translate: function(text: any) { return text; } }
      }
    };
    
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = ctx.pluginBase.language;
    // @ts-expect-error TS(2339): Property 'levels' does not exist on type '{ settin... Remove this comment to see the full error message
    ctx.levels = require('../lib/levels');
   
    var data = {sgvs: [{mills: before, mgdl: 100}, {mills: now, mgdl: 105}]};

    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    bgnow.setProperties(sbx);

    var delta = sbx.properties.delta;
    delta.mgdl.should.equal(5);
    delta.interpolated.should.equal(false);
    delta.scaled.should.equal(5);
    delta.display.should.equal('+5');

    bgnow.updateVisualisation(sbx);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should calculate BG Delta by interpolating when more than 5mins apart', function (done: any) {
    var data = {sgvs: [{mills: before - SIX_MINS, mgdl: 100}, {mills: now, mgdl: 105}]};

    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.label.should.equal(ctx.settings.units);
          options.value.should.equal('+2 *');
          findInfoValue('Elapsed Time', options.info).should.equal('11 mins');
          findInfoValue('Absolute Delta', options.info).should.equal('5 mg/dl');
          findInfoValue('Interpolated', options.info).should.equal('103 mg/dl');
          done();
        }
      }
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
      , moment: helper.ctx.moment
    };

    var sbx = sandbox.clientInit(ctx, now, data);

    bgnow.setProperties(sbx);

    var delta = sbx.properties.delta;
    delta.mgdl.should.equal(2);
    delta.interpolated.should.equal(true);
    delta.scaled.should.equal(2);
    delta.display.should.equal('+2');
    bgnow.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should calculate BG Delta in mmol', function (done: any) {
    var ctx = {
      settings: {
        units: 'mmol'
      }
      , pluginBase: {}
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
      , moment: helper.ctx.moment
    };

    var data = {sgvs: [{mills: before, mgdl: 100}, {mills: now, mgdl: 105}]};
    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    var gotbgnow = false;
    var gotdelta = false;
    var gotbuckets = false;

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      if (name === 'bgnow') {
        var bgnowProp = setter();
        bgnowProp.mean.should.equal(105);
        bgnowProp.last.should.equal(105);
        bgnowProp.mills.should.equal(now);
        gotbgnow = true;
      } else if (name === 'delta') {
        var result = setter();
        result.mgdl.should.equal(5);
        result.interpolated.should.equal(false);
        result.scaled.should.equal(0.2);
        result.display.should.equal('+0.2');
        gotdelta = true;
      } else if (name === 'buckets') {
        var buckets = setter();
        buckets[0].mean.should.equal(105);
        buckets[1].mean.should.equal(100);
        gotbuckets = true;
      }

      if (gotbgnow && gotdelta && gotbuckets) {
        done();
      }
    };

    bgnow.setProperties(sbx);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should calculate BG Delta in mmol and not show a change because of rounding', function (done: any) {
    var ctx = {
      settings: {
        units: 'mmol'
      }
      , pluginBase: {}
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
      , moment: helper.ctx.moment
    };

    var data = {sgvs: [{mills: before, mgdl: 85}, {mills: now, mgdl: 85}]};
    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    var gotbgnow = false;
    var gotdelta = false;
    var gotbuckets = false;

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      if (name === 'bgnow') {
        var bgnowProp = setter();
        bgnowProp.mean.should.equal(85);
        bgnowProp.last.should.equal(85);
        bgnowProp.mills.should.equal(now);
        gotbgnow = true;
      } else if (name === 'delta') {
        var result = setter();
        result.mgdl.should.equal(0);
        result.interpolated.should.equal(false);
        result.scaled.should.equal(0);
        result.display.should.equal('+0');
        gotdelta = true;
      } else if (name === 'buckets') {
        var buckets = setter();
        buckets[0].mean.should.equal(85);
        buckets[1].mean.should.equal(85);
        gotbuckets = true;
      }

      if (gotbgnow && gotdelta && gotbuckets) {
        done();
      }

    };

    bgnow.setProperties(sbx);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should calculate BG Delta in mmol by interpolating when more than 5mins apart', function (done: any) {
    var ctx = {
      settings: {
        units: 'mmol'
      }
      , pluginBase: {}
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
      , moment: helper.ctx.moment
    };

    var data = {sgvs: [{mills: before - SIX_MINS, mgdl: 100}, {mills: now, mgdl: 105}]};
    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    var gotbgnow = false;
    var gotdelta = false;
    var gotbuckets = false;

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      if (name === 'bgnow') {
        var bgnowProp = setter();
        bgnowProp.mean.should.equal(105);
        bgnowProp.last.should.equal(105);
        bgnowProp.mills.should.equal(now);
        gotbgnow = true;
      } else if (name === 'delta') {
        var result = setter();
        result.mgdl.should.equal(2);
        result.interpolated.should.equal(true);
        result.scaled.should.equal(0.1);
        result.display.should.equal('+0.1');
        gotdelta = true;
      } else if (name === 'buckets') {
        var buckets = setter();
        buckets[0].mean.should.equal(105);
        buckets[1].isEmpty.should.equal(true);
        buckets[2].mean.should.equal(100);
        gotbuckets = true;
      }

      if (gotbgnow && gotdelta && gotbuckets) {
        done();
      }
    };

    bgnow.setProperties(sbx);
  });

});

function findInfoValue (label: any, info: any) {
  var found = _.find(info, function checkLine (line: any) {
    return line.label === label;
  });
  return found && found.value;
}
