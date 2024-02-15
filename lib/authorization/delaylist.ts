'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');

function init (env: any) {

  const ipDelayList = {};

  const DELAY_ON_FAIL = _.get(env, 'settings.authFailDelay') || 5000;
  const FAIL_AGE = 60000;

  // @ts-expect-error TS(2339): Property 'addFailedRequest' does not exist on type... Remove this comment to see the full error message
  ipDelayList.addFailedRequest = function addFailedRequest (ip: any) {
    const ipString = String(ip);
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    let entry = ipDelayList[ipString];
    const now = Date.now();
    if (!entry) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      ipDelayList[ipString] = now + DELAY_ON_FAIL;
      return;
    }
    if (now >= entry) { entry = now; }
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    ipDelayList[ipString] = entry + DELAY_ON_FAIL;
  };

  // @ts-expect-error TS(2339): Property 'shouldDelayRequest' does not exist on ty... Remove this comment to see the full error message
  ipDelayList.shouldDelayRequest = function shouldDelayRequest (ip: any) {
    const ipString = String(ip);
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const entry = ipDelayList[ipString];
    let now = Date.now();
    if (entry) {
      if (now < entry) {
        return entry - now;
      }
    }
    return false;
  };

  // @ts-expect-error TS(2339): Property 'requestSucceeded' does not exist on type... Remove this comment to see the full error message
  ipDelayList.requestSucceeded = function requestSucceeded (ip: any) {
    const ipString = String(ip);
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (ipDelayList[ipString]) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      delete ipDelayList[ipString];
    }
  };

  // Clear items older than a minute

  setTimeout(function clearList () {
    for (var key in ipDelayList) {
      if (ipDelayList.hasOwnProperty(key)) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (Date.now() > ipDelayList[key] + FAIL_AGE) {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          delete ipDelayList[key];
        }
      }
    }
  }, 30000);

  return ipDelayList;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
