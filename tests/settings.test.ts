'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('settings', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var settings = require('../lib/settings')();

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('have defaults ready', function () {
    settings.timeFormat.should.equal(12);
    settings.nightMode.should.equal(false);
    settings.showRawbg.should.equal('never');
    settings.customTitle.should.equal('Nightscout');
    settings.theme.should.equal('default');
    settings.alarmUrgentHigh.should.equal(true);
    settings.alarmUrgentHighMins.should.eql([30, 60, 90, 120]);
    settings.alarmHigh.should.equal(true);
    settings.alarmHighMins.should.eql([30, 60, 90, 120]);
    settings.alarmLow.should.equal(true);
    settings.alarmLowMins.should.eql([15, 30, 45, 60]);
    settings.alarmUrgentLow.should.equal(true);
    settings.alarmUrgentLowMins.should.eql([15, 30, 45]);
    settings.alarmUrgentMins.should.eql([30, 60, 90, 120]);
    settings.alarmWarnMins.should.eql([30, 60, 90, 120]);
    settings.alarmTimeagoWarn.should.equal(true);
    settings.alarmTimeagoWarnMins.should.equal(15);
    settings.alarmTimeagoUrgent.should.equal(true);
    settings.alarmTimeagoUrgentMins.should.equal(30);
    settings.language.should.equal('en');
    settings.showPlugins.should.equal('dbsize');
    settings.insecureUseHttp.should.equal(false);
    settings.secureHstsHeader.should.equal(true);
    settings.secureCsp.should.equal(false);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('support setting from env vars', function () {
    var expected = [
      'ENABLE'
      , 'DISABLE'
      , 'UNITS'
      , 'TIME_FORMAT'
      , 'NIGHT_MODE'
      , 'SHOW_RAWBG'
      , 'CUSTOM_TITLE'
      , 'THEME'
      , 'ALARM_TYPES'
      , 'ALARM_URGENT_HIGH'
      , 'ALARM_HIGH'
      , 'ALARM_LOW'
      , 'ALARM_URGENT_LOW'
      , 'ALARM_TIMEAGO_WARN'
      , 'ALARM_TIMEAGO_WARN_MINS'
      , 'ALARM_TIMEAGO_URGENT'
      , 'ALARM_TIMEAGO_URGENT_MINS'
      , 'LANGUAGE'
      , 'SHOW_PLUGINS'
      , 'BG_HIGH'
      , 'BG_TARGET_TOP'
      , 'BG_TARGET_BOTTOM'
      , 'BG_LOW'
      , 'SCALE_Y'
    ];

    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'number'.
    expected.length.should.equal(24);

    var seen = { };
    settings.eachSettingAsEnv(function markSeenNames(name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      seen[name] = true;
    });


    var expectedAndSeen = _.filter(expected, function (name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return seen[name];
    });

    expectedAndSeen.length.should.equal(expected.length);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('support setting each', function () {
    var expected = [
      'enable'
      , 'disable'
      , 'units'
      , 'timeFormat'
      , 'nightMode'
      , 'showRawbg'
      , 'customTitle'
      , 'theme'
      , 'alarmTypes'
      , 'alarmUrgentHigh'
      , 'alarmHigh'
      , 'alarmLow'
      , 'alarmUrgentLow'
      , 'alarmTimeagoWarn'
      , 'alarmTimeagoWarnMins'
      , 'alarmTimeagoUrgent'
      , 'alarmTimeagoUrgentMins'
      , 'language'
      , 'showPlugins'
    ];

    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'number'.
    expected.length.should.equal(19);

    var seen = { };
    settings.eachSetting(function markSeenNames(name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      seen[name] = true;
    });


    var expectedAndSeen = _.filter(expected, function (name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return seen[name];
    });

    expectedAndSeen.length.should.equal(expected.length);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('have default features', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function () {
      return undefined;
    });

    _.each(fresh.DEFAULT_FEATURES, function eachDefault (feature: any) {
      fresh.enable.should.containEql(feature);
    });

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('support disabling default features', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function (name: any) {
      return name === 'DISABLE' ?
        fresh.DEFAULT_FEATURES.join(' ') + ' ar2' //need to add ar2 here since it will be auto enabled
        : undefined;
    });

    fresh.enable.length.should.equal(0);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('parse custom snooze mins', function () {
    var userSetting = {
      ALARM_URGENT_LOW_MINS: '5 10 15'
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function (name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return userSetting[name];
    });

    fresh.alarmUrgentLowMins.should.eql([5, 10, 15]);

    fresh.snoozeMinsForAlarmEvent({eventName: 'low', level: levels.URGENT}).should.eql([5, 10, 15]);
    fresh.snoozeFirstMinsForAlarmEvent({eventName: 'low', level: levels.URGENT}).should.equal(5);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set thresholds', function () {
    var userThresholds = {
      BG_HIGH: '200'
      , BG_TARGET_TOP: '170'
      , BG_TARGET_BOTTOM: '70'
      , BG_LOW: '60'
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function (name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return userThresholds[name];
    });

    fresh.thresholds.bgHigh.should.equal(200);
    fresh.thresholds.bgTargetTop.should.equal(170);
    fresh.thresholds.bgTargetBottom.should.equal(70);
    fresh.thresholds.bgLow.should.equal(60);

    should.deepEqual(fresh.alarmTypes, ['simple']);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('default to predict if no thresholds are set', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function ( ) {
      return undefined;
    });

    should.deepEqual(fresh.alarmTypes, ['predict']);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('ignore junk alarm types', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function (name: any) {
      return name === 'ALARM_TYPES' ? 'beep bop' : undefined;
    });

    should.deepEqual(fresh.alarmTypes, ['predict']);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('allow multiple alarm types to be set', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function (name: any) {
      return name === 'ALARM_TYPES' ? 'predict simple' : undefined;
    });

    should.deepEqual(fresh.alarmTypes, ['predict', 'simple']);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('handle screwed up thresholds in a way that will display something that looks wrong', function () {
    var screwedUp = {
      BG_HIGH: '89'
      , BG_TARGET_TOP: '90'
      , BG_TARGET_BOTTOM: '95'
      , BG_LOW: '96'
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.eachSettingAsEnv(function (name: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return screwedUp[name];
    });

    fresh.thresholds.bgHigh.should.equal(91);
    fresh.thresholds.bgTargetTop.should.equal(90);
    fresh.thresholds.bgTargetBottom.should.equal(89);
    fresh.thresholds.bgLow.should.equal(88);

    should.deepEqual(fresh.alarmTypes, ['simple']);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('check if a feature isEnabled', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.enable = ['feature1'];
    fresh.isEnabled('feature1').should.equal(true);
    fresh.isEnabled('feature2').should.equal(false);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('check if any listed feature isEnabled', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var fresh = require('../lib/settings')();
    fresh.enable = ['feature1'];
    fresh.isEnabled(['unknown', 'feature1']).should.equal(true);
    fresh.isEnabled(['unknown', 'feature2']).should.equal(false);
  });

});
