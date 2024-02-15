'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'async'.
var async = require('async');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var moment = require('moment');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('./query');

function storage (env: any, ctx: any) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var ObjectID = require('mongodb').ObjectID;

  function create (objOrArray: any, fn: any) {

    function done (err: any, result: any) {
      ctx.bus.emit('data-received');
      fn(err, result);
    }

    if (_.isArray(objOrArray)) {
      var allDocs: any = [];
      var errs: any = [];
      async.eachSeries(objOrArray, function (obj: any, callback: any) {
        upsert(obj, function upserted (err: any, docs: any) {
          allDocs = allDocs.concat(docs);
          errs.push(err);
          callback(err, docs)
        });
      }, function () {
        errs = _.compact(errs);
        done(errs.length > 0 ? errs : null, allDocs);
      });
    } else {
      upsert(objOrArray, function upserted (err: any, docs: any) {
        done(err, docs);
      });
    }


  }

  function upsert (obj: any, fn: any) {

    var results = prepareData(obj);

    var query  = {
      created_at: results.created_at
      , eventType: obj.eventType
    };

    api( ).update(query, obj, {upsert: true}, function complete (err: any, updateResults: any) {

      if (err) console.error('Problem upserting treatment', err);

      if (!err) {
        if (updateResults.result.upserted) {
          obj._id = updateResults.result.upserted[0]._id
        }
      }

      // TODO document this feature
      if (!err && obj.preBolus) {
        //create a new object to insert copying only the needed fields
        var pbTreat = {
          created_at: (new Date(new Date(results.created_at).getTime() + (obj.preBolus * 60000))).toISOString(),
          eventType: obj.eventType,
          carbs: results.preBolusCarbs
        };

        if (obj.notes) {
          // @ts-expect-error TS(2339): Property 'notes' does not exist on type '{ created... Remove this comment to see the full error message
          pbTreat.notes = obj.notes;
        }

        query.created_at = pbTreat.created_at;
        api( ).update(query, pbTreat, {upsert: true}, function pbComplete (err: any, updateResults: any) {

          if (!err) {
            if (updateResults.result.upserted) {
              // @ts-expect-error TS(2339): Property '_id' does not exist on type '{ created_a... Remove this comment to see the full error message
              pbTreat._id = updateResults.result.upserted[0]._id
            }
          }

          var treatments = _.compact([obj, pbTreat]);

          ctx.bus.emit('data-update', {
            type: 'treatments',
            op: 'update',
            changes: ctx.ddata.processRawDataForRuntime(treatments)
          });

          fn(err, treatments);
        });
      } else {

        ctx.bus.emit('data-update', {
          type: 'treatments',
          op: 'update',
          changes: ctx.ddata.processRawDataForRuntime([obj])
        });

        fn(err, [obj]);
      }

    });
  }

  function list (opts: any, fn: any) {

    function limit(this: any) {
      if (opts && opts.count) {
        return this.limit(parseInt(opts.count));
      }
      return this;
    }

    return limit.call(api()
      .find(query_for(opts))
      // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
      .sort(opts && opts.sort || {created_at: -1}), opts)
      .toArray(fn);
  }

  function query_for (opts: any) {
    return find_options(opts, storage.queryOpts);
  }

  function remove (opts: any, fn: any) {
    return api( ).remove(query_for(opts), function (err: any, stat: any) {
        //TODO: this is triggering a read from Mongo, we can do better
        //console.log('Treatment removed', opts); // , stat);

        ctx.bus.emit('data-update', {
          type: 'treatments',
          op: 'remove',
          count: stat.result.n,
          changes: opts.find._id
        });

        ctx.bus.emit('data-received');
        fn(err, stat);
      });
  }

  function save (obj: any, fn: any) {
    obj._id = new ObjectID(obj._id);
    prepareData(obj);

    function saved (err: any, created: any) {
      if (!err) {
        // console.log('Treatment updated', created);

        ctx.ddata.processRawDataForRuntime(obj);

        ctx.bus.emit('data-update', {
          type: 'treatments',
          op: 'update',
          changes: ctx.ddata.processRawDataForRuntime([obj])
        });

      }
      if (err) console.error('Problem saving treating', err);

      fn(err, created);
    }

    api().save(obj, saved);

    ctx.bus.emit('data-received');
  }

  function api ( ) {
    return ctx.store.collection(env.treatments_collection);
  }

  api.list = list;
  api.create = create;
  api.query_for = query_for;
  api.indexedFields = [
    'created_at'
    , 'eventType'
    , 'insulin'
    , 'carbs'
    , 'glucose'
    , 'enteredBy'
    , 'boluscalc.foods._id'
    , 'notes'
    , 'NSCLIENT_ID'
    , 'percent'
    , 'absolute'
    , 'duration'
    , { 'eventType' : 1, 'duration' : 1, 'created_at' : 1 }
  ];

  api.remove = remove;
  api.save = save;
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  api.aggregate = require('./aggregate')({ }, api);

  return api;
}

