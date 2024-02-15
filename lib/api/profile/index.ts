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

    api.use(ctx.authorization.isPermitted('api:profile:read'));


   /**
   * @function query_models
   * Perform the standard query logic, translating API parameters into mongo
   * db queries in a fairly regimented manner.
   * This middleware executes the query, returning the results as JSON
   */
    function query_models (req: any, res: any, next: any) {
        var query = req.query;

        // If "?count=" is present, use that number to decide how many to return.
        if (!query.count) {
            query.count = consts.PROFILES_DEFAULT_COUNT;
        }

        // perform the query
        ctx.profile.list_query(query, function payload(err: any, profiles: any) {
            return res.json(profiles);
        });
    }

    // List profiles available
    api.get('/profiles/', query_models);

    // List profiles available
    api.get('/profile/', function(req: any, res: any) {
        const limit = req.query && req.query.count ? Number(req.query.count) : consts.PROFILES_DEFAULT_COUNT;
        ctx.profile.list(function (err: any, attribute: any) {
            return res.json(attribute);
        }, limit);
    });

    // List current active record (in current state LAST record is current active)
    api.get('/profile/current', function(req: any, res: any) {
        ctx.profile.last( function(err: any, records: any) {
            return res.json(records.length > 0 ? records[0] : null);
        });
    });

    function config_authed (app: any, api: any, wares: any, ctx: any) {

        // create new record
        api.post('/profile/', ctx.authorization.isPermitted('api:profile:create'), function(req: any, res: any) {
            var data = req.body;
            ctx.purifier.purifyObject(data);
            ctx.profile.create(data, function (err: any, created: any) {
                if (err) {
                    res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
                    console.log('Error creating profile');
                    console.log(err);
                } else {
                    res.json(created.ops);
                    console.log('Profile created', created);
                }
            });
        });

        // update record
        api.put('/profile/', ctx.authorization.isPermitted('api:profile:update'), function(req: any, res: any) {
            var data = req.body;
            ctx.profile.save(data, function (err: any, created: any) {
                if (err) {
                    res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
                    console.log('Error saving profile');
                    console.log(err);
                } else {
                    res.json(created);
                    console.log('Profile saved', created);
                }

            });
        });

        api.delete('/profile/:_id', ctx.authorization.isPermitted('api:profile:delete'), function(req: any, res: any) {
          ctx.profile.remove(req.params._id, function ( ) {
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

