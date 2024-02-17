'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_forEach'.
var _forEach = require('lodash/forEach');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_isNil'.
var _isNil = require('lodash/isNil');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_isArray'.
var _isArray = require('lodash/isArray');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../../constants');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
var moment = require('moment');

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure(app: any, wares: any, ctx: any) {
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

    api.use(ctx.authorization.isPermitted('api:activity:read'));

    // List activity data available
    api.get('/activity', function(req: any, res: any) {
        var ifModifiedSince = req.get('If-Modified-Since');
        ctx.activity.list(req.query, function(err: any, results: any) {
            var d1: any = null;
            
            _forEach(results, function clean(t: any) {

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
            
            if (!_isNil(d1)) res.setHeader('Last-Modified', d1.toUTCString());

            if (ifModifiedSince && d1.getTime() <= moment(ifModifiedSince).valueOf()) {
                res.status(304).send({
                    status: 304
                    , message: 'Not modified'
                    , type: 'internal'
                });
                return;
            } else {
                return res.json(results);
            }
        });
    });

    function config_authed(app: any, api: any, wares: any, ctx: any) {

        function post_response(req: any, res: any) {
            var activity = req.body;

            if (!_isArray(activity)) {
                activity = [activity];
            }

            ctx.activity.create(activity, function(err: any, created: any) {
                if (err) {
                    console.log('Error adding activity data', err);
                    res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
                } else {
                    console.log('Activity measure created');
                    res.json(created);
                }
            });
        }

        api.post('/activity/', ctx.authorization.isPermitted('api:activity:create'), post_response);

        api.delete('/activity/:_id', ctx.authorization.isPermitted('api:activity:delete'), function(req: any, res: any) {
            ctx.activity.remove(req.params._id, function() {
                res.json({});
            });
        });

        // update record
        api.put('/activity/', ctx.authorization.isPermitted('api:activity:update'), function(req: any, res: any) {
            var data = req.body;
            ctx.activity.save(data, function(err: any, created: any) {
                if (err) {
                    res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
                    console.log('Error saving activity');
                    console.log(err);
                } else {
                    res.json(created);
                    console.log('Activity measure saved', data);
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

