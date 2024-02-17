'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'insert'.
  , insert = require('./insert')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'replace'.
  , replace = require('../update/replace')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;


/**
 * CREATE: Inserts a new document into the collection
 */
// @ts-expect-error TS(2300): Duplicate identifier 'create'.
async function create (opCtx: any) {

  const { col, req, res } = opCtx;
  const doc = req.body;

  if (_.isEmpty(doc)) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_REQUEST_BODY);
  }

  col.parseDate(doc);
  opTools.resolveIdentifier(doc);
  const identifyingFilter = col.storage.identifyingFilter(doc.identifier, doc, col.dedupFallbackFields);

  const result = await col.storage.findOneFilter(identifyingFilter, { });

  if (!result)
    throw new Error('empty result');

  if (result.length > 0) {
    const storageDoc = result[0];
    await replace(opCtx, doc, storageDoc, { isDeduplication: true });
  }
  else {
    await insert(opCtx, doc);
  }
}


// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'createOper... Remove this comment to see the full error message
function createOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339) FIXME: Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await create(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = createOperation;