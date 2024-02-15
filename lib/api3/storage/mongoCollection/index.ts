'use strict';

/**
 * Storage implementation using mongoDB
 * @param {Object} ctx
 * @param {Object} env
 * @param {string} colName - name of the collection in mongo database
 */
function MongoCollection(this: any, ctx: any, env: any, colName: any) {

  const self = this
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , utils = require('./utils')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , find = require('./find')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , modify = require('./modify')
    ;

  self.colName = colName;

  self.col = ctx.store.collection(colName);

  ctx.store.ensureIndexes(self.col, [ 'identifier',
    'srvModified',
    'isValid'
  ]);


  self.identifyingFilter = utils.identifyingFilter;

  self.findOne = (...args: any[]) => find.findOne(self.col, ...args);

  self.findOneFilter = (...args: any[]) => find.findOneFilter(self.col, ...args);

  self.findMany = (...args: any[]) => find.findMany(self.col, ...args);

  self.insertOne = (...args: any[]) => modify.insertOne(self.col, ...args);

  self.replaceOne = (...args: any[]) => modify.replaceOne(self.col, ...args);

  self.updateOne = (...args: any[]) => modify.updateOne(self.col, ...args);

  self.deleteOne = (...args: any[]) => modify.deleteOne(self.col, ...args);

  self.deleteManyOr = (...args: any[]) => modify.deleteManyOr(self.col, ...args);


  /**
   * Get server version
   */
  self.version = function version () {

    return new Promise(function (resolve, reject) {

      ctx.store.db.admin().buildInfo({}, function mongoDone (err: any, result: any) {

        err
          ? reject(err)
          : resolve({
            storage: 'mongodb',
            version: result.version
          });
      });
    });
  };


  /**
   * Get timestamp (e.g. srvModified) of the last modified document
   */
  self.getLastModified = function getLastModified (fieldName: any) {

    return new Promise(function (resolve, reject) {

      self.col.find()

        .sort({ [fieldName]: -1 })

        .limit(1)

        .project({ [fieldName]: 1 })

        // @ts-expect-error TS(7031): Binding element 'result' implicitly has an 'any' t... Remove this comment to see the full error message
        .toArray(function mongoDone (err: any, [ result ]) {
          err
            ? reject(err)
            : resolve(result);
        });
    });
  }
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = MongoCollection;
