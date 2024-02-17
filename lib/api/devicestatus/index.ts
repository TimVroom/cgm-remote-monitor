'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
const consts = require('../../constants');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { query } = require('express');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_take'.
const _take = require('lodash/take');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure (app: any, wares: any, ctx: any, env: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express')
    , api = express.Router();

  // invoke common middleware
  api.use(wares.sendJSONStatus);
  // text body types get handled as raw buffer stream
  api.use(wares.rawParser);
  // json body types get handled as parsed json
  api.use(wares.jsonParser);
  // also support url-encoded content-type
  api.use(wares.urlencodedParser);
  // text body types get handled as raw buffer stream

  api.use(ctx.authorization.isPermitted('api:devicestatus:read'));

  function processDates(results: any) {
    // Support date de-normalization for older clients
    
    if (env.settings.deNormalizeDates) {
      const r: any = [];
      results.forEach(function(e: any) {
        if (e.created_at && Object.prototype.hasOwnProperty.call(e, 'utcOffset')) {
          const d = moment(e.created_at).utcOffset(e.utcOffset);
          e.created_at = d.toISOString(true);
          delete e.utcOffset;
        }
        r.push(e);
      });
      return r;
    } else {
      return results;
    }
  }

  // List settings available
  api.get('/devicestatus/', function(req: any, res: any) {
    var q = req.query;
    if (!q.count) {
      q.count = 10;
    }

    const inMemoryData = ctx.cache.devicestatus ? ctx.cache.devicestatus : [];
    const canServeFromMemory = inMemoryData.length >= q.count && Object.keys(q).length == 1 ? true : false;

    if (canServeFromMemory) {
      const sorted = _.sortBy(inMemoryData, function(item: any) {
        return -item.mills;
      });

      return res.json(processDates(_take(sorted, q.count)));
    }

    ctx.devicestatus.list(q, function(err: any, results: any) {
      return res.json(processDates(results));
    });
  });

  function config_authed (app: any, api: any, wares: any, ctx: any) {

    function doPost (req: any, res: any) {
      var obj = req.body;

      ctx.purifier.purifyObject(obj);
  
      ctx.devicestatus.create(obj, function(err: any, created: any) {
        if (err) {
          res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
        } else {
          res.json(created);
        }
      });
    }

    api.post('/devicestatus/', ctx.authorization.isPermitted('api:devicestatus:create'), doPost);

    /**
     * @function delete_records
     * Delete devicestatus.  The query logic works the same way as find/list.  This
     * endpoint uses same search logic to remove records from the database.
     */
    function delete_records (req: any, res: any, next: any) {
      var query = req.query;
      if (!query.count) {
        query.count = 10
      }

      console.log('Delete records with query: ', query);

      // remove using the query
      ctx.devicestatus.remove(query, function(err: any, stat: any) {
        if (err) {
          console.log('devicestatus delete error: ', err);
          return next(err);
        }
        // yield some information about success of operation
        res.json(stat);

        console.log('devicestatus records deleted');

        return next();
      });
    }

    api.delete('/devicestatus/:id', ctx.authorization.isPermitted('api:devicestatus:delete'), function(req: any, res: any, next: any) {
      if (!req.query.find) {
        req.query.find = {
          _id: req.params.id
        };
      } else {
        req.query.find._id = req.params.id;
      }

      if (req.query.find._id === '*') {
        // match any record id
        delete req.query.find._id;
      }
      next();
    }, delete_records);

    // delete record that match query
    api.delete('/devicestatus/', ctx.authorization.isPermitted('api:devicestatus:delete'), delete_records);
  }

  if (app.enabled('api')) {
    config_authed(app, api, wares, ctx);
  }

  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
