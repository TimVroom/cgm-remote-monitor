'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
  , _ = require('lodash')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
  , dateTools = require('../shared/dateTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../shared/operationTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'stringTool... Remove this comment to see the full error message
  , stringTools = require('../shared/stringTools')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , MongoCollectionStorage = require('../storage/mongoCollection')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , CachedCollectionStorage = require('../storage/mongoCachedCollection')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'searchOper... Remove this comment to see the full error message
  , searchOperation = require('./search/operation')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'createOper... Remove this comment to see the full error message
  , createOperation = require('./create/operation')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'readOperat... Remove this comment to see the full error message
  , readOperation = require('./read/operation')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'updateOper... Remove this comment to see the full error message
  , updateOperation = require('./update/operation')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'patchOpera... Remove this comment to see the full error message
  , patchOperation = require('./patch/operation')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'deleteOper... Remove this comment to see the full error message
  , deleteOperation = require('./delete/operation')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'historyOpe... Remove this comment to see the full error message
  , historyOperation = require('./history/operation')
  ;

/**
  * Generic collection (abstraction over each collection specifics)
  * @param {string} colName - name of the collection inside the storage system
  * @param {function} fallbackGetDate - function that tries to create srvModified virtually from other fields of document
  * @param {Array} dedupFallbackFields - fields that all need to be matched to identify document via fallback deduplication
  * @param {function} fallbackHistoryFilter - function that creates storage filter for all newer records (than the timestamp from first function parameter)
  */
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Collection... Remove this comment to see the full error message
function Collection(
  this: any,
  {
    ctx,
    env,
    app,
    colName,
    storageColName,
    fallbackGetDate,
    dedupFallbackFields,
    fallbackDateField
  }: any
) {

  const self = this;

  self.colName = colName;
  self.fallbackGetDate = fallbackGetDate;
  self.dedupFallbackFields = app.get('API3_DEDUP_FALLBACK_ENABLED') ? dedupFallbackFields : [];
  self.autoPruneDays = app.setENVTruthy('API3_AUTOPRUNE_' + colName.toUpperCase());
  self.nextAutoPrune = new Date();

  const baseStorage = new MongoCollectionStorage(ctx, env, storageColName);
  self.storage = new CachedCollectionStorage(ctx, env, colName, baseStorage);

  self.fallbackDateField = fallbackDateField;

  self.mapRoutes = function mapRoutes () {
    const prefix = '/' + colName
      , prefixId = prefix + '/:identifier'
      , prefixHistory = prefix + '/history'
      ;


    // GET /{collection}
    app.get(prefix, searchOperation(ctx, env, app, self));

    // POST /{collection}
    app.post(prefix, createOperation(ctx, env, app, self));

    // GET /{collection}/history
    app.get(prefixHistory, historyOperation(ctx, env, app, self));

    // GET /{collection}/history
    app.get(prefixHistory + '/:lastModified', historyOperation(ctx, env, app, self));

    // GET /{collection}/{identifier}
    app.get(prefixId, readOperation(ctx, env, app, self));

    // PUT /{collection}/{identifier}
    app.put(prefixId, updateOperation(ctx, env, app, self));

    // PATCH /{collection}/{identifier}
    app.patch(prefixId, patchOperation(ctx, env, app, self));

    // DELETE /{collection}/{identifier}
    app.delete(prefixId, deleteOperation(ctx, env, app, self));
  };


  /**
    * Parse limit (max document count) from query string
    */
  self.parseLimit = function parseLimit (req: any, res: any) {
    const maxLimit = app.get('API3_MAX_LIMIT');
    let limit = maxLimit;

    if (req.query.limit) {
      if (!isNaN(req.query.limit) && req.query.limit > 0 && req.query.limit <= maxLimit) {
        limit = parseInt(req.query.limit);
      }
      else {
        opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_LIMIT);
        return null;
      }
    }

    return limit;
  };



  /**
    * Fetch modified date from document (with possible fallback and back-fill to srvModified/srvCreated)
    * @param {Object} doc - document loaded from database
    */
  self.resolveDates = function resolveDates (doc: any) {
    let modifiedDate;
    try {
      if (doc.srvModified) {
        modifiedDate = new Date(doc.srvModified);
      }
      else {
        if (typeof (self.fallbackGetDate) === 'function') {
          modifiedDate = self.fallbackGetDate(doc);
          if (modifiedDate) {
            doc.srvModified = modifiedDate.getTime();
          }
        }
      }

      if (doc.srvModified && !doc.srvCreated) {
        doc.srvCreated = modifiedDate.getTime();
      }
    }
    catch (error) {
      console.warn(error);
    }
    return modifiedDate;
  };


  /**
   * Deletes old documents from the collection if enabled (for this collection)
   * in the background (asynchronously)
   * */
  self.autoPrune = function autoPrune () {

    if (!stringTools.isNumberInString(self.autoPruneDays))
      return;

    const autoPruneDays = parseFloat(self.autoPruneDays);
    if (autoPruneDays <= 0)
      return;

    if (new Date() > self.nextAutoPrune) {

      const deleteBefore = new Date(new Date().getTime() - (autoPruneDays * 24 * 3600 * 1000));

      const filter =  [
        { field: 'srvCreated', operator: 'lt', value: deleteBefore.getTime() },
        { field: 'created_at', operator: 'lt', value: deleteBefore.toISOString() },
        { field: 'date', operator: 'lt', value: deleteBefore.getTime() }
      ];

      // let's autoprune asynchronously (we won't wait for the result)
      self.storage.deleteManyOr(filter, function deleteDone (err: any, result: any) {
        if (err || !result) {
          console.error(err);
        }

        if (result.deleted) {
          console.info('Auto-pruned ' + result.deleted + ' documents from ' + self.colName + ' collection ');
        }
      });

      self.nextAutoPrune = new Date(new Date().getTime() + (3600 * 1000));
    }
  };


  /**
    * Parse date and utcOffset + optional created_at fallback
    * @param {Object} doc
    */
  self.parseDate = function parseDate (doc: any) {
    if (!_.isEmpty(doc)) {

      let values = app.get('API3_CREATED_AT_FALLBACK_ENABLED')
        ? [doc.date, doc.created_at]
        : [doc.date];

      let m = dateTools.parseToMoment(values);
      if (m && m.isValid()) {
        doc.date = m.valueOf();

        if (typeof doc.utcOffset === 'undefined') {
          doc.utcOffset = m.utcOffset();
        }

        if (app.get('API3_CREATED_AT_FALLBACK_ENABLED')) {
          doc.created_at = m.toISOString();
        }
        else {
          if (doc.created_at)
            delete doc.created_at;
        }
      }
    }
  }
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = Collection;
