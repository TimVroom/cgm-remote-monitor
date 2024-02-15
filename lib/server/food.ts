'use strict';

function storage (env: any, ctx: any) {
   // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
   var ObjectID = require('mongodb').ObjectID;

  function create (obj: any, fn: any) {
    obj.created_at = (new Date( )).toISOString( );
    api().insert(obj, function (err: any, doc: any) {
      if (err != null && err.message) {
        console.log('Data insertion error', err.message);
        fn(err.message, null);
        return;
      }
      fn(null, doc.ops);
    });
  }

  function save (obj: any, fn: any) {
    try {
      obj._id = new ObjectID(obj._id);
    } catch (err){
      console.error(err);
      obj._id = new ObjectID();
    }
    obj.created_at = (new Date( )).toISOString( );
    api().save(obj, function (err: any, doc: any) {
      fn(err, doc);
    });
  }

  function list (fn: any) {
    return api( ).find({ }).toArray(fn);
  }
  
  function listquickpicks (fn: any) {
    return api( ).find({ $and: [ { 'type': 'quickpick'} , { 'hidden' : 'false' } ] }).sort({'position': 1}).toArray(fn);
  }
  
  function listregular (fn: any) {
    return api( ).find( { 'type': 'food'} ).toArray(fn);
  }
  
  function remove (_id: any, fn: any) {
    var objId = new ObjectID(_id);
    return api( ).remove({ '_id': objId }, fn);
  }



  function api ( ) {
    return ctx.store.collection(env.food_collection);
  }
  
  api.list = list;
  api.listquickpicks = listquickpicks;
  api.listregular = listregular;
  api.create = create;
  api.save = save;
  api.remove = remove;
  api.indexedFields = ['type','position','hidden'];
  return api;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = storage;
