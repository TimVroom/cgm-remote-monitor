'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
const consts = require('../constants');

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure (ctx: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const express = require('express')
    , api = express.Router();

  api.get('/adminnotifies', function(req: any, res: any) {
    ctx.authorization.resolveWithRequest(req, function resolved (err: any, result: any) {

      const isAdmin = ctx.authorization.checkMultiple('*:*:admin', result.shiros); //full admin permissions
      const response = {
        notifies: []
        , notifyCount: 0
      };

      if (ctx.adminnotifies) {
        const notifies = _.filter(ctx.adminnotifies.getNotifies(), function isOld (obj: any) {
          return (obj.persistent || (Date.now() - obj.lastRecorded) < 1000 * 60 * 60 * 8);
        });

        if (isAdmin) { response.notifies = notifies }
        response.notifyCount = notifies.length;
      }

      res.sendJSONStatus(res, consts.HTTP_OK, response);
    });
  });

  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
