'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('bridge', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var bridge = require('../lib/plugins/bridge');

  var env = {
    extendedSettings: {
      bridge: {
        userName: 'nightscout'
        , password: 'wearenotwaiting'
        , interval: 60000
      }
    }
  };

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('be creatable', function () {
    var configed = bridge(env);
    should.exist(configed);
    should.exist(configed.startEngine);
    should.exist(configed.startEngine.call);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set options from env', function () {
    var opts = bridge.options(env);
    should.exist(opts);

    opts.login.accountName.should.equal('nightscout');
    opts.login.password.should.equal('wearenotwaiting');
    opts.interval.should.equal(60000);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('store entries from share', function (done: any) {
    var mockEntries = {
      create: function mockCreate (err: any, callback: any) {
        callback(null);
        done();
      }
    };
    bridge.bridged(mockEntries)(null);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set too low bridge interval option from env', function () {
    var tooLowInterval = {
      extendedSettings: {
        bridge: { interval: 900 }
      }
    };

    var opts = bridge.options(tooLowInterval);
    should.exist(opts);

    opts.interval.should.equal(156000);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set too high bridge interval option from env', function () {
    var tooHighInterval = {
      extendedSettings: {
        bridge: { interval: 500000 }
      }
    };

    var opts = bridge.options(tooHighInterval);
    should.exist(opts);

    opts.interval.should.equal(156000);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('set no bridge interval option from env', function () {
    var noInterval = {
      extendedSettings: {
        bridge: { }
      }
    };

    var opts = bridge.options(noInterval);
    should.exist(opts);

    opts.interval.should.equal(156000);
  });

});
