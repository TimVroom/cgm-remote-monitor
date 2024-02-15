'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('../../const.json')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'validate'.
  , validate = require('./validate.js')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
  , dateTools = require('../../shared/dateTools')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FieldsProj... Remove this comment to see the full error message
  , FieldsProjector = require('../../shared/fieldsProjector')
  ;

/**
  * PATCH: Partially updates document in the collection
  */
async function patch (opCtx: any) {

  const { req, res, col } = opCtx;
  const doc = req.body;

  if (_.isEmpty(doc)) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_REQUEST_BODY);
  }

  await security.demandPermission(opCtx, `api:${col.colName}:update`);
  
  // parseDate is not valid for patch operation
  // (it is adding new fields)
  // col.parseDate(doc);
  const identifier = req.params.identifier
    , identifyingFilter = col.storage.identifyingFilter(identifier);

  const result = await col.storage.findOneFilter(identifyingFilter, { });

  if (!result)
    throw new Error('result empty');

  if (result.length > 0) {

    const storageDoc = result[0];
    if (storageDoc.isValid === false) {
      return opTools.sendJSONStatus(res, apiConst.HTTP.GONE);
    }

    const modifiedDate = col.resolveDates(storageDoc)
      , ifUnmodifiedSince = req.get('If-Unmodified-Since');

    if (ifUnmodifiedSince
      && dateTools.floorSeconds(modifiedDate) > dateTools.floorSeconds(new Date(ifUnmodifiedSince))) {
      return opTools.sendJSONStatus(res, apiConst.HTTP.PRECONDITION_FAILED);
    }

    await applyPatch(opCtx, identifier, doc, storageDoc);
  }
  else {
    return opTools.sendJSONStatus(res, apiConst.HTTP.NOT_FOUND);
  }
}


/**
 * Patch existing document in the collection
 * @param {Object} opCtx
 * @param {string} identifier
 * @param {Object} doc - fields and values to patch
 * @param {Object} storageDoc - original (database) version of document
 */
async function applyPatch (opCtx: any, identifier: any, doc: any, storageDoc: any) {

  const { ctx, res, col, auth } = opCtx;

  if (validate(opCtx, doc, storageDoc) !== true)
    return;

  const now = new Date;
  doc.srvModified = now.getTime();

  if (auth && auth.subject && auth.subject.name) {
    doc.modifiedBy = auth.subject.name;
  }

  const matchedCount = await col.storage.updateOne(identifier, doc);

  if (!matchedCount)
    throw new Error('matchedCount empty');

  res.setHeader('Last-Modified', now.toUTCString());
  opTools.sendJSONStatus(res, apiConst.HTTP.OK);

  const fieldsProjector = new FieldsProjector('_all');
  const patchedDocs = await col.storage.findOne(identifier, fieldsProjector);
  const patchedDoc = patchedDocs[0];
  fieldsProjector.applyProjection(patchedDoc);
  ctx.bus.emit('storage-socket-update', { colName: col.colName, doc: patchedDoc });

  col.autoPrune();
  ctx.bus.emit('data-received');
}


// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'patchOpera... Remove this comment to see the full error message
function patchOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339): Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await patch(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = patchOperation;
