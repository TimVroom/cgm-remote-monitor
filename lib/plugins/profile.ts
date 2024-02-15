'use strict';

// this is just a fake plugin to hold extended settings

function init() {

  var profile = {
    name: 'profile'
    , label: 'Profile'
    , pluginType: 'fake'
  };

  return profile;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;