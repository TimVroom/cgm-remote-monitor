'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BG direction', function ( ) {

  var now = Date.now();

  function setupSandbox(data: any, pluginBase: any) {
    var ctx = {
      settings: {}
      , pluginBase: pluginBase || {}
    };

    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    return sandbox.clientInit(ctx, Date.now(), data);
  }

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set the direction property - Flat', function (done: any) {
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    var sbx = setupSandbox({sgvs: [{mills: now, direction: 'Flat'}]});

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('direction');
      var result = setter();
      result.value.should.equal('Flat');
      result.label.should.equal('→');
      result.entity.should.equal('&#8594;');
      done();
    };

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var direction = require('../lib/plugins/direction')();
    direction.setProperties(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set the direction property Double Up', function (done: any) {
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    var sbx = setupSandbox({sgvs: [{mills: now, direction: 'DoubleUp'}]});

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('direction');
      var result = setter();
      result.value.should.equal('DoubleUp');
      result.label.should.equal('⇈');
      result.entity.should.equal('&#8648;');
      done();
    };

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var direction = require('../lib/plugins/direction')();
    direction.setProperties(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the direction', function (done: any) {
    var pluginBase = {
      updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
        options.label.should.equal('→&#xfe0e;');
        done();
      }
    };

    var sbx = setupSandbox({sgvs: [{mills: now, direction: 'Flat'}]}, pluginBase);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var direction = require('../lib/plugins/direction')();
    direction.setProperties(sbx);
    direction.updateVisualisation(sbx);
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('get the info for a direction', function () {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var direction = require('../lib/plugins/direction')();

    direction.info({mills: now, direction: 'NONE'}).label.should.equal('⇼');
    direction.info({mills: now, direction: 'NONE'}).entity.should.equal('&#8700;');

    direction.info({mills: now, direction: 'DoubleUp'}).label.should.equal('⇈');
    direction.info({mills: now, direction: 'DoubleUp'}).entity.should.equal('&#8648;');

    direction.info({mills: now, direction: 'SingleUp'}).label.should.equal('↑');
    direction.info({mills: now, direction: 'SingleUp'}).entity.should.equal('&#8593;');

    direction.info({mills: now, direction: 'FortyFiveUp'}).label.should.equal('↗');
    direction.info({mills: now, direction: 'FortyFiveUp'}).entity.should.equal('&#8599;');

    direction.info({mills: now, direction: 'Flat'}).label.should.equal('→');
    direction.info({mills: now, direction: 'Flat'}).entity.should.equal('&#8594;');

    direction.info({mills: now, direction: 'FortyFiveDown'}).label.should.equal('↘');
    direction.info({mills: now, direction: 'FortyFiveDown'}).entity.should.equal('&#8600;');

    direction.info({mills: now, direction: 'SingleDown'}).label.should.equal('↓');
    direction.info({mills: now, direction: 'SingleDown'}).entity.should.equal('&#8595;');

    direction.info({mills: now, direction: 'DoubleDown'}).label.should.equal('⇊');
    direction.info({mills: now, direction: 'DoubleDown'}).entity.should.equal('&#8650;');

    direction.info({mills: now, direction: 'NOT COMPUTABLE'}).label.should.equal('-');
    direction.info({mills: now, direction: 'NOT COMPUTABLE'}).entity.should.equal('&#45;');

    direction.info({mills: now, direction: 'RATE OUT OF RANGE'}).label.should.equal('⇕');
    direction.info({mills: now, direction: 'RATE OUT OF RANGE'}).entity.should.equal('&#8661;');
  });


});
