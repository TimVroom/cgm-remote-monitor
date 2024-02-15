'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'moment'.
var moment = require('moment');

function get_time_spec (spec: any) {
  return moment(spec).toDate();
}

function ddata_at (at: any, ctx: any, callback: any) {
  var ddata = ctx.ddata.clone( );
  if (Math.abs(at - ddata.lastUpdated) < 1000 * 60 * 5) {
    return callback(null, ctx.ddata);
  }
  ctx.dataloader.update(ddata, {lastUpdated: at, frame: true}, function (err: any) {
    // console.log('results', err, result);
    // console.log('ddata', ddata);
    callback(err, ddata);
  });
}
function get_ddata (req: any, res: any, next: any) {
  ddata_at(req.at.getTime( ), req.ctx, function (err: any, data: any) {
    res.data = data;
    // console.log('fetched results', err, data);
    console.error(err);
    next(err);
  });
}

function ensure_at (req: any, res: any, next: any) {
  if (!req.at) {
    req.at = new Date( );
  }
  next( );
}

function format_result (req: any, res: any, next: any) {
  res.json(res.data);
  next( );
}

/**
  * @method configure
  * Configure the ddata endpoints module, given an existing express app, common
  * middlewares, and the global app's `ctx`.
  * @param Express app  The express app we'll mount onto.
  * @param Object ctx The global ctx with all modules, storage, and event buses
  * configured.
  */

function configure (app: any, ctx: any) {
  // default storage biased towards entries.
  // var entries = ctx.entries;
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express'),
      api = express.Router( )
    ;

  api.param('at', function (req: any, res: any, next: any, at: any) {
    req.at = get_time_spec(at);
    next( );
  });

  api.use(function (req: any, res: any, next: any) {
    req.ctx = ctx;
    next( );
  });

  api.use(ctx.authorization.isPermitted('api:entries:read'),
    ctx.authorization.isPermitted('api:treatments:read'));
  api.get('/at/:at?', ensure_at, get_ddata, format_result);

  return api;
}

// expose module
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
