'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;

/**
 * DELETE: Deletes a document from the collection
 */
async function doDelete (opCtx: any) {

  const { col, req } = opCtx;

  await security.demandPermission(opCtx, `api:${col.colName}:delete`);

  if ((await validateDelete(opCtx)) !== true)
    return;

  if (req.query.permanent && req.query.permanent === "true") {
    await deletePermanently(opCtx);
  } else {
    await markAsDeleted(opCtx);
  }
}


async function validateDelete (opCtx: any) {

  const { col, req, res } = opCtx;

  const identifier = req.params.identifier;
  const result = await col.storage.findOne(identifier);

  if (!result)
    throw new Error('empty result');

  if (result.length === 0) {
    return opTools.sendJSON({ res, status: apiConst.HTTP.NOT_FOUND });
  }
  else {
    const storageDoc = result[0];

    if (storageDoc.isReadOnly === true || storageDoc.readOnly === true || storageDoc.readonly === true) {
      return opTools.sendJSONStatus(res, apiConst.HTTP.UNPROCESSABLE_ENTITY,
        apiConst.MSG.HTTP_422_READONLY_MODIFICATION);
    }
  }

  return true;
}


async function deletePermanently (opCtx: any) {

  const { ctx, col, req, res } = opCtx;

  const identifier = req.params.identifier;
  const result = await col.storage.deleteOne(identifier);

  if (!result)
    throw new Error('empty result');

  if (!result.deleted) {
    return opTools.sendJSON({ res, status: apiConst.HTTP.NOT_FOUND });
  }

  col.autoPrune();
  ctx.bus.emit('storage-socket-delete', { colName: col.colName, identifier });
  ctx.bus.emit('data-received');
  return opTools.sendJSON({ res, status: apiConst.HTTP.OK });
}


async function markAsDeleted (opCtx: any) {

  const { ctx, col, req, res, auth } = opCtx;

  const identifier = req.params.identifier;
  const setFields = { 'isValid': false, 'srvModified': (new Date).getTime() };

  if (auth && auth.subject && auth.subject.name) {
    // @ts-expect-error TS(2339) FIXME: Property 'modifiedBy' does not exist on type '{ is... Remove this comment to see the full error message
    setFields.modifiedBy = auth.subject.name;
  }

  const result = await col.storage.updateOne(identifier, setFields);

  if (!result)
    throw new Error('empty result');

  if (!result.updated) {
    return opTools.sendJSON({ res, status: apiConst.HTTP.NOT_FOUND });
  }

  ctx.bus.emit('storage-socket-delete', { colName: col.colName, identifier });
  col.autoPrune();
  ctx.bus.emit('data-received');
  return opTools.sendJSON({ res, status: apiConst.HTTP.OK });
}


// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'deleteOper... Remove this comment to see the full error message
function deleteOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339) FIXME: Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await doDelete(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = deleteOperation;
