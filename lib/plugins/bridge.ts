'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var engine = require('share2nightscout-bridge');

// Track the most recently seen record
var mostRecentRecord: any;

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (env: any, bus: any) {
  if (env.extendedSettings.bridge && env.extendedSettings.bridge.userName && env.extendedSettings.bridge.password) {
    return create(env, bus);
  } else {
    console.info('Dexcom bridge not enabled');
  }
}

function bridged (entries: any) {
  function payload (err: any, glucose: any) {
    if (err) {
      console.error('Bridge error: ', err);
    } else {
      if (glucose) {
        for (var i = 0; i < glucose.length; i++) {
          if (glucose[i].date > mostRecentRecord) {
            mostRecentRecord = glucose[i].date;
          }
        }
        //console.log("DEXCOM: Most recent entry received; "+new Date(mostRecentRecord).toString());
      }
      entries.create(glucose, function stored (err: any) {
        if (err) {
          console.error('Bridge storage error: ', err);
        }
      });
    }
  }
  return payload;
}

function options (env: any) {
  var config = {
    accountName: env.extendedSettings.bridge.userName
    , password: env.extendedSettings.bridge.password
  };

  var fetch_config = {
    maxCount: env.extendedSettings.bridge.maxCount || 1
    , minutes: env.extendedSettings.bridge.minutes || 1440
  };

  var interval = env.extendedSettings.bridge.interval || 60000 * 2.6; // Default: 2.6 minutes

  if (interval < 1000 || interval > 300000) {
        // Invalid interval range. Revert to default
        console.error("Invalid interval set: [" + interval + "ms]. Defaulting to 2.6 minutes.")
        interval = 60000 * 2.6 // 2.6 minutes
  }

  return {
    login: config
    , interval: interval
    , fetch: fetch_config
    , nightscout: { }
    , maxFailures: env.extendedSettings.bridge.maxFailures || 3
    , firstFetchCount: env.extendedSettings.bridge.firstFetchCount || 3
  };
}

// @ts-expect-error TS(2300): Duplicate identifier 'create'.
function create (env: any, bus: any) {

  var bridge = { };

  var opts = options(env);
  var interval = opts.interval;

  mostRecentRecord = new Date().getTime() - opts.fetch.minutes * 60000;

  // @ts-expect-error TS(2339) FIXME: Property 'startEngine' does not exist on type '{}'... Remove this comment to see the full error message
  bridge.startEngine = function startEngine (entries: any) {


    // @ts-expect-error TS(2339) FIXME: Property 'callback' does not exist on type '{ logi... Remove this comment to see the full error message
    opts.callback = bridged(entries);

    let last_run = new Date(0).getTime();
    let last_ondemand = new Date(0).getTime();

    function should_run() {
      // Time we expect to have to collect again
      const msRUN_AFTER = (300+20) * 1000;
      const msNow = new Date().getTime();

      const next_entry_expected = mostRecentRecord + msRUN_AFTER;

      if (next_entry_expected > msNow) {
        // we're not due to collect a new slot yet. Use interval
        const ms_since_last_run = msNow - last_run;
        if (ms_since_last_run < interval) {
          return false;
        }

        last_run = msNow;
        last_ondemand = new Date(0).getTime();
        console.log("DEXCOM: Running poll");
        return true;
      }

      const ms_since_last_run = msNow - last_ondemand;

      if (ms_since_last_run < interval) {
        return false;
      }
      last_run = msNow;
      last_ondemand = msNow;
      console.log("DEXCOM: Data due, running extra poll");
      return true;
    }

    let timer = setInterval(function () {
      if  (!should_run()) return;


      // @ts-expect-error TS(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      opts.fetch.minutes = parseInt((new Date() - mostRecentRecord) / 60000);
      // @ts-expect-error TS(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      opts.fetch.maxCount = parseInt((opts.fetch.minutes / 5) + 1);
      opts.firstFetchCount = opts.fetch.maxCount;
      console.log("Fetching Share Data: ", 'minutes', opts.fetch.minutes, 'maxCount', opts.fetch.maxCount);
      engine(opts);
    }, 1000 /*interval*/);

    if (bus) {
      bus.on('teardown', function serverTeardown () {
        clearInterval(timer);
      });
    }
  };

  return bridge;
}

init.create = create;
init.bridged = bridged;
init.options = options;
// @ts-expect-error TS(2304) FIXME: Cannot find name 'exports'.
exports = module.exports = init;
