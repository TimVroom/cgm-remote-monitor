'use strict';

var factories = {
  weeks: function weeks(value: any) {
    return {
      mins: value * 7 * 24 * 60, secs: value * 7 * 24 * 60 * 60, msecs: value * 7 * 24 * 60 * 60 * 1000
    };
  }
  , days: function days(value: any) {
    return {
      hours: value * 24, mins: value * 24 * 60, secs: value * 24 * 60 * 60, msecs: value * 24 * 60 * 60 * 1000
    };
  }
  , hours: function hours(value: any) {
    return {
      mins: value * 60, secs: value * 60 * 60, msecs: value * 60 * 60 * 1000
    };
  }
  , mins: function mins(value: any) {
    return {
      secs: value * 60, msecs: value * 60 * 1000
    };
  }
  , secs: function secs(value: any) {
    return {
      msecs: value * 1000
    };
  }
  , msecs: function msecs(value: any) {
    return {
      mins: value / 1000 / 60, secs: value / 1000, msecs: value
    };
  }
};

function create (types: any) {
  return function withValue (value: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return factories[types](value);
  };
}

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = {
  week: function ( ) { return create('weeks')(1); }
  , weeks: function (value: any) { return create('weeks')(value); }
  , day: function ( ) { return create('days')(1); }
  , days: function (value: any) { return create('days')(value); }
  , hour: function ( ) { return create('hours')(1); }
  , hours: function (value: any) { return create('hours')(value); }
  , min: function ( ) { return create('mins')(1); }
  , mins: function (value: any) { return create('mins')(value); }
  , sec: function ( ) { return create('secs')(1); }
  , secs: function (value: any) { return create('secs')(value); }
  , msec: function ( ) { return create('msecs')(1); }
  , msecs: function (value: any) { return create('msecs')(value); }
};

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = times;