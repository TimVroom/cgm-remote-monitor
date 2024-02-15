'use strict';

function configure (app: any, ctx: any, env: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const express = require('express')
    , api = express.Router( )
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , apiConst = require('../const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , storageTools = require('../shared/storageTools')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , security = require('../security')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , opTools = require('../shared/operationTools')
    ;

  api.get('/status', async function getStatus (req: any, res: any) {

    function permsForCol (col: any, auth: any) {
      let colPerms = '';

      if (security.checkPermission(auth, 'api:' + col.colName + ':create')) {
          colPerms += 'c';
      }

      if (security.checkPermission(auth, 'api:' + col.colName + ':read')) {
          colPerms += 'r';
      }

      if (security.checkPermission(auth, 'api:' + col.colName + ':update')) {
          colPerms += 'u';
      }

      if (security.checkPermission(auth, 'api:' + col.colName + ':delete')) {
          colPerms += 'd';
      }

      return colPerms;
    }


    async function operation (opCtx: any) {
      const cols = app.get('collections');

      let info = await storageTools.getVersionInfo(app);

      info.apiPermissions = {};
      for (let col in cols) {
        const colPerms = permsForCol(col, opCtx.auth);
        if (colPerms) {
          info.apiPermissions[col] = colPerms;
        }
      }

      opTools.sendJSON({ res, result: info });
    }


    const opCtx = { app, ctx, env, req, res };

    try {
      // @ts-expect-error TS(2339) FIXME: Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await operation(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  });

  return api;
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
