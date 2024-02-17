'use strict';

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init() {

  var runtime = {
    name: 'runtimestate'
    , label: 'Runtime state'
    , pluginType: 'fake'
  };
  
  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  runtime.setProperties = function setProperties(sbx: any) {
    sbx.offerProperty('runtimestate', function setProp ( ) {
      return {
        state: sbx.runtimeState
      };
    });
  };

  return runtime;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;