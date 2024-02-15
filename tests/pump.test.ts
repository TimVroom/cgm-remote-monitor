'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = helper.ctx.moment;

var top_ctx = helper.getctx();
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
top_ctx.settings = require('../lib/settings')();
top_ctx.language.set('en');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'env'.
var env = require('../lib/server/env')();
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
const levels = top_ctx.levels;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
const language = top_ctx.language;

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var profile = require('../lib/profilefunctions')(null, top_ctx);
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var pump = require('../lib/plugins/pump')(top_ctx);
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var sandbox = require('../lib/sandbox')(top_ctx);

// @ts-expect-error TS(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var statuses = [{
  created_at: '2015-12-05T17:35:00.000Z'
  , device: 'openaps://farawaypi'
  , pump: {
    battery: {
      status: 'normal',
      voltage: 1.52
    },
    status: {
      status: 'normal',
      bolusing: false,
      suspended: false
    },
    reservoir: 86.4,
    clock: '2015-12-05T17:32:00.000Z'
  }
}, {
  created_at: '2015-12-05T19:05:00.000Z'
  , device: 'openaps://abusypi'
  , pump: {
    battery: {
      status: 'normal',
      voltage: 1.52
    },
    status: {
      status: 'normal',
      bolusing: false,
      suspended: false
    },
    reservoir: 86.4,
    clock: '2015-12-05T19:02:00.000Z'
  }
}];

var profileData =
{
  'timezone': moment.tz.guess()
};

var statuses2 = [{
  created_at: '2015-12-05T17:35:00.000Z'
  , device: 'openaps://farawaypi'
  , pump: {
    battery: {
      status: 'normal',
      voltage: 1.52
    },
    status: {
      status: 'normal',
      bolusing: false,
      suspended: false
    },
    reservoir: 86.4,
    reservoir_display_override: '50+U',
    clock: '2015-12-05T17:32:00.000Z'
  }
}, {
  created_at: '2015-12-05T19:05:00.000Z'
  , device: 'openaps://abusypi'
  , pump: {
    battery: {
      status: 'normal',
      voltage: 1.52
    },
    status: {
      status: 'normal',
      bolusing: false,
      suspended: false
    },
    reservoir: 86.4,
    reservoir_display_override: '50+U',
    clock: '2015-12-05T19:02:00.000Z'
  }
}];

var now = moment(statuses[1].created_at);

_.forEach(statuses, function updateMills (status: any) {
  status.mills = moment(status.created_at).valueOf();
});

