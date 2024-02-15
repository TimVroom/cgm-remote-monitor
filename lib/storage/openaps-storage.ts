'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
var fs = require('fs');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var crypto = require('crypto');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var MongoMock = require('mongomock');

// @ts-expect-error TS(2300): Duplicate identifier 'config'.
var config = {
  collections: {}
};

function init (env: any, callback: any) {

  if (!env.storageURI || !_.isString(env.storageURI)) {
    throw new Error('openaps config uri is missing or invalid');
  }

  var configPath = env.storageURI.split('openaps://').pop();

  function addId (data: any) {
    // @ts-expect-error TS(2339): Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    var shasum = crypto.createHash('sha1');
    shasum.update(JSON.stringify(data));
    data._id = shasum.digest('hex');
  }

  function loadData (path: any) {

    if (!path || !_.isString(path)) {
      return [ ];
    }

    try {
      purgeCache(path);
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      var inputData = require(path);
      if (_.isArray(inputData)) {
        //console.info('>>>input is an array', path);
        _.forEach(inputData, addId);
      } else if (!_.isEmpty(inputData) && _.isObject(inputData)) {
        //console.info('>>>input is an object', path);
        inputData.created_at = new Date(fs.statSync(path).mtime).toISOString();
        addId(inputData);
        inputData = [ inputData ];
      } else {
        //console.info('>>>input is something else', path, inputData);
        inputData = [ ];
      }

      return inputData;
    } catch (err) {
      console.error('unable to find input data for', path, err);
      return [ ];
    }

  }

  function reportAsCollection (name: any) {
    var data = { };
    var input = _.get(config, 'collections.' + name + '.input');

    if (_.isArray(input)) {
      //console.info('>>>input is an array', input);
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      data[name] = _.flatten(_.map(input, loadData));
    } else {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      data[name] = loadData(input);
    }

    var mock = new MongoMock(data);

    var collection = mock.collection(name);

    var wrapper = {
      findQuery: null
      , sortQuery: null
      , limitCount: null
      , find: function find (query: any) {
        query = _.cloneDeepWith(query, function booleanize (value: any) {
          //TODO: for some reason we're getting {$exists: NaN} instead of true/false
          if (value && _.isObject(value) && '$exists' in value) {
            return {$exists: true};
          }
        });
        wrapper.findQuery = query;
        return wrapper;
      }
      , limit: function limit (count: any) {
        wrapper.limitCount = count;
        return wrapper;
      }
      , sort: function sort (query: any) {
        wrapper.sortQuery = query;
        return wrapper;
      }
      , toArray: function toArray(callback: any) {
        collection.find(wrapper.findQuery).toArray(function intercept (err: any, results: any) {
          if (err) {
            return callback(err, results);
          }

          if (wrapper.sortQuery) {
            var field = _.keys(wrapper.sortQuery).pop();
            //console.info('>>>sortField', field);
            if (field) {
              results = _.sortBy(results, field);
              if (-1 === wrapper.sortQuery[field]) {
                //console.info('>>>sort reverse');
                results = _.reverse(results);
              }
            }
          }

          if (wrapper.limitCount !== null && _.isNumber(wrapper.limitCount)) {
            //console.info('>>>limit count', wrapper.limitCount);
            results = _.take(results, wrapper.limitCount);
          }

          //console.info('>>>toArray', name, wrapper.findQuery, wrapper.sortQuery, wrapper.limitCount, results.length);

          callback(null, results);
        });
        return wrapper;
      }
    };

    return wrapper;

  }

  try {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var customConfig = require(configPath);

    // @ts-expect-error TS(2630): Cannot assign to 'config' because it is a function... Remove this comment to see the full error message
    config = _.merge({}, customConfig, config);

    callback(null, {
      collection: reportAsCollection
      , ensureIndexes: _.noop
    });
  } catch (err) {
    callback(err);
  }
}

/**
 * Removes a module from the cache
 *
 * see http://stackoverflow.com/a/14801711
 */
function purgeCache(moduleName: any) {
  // Traverse the cache looking for the files
  // loaded by the specified module name
  searchCache(moduleName, function (mod: any) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    delete require.cache[mod.id];
  });

  // Remove cached paths to the module.
  // Thanks to @bentael for pointing this out.
  // @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
  Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
    if (cacheKey.indexOf(moduleName)>0) {
      // @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
      delete module.constructor._pathCache[cacheKey];
    }
  });
}

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 *
 * see http://stackoverflow.com/a/14801711
 */
function searchCache(moduleName: any, callback: any) {
  // Resolve the module identified by the specified name
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var mod = require.resolve(moduleName);

  // Check if the module has been resolved and found within
  // the cache
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  if (mod && ((mod = require.cache[mod]) !== undefined)) {
    // Recursively go over the results
    (function traverse(mod) {
      // Go over each of the module's children and
      // traverse them
      mod.children.forEach(function (child: any) {
        traverse(child);
      });

      // Call the specified callback providing the
      // found cached module
      callback(mod);
    }(mod));
  }
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
