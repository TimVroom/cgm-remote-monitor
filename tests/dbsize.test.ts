'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
const language = require('../lib/language')(fs);
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
const levels = require('../lib/levels');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';

var topctx = {
  levels: levels
}

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Database Size', function() {

  var dataInRange = { dbstats: { dataSize: 1024 * 1024 * 137, indexSize: 1024 * 1024 * 48, fileSize: 1024 * 1024 * 256 } };
  var dataWarn = { dbstats: { dataSize: 1024 * 1024 * 250, indexSize: 1024 * 1024 * 100, fileSize: 1024 * 1024 * 360 } };
  var dataUrgent = { dbstats: { dataSize: 1024 * 1024 * 300, indexSize: 1024 * 1024 * 150, fileSize: 1024 * 1024 * 496 } };

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display database size in range', function(done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var ctx = {
      settings: {}
      , language: language
      , levels: levels
    };

    var sbx = sandbox.clientInit(ctx, Date.now(), dataInRange);

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('dbsize');
      var result = setter();
      result.display.should.equal('37%');
      result.status.should.equal('current');
      done();
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx);

  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display database size warning', function(done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var ctx = {
      settings: {}
      , language: language
      , levels: levels
    };

    var sbx = sandbox.clientInit(ctx, Date.now(), dataWarn);

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('dbsize');
      var result = setter();
      result.display.should.equal('70%');
      result.status.should.equal('warn');
      done();
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);

    dbsize.setProperties(sbx);

  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display database size urgent', function(done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var ctx = {
      settings: {}
      , language: language
      , levels: levels
    };

    var sbx = sandbox.clientInit(ctx, Date.now(), dataUrgent);

    sbx.offerProperty = function mockedOfferProperty (name: any, setter: any) {
      name.should.equal('dbsize');
      var result = setter();
      result.display.should.equal('90%');
      result.status.should.equal('urgent');
      done();
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx);

  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display database size warning notiffication', function(done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var ctx = {
      settings: {}
      , language: language
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, topctx)
      , levels: levels
    };
    ctx.notifications.initRequests();

    var sbx = sandbox.clientInit(ctx, Date.now(), dataWarn);
    sbx.extendedSettings = { 'enableAlerts': 'TRUE' };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);

    dbsize.setProperties(sbx);
    dbsize.checkNotifications(sbx);

    var notif = ctx.notifications.findHighestAlarm('Database Size');
    notif.level.should.equal(ctx.levels.WARN);
    notif.title.should.equal('Warning Database Size near its limits!');
    notif.message.should.equal('Database size is 350 MiB out of 496 MiB. Please backup and clean up database!');
    done();
  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display database size urgent notiffication', function(done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var ctx = {
      settings: {}
      , language: language
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , notifications: require('../lib/notifications')(env, topctx)
      , levels: levels
    };
    ctx.notifications.initRequests();

    var sbx = sandbox.clientInit(ctx, Date.now(), dataUrgent);
    sbx.extendedSettings = { 'enableAlerts': 'TRUE' };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);

    dbsize.setProperties(sbx);
    dbsize.checkNotifications(sbx);

    var notif = ctx.notifications.findHighestAlarm('Database Size');
    notif.level.should.equal(ctx.levels.URGENT);
    notif.title.should.equal('Urgent Database Size near its limits!');
    notif.message.should.equal('Database size is 450 MiB out of 496 MiB. Please backup and clean up database!');
    done();
  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the database size in percent', function(done: any) {
    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.value.should.equal('90%');
          options.labelClass.should.equal('plugicon-database');
          options.pillClass.should.equal('urgent');
          done();
        }
      }
      , language: language
      , levels: levels
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), dataUrgent);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx);
    dbsize.updateVisualisation(sbx);

  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set a pill to the database size in MiB', function(done: any) {
    var ctx = {
      settings: {
        extendedSettings: {
          empty: false
          , dbsize: {
            inMib: true
          }
        }
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.value.should.equal('450MiB');
          options.labelClass.should.equal('plugicon-database');
          options.pillClass.should.equal('urgent');
          done();
        }
      }
      , language: language
      , levels: levels
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), dataUrgent);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx.withExtendedSettings(dbsize));
    dbsize.updateVisualisation(sbx);

  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('configure warn level percentage', function(done: any) {

    var ctx = {
      settings: {
        extendedSettings: {
          empty: false
          , dbsize: {
            warnPercentage: 30
          }
        }
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.value.should.equal('37%');
          options.pillClass.should.equal('warn');
          done();
        }
      }
      , language: language
      , levels: levels
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), dataInRange);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx.withExtendedSettings(dbsize));
    dbsize.updateVisualisation(sbx);
  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('configure urgent level percentage', function(done: any) {

    var ctx = {
      settings: {
        extendedSettings: {
          empty: false
          , dbsize: {
            warnPercentage: 30
            , urgentPercentage: 36
          }
        }
      }
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.value.should.equal('37%');
          options.pillClass.should.equal('urgent');
          done();
        }
      }
      , language: language
      , levels: levels
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), dataInRange);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx.withExtendedSettings(dbsize));
    dbsize.updateVisualisation(sbx);
  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('hide the pill if there is no info regarding database size', function(done: any) {
    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText (plugin: any, options: any) {
          options.hide.should.equal(true);
          done();
        }
      }
      , language: language
      , levels: levels
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), {});
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx);
    dbsize.updateVisualisation(sbx);
  });

  // ~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function(done: any) {

    var ctx = {
      settings: {}
      , language: language
      , levels: levels
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var sandbox = require('../lib/sandbox')();
    var sbx = sandbox.clientInit(ctx, Date.now(), dataUrgent);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var dbsize = require('../lib/plugins/dbsize')(ctx);
    dbsize.setProperties(sbx);

    dbsize.virtAsst.intentHandlers.length.should.equal(1);

    dbsize.virtAsst.intentHandlers[0].intentHandler(function next (title: any, response: any) {
      title.should.equal('Database file size');
      response.should.equal('450 MiB. That is 90% of available database space.');

      done();

    }, [], sbx);

  });

});
