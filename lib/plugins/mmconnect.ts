/* jshint node: true */
'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash'),
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  connect = require('minimed-connect-to-nightscout');

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (env: any, entries: any, devicestatus: any, bus: any) {
  if (env.extendedSettings.mmconnect && env.extendedSettings.mmconnect.userName && env.extendedSettings.mmconnect.password) {
    return {run: makeRunner(env, entries, devicestatus, bus)};
  } else {
    console.info('MiniMed Connect not enabled');
    return null;
  }
}

function makeRunner (env: any, entries: any, devicestatus: any, bus: any) {
  var options = getOptions(env);

  var client = connect.carelink.Client(options);
  connect.logger.setVerbose(options.verbose);

  var handleData = makeHandler_(entries, devicestatus, options.sgvLimit, options.storeRawData);

  return function run () {
    let timer = setInterval(function() {
      client.fetch(handleData);
    }, options.interval);

    if (bus) {
      bus.on('teardown', function serverTeardown () {
        clearInterval(timer);
      });
    }
  };
}

function getOptions (env: any) {
  return {
    username: env.extendedSettings.mmconnect.userName
    , password: env.extendedSettings.mmconnect.password
    , sgvLimit: parseInt(env.extendedSettings.mmconnect.sgvLimit || 24, 10)
    , interval: parseInt(env.extendedSettings.mmconnect.interval || 60*1000, 10)
    , maxRetryDuration: parseInt(env.extendedSettings.mmconnect.maxRetryDuration || 32, 10)
    , verbose: !!env.extendedSettings.mmconnect.verbose
    , storeRawData: !!env.extendedSettings.mmconnect.storeRawData
  };
}

function makeHandler_ (entries: any, devicestatus: any, sgvLimit: any, storeRawData: any) {
  var filterSgvs = connect.filter.makeRecencyFilter(function(item: any) {
    return item['date'];
  });
  var filterDevicestatus = connect.filter.makeRecencyFilter(function(item: any) {
    return new Date(item['created_at']).getTime();
  });

  return function handleCarelinkData (err: any, data: any) {
    if (err) {
      console.error('MiniMed Connect error: ' + err);
    } else {
      var transformed = connect.transform(data, sgvLimit);

      if (storeRawData && (transformed.entries.length || transformed.devicestatus.length)) {
        transformed.entries.push(rawDataEntry(data));
      }

      // If we blindly upsert the SGV entries, we will lose trend data for
      // entries we've already stored, since all SGVs from CareLink except
      // the most recent are missing trend data.
      var filteredSgvs = filterSgvs(transformed.entries);

      // The devicestatus collection doesn't upsert, so we need to avoid
      // duplicates here
      var filteredStatus = filterDevicestatus(transformed.devicestatus);

      // Can't do "bulk" insert, must be done serially
      createMaybe_(entries, filteredSgvs, function() {
        createMaybe_(devicestatus, filteredStatus, _.noop);
      });
    }
  };
}

function createMaybe_ (collection: any, items: any, callback: any) {
  if (items.length === 0) {
    callback();
  } else {
    collection.create(items, function afterCreate (err: any) {
      if (err) {
        console.error('MiniMed Connect storage error: ' + err);
      }
      callback();
    });
  }
}

function rawDataEntry (data: any) {
  var cleansed = _.cloneDeep(data);

  // redact PII
  cleansed['firstName'] = cleansed['lastName'] = cleansed['medicalDeviceSerialNumber'] = '<redacted>';

  // trim the default 288 sgvs returned by carelink
  if (cleansed['sgs'] && cleansed['sgs'] instanceof Array) {
    cleansed['sgs'] = cleansed['sgs'].slice(Math.max(0, cleansed['sgs'].length - 6));
  }

  var timestamp = data['lastMedicalDeviceDataUpdateServerTime'];
  return {
    'date': timestamp
    , 'dateString': new Date(timestamp).toISOString()
    , 'type': 'carelink_raw'
    , 'data': cleansed
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  init: init
  // exposed for testing
  , getOptions: getOptions
  , rawDataEntry: rawDataEntry
};
