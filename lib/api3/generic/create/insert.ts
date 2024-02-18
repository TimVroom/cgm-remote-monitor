'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
  , validate = require('./validate')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
  , path = require('path')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;

/**
 * Insert new document into the collection
 * @param {Object} opCtx
 * @param {Object} doc
 */
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'insert'.
async function insert (opCtx: any, doc: any) {

  const { ctx, auth, col, req, res } = opCtx;

  await security.demandPermission(opCtx, `api:${col.colName}:create`);

  if (validate(opCtx, doc) !== true)
    return;

  const now = new Date;
  doc.srvModified = now.getTime();
  doc.srvCreated = doc.srvModified;

  if (auth && auth.subject && auth.subject.name) {
    doc.subject = auth.subject.name;
  }

  const identifier = await col.storage.insertOne(doc);

  if (!identifier)
    throw new Error('empty identifier');

  res.setHeader('Last-Modified', now.toUTCString());
  res.setHeader('Location', path.posix.join(req.baseUrl, req.path, identifier));


  const fields = {
    identifier: identifier,
    lastModified: now.getTime()
  };
  opTools.sendJSON({ res, status: apiConst.HTTP.CREATED, fields: fields });

  ctx.bus.emit('storage-socket-create', { colName: col.colName, doc });
  col.autoPrune();
  ctx.bus.emit('data-received');
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = insert;
