'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('env', function () {
  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it( 'show the right plugins', function () {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.SHOW_PLUGINS = 'iob';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.ENABLE = 'iob cob';

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require( '../lib/server/env' )();
    var showPlugins = env.settings.showPlugins;
    showPlugins.should.containEql( 'iob' );
    showPlugins.should.containEql( 'delta' );
    showPlugins.should.containEql( 'direction' );
    showPlugins.should.containEql( 'upbat' );

    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.SHOW_PLUGINS;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.ENABLE;
  } );

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it( 'get extended settings', function () {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.ENABLE = 'scaryplugin';
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.SCARYPLUGIN_DO_THING = 'yes';

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require( '../lib/server/env' )();
    env.settings.isEnabled( 'scaryplugin' ).should.equal( true );

    //Note the camelCase
    env.extendedSettings.scaryplugin.doThing.should.equal( 'yes' );

    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.ENABLE;
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.SCARYPLUGIN_DO_THING;
  } );

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it( 'add pushover to enable if one of the env vars is set', function () {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.PUSHOVER_API_TOKEN = 'abc12345';

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require( '../lib/server/env' )();
    env.settings.enable.should.containEql( 'pushover' );
    env.extendedSettings.pushover.apiToken.should.equal( 'abc12345' );

    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.PUSHOVER_API_TOKEN;
  } );

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it( 'add pushover to enable if one of the weird azure env vars is set', function () {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.CUSTOMCONNSTR_PUSHOVER_API_TOKEN = 'abc12345';

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require( '../lib/server/env' )();
    env.settings.enable.should.containEql( 'pushover' );
    env.extendedSettings.pushover.apiToken.should.equal( 'abc12345' );

    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.PUSHOVER_API_TOKEN;
  } );

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it( 'readENVTruthy ', function () {
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.INSECURE_USE_HTTP = 'true';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require( '../lib/server/env' )();
    env.insecureUseHttp.should.be.true();
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.INSECURE_USE_HTTP = 'false';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    env = require( '../lib/server/env' )();
    env.insecureUseHttp.should.be.false();
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.INSECURE_USE_HTTP = 'not set ok, so use default value false';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    env = require( '../lib/server/env' )();
    env.insecureUseHttp.should.be.false();
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.INSECURE_USE_HTTP; // unset INSECURE_USE_HTTP
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.SECURE_HSTS_HEADER = 'true';
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    env = require( '../lib/server/env' )();
    env.insecureUseHttp.should.be.false(); // not defined should be false
    env.secureHstsHeader.should.be.true();
  });

  // @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe( 'DISPLAY_UNITS', function () {
    const MMOL = 'mmol';
    const MGDL = 'mg/dl';
    // @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe ( 'mmol', function () {
      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'mmol => mmol', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = MMOL;
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MMOL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'mmol/l => mmol', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = 'mmol/l';
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MMOL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'mmol/L => mmol', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = 'mmol/L';
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MMOL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'MMOL => mmol', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = 'MMOL';
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MMOL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );
    } );

    // @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe ( 'mg/dl', function () {
      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'mg/dl => mg/dl', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = MGDL;
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MGDL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'mg/dL => mg/dl', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = 'mg/dL';
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MGDL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'MG/DL => mg/dl', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = 'MG/DL';
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MGDL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( 'mgdl => mg/dl', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = 'mgdl';
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MGDL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );
    } );

    // @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe ( 'default: mg/dl', function () {
      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( '<random> => mg/dl', function () {
        var random;
        while (!random || random.toLowerCase() === MGDL)
          random = [...Array(~~(Math.random()*20)+1)].map(i=>(~~(Math.random()*36)).toString(36)).join('');

        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.env.DISPLAY_UNITS = random;
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MGDL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );

      // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it( '<null> => mg/dl', function () {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        var env = require( '../lib/server/env' )();
        env.settings.units.should.equal( MGDL );
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        delete process.env.DISPLAY_UNITS;
      } );
    } );
  } );
})
