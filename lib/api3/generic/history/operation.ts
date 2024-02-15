'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
const dateTools = require('../../shared/dateTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'renderer'.
  , renderer = require('../../shared/renderer')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'security'.
  , security = require('../../security')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'FieldsProj... Remove this comment to see the full error message
  , FieldsProjector = require('../../shared/fieldsProjector')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
  , _ = require('lodash')
  ;

/**
 * HISTORY: Retrieves incremental changes since timestamp
 */
// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'history'.
async function history (opCtx: any, fieldsProjector: any) {

  const { req, res, col } = opCtx;

  let filter = parseFilter(opCtx)
    , limit = col.parseLimit(req, res)
    , projection = fieldsProjector.storageProjection()
    , sort = prepareSort()
    , skip = 0
    , onlyValid = false
    , logicalOperator = 'or'
    ;

  if (filter !== null && limit !== null && projection !== null) {

    const result = await col.storage.findMany({ filter
      , sort
      , limit
      , skip
      , projection
      , onlyValid
      , logicalOperator });

    if (!result)
      throw new Error('empty result');

    if (result.length === 0) {
      res.status(apiConst.HTTP.OK);
      return renderer.render(res, result);
    }

    _.each(result, col.resolveDates);

    const srvModifiedValues = _.map(result, function mapSrvModified (item: any) {
      return item.srvModified;
    })
      , maxSrvModified = _.max(srvModifiedValues);

    res.setHeader('Last-Modified', (new Date(maxSrvModified)).toUTCString());
    res.setHeader('ETag', 'W/"' + maxSrvModified + '"');

    _.each(result, fieldsProjector.applyProjection);

    res.status(apiConst.HTTP.OK);
    renderer.render(res, result);
  }
}


/**
 * Parse history filtering criteria from Last-Modified header
 */
// @ts-expect-error TS(2393) FIXME: Duplicate function implementation.
function parseFilter (opCtx: any) {

  const { req, res } = opCtx;

  let lastModified = null
    , lastModifiedParam = req.params.lastModified
    , operator = null;

  if (lastModifiedParam) {

    // using param in URL as a source of timestamp
    const m = dateTools.parseToMoment(lastModifiedParam);

    if (m === null || !m.isValid()) {
      opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_LAST_MODIFIED);
      return null;
    }

    lastModified = m.toDate();
    operator = 'gt';
  }
  else {
    // using request HTTP header as a source of timestamp
    const lastModifiedHeader = req.get('Last-Modified');
    if (!lastModifiedHeader) {
      opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_LAST_MODIFIED);
      return null;
    }

    try {
      lastModified = dateTools.floorSeconds(new Date(lastModifiedHeader));
    } catch (err) {
      opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_LAST_MODIFIED);
      return null;
    }
    operator = 'gte';
  }

  return [
    { field: 'srvModified', operator: operator, value: lastModified.getTime() }
  ];
}



/**
 * Prepare sorting for storage query
 */
function prepareSort () {
  return {
    srvModified: 1
  };
}


// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'historyOpe... Remove this comment to see the full error message
function historyOperation (ctx: any, env: any, app: any, col: any) {

  return async function operation (req: any, res: any) {

    const opCtx = { app, ctx, env, col, req, res };

    try {
      // @ts-expect-error TS(2339) FIXME: Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
      opCtx.auth = await security.authenticate(opCtx);

      if (col.colName === 'settings') {
        await security.demandPermission(opCtx, `api:${col.colName}:admin`);
      } else {
        await security.demandPermission(opCtx, `api:${col.colName}:read`);
      }

      const fieldsProjector = new FieldsProjector(req.query.fields);

      // @ts-expect-error TS(2349) FIXME: This expression is not callable.
      await history(opCtx, fieldsProjector);

    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        return opTools.sendJSONStatus(res, apiConst.HTTP.INTERNAL_ERROR, apiConst.MSG.STORAGE_ERROR);
      }
    }
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = historyOperation;
