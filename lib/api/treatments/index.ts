'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_forEach'.
const _forEach = require('lodash/forEach');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_isNil'.
const _isNil = require('lodash/isNil');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_isArray'.
const _isArray = require('lodash/isArray');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_take'.
const _take = require('lodash/take');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'constants'... Remove this comment to see the full error message
const constants = require('../../constants');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment');

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure (app: any, wares: any, ctx: any, env: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express')
    , api = express.Router();

  api.use(wares.compression());

  // text body types get handled as raw buffer stream
  api.use(wares.rawParser);
  // json body types get handled as parsed json
  api.use(wares.bodyParser.json({
    limit: '50Mb'
  }));
  // also support url-encoded content-type
  api.use(wares.urlencodedParser);

  // invoke common middleware
  api.use(wares.sendJSONStatus);

  api.use(ctx.authorization.isPermitted('api:treatments:read'));

  function serveTreatments(req: any,res: any, err: any, results: any) {

    var ifModifiedSince = req.get('If-Modified-Since');

    var d1: any = null;

    const deNormalizeDates = env.settings.deNormalizeDates;

    _forEach(results, function clean (t: any) {
      t.carbs = Number(t.carbs);
      t.insulin = Number(t.insulin);

      if (deNormalizeDates && Object.prototype.hasOwnProperty.call(t, 'utcOffset')) {
          const d = moment(t.created_at).utcOffset(t.utcOffset);
          t.created_at = d.toISOString(true);
          delete t.utcOffset;
      }

      var d2 = null;

      if (Object.prototype.hasOwnProperty.call(t, 'created_at')) {
        d2 = new Date(t.created_at);
      } else {
        if (Object.prototype.hasOwnProperty.call(t, 'timestamp')) {
          d2 = new Date(t.timestamp);
        }
      }

      if (d2 == null) { return; }

      if (d1 == null || d2.getTime() > d1.getTime()) {
        d1 = d2;
      }
    });

    if (!_isNil(d1)) {
      res.setHeader('Last-Modified', d1.toUTCString());

      if (ifModifiedSince && d1.getTime() <= moment(ifModifiedSince).valueOf()) {
        res.status(304).send({
          status: 304
          , message: 'Not modified'
          , type: 'internal'
        });
        return;
      }
    }

    return res.json(results);
  }

  // List treatments available
  api.get('/treatments', function(req: any, res: any) {
    var query = req.query;
    if (!query.count) {
        // If there's a date search involved, default to a higher number of objects
        query.count = query.find ? 1000 : 100;
      }

    const inMemoryData = ctx.cache.treatments;
    const canServeFromMemory = inMemoryData && inMemoryData.length >= query.count && Object.keys(query).length == 1 ? true : false;

    if (canServeFromMemory) {
      serveTreatments(req, res, null, _take(inMemoryData,query.count));
    } else {
      ctx.treatments.list(query, function(err: any, results: any) {
        serveTreatments(req,res,err,results);
      });
    }
  });

  function config_authed (app: any, api: any, wares: any, ctx: any) {

    function post_response (req: any, res: any) {
      var treatments = req.body;

      if (!_isArray(treatments)) {
        treatments = [treatments];
      }

      for (let i = 0; i < treatments.length; i++) {
        const t = treatments[i];

        if (!t.created_at) {
          t.created_at = new Date().toISOString();
        }

        ctx.purifier.purifyObject(t);

        /*
        if (!t.created_at) {
          console.log('Trying to create treatment without created_at field', t);
          res.sendJSONStatus(res, constants.HTTP_VALIDATION_ERROR, 'Treatments must contain created_at');
          return;
        }
        const d = moment(t.created_at);
        if (!d.isValid()) {
          console.log('Trying to insert date with invalid created_at', t);
          res.sendJSONStatus(res, constants.HTTP_VALIDATION_ERROR, 'Treatments created_at must be an ISO-8601 date');
          return;
        }
        */
       
      }

      ctx.treatments.create(treatments, function(err: any, created: any) {
        if (err) {
          console.log('Error adding treatment', err);
          res.sendJSONStatus(res, constants.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
        } else {
          console.log('REST API treatment created', created);
          res.json(created);
        }
      });
    }

    api.post('/treatments/', ctx.authorization.isPermitted('api:treatments:create'), post_response);

    /**
     * @function delete_records
     * Delete treatments.  The query logic works the same way as find/list.  This
     * endpoint uses same search logic to remove records from the database.
     */
    function delete_records (req: any, res: any, next: any) {
      var query = req.query;
      if (!query.count) {
        query.count = 10
      }

      // remove using the query
      ctx.treatments.remove(query, function(err: any, stat: any) {
        if (err) {
          console.log('treatments delete error: ', err);
          return next(err);
        }

        // yield some information about success of operation
        res.json(stat);

        return next();
      });
    }

    api.delete('/treatments/:id', ctx.authorization.isPermitted('api:treatments:delete'), function(req: any, res: any, next: any) {
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
    api.delete('/treatments/', ctx.authorization.isPermitted('api:treatments:delete'), delete_records);

    // update record
    api.put('/treatments/', ctx.authorization.isPermitted('api:treatments:update'), function(req: any, res: any) {
      var data = req.body;
      ctx.treatments.save(data, function(err: any, created: any) {
        if (err) {
          res.sendJSONStatus(res, constants.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
          console.log('Error saving treatment', err);
        } else {
          res.json(created);
          console.log('Treatment saved', data);
        }
      });
    });
  }

  if (app.enabled('api') && app.enabled('careportal')) {
    config_authed(app, api, wares, ctx);
  }

  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
