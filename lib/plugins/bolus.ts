'use strict';

function init () {

  var bolus = {
    name: 'bolus'
    , label: 'Bolus'
    , pluginType: 'fake'
  };

  // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  bolus.getPrefs = function getPrefs(sbx: any) {
    return {
      renderFormat: sbx.extendedSettings.renderFormat ? sbx.extendedSettings.renderFormat : 'default'
      , renderOver: sbx.extendedSettings.renderOver ? sbx.extendedSettings.renderOver : 0
      , notifyOver: sbx.extendedSettings.notifyOver ? sbx.extendedSettings.notifyOver : 0
    };
  };

  return bolus;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;