function prepareData(obj: any) {

  // Convert all dates to UTC dates

  // TODO remove this -> must not create new date if missing
  const d = moment(obj.created_at).isValid() ? moment.parseZone(obj.created_at) : moment();
  obj.created_at = d.toISOString();

  var results = {
    created_at: obj.created_at
    , preBolusCarbs: ''
  };

  const offset = d.utcOffset();
  obj.utcOffset = offset;
  // @ts-expect-error TS(2339): Property 'offset' does not exist on type '{ create... Remove this comment to see the full error message
  results.offset = offset;

  obj.glucose = Number(obj.glucose);
  obj.targetTop = Number(obj.targetTop);
  obj.targetBottom = Number(obj.targetBottom);
  obj.carbs = Number(obj.carbs);
  obj.insulin = Number(obj.insulin);
  obj.duration = Number(obj.duration);
  obj.percent = Number(obj.percent);
  obj.absolute = Number(obj.absolute);
  obj.relative = Number(obj.relative);
  obj.preBolus = Number(obj.preBolus);

  //NOTE: the eventTime is sent by the client, but deleted, we only store created_at
  var eventTime;
  if (obj.eventTime) {
    eventTime = new Date(obj.eventTime).toISOString();
    results.created_at = eventTime;
  }

  obj.created_at = results.created_at;
  if (obj.preBolus && obj.preBolus !== 0 && obj.carbs) {
    results.preBolusCarbs = obj.carbs;
    delete obj.carbs;
  }

  if (obj.eventType === 'Announcement') {
    obj.isAnnouncement = true;
  }

  // clean data
  delete obj.eventTime;

  function deleteIfEmpty (field: any) {
    if (!obj[field] || obj[field] === 0) {
      delete obj[field];
    }
  }

  function deleteIfNaN (field: any) {
    if (isNaN(obj[field])) {
      delete obj[field];
    }
  }

  deleteIfEmpty('targetTop');
  deleteIfEmpty('targetBottom');
  deleteIfEmpty('carbs');
  deleteIfEmpty('insulin');
  deleteIfEmpty('percent');
  deleteIfEmpty('relative');
  deleteIfEmpty('notes');
  deleteIfEmpty('preBolus');

  deleteIfNaN('absolute');
  deleteIfNaN('duration');

  if (obj.glucose === 0 || isNaN(obj.glucose)) {
    delete obj.glucose;
    delete obj.glucoseType;
    delete obj.units;
  }

  return results;
}

storage.queryOpts = {
  walker: {
    insulin: parseInt
    , carbs: parseInt
    , glucose: parseInt
    , notes: find_options.parseRegEx
    , eventType: find_options.parseRegEx
    , enteredBy: find_options.parseRegEx
  }
  , dateField: 'created_at'
};

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = storage;