_.forEach(statuses2, function updateMills (status: any) {
  status.mills = moment(status.created_at).valueOf();
});

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('pump', function ( ) {

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set the property and update the pill', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.label.should.equal('Pump');
          options.value.should.equal('86.4U');
          done();
        }
      }
      , language: language
      , levels: levels
    };

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {devicestatus: statuses});

    var unmockedOfferProperty = sbx.offerProperty;
    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('pump');
      var result = setter();
      should.exist(result);
      result.data.level.should.equal(levels.NONE);
      result.data.battery.value.should.equal(1.52);
      result.data.reservoir.value.should.equal(86.4);

      sbx.offerProperty = unmockedOfferProperty;
      unmockedOfferProperty(name, setter);

    };

    pump.setProperties(sbx);
    pump.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('use reservoir_display_override when available', function (done: any) {
    var ctx = {
      settings: {
        units: 'mmol'
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.label.should.equal('Pump');
          options.value.should.equal('50+U');
          done();
        }
      }
      , language: language
      , levels: levels
    };

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {devicestatus: statuses2});

    var unmockedOfferProperty = sbx.offerProperty;
    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('pump');
      sbx.offerProperty = unmockedOfferProperty;
      unmockedOfferProperty(name, setter);
    };

    pump.setProperties(sbx);
    pump.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('not generate an alert when pump is ok', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };

    ctx.notifications.initRequests();

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {
      devicestatus: statuses
    });
    sbx.extendedSettings = { 'enableAlerts': true };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    should.not.exist(highest);

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('generate an alert when reservoir is low', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };

    ctx.notifications.initRequests();

    var lowResStatuses = _.cloneDeep(statuses);
    lowResStatuses[1].pump.reservoir = 0.5;

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {
      devicestatus: lowResStatuses
    });
    sbx.extendedSettings = { 'enableAlerts': true };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    highest.level.should.equal(levels.URGENT);
    highest.title.should.equal('URGENT: Pump Reservoir Low');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('generate an alert when reservoir is 0', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };

    ctx.notifications.initRequests();

    var lowResStatuses = _.cloneDeep(statuses);
    lowResStatuses[1].pump.reservoir = 0;

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {
      devicestatus: lowResStatuses
    });
    sbx.extendedSettings = { 'enableAlerts': true };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    highest.level.should.equal(levels.URGENT);
    highest.title.should.equal('URGENT: Pump Reservoir Low');

    done();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('generate an alert when battery is low', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };

    ctx.notifications.initRequests();

    var lowBattStatuses = _.cloneDeep(statuses);
    lowBattStatuses[1].pump.battery.voltage = 1.33;

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {
      devicestatus: lowBattStatuses
    });
    sbx.extendedSettings = { 'enableAlerts': true };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    highest.level.should.equal(levels.WARN);
    highest.title.should.equal('Warning, Pump Battery Low');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('generate an urgent alarm when battery is really low', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };

    ctx.notifications.initRequests();

    var lowBattStatuses = _.cloneDeep(statuses);
    lowBattStatuses[1].pump.battery.voltage = 1.00;

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {
      devicestatus: lowBattStatuses
    });
    sbx.extendedSettings = { 'enableAlerts': true };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    highest.level.should.equal(levels.URGENT);
    highest.title.should.equal('URGENT: Pump Battery Low');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('not generate a battery alarm during night when PUMP_WARN_BATT_QUIET_NIGHT is true', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
        , dayStart: 24 // Set to 24 so it always evaluates true in test
        , dayEnd: 21.0
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.label.should.equal('Pump');
          options.value.should.equal('86.4U');
          done();
        }
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
      , levels: levels
    };

    ctx.notifications.initRequests();

    var lowBattStatuses = _.cloneDeep(statuses);
    lowBattStatuses[1].pump.battery.voltage = 1.00;

    var sbx = sandbox.clientInit(ctx, now.valueOf(), {
      devicestatus: lowBattStatuses
      , profiles: [profileData]
    });
    profile.loadData(_.cloneDeep([profileData]));
    sbx.data.profile = profile;

    sbx.extendedSettings = {
      enableAlerts: true
      , warnBattQuietNight: true
    };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    should.not.exist(highest);

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('not generate an alert for a stale pump data, when there is an offline marker', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };

    ctx.notifications.initRequests();

    var sbx = sandbox.clientInit(ctx, now.add(1, 'hours').valueOf(), {
      devicestatus: statuses
      , treatments: [{eventType: 'OpenAPS Offline', mills: now.valueOf(), duration: 60}]
    });
    sbx.extendedSettings = { 'enableAlerts': true };
    pump.setProperties(sbx);
    pump.checkNotifications(sbx);

    var highest = ctx.notifications.findHighestAlarm('Pump');
    should.not.exist(highest);
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
      }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, top_ctx)
      , language: language
      , levels: levels
    };
    
    ctx.language.set('en');
    var sbx = sandbox.clientInit(ctx, now.valueOf(), {devicestatus: statuses});
    pump.setProperties(sbx);

    pump.virtAsst.intentHandlers.length.should.equal(4);

    pump.virtAsst.intentHandlers[0].intentHandler(function next(title: any, response: any) {
      title.should.equal('Insulin Remaining');
      response.should.equal('You have 86.4 units remaining');

      pump.virtAsst.intentHandlers[1].intentHandler(function next(title: any, response: any) {
        title.should.equal('Pump Battery');
        response.should.equal('Your pump battery is at 1.52 volts');
        
        pump.virtAsst.intentHandlers[2].intentHandler(function next(title: any, response: any) {
          title.should.equal('Insulin Remaining');
          response.should.equal('You have 86.4 units remaining');
    
          pump.virtAsst.intentHandlers[3].intentHandler(function next(title: any, response: any) {
            title.should.equal('Pump Battery');
            response.should.equal('Your pump battery is at 1.52 volts');
            done();
          }, [], sbx);
          
        }, [], sbx);
          
      }, [], sbx);

    }, [], sbx);

  });

});
