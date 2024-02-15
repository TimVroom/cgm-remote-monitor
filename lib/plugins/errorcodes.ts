'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

function init(ctx: any) {

  var errorcodes = {
    name: 'errorcodes'
    , label: 'Dexcom Error Codes'
    , pluginType: 'notification'
  };

  var code2Display = {
    1: '?SN' //SENSOR_NOT_ACTIVE
    , 2: '?MD' //MINIMAL_DEVIATION
    , 3: '?NA' //NO_ANTENNA
    , 5: '?NC' //SENSOR_NOT_CALIBRATED
    , 6: '?CD' //COUNTS_DEVIATION
    , 9: '?AD' //ABSOLUTE_DEVIATION
    , 10: '???' //POWER_DEVIATION
    , 12: '?RF' //BAD_RF
  };

  var code2PushoverSound = {
    5: 'intermission'
    , 9: 'alien'
    , 10: 'alien'
  };

  function toDisplay (errorCode: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return code2Display[errorCode] || errorCode + '??';
  }

  // @ts-expect-error TS(2339) FIXME: Property 'toDisplay' does not exist on type '{ nam... Remove this comment to see the full error message
  errorcodes.toDisplay = toDisplay;

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  errorcodes.checkNotifications = function checkNotifications (sbx: any) {
    var now = sbx.time;
    var lastSGV = sbx.lastSGVEntry();

    var code2Level = buildMappingFromSettings(sbx.extendedSettings);

    if (lastSGV && now - lastSGV.mills < times.mins(10).msecs && lastSGV.mgdl < 39) {
      var errorDisplay = toDisplay(lastSGV.mgdl);
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      var pushoverSound = code2PushoverSound[lastSGV.mgdl] || null;
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      var notifyLevel = code2Level[lastSGV.mgdl];

      if (notifyLevel !== undefined) {
        sbx.notifications.requestNotify({
          level: notifyLevel
          , title: 'CGM Error Code'
          , message: errorDisplay
          , plugin: errorcodes
          , pushoverSound: pushoverSound
          , group: 'CGM Error Code'
          , debug: {
            lastSGV: lastSGV
          }
        });
      }

    }
  };

  function buildMappingFromSettings (extendedSettings: any) {
    var mapping = {};

    function addValuesToMapping (value: any, level: any) {
      if (!value || !value.split) {
        return [];
      }

      var rawValues = value && value.split(' ') || [];
      _.each(rawValues, function (num: any) {
        if (!isNaN(num)) {
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          mapping[Number(num)] = level;
        }
      });
    }

    addValuesToMapping(extendedSettings.info || '1 2 3 4 5 6 7 8', ctx.levels.INFO);
    addValuesToMapping(extendedSettings.warn || false,  ctx.levels.WARN);
    addValuesToMapping(extendedSettings.urgent || '9 10',  ctx.levels.URGENT);

    return mapping;
  }

  //for tests
  // @ts-expect-error TS(2339) FIXME: Property 'buildMappingFromSettings' does not exist... Remove this comment to see the full error message
  errorcodes.buildMappingFromSettings = buildMappingFromSettings;


  return errorcodes;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;