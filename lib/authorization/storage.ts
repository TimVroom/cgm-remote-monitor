'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'crypto'.
var crypto = require('crypto');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'shiroTrie'... Remove this comment to see the full error message
var shiroTrie = require('shiro-trie');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ObjectID'.
var ObjectID = require('mongodb').ObjectID;

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('../server/query');

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (env: any, ctx: any) {
  var storage = { };

  var rolesCollection = ctx.store.collection(env.authentication_collections_prefix + 'roles');
  var subjectsCollection = ctx.store.collection(env.authentication_collections_prefix + 'subjects');

  // @ts-expect-error TS(2339): Property 'queryOpts' does not exist on type '{}'.
  storage.queryOpts = {
    dateField: 'created_at'
    , noDateFilter: true
  };

  function query_for (opts: any) {
    // @ts-expect-error TS(2339): Property 'queryOpts' does not exist on type '{}'.
    return find_options(opts, storage.queryOpts);
  }

  function create (collection: any) {
    function doCreate(obj: any, fn: any) {
      if (!Object.prototype.hasOwnProperty.call(obj, 'created_at')) {
        obj.created_at = (new Date()).toISOString();
      }
      collection.insert(obj, function (err: any, doc: any) {
        if (err != null && err.message) {
          console.log('Data insertion error', err.message);
          fn(err.message, null);
          return;
        }
        // @ts-expect-error TS(2339): Property 'reload' does not exist on type '{}'.
        storage.reload(function loaded() {
          fn(null, doc.ops);
        });
      });
    }
    return doCreate;
  }

  function list (collection: any) {
    function doList(opts: any, fn: any) {
      // these functions, find, sort, and limit, are used to
      // dynamically configure the request, based on the options we've
      // been given

      // determine sort options
      function sort() {
        return opts && opts.sort || {date: -1};
      }

      // configure the limit portion of the current query
      function limit(this: any) {
        if (opts && opts.count) {
          return this.limit(parseInt(opts.count));
        }
        return this;
      }

      // handle all the results
      function toArray(err: any, entries: any) {
        fn(err, entries);
      }

      // now just stitch them all together
      limit.call(collection
          .find(query_for(opts))
          .sort(sort())
      ).toArray(toArray);
    }

    return doList;
  }

  function remove (collection: any) {
    function doRemove (_id: any, callback: any) {
      collection.remove({ '_id': new ObjectID(_id) }, function (err: any) {
        // @ts-expect-error TS(2339): Property 'reload' does not exist on type '{}'.
        storage.reload(function loaded() {
          callback(err, null);
        });
      });
    }
    return doRemove;
  }

  function save (collection: any) {
    function doSave (obj: any, callback: any) {
      obj._id = new ObjectID(obj._id);
      if (!obj.created_at) {
        obj.created_at = (new Date()).toISOString();
      }
      collection.save(obj, function (err: any) {
        //id should be added for new docs
        // @ts-expect-error TS(2339): Property 'reload' does not exist on type '{}'.
        storage.reload(function loaded() {
          callback(err, obj);
        });
      });
    }
    return doSave;
  }

  // @ts-expect-error TS(2339): Property 'createSubject' does not exist on type '{... Remove this comment to see the full error message
  storage.createSubject = create(subjectsCollection);
  // @ts-expect-error TS(2339): Property 'saveSubject' does not exist on type '{}'... Remove this comment to see the full error message
  storage.saveSubject = save(subjectsCollection);
  // @ts-expect-error TS(2339): Property 'removeSubject' does not exist on type '{... Remove this comment to see the full error message
  storage.removeSubject = remove(subjectsCollection);
  // @ts-expect-error TS(2339): Property 'listSubjects' does not exist on type '{}... Remove this comment to see the full error message
  storage.listSubjects = list(subjectsCollection);

  // @ts-expect-error TS(2339): Property 'createRole' does not exist on type '{}'.
  storage.createRole = create(rolesCollection);
  // @ts-expect-error TS(2339): Property 'saveRole' does not exist on type '{}'.
  storage.saveRole = save(rolesCollection);
  // @ts-expect-error TS(2339): Property 'removeRole' does not exist on type '{}'.
  storage.removeRole = remove(rolesCollection);
  // @ts-expect-error TS(2339): Property 'listRoles' does not exist on type '{}'.
  storage.listRoles = list(rolesCollection);

  // @ts-expect-error TS(2339): Property 'defaultRoles' does not exist on type '{}... Remove this comment to see the full error message
  storage.defaultRoles = [
    { name: 'admin', permissions: ['*'] }
    , { name: 'denied', permissions: [ ] }
    , { name: 'status-only', permissions: [ 'api:status:read' ] }
    , { name: 'readable', permissions: [ '*:*:read' ] }
    , { name: 'careportal', permissions: [ 'api:treatments:create' ] }
    , { name: 'devicestatus-upload', permissions: [ 'api:devicestatus:create' ] }
    , { name: 'activity', permissions: [ 'api:activity:create' ] }
  ];

  // @ts-expect-error TS(2339): Property 'ensureIndexes' does not exist on type '{... Remove this comment to see the full error message
  storage.ensureIndexes = function ensureIndexes() {
    ctx.store.ensureIndexes(rolesCollection, ['name']);
    ctx.store.ensureIndexes(subjectsCollection, ['name']);
  }

  // @ts-expect-error TS(2339): Property 'getSHA1' does not exist on type '{}'.
  storage.getSHA1 = function getSHA1 (message: any) {
    // @ts-expect-error TS(2339): Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    var shasum = crypto.createHash('sha1');
    shasum.update(message);
    return shasum.digest('hex');
  }

  // @ts-expect-error TS(2339): Property 'reload' does not exist on type '{}'.
  storage.reload = function reload (callback: any) {

    // @ts-expect-error TS(2339): Property 'listRoles' does not exist on type '{}'.
    storage.listRoles({sort: {name: 1}}, function listResults (err: any, results: any) {
      if (err) {
        return callback && callback(err);
      }

      // @ts-expect-error TS(2339): Property 'roles' does not exist on type '{}'.
      storage.roles = results || [ ];

      // @ts-expect-error TS(2339): Property 'defaultRoles' does not exist on type '{}... Remove this comment to see the full error message
      _.forEach(storage.defaultRoles, function eachRole (role: any) {
        // @ts-expect-error TS(2339): Property 'roles' does not exist on type '{}'.
        if (_.isEmpty(_.find(storage.roles, {name: role.name}))) {
          // @ts-expect-error TS(2339): Property 'roles' does not exist on type '{}'.
          storage.roles.push(role);
        }
      });

      // @ts-expect-error TS(2339): Property 'roles' does not exist on type '{}'.
      storage.roles = _.sortBy(storage.roles, 'name');

      // @ts-expect-error TS(2339): Property 'listSubjects' does not exist on type '{}... Remove this comment to see the full error message
      storage.listSubjects({sort: {name: 1}}, function listResults (err: any, results: any) {
        if (err) {
          return callback && callback(err);
        }

        // @ts-expect-error TS(2339): Property 'subjects' does not exist on type '{}'.
        storage.subjects = _.map(results, function eachSubject (subject: any) {
          if (env.enclave.isApiKeySet()) {
            subject.digest = env.enclave.getSubjectHash(subject._id.toString());
            var abbrev = subject.name.toLowerCase().replace(/[\W]/g, '').substring(0, 10);
            subject.accessToken = abbrev + '-' + subject.digest.substring(0, 16);
            // @ts-expect-error TS(2339): Property 'getSHA1' does not exist on type '{}'.
            subject.accessTokenDigest = storage.getSHA1(subject.accessToken);
          }

          return subject;
        });

        if (callback) {
          callback( );
        }
      });
    });

  };

  // @ts-expect-error TS(2339): Property 'findRole' does not exist on type '{}'.
  storage.findRole = function findRole (roleName: any) {
    // @ts-expect-error TS(2339): Property 'roles' does not exist on type '{}'.
    return _.find(storage.roles, {name: roleName});
  };

  // @ts-expect-error TS(2339): Property 'roleToShiro' does not exist on type '{}'... Remove this comment to see the full error message
  storage.roleToShiro = function roleToShiro (roleName: any) {
    var shiro = null;

    // @ts-expect-error TS(2339): Property 'findRole' does not exist on type '{}'.
    var role = storage.findRole(roleName);
    if (role) {
      shiro = shiroTrie.new();
      shiro.add(role.permissions);
    }

    return shiro;
  };

  // @ts-expect-error TS(2339): Property 'rolesToShiros' does not exist on type '{... Remove this comment to see the full error message
  storage.rolesToShiros = function roleToShiro (roleNames: any) {
    return _.chain(roleNames)
      // @ts-expect-error TS(2339): Property 'roleToShiro' does not exist on type '{}'... Remove this comment to see the full error message
      .map(storage.roleToShiro)
      .reject(_.isEmpty)
      .value();
  };

  // @ts-expect-error TS(2339): Property 'roleToPermissions' does not exist on typ... Remove this comment to see the full error message
  storage.roleToPermissions = function roleToPermissions (roleName: any) {
    var permissions = [ ];

    // @ts-expect-error TS(2339): Property 'findRole' does not exist on type '{}'.
    var role = storage.findRole(roleName);
    if (role) {
      permissions = role.permissions;
    }

    return permissions;
  };

  // @ts-expect-error TS(2339): Property 'findSubject' does not exist on type '{}'... Remove this comment to see the full error message
  storage.findSubject = function findSubject (accessToken: any) {

    if (!accessToken) return null;

    function checkToken(accessToken: any) {
      var split_token = accessToken.split('-');
      var prefix = split_token ? _.last(split_token) : '';

      if (prefix.length < 16) {
        return null;
      }

      // @ts-expect-error TS(2339): Property 'subjects' does not exist on type '{}'.
      return _.find(storage.subjects, function matches (subject: any) {
        return subject.accessTokenDigest.indexOf(accessToken) === 0 || subject.digest.indexOf(prefix) === 0;
      });
   }

   if (!Array.isArray(accessToken)) accessToken = [accessToken];

   for (let i=0; i < accessToken.length; i++) {
     const subject = checkToken(accessToken[i]);
     if (subject) return subject;
   }

   return null;
  };

  // @ts-expect-error TS(2339): Property 'doesAccessTokenExist' does not exist on ... Remove this comment to see the full error message
  storage.doesAccessTokenExist = function doesAccessTokenExist(accessToken: any) {
    // @ts-expect-error TS(2339): Property 'findSubject' does not exist on type '{}'... Remove this comment to see the full error message
    if (storage.findSubject(accessToken)) {
      return true;
    }
    return false;
  }

  // @ts-expect-error TS(2339): Property 'resolveSubjectAndPermissions' does not e... Remove this comment to see the full error message
  storage.resolveSubjectAndPermissions = function resolveSubjectAndPermissions (accessToken: any) {
    var shiros = [];

    // @ts-expect-error TS(2339): Property 'findSubject' does not exist on type '{}'... Remove this comment to see the full error message
    var subject = storage.findSubject(accessToken);
    if (subject) {
      // @ts-expect-error TS(2339): Property 'rolesToShiros' does not exist on type '{... Remove this comment to see the full error message
      shiros = storage.rolesToShiros(subject.roles);
    }

    return {
      subject: subject
      , shiros: shiros
    };
  };

  return storage;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
