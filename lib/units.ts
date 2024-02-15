'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'consts'.
var consts = require('./constants');

function mgdlToMMOL(mgdl: any) {
  return (Math.round((mgdl / consts.MMOL_TO_MGDL) * 10) / 10).toFixed(1);
}

function mmolToMgdl(mgdl: any) {
  return Math.round(mgdl * consts.MMOL_TO_MGDL);
}

// @ts-expect-error TS(2393): Duplicate function implementation.
function configure() {
  return {
    mgdlToMMOL: mgdlToMMOL
    , mmolToMgdl: mmolToMgdl
  };
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;