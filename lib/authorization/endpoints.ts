'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
var express = require('express');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('./../constants');

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init (env: any, authorization: any) {
  var endpoints = express( );

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var wares = require('./../middleware/index')(env);

  endpoints.use(wares.sendJSONStatus);
  // text body types get handled as raw buffer stream
  endpoints.use(wares.bodyParser.raw());
  // json body types get handled as parsed json
  endpoints.use(wares.bodyParser.json());
  // also support url-encoded content-type
  endpoints.use(wares.bodyParser.urlencoded({ extended: true }));

  endpoints.get('/request/:accessToken', function requestAuthorize (req: any, res: any) {
    var authorized = authorization.authorize(req.params.accessToken);

    if (authorized) {
      res.json(authorized);
    } else {
      res.sendJSONStatus(res, consts.HTTP_UNAUTHORIZED, 'Unauthorized', 'Invalid/Missing');
    }
  });

  endpoints.get('/permissions', authorization.isPermitted('admin:api:permissions:read'), function getSubjects (req: any, res: any) {
    res.json(authorization.seenPermissions);
  });

  endpoints.get('/permissions/trie', authorization.isPermitted('admin:api:permissions:read'), function getSubjects (req: any, res: any) {
    res.json(authorization.expandedPermissions());
  });

  endpoints.get('/subjects', authorization.isPermitted('admin:api:subjects:read'), function getSubjects (req: any, res: any) {
    res.json(_.map(authorization.storage.subjects, function eachSubject (subject: any) {
      return _.pick(subject, ['_id', 'name', 'accessToken', 'roles']);
    }));
  });

  endpoints.post('/subjects', authorization.isPermitted('admin:api:subjects:create'), function createSubject (req: any, res: any) {
    authorization.storage.createSubject(req.body, function created (err: any, created: any) {
      if (err) {
        res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
      } else {
        res.json(created);
      }
    });
  });

  endpoints.put('/subjects', authorization.isPermitted('admin:api:subjects:update'), function saveSubject (req: any, res: any) {
    authorization.storage.saveSubject(req.body, function saved (err: any, saved: any) {
      if (err) {
        res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
      } else {
        res.json(saved);
      }
    });
  });

  endpoints.delete('/subjects/:_id', authorization.isPermitted('admin:api:subjects:delete'), function deleteSubject (req: any, res: any) {
    authorization.storage.removeSubject(req.params._id, function deleted (err: any) {
      if (err) {
        res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
      } else {
        res.json({ });
      }
    });
  });

  endpoints.get('/roles', authorization.isPermitted('admin:api:roles:list'), function getRoles (req: any, res: any) {
    res.json(authorization.storage.roles);
  });

  endpoints.post('/roles', authorization.isPermitted('admin:api:roles:create'), function createSubject (req: any, res: any) {
    authorization.storage.createRole(req.body, function created (err: any, created: any) {
      if (err) {
        res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
      } else {
        res.json(created);
      }
    });
  });

  endpoints.put('/roles', authorization.isPermitted('admin:api:roles:update'), function saveRole (req: any, res: any) {
    authorization.storage.saveRole(req.body, function saved (err: any, saved: any) {
      if (err) {
        res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
      } else {
        res.json(saved);
      }
    });
  });

  endpoints.delete('/roles/:_id', authorization.isPermitted('admin:api:roles:delete'), function deleteRole (req: any, res: any) {
    authorization.storage.removeRole(req.params._id, function deleted (err: any) {
      if (err) {
        res.sendJSONStatus(res, consts.HTTP_INTERNAL_ERROR, 'Mongo Error', err);
      } else {
        res.json({ });
      }
    });
  });

  endpoints.get('/debug/check/:permission', function check (req: any, res: any, next: any) {
    authorization.isPermitted(req.params.permission)(req, res, next);
  }, function debug (req: any, res: any) {
    res.json({check: true});
  });


  return endpoints;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
