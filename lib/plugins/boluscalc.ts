'use strict';

// this is just a fake plugin to enable hiding from settings drawer

function init() {

  var boluscalc = {
    name: 'boluscalc'
    , label: 'Bolus Wizard'
    , pluginType: 'drawer'
  };

  return boluscalc;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;