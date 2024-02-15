'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'stringTool... Remove this comment to see the full error message
  , stringTools = require('./stringTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('../const.json')
  ;


/**
  * Floor date to whole seconds (cut off milliseconds)
  * @param {Date} date
  */
function floorSeconds (date: any) {
  let ms = date.getTime();
  ms -= ms % 1000;
  return new Date(ms);
}


/**
 * Parse date as moment object from value or array of values.
 * @param {any} value
 */
// @ts-expect-error TS(7023) FIXME: 'parseToMoment' implicitly has return type 'any' b... Remove this comment to see the full error message
function parseToMoment (value: any)
{
  if (!value)
    return null;

  if (Array.isArray(value)) {
    for (let item of value) {
      // @ts-expect-error TS(7022) FIXME: 'm' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      let m = parseToMoment(item);

      if (m !== null)
        return m;
    }
  }
  else {

    if (typeof value === 'string' && stringTools.isNumberInString(value)) {
      value = parseFloat(value);
    }

    if (typeof value === 'number') {
      let m = moment(value);

      if (!m.isValid())
        return null;

      if (m.valueOf() < apiConst.MIN_TIMESTAMP)
        m = moment.unix(m);

      if (!m.isValid() || m.valueOf() < apiConst.MIN_TIMESTAMP)
        return null;

      return m;
    }

    if (typeof value === 'string') {
      let m = moment.parseZone(value, moment.ISO_8601);

      if (!m.isValid())
        m = moment.parseZone(value, moment.RFC_2822);

      if (!m.isValid() || m.valueOf() < apiConst.MIN_TIMESTAMP)
        return null;

      return m;
    }
  }

  // no parsing option succeeded => failure
  return null;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  floorSeconds,
  parseToMoment
};
