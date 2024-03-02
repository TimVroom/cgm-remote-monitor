import 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
const should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
const language = require('../lib/language')(fs);

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('basalprofile', function ( ) {

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var sandbox = require('../lib/sandbox')();
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();
  var ctx = {
    settings: {}
    , language: language
  };
  // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{ setting... Remove this comment to see the full error message
  ctx.ddata = require('../lib/data/ddata')();
  // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
  ctx.notifications = require('../lib/notifications')(env, ctx);

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var basal = require('../lib/plugins/basalprofile')(ctx);

  var profileData = 
  {
    'timezone': 'UTC',
    'startDate': '2015-06-21',
    'basal': [
        {
            'time': '00:00',
            'value': 0.175
        },
        {
            'time': '02:30',
            'value': 0.125
        },
        {
            'time': '05:00',
            'value': 0.075
        },
        {
            'time': '08:00',
            'value': 0.1
        },
        {
            'time': '14:00',
            'value': 0.125
        },
        {
            'time': '20:00',
            'value': 0.3
        },
        {
            'time': '22:00',
            'value': 0.225
        }
    ]
  };

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var profile = require('../lib/profilefunctions')([profileData], helper.ctx);

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('update basal profile pill', function (done: any) {
    var data = {};

    var ctx = {
      settings: {}
      , pluginBase: {
        updatePillText: function mockedUpdatePillText(plugin: any, options: any) {
          options.value.should.equal('0.175U');
          done();
        }
      }
      , language: language
    };

    var time = new Date('2015-06-21T00:00:00+00:00');

    console.log('TIME1', time);

    var sbx = sandbox.clientInit(ctx, time, data);
    sbx.data.profile = profile;
    basal.setProperties(sbx);
    basal.updateVisualisation(sbx);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function (done: any) {
    var data = {};

    var ctx = {
      settings: {}
      , pluginBase: { }
      , language: language
    };

    var time = new Date('2015-06-21T00:00:00+00:00');

    var sbx = sandbox.clientInit(ctx, time, data);
    sbx.data.profile = profile;

    basal.virtAsst.intentHandlers.length.should.equal(1);
    basal.virtAsst.rollupHandlers.length.should.equal(1);

    basal.virtAsst.intentHandlers[0].intentHandler(function next(title: any, response: any) {
      title.should.equal('Current Basal');
      response.should.equal('Your current basal is 0.175 units per hour');

      basal.virtAsst.rollupHandlers[0].rollupHandler([], sbx, function callback (err: any, response: any) {
        should.not.exist(err);
        response.results.should.equal('Your current basal is 0.175 units per hour');
        response.priority.should.equal(1);
        done();
      });

    }, [], sbx);
  });

});