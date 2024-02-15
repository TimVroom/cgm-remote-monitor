// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'async'.
var async = require('async');

function init () {
  console.log('Configuring Google Home...');
  function googleHome() {
    return googleHome;
  }
  var intentHandlers = {};
  var rollup = {};

  // There is no protection for a previously handled metric - one plugin can overwrite the handler of another plugin.
  googleHome.configureIntentHandler = function configureIntentHandler(intent: any, handler: any, metrics: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!intentHandlers[intent]) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      intentHandlers[intent] = {};
    }
    if (metrics) {
      for (var i = 0, len = metrics.length; i < len; i++) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!intentHandlers[intent][metrics[i]]) {
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          intentHandlers[intent][metrics[i]] = {};
        }
        console.log('Storing handler for intent \'' + intent + '\' for metric \'' + metrics[i] + '\'');
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        intentHandlers[intent][metrics[i]].handler = handler;
      }
    } else {
      console.log('Storing handler for intent \'' + intent + '\'');
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      intentHandlers[intent].handler = handler;
    }
  };

  // This function retrieves a handler based on the intent name and metric requested.
  googleHome.getIntentHandler = function getIntentHandler(intentName: any, metric: any) {
    console.log('Looking for handler for intent \'' + intentName + '\' for metric \'' + metric + '\'');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (intentName && intentHandlers[intentName]) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (intentHandlers[intentName][metric] && intentHandlers[intentName][metric].handler) {
        console.log('Found!');
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return intentHandlers[intentName][metric].handler
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      } else if (intentHandlers[intentName].handler) {
        console.log('Found!');
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return intentHandlers[intentName].handler;
      }
      console.log('Not found!');
      return null;
    } else {
      console.log('Not found!');
      return null;
    }
  };

  googleHome.addToRollup = function(rollupGroup: any, handler: any, rollupName: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!rollup[rollupGroup]) {
      console.log('Creating the rollup group: ', rollupGroup);
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      rollup[rollupGroup] = [];
    }
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    rollup[rollupGroup].push({handler: handler, name: rollupName});
  };

  googleHome.getRollup = function(rollupGroup: any, sbx: any, slots: any, locale: any, callback: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var handlers = _.map(rollup[rollupGroup], 'handler');
    console.log('Rollup array for ', rollupGroup);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    console.log(rollup[rollupGroup]);
    var nHandlers: any = [];
    _.each(handlers, function (handler: any) {
      nHandlers.push(handler.bind(null, slots, sbx));
    });
    async.parallelLimit(nHandlers, 10, function(err: any, results: any) {
      if (err) {
        console.error('Error: ', err);
      }
      callback(_.map(_.orderBy(results, ['priority'], ['asc']), 'results').join(' '));
    });
  };

  // This creates the expected Google Home response
  googleHome.buildSpeechletResponse = function buildSpeechletResponse(output: any, expectUserResponse: any) {
    return {
      payload: {
        google: {
          expectUserResponse: expectUserResponse,
          richResponse: {
            items: [
              {
                simpleResponse: {
                  textToSpeech: output
                }
              }
            ]
          }
        }
      }
    };
  };

  return googleHome;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;