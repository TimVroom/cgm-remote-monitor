'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Raw BG', function ( ) {
  var ctx =  {
      settings: { units: 'mg/dl'}
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')(fs)
      , pluginBase: {}
  };
  ctx.language.set('en');

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var rawbg = require('../lib/plugins/rawbg')(ctx);

  var now = Date.now();
  var data = {
    sgvs: [{unfiltered: 113680, filtered: 111232, mgdl: 110, noise: 1, mills: now}]
    , cals: [{scale: 1, intercept: 25717.82377004309, slope: 766.895601715918, mills: now}]
  };


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should calculate Raw BG', function (done: any) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('rawbg');
      var result = setter();
      result.mgdl.should.equal(113);
      result.noiseLabel.should.equal('Clean');
      done();
    };

    rawbg.setProperties(sbx);

  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function (done: any) {

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    rawbg.setProperties(sbx);

    rawbg.virtAsst.intentHandlers.length.should.equal(1);

    rawbg.virtAsst.intentHandlers[0].intentHandler(function next(title: any, response: any) {
      title.should.equal('Current Raw BG');
      response.should.equal('Your raw bg is 113');

      done();
    }, [], sbx);

  });

});
