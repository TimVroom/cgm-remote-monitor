'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('./query');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var consts = require('../constants');

function storage (collection: any, ctx: any) {
   // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
   var ObjectID = require('mongodb').ObjectID;

  function create (obj: any, fn: any) {
    obj.created_at = (new Date( )).toISOString( );
    api().insert(obj, function (err: any, doc: any) {
      fn(null, doc);
    });
    ctx.bus.emit('data-received');
  }

  function save (obj: any, fn: any) {
    obj._id = new ObjectID(obj._id);
    if (!obj.created_at) {
      obj.created_at = (new Date( )).toISOString( );
    }
    api().save(obj, function (err: any) {
      //id should be added for new docs
      fn(err, obj);
    });
    ctx.bus.emit('data-received');
  }

  function list (fn: any, count: any) {
    const limit = count !== null ? count : Number(consts.PROFILES_DEFAULT_COUNT);
    return api( ).find({ }).limit(limit).sort({startDate: -1}).toArray(fn);
  }

  function list_query (opts: any, fn: any) {

    storage.queryOpts = {
      walker: {}
      , dateField: 'startDate'
    };

    function limit(this: any) {
        if (opts && opts.count) {
            return this.limit(parseInt(opts.count));
        }
        return this;
    }

    return limit.call(api()
      .find(query_for(opts))
      // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
      .sort(opts && opts.sort && query_sort(opts) || { startDate: -1 }), opts)
      .toArray(fn);
  }

  function query_for (opts: any) {
      var retVal = find_options(opts, storage.queryOpts);
      return retVal;
  }

  function query_sort (opts: any) {
    if (opts && opts.sort) {
      var sortKeys = Object.keys(opts.sort);

      for (var i = 0; i < sortKeys.length; i++) {
        if (opts.sort[sortKeys[i]] == '1') {
          opts.sort[sortKeys[i]] = 1;
        }
        else {
          opts.sort[sortKeys[i]] = -1;
        }
      }
      return opts.sort;
    }
  }


  function last (fn: any) {
    return api().find().sort({startDate: -1}).limit(1).toArray(fn);
  }

  function remove (_id: any, fn: any) {
    var objId = new ObjectID(_id);
    api( ).remove({ '_id': objId }, fn);

    ctx.bus.emit('data-received');
  }

  function api () {
    return ctx.store.collection(collection);
  }
  
  api.list = list;
  api.list_query = list_query;
  api.create = create;
  api.save = save;
  api.remove = remove;
  api.last = last;
  api.indexedFields = ['startDate'];
  return api;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = storage;
