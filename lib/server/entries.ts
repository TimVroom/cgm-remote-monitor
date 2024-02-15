'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'es'.
var es = require('event-stream');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('./query');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ObjectID'.
var ObjectID = require('mongodb').ObjectID;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'moment'.
var moment = require('moment');

/**********\
 * Entries
 * Encapsulate persistent storage of sgv entries.
\**********/

function storage (env: any, ctx: any) {

  // TODO: Code is a little redundant.

  // query for entries from storage
  function list (opts: any, fn: any) {
    // these functions, find, sort, and limit, are used to
    // dynamically configure the request, based on the options we've
    // been given

    // determine sort options
    function sort () {
      return opts && opts.sort || { date: -1 };
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
    limit.call(api()
      .find(query_for(opts))
      .sort(sort())
    ).toArray(toArray);
  }

  function remove (opts: any, fn: any) {
    api().remove(query_for(opts), function(err: any, stat: any) {

      ctx.bus.emit('data-update', {
        type: 'entries'
        , op: 'remove'
        , count: stat.result.n
        , changes: opts.find._id
      });

      //TODO: this is triggering a read from Mongo, we can do better
      ctx.bus.emit('data-received');
      fn(err, stat);
    });
  }

  // return writable stream to lint each sgv record passing through it
  // TODO: get rid of this? not doing anything now
  function map () {
    return es.map(function iter (item: any, next: any) {
      return next(null, item);
    });
  }

  // writable stream that persists all records
  // takes function to call when done
  function persist (fn: any) {
    // receives entire list at end of stream
    function done (err: any, result: any) {
      // report any errors
      if (err) { return fn(err, result); }
      // batch insert a list of records
      create(result, fn);
    }
    // lint and store the entire list
    return es.pipeline(map(), es.writeArray(done));
  }

  //TODO: implement
  //function update (fn) {
  //}
  //

  // store new documents using the storage mechanism
  function create (docs: any, fn: any) {
    // potentially a batch insert
    var firstErr: any = null
      , numDocs = docs.length
      , totalCreated = 0;

    docs.forEach(function(doc: any) {

      // Normalize dates to be in UTC, store offset in utcOffset

      var _sysTime;

      if (doc.dateString) { _sysTime = moment.parseZone(doc.dateString); }
      if (!_sysTime && doc.date) { _sysTime = moment(doc.date); }
      if (!_sysTime) _sysTime = moment();

      doc.utcOffset = _sysTime.utcOffset();
      doc.sysTime = _sysTime.toISOString();
      if (doc.dateString) doc.dateString = doc.sysTime;

      var query = (doc.sysTime && doc.type) ? { sysTime: doc.sysTime, type: doc.type } : doc;
      api().update(query, doc, { upsert: true }, function(err: any, updateResults: any) {
        firstErr = firstErr || err;

        if (!err) {
          if (updateResults.result.upserted) {
            doc._id = updateResults.result.upserted[0]._id
          }

          ctx.bus.emit('data-update', {
            type: 'entries'
            , op: 'update'
            , changes: ctx.ddata.processRawDataForRuntime([doc])
          });
        }

        if (++totalCreated === numDocs) {
          //TODO: this is triggering a read from Mongo, we can do better
          ctx.bus.emit('data-received');
          fn(firstErr, docs);
        }
      });
    });
  }

  function getEntry (id: any, fn: any) {
    api().findOne({ _id: ObjectID(id) }, function(err: any, entry: any) {
      if (err) {
        fn(err);
      } else {
        fn(null, entry);
      }
    });
  }

  function query_for (opts: any) {
    return find_options(opts, storage.queryOpts);
  }

  // closure to represent the API
  function api () {
    // obtain handle usable for querying the collection associated
    // with these records
    return ctx.store.collection(env.entries_collection);
  }

  // Expose all the useful functions
  api.list = list;
  api.map = map;
  api.create = create;
  api.remove = remove;
  api.persist = persist;
  api.query_for = query_for;
  api.getEntry = getEntry;
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  api.aggregate = require('./aggregate')({}, api);
  api.indexedFields = [
    'date'
    , 'type'
    , 'sgv'
    , 'mbg'
    , 'sysTime'
    , 'dateString'
    , { 'type': 1, 'date': -1, 'dateString': 1 }
 ];
  return api;
}

storage.queryOpts = {
  walker: {
    date: parseInt
    , sgv: parseInt
    , filtered: parseInt
    , unfiltered: parseInt
    , rssi: parseInt
    , noise: parseInt
    , mbg: parseInt
  }
  , useEpoch: true
};

// expose module
storage.storage = storage;
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = storage;
