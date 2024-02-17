'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (ctx: any) {

  var translate = ctx.language.translate;

  var rawbg = {
    name: 'rawbg'
    , label: 'Raw BG'
    , pluginType: 'bg-status'
    , pillFlip: true
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  rawbg.getPrefs = function getPrefs (sbx: any) {
    return {
      display: (sbx && sbx.extendedSettings.display) ? sbx.extendedSettings.display  : 'unsmoothed'
    };
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  rawbg.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('rawbg', function setRawBG ( ) {
      var result = { };
      var currentSGV = sbx.lastSGVEntry();

      //TODO:OnlyOneCal - currently we only load the last cal, so we can't ignore future data
      var currentCal = _.last(sbx.data.cals);

      var staleAndInRetroMode = sbx.data.inRetroMode && !sbx.isCurrent(currentSGV);

      if (!staleAndInRetroMode && currentSGV && currentCal) {
        // @ts-expect-error TS(2339) FIXME: Property 'mgdl' does not exist on type '{}'.
        result.mgdl = rawbg.calc(currentSGV, currentCal, sbx);
        // @ts-expect-error TS(2339) FIXME: Property 'noiseLabel' does not exist on type '{}'.
        result.noiseLabel = rawbg.noiseCodeToDisplay(currentSGV.mgdl, currentSGV.noise);
        // @ts-expect-error TS(2339) FIXME: Property 'sgv' does not exist on type '{}'.
        result.sgv = currentSGV;
        // @ts-expect-error TS(2339) FIXME: Property 'cal' does not exist on type '{}'.
        result.cal = currentCal;
        // @ts-expect-error TS(2339) FIXME: Property 'displayLine' does not exist on type '{}'... Remove this comment to see the full error message
        result.displayLine = ['Raw BG:', sbx.scaleMgdl(result.mgdl), sbx.unitsLabel, result.noiseLabel].join(' ');
      }

      return result;
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  rawbg.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.rawbg;

    // @ts-expect-error TS(2339) FIXME: Property 'showRawBGs' does not exist on type '{ na... Remove this comment to see the full error message
    var options = prop && prop.sgv && rawbg.showRawBGs(prop.sgv.mgdl, prop.sgv.noise, prop.cal, sbx) ? {
      hide: !prop || !prop.mgdl
      , value: sbx.scaleMgdl(prop.mgdl)
      , label: prop.noiseLabel
    } : {
      hide: true
    };

    sbx.pluginBase.updatePillText(rawbg, options);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'calc' does not exist on type '{ name: st... Remove this comment to see the full error message
  rawbg.calc = function calc(sgv: any, cal: any, sbx: any) {
    var raw = 0;
    var cleaned = cleanValues(sgv, cal);

    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = rawbg.getPrefs(sbx);

    if (cleaned.slope === 0 || cleaned.unfiltered === 0 || cleaned.scale === 0) {
      raw = 0;
    } else if (cleaned.filtered === 0 || sgv.mgdl < 40 || prefs.display === 'unfiltered') {
      raw = cleaned.scale * (cleaned.unfiltered - cleaned.intercept) / cleaned.slope;
    } else if (prefs.display === 'filtered') {
      raw = cleaned.scale * (cleaned.filtered - cleaned.intercept) / cleaned.slope;
    } else {
      var ratio = cleaned.scale * (cleaned.filtered - cleaned.intercept) / cleaned.slope / sgv.mgdl;
      raw = cleaned.scale * (cleaned.unfiltered - cleaned.intercept) / cleaned.slope / ratio;
    }

    return Math.round(raw);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'isEnabled' does not exist on type '{ nam... Remove this comment to see the full error message
  rawbg.isEnabled = function isEnabled(sbx: any) {
    return sbx.settings.isEnabled('rawbg');
  };

  // @ts-expect-error TS(2339) FIXME: Property 'showRawBGs' does not exist on type '{ na... Remove this comment to see the full error message
  rawbg.showRawBGs = function showRawBGs(mgdl: any, noise: any, cal: any, sbx: any) {
    return cal
      // @ts-expect-error TS(2339) FIXME: Property 'isEnabled' does not exist on type '{ nam... Remove this comment to see the full error message
      && rawbg.isEnabled(sbx)
      && (sbx.settings.showRawbg === 'always'
           || (sbx.settings.showRawbg === 'noise' && (noise >= 2 || mgdl < 40))
         );
  };

  // @ts-expect-error TS(2339) FIXME: Property 'noiseCodeToDisplay' does not exist on ty... Remove this comment to see the full error message
  rawbg.noiseCodeToDisplay = function noiseCodeToDisplay(mgdl: any, noise: any) {
    var display;
    switch (parseInt(noise)) {
      case 0: display = '---'; break;
      case 1: display = translate('Clean'); break;
      case 2: display = translate('Light'); break;
      case 3: display = translate('Medium'); break;
      case 4: display = translate('Heavy'); break;
      default:
        if (mgdl < 40) {
          display = translate('Heavy');
        } else {
          display = '~~~';
        }
        break;
    }
    return display;
  };

  function virtAsstRawBGHandler (next: any, slots: any, sbx: any) {
    var rawBg = _.get(sbx, 'properties.rawbg.mgdl');
    if (rawBg) {
      var response = translate('virtAsstRawBG', {
        params: [
          rawBg
        ]
      });
      next(translate('virtAsstTitleRawBG'), response);
    } else {
      next(translate('virtAsstTitleRawBG'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  rawbg.virtAsst = {
    intentHandlers: [{
      intent: 'MetricNow'
      , metrics:['raw bg', 'raw blood glucose']
      , intentHandler: virtAsstRawBGHandler
    }]
  };

  return rawbg;

}

function cleanValues (sgv: any, cal: any) {
  return {
    unfiltered: parseInt(sgv.unfiltered) || 0
    , filtered: parseInt(sgv.filtered) || 0
    , scale: parseFloat(cal.scale) || 0
    , intercept: parseFloat(cal.intercept) || 0
    , slope: parseFloat(cal.slope) || 0
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
