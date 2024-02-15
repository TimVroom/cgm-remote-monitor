'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
  , dateTools = require('../../shared/dateTools')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'renderer'.
  , renderer = require('../../shared/renderer')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FieldsProj... Remove this comment to see the full error message
  , FieldsProjector = require('../../shared/fieldsProjector')
  ;

/**
  * READ: Retrieves a single document from the collection
  */
async function read (opCtx: any) {

  const { req, res, col } = opCtx;

  await security.demandPermission(opCtx, `api:${col.colName}:read`);

  const fieldsProjector = new FieldsProjector(req.query.fields);

  const result = await col.storage.findOne(req.params.identifier
    , fieldsProjector.storageProjection());

  if (!result)
    throw new Error('empty result');

  if (result.length === 0) {
    return opTools.sendJSON({ res, status: apiConst.HTTP.NOT_FOUND });
  }

  const doc = result[0];
  if (doc.isValid === false) {
    return opTools.sendJSON({ res, status: apiConst.HTTP.GONE });
  }


  const modifiedDate = col.resolveDates(doc);
  if (modifiedDate) {
    res.setHeader('Last-Modified', modifiedDate.toUTCString());

    const ifModifiedSince = req.get('If-Modified-Since');

    if (ifModifiedSince
      && dateTools.floorSeconds(modifiedDate) <= dateTools.floorSeconds(new Date(ifModifiedSince))) {
      return res.status(apiConst.HTTP.NOT_MODIFIED).end();
    }
  }

  fieldsProjector.applyProjection(doc);

  res.status(apiConst.HTTP.OK);
  renderer.render(res, doc);
}


// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'readOperat... Remove this comment to see the full error message
function readOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339): Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await read(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = readOperation;
