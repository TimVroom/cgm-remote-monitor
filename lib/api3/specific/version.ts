'use strict';

function configure (app: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const express = require('express')
    , api = express.Router( )
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , apiConst = require('../const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , storageTools = require('../shared/storageTools')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , opTools = require('../shared/operationTools')
    ;

  api.get('/version', async function getVersion (req: any, res: any) {

    try {
      const versionInfo = await storageTools.getVersionInfo(app);

      opTools.sendJSON({ res, result: versionInfo });

    } catch(error) {
      console.error(error);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  });

  return api;
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
