'use strict';

import times from '../times';
import calcData from '../data/calcdelta';
import {ObjectID} from 'mongodb';
import forwarded from 'forwarded-for';
import {Server} from "socket.io";

function getRemoteIP(req) {
    const address = forwarded(req, req.headers);
    return address.ip;
}

function init(env, ctx, server) {

    function websocket() {
        return websocket;
    }

    //var log_yellow = '\x1B[33m';
    const log_green = '\x1B[32m';
    const log_magenta = '\x1B[35m';
    const log_reset = '\x1B[0m';
    const LOG_WS = log_green + 'WS: ' + log_reset;
    const LOG_DEDUP = log_magenta + 'DEDUPE: ' + log_reset;

    let io;
    let watchers = 0;
    let lastData = {};
    let lastProfileSwitch = null;

    // TODO: this would be better to have somehow integrated/improved
    const supportedCollections = {
        'treatments': env.treatments_collection
        , 'entries': env.entries_collection
        , 'devicestatus': env.devicestatus_collection
        , 'profile': env.profile_collection
        , 'food': env.food_collection
        , 'activity': env.activity_collection
    };

    // This is little ugly copy but I was unable to pass testa after making module from status and share with /api/v1/status
    function status() {
        let versionNum = 0;
        const vString = '' + env.version;
        const verParse = vString.split('.');
        if (verParse) {
            versionNum = 10000 * Number(verParse[0]) + 100 * Number(verParse[1]) + Number(verParse[2]);
        }

        const apiEnabled = env.enclave.isApiKeySet();

        const activeProfile = ctx.ddata.lastProfileFromSwitch;

        const info = {
            status: 'ok',
            name: env.name,
            version: env.version,
            versionNum: versionNum,
            serverTime: new Date().toISOString(),
            apiEnabled: apiEnabled,
            careportalEnabled: apiEnabled && env.settings.enable.indexOf('careportal') > -1,
            boluscalcEnabled: apiEnabled && env.settings.enable.indexOf('boluscalc') > -1,
            settings: env.settings,
            extendedSettings: ctx.plugins && ctx.plugins.extendedClientSettings ? ctx.plugins.extendedClientSettings(env.extendedSettings) : {},
            activeProfile: undefined,
        };

        if (activeProfile) {
            info.activeProfile = activeProfile;
        }
        return info;
    }

    function start() {
        io = new Server(server, {
            //these only effect the socket.io.js file that is sent to the client, but better than nothing
            // compat with v2 client
            allowEIO3: true,
            perMessageDeflate: {
                threshold: 512
            },
            transports: ["polling", "websocket"],
            httpCompression: {
                threshold: 512
            }
        });
        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
        io.set('log level', 0);

        ctx.bus.on('teardown', function serverTeardown() {
            Object.keys(io.sockets.sockets).forEach(function (s) {
                io.sockets.sockets[s].disconnect(true);
            });
            io.close();
        });

        ctx.bus.on('data-processed', function () {
            update();
        });

    }

    function verifyAuthorization(message, ip, callback) {

        if (!message) message = {};

        ctx.authorization.resolve({
            api_secret: message.secret,
            token: message.token,
            ip: ip
        }, function resolved(err, result) {

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

    function emitData(delta) {
        if (lastData.cals) {
            // console.log(LOG_WS + 'running websocket.emitData', ctx.ddata.lastUpdated);
            if (lastProfileSwitch !== ctx.ddata.lastProfileFromSwitch) {
                // console.log(LOG_WS + 'profile switch detected OLD: ' + lastProfileSwitch + ' NEW: ' + ctx.ddata.lastProfileFromSwitch);
                delta.status = status(ctx.ddata.profiles);
                lastProfileSwitch = ctx.ddata.lastProfileFromSwitch;
            }
            io.to('DataReceivers').compress(true).emit('dataUpdate', delta);
        }
    }

    function listeners() {
        io.sockets.on('connection', function onConnection(socket) {
            let socketAuthorization = null;

            const remoteIP = getRemoteIP(socket.request);
            console.log(LOG_WS + 'Connection from client ID: ', socket.client.id, ' IP: ', remoteIP);

            io.emit('clients', ++watchers);
            socket.on('disconnect', function onDisconnect() {
                io.emit('clients', --watchers);
                console.log(LOG_WS + 'Disconnected client ID: ', socket.client.id);
            });

            function checkConditions(action, data) {
                const collection = supportedCollections[data.collection];
                if (!collection) {
                    console.log('WS dbUpdate/dbAdd call: ', 'Wrong collection', data);
                    return {result: 'Wrong collection'};
                }

                if (!socketAuthorization) {
                    console.log('WS dbUpdate/dbAdd call: ', 'Not authorized', data);
                    return {result: 'Not authorized'};
                }

                if (data.collection === 'treatments') {
                    if (!socketAuthorization.write_treatment) {
                        console.log('WS dbUpdate/dbAdd call: ', 'Not permitted', data);
                        return {result: 'Not permitted'};
                    }
                } else {
                    if (!socketAuthorization.write) {
                        console.log('WS dbUpdate call: ', 'Not permitted', data);
                        return {result: 'Not permitted'};
                    }
                }

                if (action === 'dbUpdate' && !data._id) {
                    console.log('WS dbUpdate/dbAddnot sure abou documentati call: ', 'Missing _id', data);
                    return {result: 'Missing _id'};
                }

                return null;
            }

            socket.on('loadRetro', function loadRetro(opts, callback) {
                if (callback) {
                    callback({result: 'success'});
                }
                //TODO: use opts to only send delta for retro data
                socket.compress(true).emit('retroUpdate', {devicestatus: lastData.devicestatus});
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
            socket.on('dbUpdate', function dbUpdate(data, callback) {
                console.log(LOG_WS + 'dbUpdate client ID: ', socket.client.id, ' data: ', data);
                const collection = supportedCollections[data.collection];

                const check = checkConditions('dbUpdate', data);
                if (check) {
                    if (callback) {
                        callback(check);
                    }
                    return;
                }
                let id;
                try {
                    id = new ObjectID(data._id);
                } catch (err) {
                    console.error(err);
                    id = new ObjectID();
                }

                ctx.store.collection(collection).update({'_id': id}
                    , {$set: data.data}
                    , function (err) {

                        if (!err) {
                            ctx.store.collection(collection).findOne({'_id': id}
                                , function (err, results) {
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
                    callback({result: 'success'});
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
            socket.on('dbUpdateUnset', function dbUpdateUnset(data, callback) {
                console.log(LOG_WS + 'dbUpdateUnset client ID: ', socket.client.id, ' data: ', data);
                const collection = supportedCollections[data.collection];

                const check = checkConditions('dbUpdate', data);
                if (check) {
                    if (callback) {
                        callback(check);
                    }
                    return;
                }

                const objId = new ObjectID(data._id);
                ctx.store.collection(collection).update({'_id': objId}, {$unset: data.data}
                    , function (err) {
                        if (!err) {
                            ctx.store.collection(collection).findOne({'_id': objId}
                                , function (err, results) {
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
                    callback({result: 'success'});
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
            socket.on('dbAdd', function dbAdd(data, callback) {
                console.log(LOG_WS + 'dbAdd client ID: ', socket.client.id, ' data: ', data);
                const collection = supportedCollections[data.collection];
                const maxtimediff = times.secs(2).msecs;

                const check = checkConditions('dbAdd', data);
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
                    let query;
                    if (data.data.NSCLIENT_ID) {
                        query = {NSCLIENT_ID: data.data.NSCLIENT_ID};
                    } else {
                        query = {
                            created_at: data.data.created_at
                            , eventType: data.data.eventType
                        };
                    }

                    // try to find exact match
                    ctx.store.collection(collection).find(query).toArray(function findResult(err, array) {
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

                        let selected = false;
                        const query_similiar = {
                            created_at: {
                                $gte: new Date(new Date(data.data.created_at).getTime() - maxtimediff).toISOString(),
                                $lte: new Date(new Date(data.data.created_at).getTime() + maxtimediff).toISOString()
                            }
                        };
                        if (data.data.insulin) {
                            query_similiar.insulin = data.data.insulin;
                            selected = true;
                        }
                        if (data.data.carbs) {
                            query_similiar.carbs = data.data.carbs;
                            selected = true;
                        }
                        if (data.data.percent) {
                            query_similiar.percent = data.data.percent;
                            selected = true;
                        }
                        if (data.data.absolute) {
                            query_similiar.absolute = data.data.absolute;
                            selected = true;
                        }
                        if (data.data.duration) {
                            query_similiar.duration = data.data.duration;
                            selected = true;
                        }
                        if (data.data.NSCLIENT_ID) {
                            query_similiar.NSCLIENT_ID = data.data.NSCLIENT_ID;
                            selected = true;
                        }
                        // if none assigned add at least eventType
                        if (!selected) {
                            query_similiar.eventType = data.data.eventType;
                        }
                        // try to find similiar
                        ctx.store.collection(collection).find(query_similiar).toArray(function findSimiliarResult(err, array) {
                            // if found similiar just update date. next time it will match exactly

                            if (err) {
                                console.error(err);
                                callback([]);
                                return;
                            }

                            if (array.length > 0) {
                                console.log(LOG_DEDUP + 'Found similiar', array[0]);
                                array[0].created_at = data.data.created_at;
                                const objId = new ObjectID(array[0]._id);
                                ctx.store.collection(collection).update({'_id': objId}, {$set: {created_at: data.data.created_at}});
                                if (callback) {
                                    callback([array[0]]);
                                }
                                ctx.bus.emit('data-received');
                                return;
                            }
                            // if not found create new record
                            console.log(LOG_DEDUP + 'Adding new record');
                            ctx.store.collection(collection).insert(data.data, function insertResult(err, doc) {
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
                    let queryDev;
                    if (data.data.NSCLIENT_ID) {
                        queryDev = {NSCLIENT_ID: data.data.NSCLIENT_ID};
                    } else {
                        queryDev = {
                            created_at: data.data.created_at
                        };
                    }

                    // try to find exact match
                    ctx.store.collection(collection).find(queryDev).toArray(function findResult(err, array) {
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
                        }
                    });

                    ctx.store.collection(collection).insert(data.data, function insertResult(err, doc) {
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
                    ctx.store.collection(collection).insert(data.data, function insertResult(err, doc) {
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
            socket.on('dbRemove', function dbRemove(data, callback) {
                console.log(LOG_WS + 'dbRemove client ID: ', socket.client.id, ' data: ', data);
                const collection = supportedCollections[data.collection];

                const check = checkConditions('dbUpdate', data);
                if (check) {
                    if (callback) {
                        callback(check);
                    }
                    return;
                }

                const objId = new ObjectID(data._id);
                ctx.store.collection(collection).remove({'_id': objId}
                    , function (err, stat) {

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
                    callback({result: 'success'});
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
            socket.on('authorize', function authorize(message, callback) {
                const remoteIP = getRemoteIP(socket.request);
                verifyAuthorization(message, remoteIP, function verified(err, authorization) {

                    if (err) {
                        console.log('Websocket authorization failed:', err);
                        socket.disconnect();
                        return;
                    }

                    socket.emit('connected');

                    socketAuthorization = authorization;

                    if (socketAuthorization.read) {
                        socket.join('DataReceivers');

                        if (lastData && lastData.dataWithRecentStatuses) {
                            const data = lastData.dataWithRecentStatuses();

                            if (message.status) {
                                data.status = status(data.profiles);
                            }

                            socket.emit('dataUpdate', data);
                        }
                    }
                    if (callback) {
                        callback(socketAuthorization);
                    }
                });
            });
        });
    }

    function update() {
        // console.log(LOG_WS + 'running websocket.update');
        if (lastData.sgvs) {
            const delta = calcData(lastData, ctx.ddata);
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
export default init;
