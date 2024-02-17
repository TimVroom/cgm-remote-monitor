'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('./query');


// @ts-expect-error TS(2393) FIXME: Duplicate function implementation.
function storage (env: any, ctx: any) {
   // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
   var ObjectID = require('mongodb').ObjectID;

  function create (obj: any, fn: any) {
    obj.created_at = (new Date( )).toISOString( );
    api().insert(obj, function (err: any, doc: any) {
      if (err != null && err.message) {
        console.log('Activity data insertion error', err.message);
        fn(err.message, null);
        return;
      }
      fn(null, doc.ops);
    });
  }

  function save (obj: any, fn: any) {
    obj._id = new ObjectID(obj._id);
    obj.created_at = (new Date( )).toISOString( );
    api().save(obj, function (err: any, doc: any) {
      fn(err, doc);
    });
  }

  function query_for (opts: any) {
    return find_options(opts, storage.queryOpts);
  }

  function list(opts: any, fn: any) {
    // these functions, find, sort, and limit, are used to
    // dynamically configure the request, based on the options we've
    // been given

    // determine sort options
    function sort ( ) {
      return opts && opts.sort || {created_at: -1};
    }

    // configure the limit portion of the current query
    function limit(this: any) {
      if (opts && opts.count) {
        return this.limit(parseInt(opts.count));
      }
      return this;
    }

    // handle all the results
    function toArray (err: any, entries: any) {
      fn(err, entries);
    }

    // now just stitch them all together
    limit.call(api( )
        .find(query_for(opts))
        .sort(sort( ))
    ).toArray(toArray);
  }
  
  function remove (_id: any, fn: any) {
    var objId = new ObjectID(_id);
    return api( ).remove({ '_id': objId }, fn);
  }

  function api ( ) {
    return ctx.store.collection(env.activity_collection);
  }
  
  api.list = list;
  api.create = create;
  api.query_for = query_for;
  api.save = save;
  api.remove = remove;
  api.indexedFields = ['created_at'];
  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = storage;

storage.queryOpts = {
  dateField: 'created_at'
};
