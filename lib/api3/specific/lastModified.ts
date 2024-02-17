'use strict';

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure (app: any, ctx: any, env: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const express = require('express')
    , api = express.Router( )
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , apiConst = require('../const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , security = require('../security')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , opTools = require('../shared/operationTools')
  ;

  api.get('/lastModified', async function getLastModified (req: any, res: any) {

    async function getLastModified (col: any) {

      let result;
      const lastModified = await col.storage.getLastModified('srvModified');

      if (lastModified) {
        result = lastModified.srvModified ? lastModified.srvModified : null;
      }

      if (col.fallbackDateField) {

        const lastModified = await col.storage.getLastModified(col.fallbackDateField);

        if (lastModified && lastModified[col.fallbackDateField]) {
          let timestamp = lastModified[col.fallbackDateField];
          if (typeof(timestamp) === 'string') {
            timestamp = (new Date(timestamp)).getTime();
          }

          if (result === null || result < timestamp) {
            result = timestamp;
          }
        }
      }

      return { colName: col.colName, lastModified: result };
    }


    async function collectionsAsync (auth: any) {

      const cols = app.get('collections')
        , promises = []
        , output = {}
        ;

      for (const colName in cols) {
        const col = cols[colName];

        if (security.checkPermission(auth, 'api:' + col.colName + ':read')) {
          promises.push(getLastModified(col));
        }
      }

      const results = await Promise.all(promises);

      for (const result of results) {
        if (result.lastModified)
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          output[result.colName] = result.lastModified;
      }

      return output;
    }


    async function operation (opCtx: any) {

      const { res, auth } = opCtx;
      const srvDate = new Date();

      let info = {
        srvDate: srvDate.getTime(),
        collections: { }
      };

      info.collections = await collectionsAsync(auth);

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
