// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('sandbox', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var sandbox = require('../lib/sandbox')();

  var now = Date.now();

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('init on client', function (done: any) {
    var ctx = {
      settings: {
        units: 'mg/dl'
        , thresholds:{
          bgHigh: 260
          , bgTargetTop: 180
          , bgTargetBottom: 80
          , bgLow: 55
        }
      }
      , pluginBase: {}
    };
    
    // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{ sett... Remove this comment to see the full error message
    ctx.language = require('../lib/language')();

    var data = {sgvs: [{mgdl: 100, mills: now}]};

    var sbx = sandbox.clientInit(ctx, Date.now(), data);

    sbx.pluginBase.should.equal(ctx.pluginBase);
    sbx.data.should.equal(data);
    sbx.lastSGVMgdl().should.equal(100);

    done();
  });

  function createServerSandbox() {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')();
    var ctx = {};
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    ctx.ddata = require('../lib/data/ddata')();
    // @ts-expect-error TS(2339) FIXME: Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    ctx.notifications = require('../lib/notifications')(env, ctx);
    // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{}'.
    ctx.language = require('../lib/language')();

    return sandbox.serverInit(env, ctx);
  }

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('init on server', function (done: any) {
    var sbx = createServerSandbox();
    sbx.data.sgvs = [{mgdl: 100, mills: now}];

    should.exist(sbx.notifications.requestNotify);
    should.not.exist(sbx.notifications.process);
    should.not.exist(sbx.notifications.ack);
    sbx.lastSGVMgdl().should.equal(100);

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display 39 as LOW and 401 as HIGH', function () {
    var sbx = createServerSandbox();

    sbx.displayBg({mgdl: 39}).should.equal('LOW');
    sbx.displayBg({mgdl: '39'}).should.equal('LOW');
    sbx.displayBg({mgdl: 401}).should.equal('HIGH');
    sbx.displayBg({mgdl: '401'}).should.equal('HIGH');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('build BG Now line using properties', function ( ) {
    var sbx = createServerSandbox();
    sbx.data.sgvs = [{mgdl: 99, mills: now}];
    sbx.properties = { delta: {display: '+5' }, direction: {value: 'FortyFiveUp', label: '↗', entity: '&#8599;'} };

    sbx.buildBGNowLine().should.equal('BG Now: 99 +5 ↗ mg/dl');

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('build default message using properties', function ( ) {
    var sbx = createServerSandbox();
    sbx.data.sgvs = [{mgdl: 99, mills: now}];
    sbx.properties = {
      delta: {display: '+5' }
      , direction: {value: 'FortyFiveUp', label: '↗', entity: '&#8599;'}
      , rawbg: {displayLine: 'Raw BG: 100 mg/dl'}
      , iob: {displayLine: 'IOB: 1.25U'}
      , cob: {displayLine: 'COB: 15g'}
    };

    sbx.buildDefaultMessage().should.equal('BG Now: 99 +5 ↗ mg/dl\nRaw BG: 100 mg/dl\nIOB: 1.25U\nCOB: 15g');

  });

});
