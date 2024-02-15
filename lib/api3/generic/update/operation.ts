'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
  , dateTools = require('../../shared/dateTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'insert'.
  , insert = require('../create/insert')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'replace'.
  , replace = require('./replace')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;

/**
  * UPDATE: Updates a document in the collection
  */
async function update (opCtx: any) {

  const { col, req, res } = opCtx;
  const doc = req.body;

  if (_.isEmpty(doc)) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_REQUEST_BODY);
  }

  col.parseDate(doc);
  opTools.resolveIdentifier(doc);

  const identifier = req.params.identifier
    , identifyingFilter = col.storage.identifyingFilter(identifier);

  const result = await col.storage.findOneFilter(identifyingFilter, { });

  if (!result)
    throw new Error('empty result');

  doc.identifier = identifier;

  if (result.length > 0) {
    await updateConditional(opCtx, doc, result[0]);
  }
  else {
    await insert(opCtx, doc);
  }
}


async function updateConditional (opCtx: any, doc: any, storageDoc: any) {

  const { col, req, res } = opCtx;

  if (storageDoc.isValid === false) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.GONE);
  }

  const modifiedDate = col.resolveDates(storageDoc)
    , ifUnmodifiedSince = req.get('If-Unmodified-Since');

  if (ifUnmodifiedSince
    && dateTools.floorSeconds(modifiedDate) > dateTools.floorSeconds(new Date(ifUnmodifiedSince))) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.PRECONDITION_FAILED);
  }

  await replace(opCtx, doc, storageDoc);
}


// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'updateOper... Remove this comment to see the full error message
function updateOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339) FIXME: Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await update(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = updateOperation;
