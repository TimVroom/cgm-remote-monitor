'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'renderer'.
  , renderer = require('../../shared/renderer')
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , input = require('./input')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_each'.
  , _each = require('lodash/each')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FieldsProj... Remove this comment to see the full error message
  , FieldsProjector = require('../../shared/fieldsProjector')
  ;


/**
  * SEARCH: Search documents from the collection
  */
async function search (opCtx: any) {

  const { req, res, col } = opCtx;

  if (col.colName === 'settings') {
    await security.demandPermission(opCtx, `api:${col.colName}:admin`);
  } else {
    await security.demandPermission(opCtx, `api:${col.colName}:read`);
  }

  const fieldsProjector = new FieldsProjector(req.query.fields);

  const filter = input.parseFilter(req, res)
    , sort = input.parseSort(req, res)
    , limit = col.parseLimit(req, res)
    , skip = input.parseSkip(req, res)
    , projection = fieldsProjector.storageProjection()
    , onlyValid = true
    ;


  if (filter !== null && sort !== null && limit !== null && skip !== null && projection !== null) {
    const result = await col.storage.findMany({ filter
      , sort
      , limit
      , skip
      , projection
      , onlyValid });

    if (!result)
      throw new Error('empty result');

    _each(result, col.resolveDates);

    _each(result, fieldsProjector.applyProjection);

    res.status(apiConst.HTTP.OK);
    renderer.render(res, result);
  }
}


// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'searchOper... Remove this comment to see the full error message
function searchOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339): Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      await search(opCtx);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = searchOperation;
