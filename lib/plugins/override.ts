'use strict';

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init() {
  var override = {
    name: 'override'
    , label: 'Override'
    , pluginType: 'pill-status'
  };

  // @ts-expect-error TS(2339) FIXME: Property 'isActive' does not exist on type '{ name... Remove this comment to see the full error message
  override.isActive = function isActive(overrideStatus: any, sbx: any) {

    if (!overrideStatus) {
      return false;
    } else {
      var endMoment = overrideStatus.duration ? overrideStatus.moment.clone().add(overrideStatus.duration, 'seconds') : null;
      overrideStatus.endMoment = endMoment;
      return overrideStatus.active && (!endMoment || endMoment.isAfter(sbx.time));
    }

  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  override.updateVisualisation = function updateVisualisation (sbx: any) {
    var lastOverride = sbx.properties.loop.lastOverride;
    var info: any = [ ];
    var label = '';
    // @ts-expect-error TS(2339) FIXME: Property 'isActive' does not exist on type '{ name... Remove this comment to see the full error message
    var isActive = override.isActive(lastOverride, sbx);

    if (isActive) {
      if (lastOverride.currentCorrectionRange) {
        var max = lastOverride.currentCorrectionRange.maxValue;
        var min = lastOverride.currentCorrectionRange.minValue;

        if (sbx.settings.units === 'mmol') {
          max = sbx.roundBGToDisplayFormat(sbx.scaleMgdl(max));
          min = sbx.roundBGToDisplayFormat(sbx.scaleMgdl(min));
        }

        if (lastOverride.currentCorrectionRange.minValue === lastOverride.currentCorrectionRange.maxValue) {
          label += 'BG Target: ' + min;
        } else {
          label += 'BG Targets: ' + min + ':' + max;
        }
      }
      if ((lastOverride.multiplier || lastOverride.multiplier === 0) && lastOverride.multiplier !== 1) {
        var multiplier = (lastOverride.multiplier * 100).toFixed(0);
        label += ' | O: ' + multiplier + '%';
      }
    }

    var endOverrideValue = lastOverride && lastOverride.endMoment ?
      '⇥ ' + lastOverride.endMoment.format('LT') : (lastOverride ? '∞' : '');

    sbx.pluginBase.updatePillText(override, {
      value: endOverrideValue
      , label: label
      , info: info
      , hide: !isActive
    });

  };

  return override;

}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
