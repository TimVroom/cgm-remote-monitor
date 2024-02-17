'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'async'.
const async = require('async');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fitTreatme... Remove this comment to see the full error message
const fitTreatmentsToBGCurve = require('./treatmenttocurve');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'constants'... Remove this comment to see the full error message
const constants = require('../constants');

function uniqBasedOnMills(a: any) {
    var seen = {};
    return a.filter(function(item: any) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return Object.prototype.hasOwnProperty.call(seen, item.mills) ? false : (seen[item.mills] = true);
    });
}

const processForRuntime = (obj: any) => {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key]) {
          if (obj[key].hasOwnProperty('_id')) {
            obj[key]._id = obj[key]._id.toString();
          }
          if (obj[key].hasOwnProperty('created_at') && !obj[key].hasOwnProperty('mills')) {
            obj[key].mills = new Date(obj[key].created_at).getTime();
          }
        }
    });
}

const findLatestMills = (data: any) => {
    if (!data) return;
    let max = data[0].mills;
    for (let i = 0, len = data.length; i < len; i++) {
        let o = data[i];
        max = o.mills > max ? o.mills : max;
    }
    return max;
}

function mergeProcessSort(oldData: any, newData: any, ageLimit: any) {

  processForRuntime(newData);

  var filtered = _.filter(newData, function hasId(object: any) {
    const hasId = !_.isEmpty(object._id);
    const isFresh = (ageLimit && object.mills >= ageLimit) || (!ageLimit);
    return isFresh && hasId;
  });

  // Merge old and new data, preferring the new objects

  let merged = [];
  if (oldData && filtered) {
    merged = filtered; // Start with the new / updated data
    for (let i = 0; i < oldData.length; i++) {
        const oldElement = oldData[i];
        let found = false;
        for (let j = 0; j < filtered.length; j++) {
            if (oldElement._id == filtered[j]._id) {
                found = true;
                break;
            }
        }
        if (!found) merged.push(oldElement); // Merge old object in, if it wasn't found in the new data
    }
  } else {
      merged = filtered;
  }

  return _.sortBy(merged, function(item: any) {
    return item.mills;
  });

}

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init(env: any, ctx: any) {

    var dataloader = {};

    // @ts-expect-error TS(2339) FIXME: Property 'update' does not exist on type '{}'.
    dataloader.update = function update(ddata: any, opts: any, done: any) {

        if (opts && done == null && opts.call) {
            done = opts;
            opts = {
                lastUpdated: Date.now(),
                frame: false
            };
        }

        if (opts.frame) {
            ddata.page = {
                frame: true,
                after: opts.lastUpdated
                    // , before: opts.
            };
        }
        ddata.lastUpdated = opts.lastUpdated;

        const normalizeTreatments = (obj: any) => {
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object' && obj[key]) {
                    const element = obj[key];
                  if (element.hasOwnProperty('_id')) {
                    element._id = element._id.toString();
                  }
                  if (element.hasOwnProperty('amount') && !element.hasOwnProperty('absolute')) {
                      element.absolute = Number(element.amount);
                  }
                  normalizeTreatments(obj[key]);
                }
            });
        }

        function loadComplete(err: any, result: any) {

            // convert all IDs to strings, as these are not used after load

            normalizeTreatments(ddata);

            ddata.treatments = _.uniq(ddata.treatments, false, function(item: any) {
                return item._id;
            });

            //sort treatments so the last is the most recent
            
            ddata.treatments = _.sortBy(ddata.treatments, function(item: any) {
                return item.mills;
            });

            fitTreatmentsToBGCurve(ddata, env, ctx);
            if (err) {
                console.error(err);
            }
            ddata.processTreatments(true);

            var counts: any = [];
            _.forIn(ddata, function each(value: any, key: any) {
                if (_.isArray(value) && value.length > 0) {
                    counts.push(key + ':' + value.length);
                }
            });

            console.info('Load Complete:\n\t', counts.join(', '));
            done(err, result);
        }

        // clear data we'll get from the cache

        ddata.treatments = [];
        ddata.devicestatus = [];
        ddata.entries = [];

        ddata.dbstats = {};

        async.parallel([
            loadEntries.bind(null, ddata, ctx)
            , loadTreatments.bind(null, ddata, ctx)
            , loadProfileSwitchTreatments.bind(null, ddata, ctx)
            , loadSensorAndInsulinTreatments.bind(null, ddata, ctx)
            , loadProfile.bind(null, ddata, ctx)
            , loadFood.bind(null, ddata, ctx)
            , loadDeviceStatus.bind(null, ddata, env, ctx)
            , loadActivity.bind(null, ddata, ctx)
            , loadDatabaseStats.bind(null, ddata, ctx)
        ], loadComplete);

    };

    return dataloader;

}

