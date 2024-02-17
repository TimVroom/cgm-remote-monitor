'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'utils'.
const utils = require('./utils')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
  , _ = require('lodash')
  ;


/**
 * Find single document by identifier
 * @param {Object} col
 * @param {string} identifier
 * @param {Object} projection
 * @param {Object} options
 */
function findOne (col: any, identifier: any, projection: any, options: any) {

  return new Promise(function (resolve, reject) {

    const filter = utils.filterForOne(identifier);

    col.find(filter)
      .project(projection)
      .sort({ identifier: -1 }) // document with identifier first (not the fallback one)
      .toArray(function mongoDone (err: any, result: any) {

        if (err) {
          reject(err);
        } else {
          if (!options || options.normalize !== false) {
            _.each(result, utils.normalizeDoc);
          }
          resolve(result);
        }
      });
  });
}


/**
 * Find single document by query filter
 * @param {Object} col
 * @param {Object} filter specific filter
 * @param {Object} projection
 * @param {Object} options
 */
function findOneFilter (col: any, filter: any, projection: any, options: any) {

  return new Promise(function (resolve, reject) {

    col.find(filter)
      .project(projection)
      .sort({ identifier: -1 }) // document with identifier first (not the fallback one)
      .toArray(function mongoDone (err: any, result: any) {

        if (err) {
          reject(err);
        } else {
          if (!options || options.normalize !== false) {
            _.each(result, utils.normalizeDoc);
          }
          resolve(result);
        }
      });
  });
}


/**
 * Find many documents matching the filtering criteria
 */
function findMany (col: any, args: any) {
  const logicalOperator = args.logicalOperator || 'and';
  return new Promise(function (resolve, reject) {

    const filter = utils.parseFilter(args.filter, logicalOperator, args.onlyValid);

    col.find(filter)
      .sort(args.sort)
      .limit(args.limit)
      .skip(args.skip)
      .project(args.projection)
      .toArray(function mongoDone (err: any, result: any) {

        if (err) {
          reject(err);
        } else {
          if (!args.options || args.options.normalize !== false) {
            _.each(result, utils.normalizeDoc);
          }
          resolve(result);
        }
      });
  });
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  findOne,
  findOneFilter,
  findMany
};
