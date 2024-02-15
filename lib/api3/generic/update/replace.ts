'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
  , validate = require('./validate.js')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
  , path = require('path')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;

/**
 * Replace existing document in the collection
 * @param {Object} opCtx
 * @param {any} doc - new version of document to set
 * @param {any} storageDoc - old version of document (existing in the storage)
 * @param {Object} options
 */
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'replace'.
async function replace (opCtx: any, doc: any, storageDoc: any, options: any) {

  const { ctx, auth, col, req, res } = opCtx;
  const { isDeduplication } = options || {};

  await security.demandPermission(opCtx, `api:${col.colName}:update`);

  if (validate(opCtx, doc, storageDoc, { isDeduplication }) !== true)
    return;

  const now = new Date;
  doc.srvModified = now.getTime();
  doc.srvCreated = storageDoc.srvCreated || doc.srvModified;

  if (auth && auth.subject && auth.subject.name) {
    doc.subject = auth.subject.name;
  }

  const matchedCount = await col.storage.replaceOne(storageDoc.identifier, doc);

  if (!matchedCount)
    throw new Error('empty matchedCount');

  res.setHeader('Last-Modified', now.toUTCString());
  const fields = {
    lastModified: now.getTime()
  }

  if (storageDoc.identifier !== doc.identifier || isDeduplication) {
    res.setHeader('Location', path.posix.join(req.baseUrl, req.path, doc.identifier));
    // @ts-expect-error TS(2339) FIXME: Property 'identifier' does not exist on type '{ la... Remove this comment to see the full error message
    fields.identifier = doc.identifier;
    // @ts-expect-error TS(2339) FIXME: Property 'isDeduplication' does not exist on type ... Remove this comment to see the full error message
    fields.isDeduplication = true;
    if (storageDoc.identifier !== doc.identifier) {
      // @ts-expect-error TS(2339) FIXME: Property 'deduplicatedIdentifier' does not exist o... Remove this comment to see the full error message
      fields.deduplicatedIdentifier = storageDoc.identifier;
    }
  }

  opTools.sendJSON({ res, status: apiConst.HTTP.OK, fields });

  ctx.bus.emit('storage-socket-update', { colName: col.colName, doc });
  col.autoPrune();
  ctx.bus.emit('data-received');
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = replace;
