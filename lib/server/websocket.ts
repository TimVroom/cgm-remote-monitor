'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var times = require('../times');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var calcData = require('../data/calcdelta');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'ObjectID'.
var ObjectID = require('mongodb').ObjectID;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'forwarded'... Remove this comment to see the full error message
const forwarded = require('forwarded-for');

// @ts-expect-error TS(2300): Duplicate identifier 'getRemoteIP'.
function getRemoteIP (req: any) {
  const address = forwarded(req, req.headers);
  return address.ip;
}

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (env: any, ctx: any, server: any) {

  function websocket () {
    return websocket;
  }

  //var log_yellow = '\x1B[33m';
  var log_green = '\x1B[32m';
  var log_magenta = '\x1B[35m';
  var log_reset = '\x1B[0m';
  var LOG_WS = log_green + 'WS: ' + log_reset;
  var LOG_DEDUP = log_magenta + 'DEDUPE: ' + log_reset;

  var io: any;
  var watchers = 0;
  var lastData = {};
  var lastProfileSwitch: any = null;

  // TODO: this would be better to have somehow integrated/improved
  var supportedCollections = {
    'treatments': env.treatments_collection
    , 'entries': env.entries_collection
    , 'devicestatus': env.devicestatus_collection
    , 'profile': env.profile_collection
    , 'food': env.food_collection
    , 'activity': env.activity_collection
  };

  // This is little ugly copy but I was unable to pass testa after making module from status and share with /api/v1/status
  function status () {
    var versionNum = 0;
    const vString = '' + env.version;
    const verParse = vString.split('.');
    if (verParse) {
      versionNum = 10000 * Number(verParse[0]) + 100 * Number(verParse[1]) + 1 * Number(verParse[2]);
    }

    var apiEnabled = env.enclave.isApiKeySet();

    var activeProfile = ctx.ddata.lastProfileFromSwitch;

    var info = {
      status: 'ok'
      , name: env.name
      , version: env.version
      , versionNum: versionNum
      , serverTime: new Date().toISOString()
      , apiEnabled: apiEnabled
      , careportalEnabled: apiEnabled && env.settings.enable.indexOf('careportal') > -1
      , boluscalcEnabled: apiEnabled && env.settings.enable.indexOf('boluscalc') > -1
      , settings: env.settings
      , extendedSettings: ctx.plugins && ctx.plugins.extendedClientSettings ? ctx.plugins.extendedClientSettings(env.extendedSettings) : {}
    };

    if (activeProfile) {
      // @ts-expect-error TS(2339) FIXME: Property 'activeProfile' does not exist on type '{... Remove this comment to see the full error message
      info.activeProfile = activeProfile;
    }
    return info;
  }

  function start () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    io = require('socket.io')({
      'log level': 0
    }).listen(server, {
      //these only effect the socket.io.js file that is sent to the client, but better than nothing
      // compat with v2 client
      allowEIO3: true
      , 'browser client minification': true
      , 'browser client etag': true
      , 'browser client gzip': false
      , 'perMessageDeflate': {
        threshold: 512
      }
      , transports: ["polling", "websocket"]
      , httpCompression: {
        threshold: 512
      }
    });

    ctx.bus.on('teardown', function serverTeardown () {
      Object.keys(io.sockets.sockets).forEach(function(s) {
        io.sockets.sockets[s].disconnect(true);
      });
      io.close();
    });
	
    ctx.bus.on('data-processed', function() {
      update();
    });

  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'message' implicitly has an 'any' type.
  function verifyAuthorization (message, ip, callback) {

    if (!message) message = {};

    // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
    ctx.authorization.resolve({ api_secret: message.secret, token: message.token, ip: ip }, function resolved (err, result) {

      if (err) {
        return callback(err, {
          read: false
          , write: false
          , write_treatment: false
          , error: true
        });
      }

      return callback(null, {
        read: ctx.authorization.checkMultiple('api:*:read', result.shiros)
        , write: ctx.authorization.checkMultiple('api:*:create,update,delete', result.shiros)
        , write_treatment: ctx.authorization.checkMultiple('api:treatments:create,update,delete', result.shiros)
      });
    });
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'delta' implicitly has an 'any' type.
  function emitData (delta) {
    // @ts-expect-error TS(2339) FIXME: Property 'cals' does not exist on type '{}'.
    if (lastData.cals) {
      // console.log(LOG_WS + 'running websocket.emitData', ctx.ddata.lastUpdated);
      if (lastProfileSwitch !== ctx.ddata.lastProfileFromSwitch) {
        // console.log(LOG_WS + 'profile switch detected OLD: ' + lastProfileSwitch + ' NEW: ' + ctx.ddata.lastProfileFromSwitch);
        // @ts-expect-error TS(2554) FIXME: Expected 0 arguments, but got 1.
        delta.status = status(ctx.ddata.profiles);
        lastProfileSwitch = ctx.ddata.lastProfileFromSwitch;
      }
      io.to('DataReceivers').compress(true).emit('dataUpdate', delta);
    }
  }

  function listeners () {
    // @ts-expect-error TS(7006) FIXME: Parameter 'socket' implicitly has an 'any' type.
    io.sockets.on('connection', function onConnection (socket) {
      // @ts-expect-error TS(7034) FIXME: Variable 'socketAuthorization' implicitly has type... Remove this comment to see the full error message
      var socketAuthorization = null;
      var clientType = null;
      var timeDiff;
      var history;

      const remoteIP = getRemoteIP(socket.request);
      console.log(LOG_WS + 'Connection from client ID: ', socket.client.id, ' IP: ', remoteIP);

      io.emit('clients', ++watchers);
      socket.on('disconnect', function onDisconnect () {
        io.emit('clients', --watchers);
        console.log(LOG_WS + 'Disconnected client ID: ', socket.client.id);
      });

      // @ts-expect-error TS(7006) FIXME: Parameter 'action' implicitly has an 'any' type.
      function checkConditions (action, data) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var collection = supportedCollections[data.collection];
        if (!collection) {
          console.log('WS dbUpdate/dbAdd call: ', 'Wrong collection', data);
          return { result: 'Wrong collection' };
        }

        // @ts-expect-error TS(7005) FIXME: Variable 'socketAuthorization' implicitly has an '... Remove this comment to see the full error message
        if (!socketAuthorization) {
          console.log('WS dbUpdate/dbAdd call: ', 'Not authorized', data);
          return { result: 'Not authorized' };
        }

        if (data.collection === 'treatments') {
          if (!socketAuthorization.write_treatment) {
            console.log('WS dbUpdate/dbAdd call: ', 'Not permitted', data);
            return { result: 'Not permitted' };
          }
        } else {
          if (!socketAuthorization.write) {
            console.log('WS dbUpdate call: ', 'Not permitted', data);
            return { result: 'Not permitted' };
          }
        }

        if (action === 'dbUpdate' && !data._id) {
          console.log('WS dbUpdate/dbAddnot sure abou documentati call: ', 'Missing _id', data);
          return { result: 'Missing _id' };
        }

        return null;
      }

      // @ts-expect-error TS(7006) FIXME: Parameter 'opts' implicitly has an 'any' type.
      socket.on('loadRetro', function loadRetro (opts, callback) {
        if (callback) {
          callback({ result: 'success' });
        }
        //TODO: use opts to only send delta for retro data
        // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
        socket.compress(true).emit('retroUpdate', { devicestatus: lastData.devicestatus });
        console.info('sent retroUpdate', opts);
      });

      // dbUpdate message
      //  {
      //    collection: treatments
      //    _id: 'some mongo record id'
      //    data: {
      //      field_1: new_value,
      //      field_2: another_value
      //    }
      //  }
      // @ts-expect-error TS(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
      socket.on('dbUpdate', function dbUpdate (data, callback) {
        console.log(LOG_WS + 'dbUpdate client ID: ', socket.client.id, ' data: ', data);
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var collection = supportedCollections[data.collection];

        var check = checkConditions('dbUpdate', data);
        if (check) {
          if (callback) {
            callback(check);
          }
          return;
        }
        // @ts-expect-error TS(7034) FIXME: Variable 'id' implicitly has type 'any' in some lo... Remove this comment to see the full error message
        var id;
        try {
          id = new ObjectID(data._id);
        } catch (err) {
          console.error(err);
          id = new ObjectID();
        }

        ctx.store.collection(collection).update({ '_id': id }
          , { $set: data.data }
          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          , function(err, results) {

            if (!err) {
              // @ts-expect-error TS(7005) FIXME: Variable 'id' implicitly has an 'any' type.
              ctx.store.collection(collection).findOne({ '_id': id }
                // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
                , function(err, results) {
                  console.log('Got results', results);
                  if (!err && results !== null) {
                    ctx.bus.emit('data-update', {
                      type: data.collection
                      , op: 'update'
                      , changes: ctx.ddata.processRawDataForRuntime([results])
                    });
                  }
                });
            }
          }
        );

        if (callback) {
          callback({ result: 'success' });
        }
        ctx.bus.emit('data-received');
      });

      // dbUpdateUnset message
      //  {
      //    collection: treatments
      //    _id: 'some mongo record id'
      //    data: {
      //      field_1: 1,
      //      field_2: 1
      //    }
      //  }
      // @ts-expect-error TS(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
      socket.on('dbUpdateUnset', function dbUpdateUnset (data, callback) {
        console.log(LOG_WS + 'dbUpdateUnset client ID: ', socket.client.id, ' data: ', data);
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var collection = supportedCollections[data.collection];

        var check = checkConditions('dbUpdate', data);
        if (check) {
          if (callback) {
            callback(check);
          }
          return;
        }

        var objId = new ObjectID(data._id);
        ctx.store.collection(collection).update({ '_id': objId }, { $unset: data.data }
          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          , function(err, results) {

            if (!err) {
              ctx.store.collection(collection).findOne({ '_id': objId }
                // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
                , function(err, results) {
                  console.log('Got results', results);
                  if (!err && results !== null) {
                    ctx.bus.emit('data-update', {
                      type: data.collection
                      , op: 'update'
                      , changes: ctx.ddata.processRawDataForRuntime([results])
                    });
                  }
                });
            }
          });

        if (callback) {
          callback({ result: 'success' });
        }
        ctx.bus.emit('data-received');
      });

      // dbAdd message
      //  {
      //    collection: treatments
      //    data: {
      //      field_1: new_value,
      //      field_2: another_value
      //    }
      //  }
      // @ts-expect-error TS(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
      socket.on('dbAdd', function dbAdd (data, callback) {
        console.log(LOG_WS + 'dbAdd client ID: ', socket.client.id, ' data: ', data);
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var collection = supportedCollections[data.collection];
        var maxtimediff = times.secs(2).msecs;

        var check = checkConditions('dbAdd', data);
        if (check) {
          if (callback) {
            callback(check);
          }
          return;
        }

        if (data.collection === 'treatments' && !('eventType' in data.data)) {
          data.data.eventType = '<none>';
        }
        if (!('created_at' in data.data)) {
          data.data.created_at = new Date().toISOString();
        }

        // treatments deduping
        if (data.collection === 'treatments') {
          var query;
          if (data.data.NSCLIENT_ID) {
            query = { NSCLIENT_ID: data.data.NSCLIENT_ID };
          } else {
            query = {
              created_at: data.data.created_at
              , eventType: data.data.eventType
            };
          }

          // try to find exact match
          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          ctx.store.collection(collection).find(query).toArray(function findResult (err, array) {
            if (err) {
              console.error(err);
              callback([]);
              return;
            }

            if (array.length > 0) {
              console.log(LOG_DEDUP + 'Exact match');
              if (callback) {
                callback([array[0]]);
              }
              return;
            }

            var selected = false;
            var query_similiar = {
              created_at: { $gte: new Date(new Date(data.data.created_at).getTime() - maxtimediff).toISOString(), $lte: new Date(new Date(data.data.created_at).getTime() + maxtimediff).toISOString() }
            };
            if (data.data.insulin) {
              // @ts-expect-error TS(2339) FIXME: Property 'insulin' does not exist on type '{ creat... Remove this comment to see the full error message
              query_similiar.insulin = data.data.insulin;
              selected = true;
            }
            if (data.data.carbs) {
              // @ts-expect-error TS(2339) FIXME: Property 'carbs' does not exist on type '{ created... Remove this comment to see the full error message
              query_similiar.carbs = data.data.carbs;
              selected = true;
            }
            if (data.data.percent) {
              // @ts-expect-error TS(2339) FIXME: Property 'percent' does not exist on type '{ creat... Remove this comment to see the full error message
              query_similiar.percent = data.data.percent;
              selected = true;
            }
            if (data.data.absolute) {
              // @ts-expect-error TS(2339) FIXME: Property 'absolute' does not exist on type '{ crea... Remove this comment to see the full error message
              query_similiar.absolute = data.data.absolute;
              selected = true;
            }
            if (data.data.duration) {
              // @ts-expect-error TS(2339) FIXME: Property 'duration' does not exist on type '{ crea... Remove this comment to see the full error message
              query_similiar.duration = data.data.duration;
              selected = true;
            }
            if (data.data.NSCLIENT_ID) {
              // @ts-expect-error TS(2339) FIXME: Property 'NSCLIENT_ID' does not exist on type '{ c... Remove this comment to see the full error message
              query_similiar.NSCLIENT_ID = data.data.NSCLIENT_ID;
              selected = true;
            }
            // if none assigned add at least eventType
            if (!selected) {
              // @ts-expect-error TS(2339) FIXME: Property 'eventType' does not exist on type '{ cre... Remove this comment to see the full error message
              query_similiar.eventType = data.data.eventType;
            }
            // try to find similiar
            // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
            ctx.store.collection(collection).find(query_similiar).toArray(function findSimiliarResult (err, array) {
              // if found similiar just update date. next time it will match exactly

              if (err) {
                console.error(err);
                callback([]);
                return;
              }

              if (array.length > 0) {
                console.log(LOG_DEDUP + 'Found similiar', array[0]);
                array[0].created_at = data.data.created_at;
                var objId = new ObjectID(array[0]._id);
                ctx.store.collection(collection).update({ '_id': objId }, { $set: { created_at: data.data.created_at } });
                if (callback) {
                  callback([array[0]]);
                }
                ctx.bus.emit('data-received');
                return;
              }
              // if not found create new record
              console.log(LOG_DEDUP + 'Adding new record');
              // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
              ctx.store.collection(collection).insert(data.data, function insertResult (err, doc) {
                if (err != null && err.message) {
                  console.log('treatments data insertion error: ', err.message);
                  return;
                }

                ctx.bus.emit('data-update', {
                  type: data.collection
                  , op: 'update'
                  , changes: ctx.ddata.processRawDataForRuntime(doc.ops)
                });

                if (callback) {
                  callback(doc.ops);
                }
                ctx.bus.emit('data-received');
              });
            });
          });
          // devicestatus deduping
        } else if (data.collection === 'devicestatus') {
          var queryDev;
          if (data.data.NSCLIENT_ID) {
            queryDev = { NSCLIENT_ID: data.data.NSCLIENT_ID };
          } else {
            queryDev = {
              created_at: data.data.created_at
            };
          }

          // try to find exact match
          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          ctx.store.collection(collection).find(queryDev).toArray(function findResult (err, array) {
            if (err) {
              console.error(err);
              callback([]);
              return;
            }

            if (array.length > 0) {
              console.log(LOG_DEDUP + 'Devicestatus exact match');
              if (callback) {
                callback([array[0]]);
              }
              return;
            }

          });

          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          ctx.store.collection(collection).insert(data.data, function insertResult (err, doc) {
            if (err != null && err.message) {
              console.log('devicestatus insertion error: ', err.message);
              return;
            }

            ctx.bus.emit('data-update', {
              type: 'devicestatus'
              , op: 'update'
              , changes: ctx.ddata.processRawDataForRuntime(doc.ops)
            });

            if (callback) {
              callback(doc.ops);
            }
            ctx.bus.emit('data-received');
          });
        } else {
          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          ctx.store.collection(collection).insert(data.data, function insertResult (err, doc) {
            if (err != null && err.message) {
              console.log(data.collection + ' insertion error: ', err.message);
              return;
            }

            ctx.bus.emit('data-update', {
              type: data.collection
              , op: 'update'
              , changes: ctx.ddata.processRawDataForRuntime(doc.ops)
            });

            if (callback) {
              callback(doc.ops);
            }
            ctx.bus.emit('data-received');
          });
        }
      });
      // dbRemove message
      //  {
      //    collection: treatments
      //    _id: 'some mongo record id'
      //  }
      // @ts-expect-error TS(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
      socket.on('dbRemove', function dbRemove (data, callback) {
        console.log(LOG_WS + 'dbRemove client ID: ', socket.client.id, ' data: ', data);
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var collection = supportedCollections[data.collection];

        var check = checkConditions('dbUpdate', data);
        if (check) {
          if (callback) {
            callback(check);
          }
          return;
        }

        var objId = new ObjectID(data._id);
        ctx.store.collection(collection).remove({ '_id': objId }
          // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
          , function(err, stat) {

            if (!err) {
              ctx.bus.emit('data-update', {
                type: data.collection
                , op: 'remove'
                , count: stat.result.n
                , changes: data._id
              });

            }
          });

        if (callback) {
          callback({ result: 'success' });
        }
        ctx.bus.emit('data-received');
      });

      // Authorization message
      // {
      //  client: 'web' | 'phone' | 'pump'
      //  , secret: 'secret_hash'
      //  [, history : history_in_hours ]
      //  [, status : true ]
      // }
      // @ts-expect-error TS(7006) FIXME: Parameter 'message' implicitly has an 'any' type.
      socket.on('authorize', function authorize (message, callback) {
        const remoteIP = getRemoteIP(socket.request);
        // @ts-expect-error TS(7006) FIXME: Parameter 'err' implicitly has an 'any' type.
        verifyAuthorization(message, remoteIP, function verified (err, authorization) {

          if (err) {
            console.log('Websocket authorization failed:', err);
            socket.disconnect();
            return;
          }

          socket.emit('connected');

          socketAuthorization = authorization;
          clientType = message.client;
          history = message.history || 48; //default history is 48 hours

          if (socketAuthorization.read) {
            socket.join('DataReceivers');

            // @ts-expect-error TS(2339) FIXME: Property 'dataWithRecentStatuses' does not exist o... Remove this comment to see the full error message
            if (lastData && lastData.dataWithRecentStatuses) {
              // @ts-expect-error TS(2339) FIXME: Property 'dataWithRecentStatuses' does not exist o... Remove this comment to see the full error message
              let data = lastData.dataWithRecentStatuses();

              if (message.status) {
                // @ts-expect-error TS(2554) FIXME: Expected 0 arguments, but got 1.
                data.status = status(data.profiles);
              }

              socket.emit('dataUpdate', data);
            }
          }
          // console.log(LOG_WS + 'Authetication ID: ', socket.client.id, ' client: ', clientType, ' history: ' + history);
          if (callback) {
            callback(socketAuthorization);
          }
        });
      });
    });
  }

  function update () {
    // console.log(LOG_WS + 'running websocket.update');
    // @ts-expect-error TS(2339) FIXME: Property 'sgvs' does not exist on type '{}'.
    if (lastData.sgvs) {
      var delta = calcData(lastData, ctx.ddata);
      if (delta.delta) {
        // console.log('lastData full size', JSON.stringify(lastData).length,'bytes');
        // if (delta.sgvs) { console.log('patientData update size', JSON.stringify(delta).length,'bytes'); }
        emitData(delta);
      } // else { console.log('delta calculation indicates no new data is present'); }
    }
    lastData = ctx.ddata.clone();
  }

  start();
  listeners();

  if (ctx.storageSocket) {
    ctx.storageSocket.init(io);
  }

  if (ctx.alarmSocket) {
    ctx.alarmSocket.init(io);
  }

  return websocket();
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