function loadEntries(ddata: any, ctx: any, callback: any) {

    const withFrame = ddata.page && ddata.page.frame;
    const longLoad = Math.round(constants.TWO_DAYS);
    const loadTime = ctx.cache.isEmpty('entries') || withFrame ? longLoad : constants.FIFTEEN_MINUTES;

    var dateRange = {
        $gte: ddata.lastUpdated - loadTime
    };
    if (withFrame) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dateRange['$lte'] = ddata.lastUpdated;
    }
    var q = {
        find: {
            date: dateRange
        },
        sort: {
            date: 1
        }
    };

    var obscureDeviceProvenance = ctx.settings.obscureDeviceProvenance;
    ctx.entries.list(q, function(err: any, results: any) {

        if (err) {
            console.log("Problem loading entries");
        }

        if (!err && results) {

            const r = ctx.ddata.processRawDataForRuntime(results);
            const currentData = ctx.cache.insertData('entries', r).reverse();

            const mbgs: any = [];
            const sgvs: any = [];
            const cals: any = [];

            currentData.forEach(function(element: any) {
                if (element) {
                    if (!element.mills) element.mills = element.date;
                    if (element.mbg) {
                        mbgs.push({
                            _id: element._id,
                            mgdl: Number(element.mbg),
                            mills: element.date,
                            device: obscureDeviceProvenance || element.device,
                            type: 'mbg'
                        });
                    } else if (element.sgv) {
                        sgvs.push({
                            _id: element._id,
                            mgdl: Number(element.sgv),
                            mills: element.date,
                            device: obscureDeviceProvenance || element.device,
                            direction: element.direction,
                            filtered: element.filtered,
                            unfiltered: element.unfiltered,
                            noise: element.noise,
                            rssi: element.rssi,
                            type: 'sgv'
                        });
                    } else if (element.type === 'cal') {
                        cals.push({
                            _id: element._id,
                            mills: element.date,
                            scale: element.scale,
                            intercept: element.intercept,
                            slope: element.slope,
                            type: 'cal'
                        });
                    }
                }
            });

            const ageLimit = ddata.lastUpdated - constants.TWO_DAYS;
            ddata.sgvs = sgvs;
            ddata.mbgs = mbgs;
            ddata.cals = cals;
        }
        callback();
    });
}

function loadActivity(ddata: any, ctx: any, callback: any) {
    var dateRange = {
        $gte: new Date(ddata.lastUpdated - (constants.ONE_DAY * 2)).toISOString()
    };
    if (ddata.page && ddata.page.frame) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dateRange['$lte'] = new Date(ddata.lastUpdated).toISOString();
    }

    var q = {
        find: {
            created_at: dateRange
        },
        sort: {
            created_at: 1
        }
    };

    ctx.activity.list(q, function(err: any, results: any) {

        if (err) {
            console.log("Problem loading activity data");
        }

        if (!err && results) {
            var activity: any = [];
            results.forEach(function(element: any) {
                if (element) {
                    if (element.created_at) {
                        var d = new Date(element.created_at);
                        activity.push({
                            mills: d,
                            heartrate: element.heartrate,
                            steps: element.steps,
                            activitylevel: element.activitylevel
                        });
                    }
                }
            });

            ddata.activity = uniqBasedOnMills(activity);
        }
        callback();
    });
}

function loadTreatments(ddata: any, ctx: any, callback: any) {

    const withFrame = ddata.page && ddata.page.frame;
    const longLoad = Math.round(constants.ONE_DAY * 2.5); //ONE_DAY * 2.5;

    // Load 2.5 days to cover last 48 hours including overlapping temp boluses or temp targets for first load
    // Subsequently load at least 15 minutes of data

    const loadTime = ctx.cache.isEmpty('treatments') || withFrame ? longLoad : constants.FIFTEEN_MINUTES;

    var dateRange = {
        $gte: new Date(ddata.lastUpdated - loadTime).toISOString()
    };
    if (withFrame) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dateRange['$lte'] = new Date(ddata.lastUpdated).toISOString();
    }
    var tq = {
        find: {
            created_at: dateRange
        },
        sort: {
            created_at: 1
        }
    };

    ctx.treatments.list(tq, function(err: any, results: any) {
        if (!err && results) {

            // update cache and apply to runtime data
            const r = ctx.ddata.processRawDataForRuntime(results);
            const currentData = ctx.cache.insertData('treatments', r);
            ddata.treatments = ctx.ddata.idMergePreferNew(ddata.treatments, currentData);
        }

        callback();
    });
}

