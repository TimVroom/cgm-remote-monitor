// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'async'.
var async = require('async');

function init () {
  console.log('Configuring Alexa...');
  function alexa() {
    return alexa;
  }
  var intentHandlers = {};
  var rollup = {};

  // There is no protection for a previously handled metric - one plugin can overwrite the handler of another plugin.
  alexa.configureIntentHandler = function configureIntentHandler(intent: any, handler: any, metrics: any) {
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
  alexa.getIntentHandler = function getIntentHandler(intentName: any, metric: any) {
    if (metric === undefined) {
      console.log('Looking for handler for intent \'' + intentName + '\'');
      if (intentName
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        && intentHandlers[intentName]
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        && intentHandlers[intentName].handler
      ) {
        console.log('Found!');
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return intentHandlers[intentName].handler;
      }
    } else {
      console.log('Looking for handler for intent \'' + intentName + '\' for metric \'' + metric + '\'');
      if (intentName
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        && intentHandlers[intentName]
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        && intentHandlers[intentName][metric]
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        && intentHandlers[intentName][metric].handler
      ) {
        console.log('Found!');
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        return intentHandlers[intentName][metric].handler
      }
    }

    console.log('Not found!');
    return null;
  };

  alexa.addToRollup = function(rollupGroup: any, handler: any, rollupName: any) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!rollup[rollupGroup]) {
      console.log('Creating the rollup group: ', rollupGroup);
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      rollup[rollupGroup] = [];
    }
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    rollup[rollupGroup].push({handler: handler, name: rollupName});
  };

  alexa.getRollup = function(rollupGroup: any, sbx: any, slots: any, locale: any, callback: any) {
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

  // This creates the expected alexa response
  alexa.buildSpeechletResponse = function buildSpeechletResponse(title: any, output: any, repromptText: any, shouldEndSession: any) {
    return {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: output
        },
        card: {
          type: 'Simple',
          title: title,
          content: output
        },
        reprompt: {
          outputSpeech: {
            type: 'PlainText',
            text: repromptText
          }
        },
        shouldEndSession: shouldEndSession
      }
    };
  };

  return alexa;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;