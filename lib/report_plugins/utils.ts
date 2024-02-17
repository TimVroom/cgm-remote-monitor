'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
var moment = window.moment;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'utils'.
var utils = { };

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init( ) {
  return utils;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

utils.localeDate = function localeDate(day: any) {
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var translate = window.Nightscout.client.translate;
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var zone = window.Nightscout.client.sbx.data.profile.getTimezone();
  var date;
  if (typeof day === 'string') {
    date = moment.tz(day + 'T00:00:00',zone);
  } else {
    date = moment(day);
  }
  var ret = 
    [translate('Sunday'),translate('Monday'),translate('Tuesday'),translate('Wednesday'),translate('Thursday'),translate('Friday'),translate('Saturday')][date.day()];
  ret += ' ';
  ret += date.toDate().toLocaleDateString();
  return ret;
};

utils.localeDateTime = function localeDateTime(day: any) {
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var zone = window.Nightscout.client.sbx.data.profile.getTimezone();
  var date;
  if (typeof day === 'string') {
    date = moment.tz(day + 'T00:00:00',zone);
  } else {
    date = moment(day);
  }
  var ret = date.toDate().toLocaleDateString() + ' ' + date.toDate().toLocaleTimeString();
  return ret;
};

utils.scaledTreatmentBG = function scaledTreatmentBG(treatment: any,data: any) {
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var client = window.Nightscout.client;

  var SIX_MINS_IN_MS =  360000;
 
  function calcBGByTime(time: any) {
    var closeBGs = data.filter(function(d: any) {
      if (!d.y) {
        return false;
      } else {
        return Math.abs((new Date(d.date)).getTime() - time) <= SIX_MINS_IN_MS;
      }
    });

    var totalBG = 0;
    closeBGs.forEach(function(d: any) {
      totalBG += Number(d.y);
    });

    return totalBG > 0 ? (totalBG / closeBGs.length) : 450;
  }

  var treatmentGlucose = null;

  if (treatment.glucose && isNaN(treatment.glucose)) {
    console.warn('found an invalid glucose value', treatment);
  } else {
    if (treatment.glucose && treatment.units && client.settings.units) {
      if (treatment.units !== client.settings.units) {
        console.info('found mismatched glucose units, converting ' + treatment.units + ' into ' + client.settings.units, treatment);
        if (treatment.units === 'mmol') {
          //BG is in mmol and display in mg/dl
          treatmentGlucose = Math.round(treatment.glucose * consts.MMOL_TO_MGDL);
        } else {
          //BG is in mg/dl and display in mmol
          treatmentGlucose = client.utils.scaleMgdl(treatment.glucose);
        }
      } else {
        treatmentGlucose = treatment.glucose;
      }
    } else if (treatment.glucose) {
      //no units, assume everything is the same
      console.warn('found an glucose value with any units, maybe from an old version?', treatment);
      treatmentGlucose = treatment.glucose;
    }
  }

  return treatmentGlucose || client.utils.scaleMgdl(calcBGByTime(treatment.mills));
};