function loadProfileSwitchTreatments(ddata: any, ctx: any, callback: any) {
    var dateRange = {
        $gte: new Date(ddata.lastUpdated - (constants.ONE_DAY * 31 * 12)).toISOString()
    };

    if (ddata.page && ddata.page.frame) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dateRange['$lte'] = new Date(ddata.lastUpdated).toISOString();
    }

    // Load the latest profile switch treatment
    var tq = {
        find: {
            eventType: 'Profile Switch',
            created_at: dateRange,
            duration: 0
        },
        sort: {
            created_at: -1
        },
        count: 1
    };

    ctx.treatments.list(tq, function(err: any, results: any) {
        if (!err && results) {
            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            ddata.treatments = mergeProcessSort(ddata.treatments, results);
        }

        // Store last profile switch
        if (results) {
            ddata.lastProfileFromSwitch = null;
            var now = new Date().getTime();
            for (var p = 0; p < results.length; p++) {
                var pdate = new Date(results[p].created_at).getTime();
                if (pdate < now) {
                    ddata.lastProfileFromSwitch = results[p].profile;
                    break;
                }
            }
        }

        callback();
    });
}

function loadSensorAndInsulinTreatments(ddata: any, ctx: any, callback: any) {
    async.parallel([
        loadLatestSingle.bind(null, ddata, ctx, 'Sensor Start')
        ,loadLatestSingle.bind(null, ddata, ctx, 'Sensor Change')
        ,loadLatestSingle.bind(null, ddata, ctx, 'Sensor Stop')
        ,loadLatestSingle.bind(null, ddata, ctx, 'Site Change')
        ,loadLatestSingle.bind(null, ddata, ctx, 'Insulin Change')
        ,loadLatestSingle.bind(null, ddata, ctx, 'Pump Battery Change')
    ], callback);
}

function loadLatestSingle(ddata: any, ctx: any, dataType: any, callback: any) {

    var dateRange = {
        $gte: new Date(ddata.lastUpdated - (constants.ONE_DAY * 62)).toISOString()
    };

    if (ddata.page && ddata.page.frame) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dateRange['$lte'] = new Date(ddata.lastUpdated).toISOString();
    }

    var tq = {
        find: {
            eventType: {
                $eq: dataType
            },
            created_at: dateRange
        },
        sort: {
            created_at: -1
        },
        count: 1
    };

    ctx.treatments.list(tq, function(err: any, results: any) {
        if (!err && results) {
            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            ddata.treatments = mergeProcessSort(ddata.treatments, results);
        }
        callback();
    });
}

function loadProfile(ddata: any, ctx: any, callback: any) {
    ctx.profile.last(function(err: any, results: any) {
        if (!err && results) {
            var profiles: any = [];
            results.forEach(function(element: any) {
                if (element) {
                    profiles[0] = element;
                }
            });
            ddata.profiles = profiles;
        }
        callback();
    });
}

function loadFood(ddata: any, ctx: any, callback: any) {
    ctx.food.list(function(err: any, results: any) {
        if (!err && results) {
            ddata.food = results;
        }
        callback();
    });
}

function loadDeviceStatus(ddata: any, env: any, ctx: any, callback: any) {

    const withFrame = ddata.page && ddata.page.frame;
    const longLoad = env.extendedSettings.devicestatus && env.extendedSettings.devicestatus.days && env.extendedSettings.devicestatus.days == 2 ? constants.TWO_DAYS : constants.ONE_DAY;
    const loadTime = ctx.cache.isEmpty('devicestatus') || withFrame ? longLoad : constants.FIFTEEN_MINUTES;

    var dateRange = {
        $gte: new Date( ddata.lastUpdated -  loadTime ).toISOString()
    };

    if (withFrame) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        dateRange['$lte'] = new Date(ddata.lastUpdated).toISOString();
    }

    var opts = {
        find: {
            created_at: dateRange
        },
        sort: {
            created_at: -1
        }
    };

    ctx.devicestatus.list(opts, function(err: any, results: any) {
        if (!err && results) {

            // update cache and apply to runtime data
            const r = ctx.ddata.processRawDataForRuntime(results);
            const currentData = ctx.cache.insertData('devicestatus', r);

            const res2 = _.map(currentData, function eachStatus(result: any) {
                if ('uploaderBattery' in result) {
                    result.uploader = {
                        battery: result.uploaderBattery
                    };
                    delete result.uploaderBattery;
                }
                return result;
            });

            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            ddata.devicestatus = mergeProcessSort(ddata.devicestatus, res2);
        } else {
            ddata.devicestatus = [];
        }
        callback();
    });
}

function loadDatabaseStats(ddata: any, ctx: any, callback: any) {
    ctx.store.db.stats(function mongoDone (err: any, result: any) {
        if (err) {
            console.log("Problem loading database stats");
        }
        if (!err && result) {
            ddata.dbstats = { 
                  dataSize:  result.dataSize
                , indexSize: result.indexSize
            };
        }
        callback();
    });
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

