'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../../constants');

function configure (app: any, wares: any, ctx: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var express = require('express'),
        api = express.Router( );

    // invoke common middleware
    api.use(wares.sendJSONStatus);
    // text body types get handled as raw buffer stream
    api.use(wares.rawParser);
    // json body types get handled as parsed json
    api.use(wares.jsonParser);
    // also support url-encoded content-type
    api.use(wares.urlencodedParser);
    // text body types get handled as raw buffer stream
    // shortcut to use extension to specify output content-type

    api.use(ctx.authorization.isPermitted('api:food:read'));

    // List foods available
    api.get('/food/', function(req: any, res: any) {
      ctx.food.list(function (err: any, attribute: any) {
        return res.json(attribute);
      });
    });

    api.get('/food/quickpicks', function(req: any, res: any) {
      ctx.food.listquickpicks(function (err: any, attribute: any) {
        return res.json(attribute);
      });
    });

    api.get('/food/regular', function(req: any, res: any) {
      ctx.food.listregular(function (err: any, attribute: any) {
        return res.json(attribute);
      });
    });

    function config_authed (app: any, api: any, wares: any, ctx: any) {

      // create new record
      api.post('/food/', ctx.authorization.isPermitted('api:food:create'), function(req: any, res: any) {
        var data = req.body;
        ctx.food.create(data, function (err: any, created: any) {
          if (err) {
            res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
            console.log('Error creating food');
            console.log(err);
          } else {
            res.json(created);
            console.log('food created',created);
          }
        });
      });

      // update record
      api.put('/food/', ctx.authorization.isPermitted('api:food:update'), function(req: any, res: any) {
        var data = req.body;
        ctx.food.save(data, function (err: any, created: any) {
          if (err) {
            res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
            console.log('Error saving food');
            console.log(err);
          } else {
            res.json(created);
            console.log('food saved');
          }
        });
      });
      // delete record
      api.delete('/food/:_id', ctx.authorization.isPermitted('api:food:delete'), function(req: any, res: any) {
        ctx.food.remove(req.params._id, function ( ) {
        res.json({ });
        });
      });
    }

    if (app.enabled('api')) {
      config_authed(app, api, wares, ctx);
    }

    return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;

