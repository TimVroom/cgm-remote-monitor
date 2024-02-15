'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var units = require('./units')();

function init(ctx: any) {
  var moment = ctx.moment;
  var settings = ctx.settings;
  var translate = ctx.language.translate;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var timeago = require('./plugins/timeago')(ctx);

  var utils = { };

  // @ts-expect-error TS(2339) FIXME: Property 'scaleMgdl' does not exist on type '{}'.
  utils.scaleMgdl = function scaleMgdl (mgdl: any) {
    if (settings.units === 'mmol' && mgdl) {
      return Number(units.mgdlToMMOL(mgdl));
    } else {
      return Number(mgdl);
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'roundBGForDisplay' does not exist on typ... Remove this comment to see the full error message
  utils.roundBGForDisplay = function roundBGForDisplay (bg: any) {
    return settings.units === 'mmol' ? Math.round(bg * 10) / 10 : Math.round(bg);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'toFixed' does not exist on type '{}'.
  utils.toFixed = function toFixed(value: any) {
    if (!value) {
      return '0';
    } else {
      var fixed = value.toFixed(2);
      return fixed === '-0.00' ? '0.00' : fixed;
    }
  };

  /**
   * Round the number to maxDigits places, return a string
   * that truncates trailing zeros
   */
  // @ts-expect-error TS(2339) FIXME: Property 'toRoundedStr' does not exist on type '{}... Remove this comment to see the full error message
  utils.toRoundedStr = function toRoundedStr (value: any, maxDigits: any) {
    if (!value) {
      return '0';
    }
    const mult = Math.pow(10, maxDigits);
    const fixed = Math.sign(value) * Math.round(Math.abs(value)*mult) / mult;
    if (isNaN(fixed)) return '0';
    return String(fixed);
  };

  // some helpers for input "date"
  // @ts-expect-error TS(2339) FIXME: Property 'mergeInputTime' does not exist on type '... Remove this comment to see the full error message
  utils.mergeInputTime = function mergeInputTime(timestring: any, datestring: any) {
    return moment(datestring + ' ' + timestring, 'YYYY-MM-D HH:mm');
  };


  // @ts-expect-error TS(2339) FIXME: Property 'deviceName' does not exist on type '{}'.
  utils.deviceName = function deviceName (device: any) {
    var last = device ? _.last(device.split('://')) : 'unknown';
    return _.first(last.split('/'));
  };

  // @ts-expect-error TS(2339) FIXME: Property 'timeFormat' does not exist on type '{}'.
  utils.timeFormat = function timeFormat (m: any, sbx: any) {
    var when;
    if (m && sbx.data.inRetroMode) {
      when = m.format('LT');
    } else if (m) {
      // @ts-expect-error TS(2339) FIXME: Property 'formatAgo' does not exist on type '{}'.
      when = utils.formatAgo(m, sbx.time);
    } else {
      when = 'unknown';
    }

    return when;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'formatAgo' does not exist on type '{}'.
  utils.formatAgo = function formatAgo (m: any, nowMills: any) {
    var ago = timeago.calcDisplay({mills: m.valueOf()}, nowMills);
    return translate('%1' + ago.shortLabel + (ago.shortLabel.length === 1 ? ' ago' : ''), { params: [(ago.value ? ago.value : '')]});
  };

  // @ts-expect-error TS(2339) FIXME: Property 'timeAt' does not exist on type '{}'.
  utils.timeAt = function timeAt (prefix: any, sbx: any) {
    return sbx.data.inRetroMode ? (prefix ? ' ' : '') + '@ ' : (prefix ? ', ' : '');
  };

  return utils;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
