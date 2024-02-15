'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _each = require('lodash/each');

function init(env: any, ctx: any) {
  var moment = ctx.moment;

  function virtAsstBase() {
    return virtAsstBase;
  }

  var entries = ctx.entries;
  var translate = ctx.language.translate;

  virtAsstBase.setupMutualIntents = function (configuredPlugin: any) {
    // full status
    configuredPlugin.addToRollup('Status', function (slots: any, sbx: any, callback: any) {
      entries.list({count: 1}, function (err: any, records: any) {
        var direction;
        if (translate(records[0].direction)) {
          direction = translate(records[0].direction);
        } else {
          direction = records[0].direction;
        }
        var status = translate('virtAsstStatus', {
          params: [
            sbx.scaleMgdl(records[0].sgv),
            direction,
            moment(records[0].date).from(moment(sbx.time))
          ]
        });

        callback(null, {results: status, priority: -1});
      });
    }, 'BG Status');

    configuredPlugin.configureIntentHandler('NSStatus', function (callback: any, slots: any, sbx: any, locale: any) {
      configuredPlugin.getRollup('Status', sbx, slots, locale, function (status: any) {
        callback(translate('virtAsstTitleFullStatus'), status);
      });
    });

    // blood sugar and direction
    configuredPlugin.configureIntentHandler('MetricNow', function (callback: any, slots: any, sbx: any) {
      entries.list({count: 1}, function(err: any, records: any) {
        var direction;
        if(translate(records[0].direction)){
          direction = translate(records[0].direction);
        } else {
          direction = records[0].direction;
        }
        var status = translate('virtAsstStatus', {
          params: [
            sbx.scaleMgdl(records[0].sgv),
            direction,
            moment(records[0].date).from(moment(sbx.time))]
        });

        callback(translate('virtAsstTitleCurrentBG'), status);
      });
    }, ['bg', 'blood glucose', 'number']);
  };

  virtAsstBase.setupVirtAsstHandlers = function (configuredPlugin: any) {
    ctx.plugins.eachEnabledPlugin(function (plugin: any) {
      if (plugin.virtAsst) {
        if (plugin.virtAsst.intentHandlers) {
          console.log('Plugin "' + plugin.name + '" supports Virtual Assistants');
          _each(plugin.virtAsst.intentHandlers, function (route: any) {
            if (route) {
              configuredPlugin.configureIntentHandler(route.intent, route.intentHandler, route.metrics);
            }
          });
        }
        if (plugin.virtAsst.rollupHandlers) {
          console.log('Plugin "' + plugin.name + '" supports rollups for Virtual Assistants');
          _each(plugin.virtAsst.rollupHandlers, function (route: any) {
            if (route) {
              configuredPlugin.addToRollup(route.rollupGroup, route.rollupHandler, route.rollupName);
            }
          });
        }
      } else {
        console.log('Plugin "' + plugin.name + '" does not support Virtual Assistants');
      }
    });
  };

  return virtAsstBase;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
