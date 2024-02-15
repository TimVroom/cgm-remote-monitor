'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
var moment = require('moment');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('./query');

function storage (collection: any, ctx: any) {

  function create (statuses: any, fn: any) {

    if (!Array.isArray(statuses)) { statuses = [statuses]; }

    const r: any = [];
    let errorOccurred = false;

    for (let i = 0; i < statuses.length; i++) {

      const obj = statuses[i];

      if (errorOccurred) return;

      // Normalize all dates to UTC
      const d = moment(obj.created_at).isValid() ? moment.parseZone(obj.created_at) : moment();
      obj.created_at = d.toISOString();
      obj.utcOffset = d.utcOffset();

      api().insertOne(obj, function(err: any, results: any) {
        if (err !== null && err.message) {
          console.log('Error inserting the device status object', err.message);
          errorOccurred = true;
          fn(err.message, null);
          return;
        }

        if (!err) {

          if (!obj._id) obj._id = results.insertedIds[0]._id;
          r.push(obj);

          ctx.bus.emit('data-update', {
            type: 'devicestatus'
            , op: 'update'
            , changes: ctx.ddata.processRawDataForRuntime([obj])
          });

          // Last object! Return results
          if (i == statuses.length - 1) {
            fn(null, r);
            ctx.bus.emit('data-received');
          }
        }
      });
    }
  }

  function last (fn: any) {
    return list({ count: 1 }, function(err: any, entries: any) {
      if (entries && entries.length > 0) {
        fn(err, entries[0]);
      } else {
        fn(err, null);
      }
    });
  }

  function query_for (opts: any) {
    return find_options(opts, storage.queryOpts);
  }

  function list (opts: any, fn: any) {
    // these functions, find, sort, and limit, are used to
    // dynamically configure the request, based on the options we've
    // been given

    // determine sort options
    function sort () {
      return opts && opts.sort || { created_at: -1 };
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

    function removed (err: any, stat: any) {

      ctx.bus.emit('data-update', {
        type: 'devicestatus'
        , op: 'remove'
        , count: stat.result.n
        , changes: opts.find._id
      });

      fn(err, stat);
    }

    return api().remove(
      query_for(opts), removed);
  }

  function api () {
    return ctx.store.collection(collection);
  }

  api.list = list;
  api.create = create;
  api.query_for = query_for;
  api.last = last;
  api.remove = remove;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  api.aggregate = require('./aggregate')({}, api);
  api.indexedFields = [
    'created_at'



  
    , 'NSCLIENT_ID'
  ];
  return api;
}

storage.queryOpts = {
  dateField: 'created_at'
};

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = storage;
