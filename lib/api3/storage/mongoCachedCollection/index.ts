'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')

/**
 * Storage implementation which wraps mongo baseStorage with caching
 * @param {Object} ctx
 * @param {Object} env
 * @param {string} colName - name of the collection in mongo database
 * @param {Object} baseStorage - wrapped mongo storage implementation
 */
function MongoCachedCollection(this: any, ctx: any, env: any, colName: any, baseStorage: any) {

  const self = this;

  self.colName = colName;

  self.identifyingFilter = baseStorage.identifyingFilter;

  self.findOne = (...args: any[]) => baseStorage.findOne(...args);

  self.findOneFilter = (...args: any[]) => baseStorage.findOneFilter(...args);

  self.findMany = (...args: any[]) => baseStorage.findMany(...args);


  self.insertOne = async (doc: any) => {
    const result = await baseStorage.insertOne(doc, { normalize: false });

    if (cacheSupported()) {
      updateInCache([doc]);
    }

    if (doc._id) {
      delete doc._id;
    }
    return result;
  }


  self.replaceOne = async (identifier: any, doc: any) => {
    const result = await baseStorage.replaceOne(identifier, doc);

    if (cacheSupported()) {
      const rawDocs = await baseStorage.findOne(identifier, null, { normalize: false })
      updateInCache([rawDocs[0]])
    }

    return result;
  }


  self.updateOne = async (identifier: any, setFields: any) => {
    const result = await baseStorage.updateOne(identifier, setFields);

    if (cacheSupported()) {
      const rawDocs = await baseStorage.findOne(identifier, null, { normalize: false })

      if (rawDocs[0].isValid === false) {
        deleteInCache(rawDocs)
      }
      else {
        updateInCache([rawDocs[0]])
      }
    }

    return result;
  }

  self.deleteOne = async (identifier: any) => {
    let invalidateDocs
    if (cacheSupported()) {
      invalidateDocs = await baseStorage.findOne(identifier, { _id: 1 }, { normalize: false })
    }

    const result = await baseStorage.deleteOne(identifier);

    if (cacheSupported()) {
      deleteInCache(invalidateDocs)
    }

    return result;
  }

  self.deleteManyOr = async (filter: any) => {
    let invalidateDocs
    if (cacheSupported()) {
      invalidateDocs = await baseStorage.findMany({ filter,
        limit: 1000,
        skip: 0,
        projection: { _id: 1 },
        options: { normalize: false } });
    }

    const result = await baseStorage.deleteManyOr(filter);

    if (cacheSupported()) {
      deleteInCache(invalidateDocs)
    }

    return result;
  }

  self.version = (...args: any[]) => baseStorage.version(...args);

  self.getLastModified = (...args: any[]) => baseStorage.getLastModified(...args);

  function cacheSupported () {
    return ctx.cache
      && ctx.cache[colName]
      && _.isArray(ctx.cache[colName]);
  }

  function updateInCache (doc: any) {
    if (doc && doc.isValid === false) {
      deleteInCache([doc._id])
    }
    else {
      ctx.bus.emit('data-update', {
        type: colName
        , op: 'update'
        , changes: doc
      });
    }
  }

  function deleteInCache (docs: any) {
    let changes
    if (_.isArray(docs)) {
      if (docs.length === 0) {
        return
      }
      else if (docs.length === 1 && docs[0]._id) {
        const _id = docs[0]._id.toString()
        changes = [ _id ]
      }
    }

    ctx.bus.emit('data-update', {
      type: colName
      , op: 'remove'
      , changes
    });
  }
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = MongoCachedCollection;
