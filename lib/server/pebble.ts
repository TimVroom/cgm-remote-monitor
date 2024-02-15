'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var sandbox = require('../sandbox')();
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var units = require('../units')();

var DIRECTIONS = {
  NONE: 0
  , DoubleUp: 1
  , SingleUp: 2
  , FortyFiveUp: 3
  , Flat: 4
  , FortyFiveDown: 5
  , SingleDown: 6
  , DoubleDown: 7
  , 'NOT COMPUTABLE': 8
  , 'RATE OUT OF RANGE': 9
};

function directionToTrend (direction: any) {
  var trend = 8;
  if (direction in DIRECTIONS) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    trend = DIRECTIONS[direction];
  }
  return trend;
}

function reverseAndSlice (entries: any, req: any) {
  var reversed = entries.slice(0);
  reversed.reverse();
  return reversed.slice(0, req.count);
}


function mapSGVs(req: any, sbx: any) {
  function scaleMgdlAPebbleLegacyHackThatWillNotGoAway (bg: any) {
    if (req.mmol) {
      return units.mgdlToMMOL(bg);
    } else {
      return bg.toString();
    }
  }

  var cal = sbx.lastEntry(sbx.data.cals);

  return _.map(reverseAndSlice(sbx.data.sgvs, req), function transformSGV(sgv: any) {
    var transformed = {
      sgv: scaleMgdlAPebbleLegacyHackThatWillNotGoAway(sgv.mgdl), trend: directionToTrend(sgv.direction), direction: sgv.direction, datetime: sgv.mills
    };

    if (req.rawbg && cal) {
      // @ts-expect-error TS(2339) FIXME: Property 'filtered' does not exist on type '{ sgv:... Remove this comment to see the full error message
      transformed.filtered = sgv.filtered;
      // @ts-expect-error TS(2339) FIXME: Property 'unfiltered' does not exist on type '{ sg... Remove this comment to see the full error message
      transformed.unfiltered = sgv.unfiltered;
      // @ts-expect-error TS(2339) FIXME: Property 'noise' does not exist on type '{ sgv: an... Remove this comment to see the full error message
      transformed.noise = sgv.noise;
    }

    return transformed;
  });

}

function addExtraData (first: any, req: any, sbx: any) {
  //for compatibility we're keeping battery and iob on the first bg, but they would be better somewhere else

  var data = sbx.data;

  function addDelta() {
    var delta = sbx.properties.delta;

    //for legacy reasons we need to return a 0 for delta if it can't be calculated
    first.bgdelta = delta && delta.scaled || 0;
    if (req.mmol) {
      first.bgdelta = first.bgdelta.toFixed(1);
    }
  }

  function addBattery() {
    var uploaderStatus = _.findLast(data.devicestatus, function (status: any) {
      return ('uploader' in status);
    });

    var battery = uploaderStatus && uploaderStatus.uploader && uploaderStatus.uploader.battery;

    if (battery && battery >= 0) {
      first.battery = battery.toString();
    }
  }

  function addIOB() {
    if (req.iob) {
      var iobResult = req.ctx.plugins('iob').calcTotal(data.treatments, data.devicestatus, data.profile, Date.now());
      if (iobResult) {
        first.iob = iobResult.display || 0;
      }
      
      sbx.properties.iob = iobResult;
      var bwpResult = req.ctx.plugins('bwp').calc(sbx);

      if (bwpResult) {
        first.bwp = bwpResult.bolusEstimateDisplay;
        first.bwpo = bwpResult.outcomeDisplay;
      }
      
    }
  }

  function addCOB() {
    if (req.cob) {
      var cobResult = req.ctx.plugins('cob').cobTotal(data.treatments, data.devicestatus, data.profile, Date.now());
      if (cobResult) {
        first.cob = cobResult.display || 0;
      }
    }
  }

  addDelta();
  addBattery();
  addIOB();
  addCOB();
}

function prepareBGs (req: any, sbx: any) {
  if (sbx.data.sgvs.length === 0) {
    return [];
  }

  var bgs = mapSGVs(req, sbx);
  addExtraData(bgs[0], req, sbx);

  return bgs;
}

function prepareCals (req: any, sbx: any) {
  var data = sbx.data;

  if (req.rawbg && data.cals && data.cals.length > 0) {
    return _.map(reverseAndSlice(data.cals, req), function transformCal (cal: any) {
      return _.pick(cal, ['slope', 'intercept', 'scale']);
    });
  } else {
    return [];
  }
}

function prepareSandbox (req: any) {
  var clonedEnv = _.cloneDeep(req.env);
  if (req.mmol) {
    clonedEnv.settings.units = 'mmol';
  }

  var sbx = sandbox.serverInit(clonedEnv, req.ctx);
  req.ctx.plugins('bgnow').setProperties(sbx);

  return sbx;
}

function pebble (req: any, res: any) {
  var sbx = prepareSandbox(req);

  res.setHeader('content-type', 'application/json');
  res.write(JSON.stringify({
    status: [ {now: Date.now()} ]
    , bgs: prepareBGs(req, sbx)
    , cals: prepareCals(req, sbx)
  }));

  res.end( );
}

function configure (env: any, ctx: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var wares = require('../middleware/')(env);
  function middle (req: any, res: any, next: any) {
    req.env = env;
    req.ctx = ctx;
    req.rawbg = env.settings.isEnabled('rawbg');
    req.iob = env.settings.isEnabled('iob');
    req.cob = env.settings.isEnabled('cob');
    req.mmol = (req.query.units || env.settings.units) === 'mmol';
    req.count = parseInt(req.query.count) || 1;

    next( );
  }
  return [middle, wares.sendJSONStatus, ctx.authorization.isPermitted('api:pebble,entries:read'), pebble];
}

configure.pebble = pebble;

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
