'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'constants'... Remove this comment to see the full error message
var constants = require('./constants');

var levels = {
  URGENT: constants.LEVEL_URGENT
  , WARN: constants.LEVEL_WARN
  , INFO: constants.LEVEL_INFO
  , LOW: constants.LEVEL_LOW
  , LOWEST: constants.LEVEL_LOWEST
  , NONE: constants.LEVEL_NONE
};

// @ts-expect-error TS(2339): Property 'language' does not exist on type '{ URGE... Remove this comment to see the full error message
levels.language = require('./language')();
// @ts-expect-error TS(2339): Property 'translate' does not exist on type '{ URG... Remove this comment to see the full error message
levels.translate = levels.language.translate;

var level2Display = {
  '2': 'Urgent'
  , '1':'Warning'
  , '0': 'Info'
  , '-1': 'Low'
  , '-2': 'Lowest'
  , '-3': 'None'
};

// @ts-expect-error TS(2339): Property 'isAlarm' does not exist on type '{ URGEN... Remove this comment to see the full error message
levels.isAlarm = function isAlarm(level: any) {
  return level === levels.WARN || level === levels.URGENT;
};

// @ts-expect-error TS(2339): Property 'toDisplay' does not exist on type '{ URG... Remove this comment to see the full error message
levels.toDisplay = function toDisplay(level: any) {
  var key = level !== undefined && level.toString();
  // @ts-expect-error TS(2339): Property 'translate' does not exist on type '{ URG... Remove this comment to see the full error message
  return key && levels.translate(level2Display[key]) || levels.translate('Unknown');
};

// @ts-expect-error TS(2339): Property 'toLowerCase' does not exist on type '{ U... Remove this comment to see the full error message
levels.toLowerCase = function toLowerCase(level: any) {
  // @ts-expect-error TS(2339): Property 'toDisplay' does not exist on type '{ URG... Remove this comment to see the full error message
  return levels.toDisplay(level).toLowerCase();
};

// @ts-expect-error TS(2339): Property 'toStatusClass' does not exist on type '{... Remove this comment to see the full error message
levels.toStatusClass = function toStatusClass(level: any) {
  var cls = 'current';

  if (level === levels.WARN) {
    cls = 'warn';
  } else if (level === levels.URGENT) {
    cls = 'urgent';
  }

  return cls;
};


// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = levels;