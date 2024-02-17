'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'utils'.
const utils = require('./utils')
  ;

/**
 * Insert single document
 * @param {Object} col
 * @param {Object} doc
 * @param {Object} options
 */
function insertOne (col: any, doc: any, options: any) {

  return new Promise(function (resolve, reject) {

    col.insertOne(doc, function mongoDone(err: any, result: any) {

      if (err) {
        reject(err);
      } else {
        const identifier = doc.identifier || result.insertedId.toString();

        if (!options || options.normalize !== false) {
          delete doc._id;
        }
        resolve(identifier);
      }
    });
  });
}


/**
 * Replace single document
 * @param {Object} col
 * @param {string} identifier
 * @param {Object} doc
 */
function replaceOne (col: any, identifier: any, doc: any) {

  return new Promise(function (resolve, reject) {

    const filter = utils.filterForOne(identifier);

    col.replaceOne(filter, doc, { upsert: true }, function mongoDone(err: any, result: any) {
      if (err) {
        reject(err);
      } else {
        resolve(result.matchedCount);
      }
    });
  });
}


/**
 * Update single document by identifier
 * @param {Object} col
 * @param {string} identifier
 * @param {object} setFields
 */
function updateOne (col: any, identifier: any, setFields: any) {

  return new Promise(function (resolve, reject) {

    const filter = utils.filterForOne(identifier);

    col.updateOne(filter, { $set: setFields }, function mongoDone(err: any, result: any) {
      if (err) {
        reject(err);
      } else {
        resolve({ updated: result.result.nModified });
      }
    });
  });
}


/**
 * Permanently remove single document by identifier
 * @param {Object} col
 * @param {string} identifier
 */
function deleteOne (col: any, identifier: any) {

  return new Promise(function (resolve, reject) {

    const filter = utils.filterForOne(identifier);

    col.deleteOne(filter, function mongoDone(err: any, result: any) {
      if (err) {
        reject(err);
      } else {
        resolve({ deleted: result.result.n });
      }
    });
  });
}


/**
 * Permanently remove many documents matching any of filtering criteria
 */
function deleteManyOr (col: any, filterDef: any) {

  return new Promise(function (resolve, reject) {

    const filter = utils.parseFilter(filterDef, 'or');

    col.deleteMany(filter, function mongoDone(err: any, result: any) {
      if (err) {
        reject(err);
      } else {
        resolve({ deleted: result.deletedCount });
      }
    });
  });
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  insertOne,
  replaceOne,
  updateOne,
  deleteOne,
  deleteManyOr
};
