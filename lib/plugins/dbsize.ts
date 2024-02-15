'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function init (ctx: any) {
  var translate = ctx.language.translate;

  var dbsize = {
    name: 'dbsize'
    , label: translate('Database Size')
    , pluginType: 'pill-status'
    , pillFlip: true
  };

  // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  dbsize.getPrefs = function getPrefs (sbx: any) {
    return {
      warnPercentage: sbx.extendedSettings.warnPercentage ? sbx.extendedSettings.warnPercentage : 60
      , urgentPercentage: sbx.extendedSettings.urgentPercentage ? sbx.extendedSettings.urgentPercentage : 75
      , max: sbx.extendedSettings.max ? sbx.extendedSettings.max : 496
      , enableAlerts: sbx.extendedSettings.enableAlerts
      , inMib: sbx.extendedSettings.inMib
    };
  };

  // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  dbsize.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('dbsize', function setDbsize () {
      // @ts-expect-error TS(2339): Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
      return dbsize.analyzeData(sbx);
    });
  };

  // @ts-expect-error TS(2339): Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
  dbsize.analyzeData = function analyzeData (sbx: any) {

    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = dbsize.getPrefs(sbx);

    var recentData = sbx.data.dbstats;

    var result = {
      level: undefined
      , display: prefs.inMib ? '?MiB' : '?%'
      , status: undefined
    };

    var maxSize = (prefs.max > 0) ? prefs.max : 100 * 1024;
    var totalDataSize = (recentData && recentData.dataSize) ? recentData.dataSize : 0;
    totalDataSize += (recentData && recentData.indexSize) ? recentData.indexSize : 0;
    totalDataSize /= 1024 * 1024;

    var dataPercentage = Math.floor((totalDataSize * 100.0) / maxSize);

    // @ts-expect-error TS(2339): Property 'totalDataSize' does not exist on type '{... Remove this comment to see the full error message
    result.totalDataSize = totalDataSize;
    // @ts-expect-error TS(2339): Property 'dataPercentage' does not exist on type '... Remove this comment to see the full error message
    result.dataPercentage = dataPercentage;
    // @ts-expect-error TS(2339): Property 'notificationLevel' does not exist on typ... Remove this comment to see the full error message
    result.notificationLevel = ctx.levels.INFO;
    // @ts-expect-error TS(2339): Property 'details' does not exist on type '{ level... Remove this comment to see the full error message
    result.details = {
        maxSize: parseFloat(maxSize.toFixed(2))
      , dataSize: parseFloat(totalDataSize.toFixed(2))
    };

    // failsafe to have percentage in 0..100 range
    var boundWarnPercentage = Math.max(0, Math.min(100, parseInt(prefs.warnPercentage)));
    var boundUrgentPercentage = Math.max(0, Math.min(100, parseInt(prefs.urgentPercentage)));

    var warnSize = Math.floor((boundWarnPercentage/100) * maxSize);
    var urgentSize = Math.floor((boundUrgentPercentage/100) * maxSize);

    if ((totalDataSize >= urgentSize)&&(boundUrgentPercentage > 0)) {
      // @ts-expect-error TS(2339): Property 'notificationLevel' does not exist on typ... Remove this comment to see the full error message
      result.notificationLevel = ctx.levels.URGENT;
    } else if ((totalDataSize >= warnSize)&&(boundWarnPercentage > 0)) {
      // @ts-expect-error TS(2339): Property 'notificationLevel' does not exist on typ... Remove this comment to see the full error message
      result.notificationLevel = ctx.levels.WARN;
    }

    result.display = prefs.inMib ? parseFloat(totalDataSize.toFixed(0)) + 'MiB' : dataPercentage + '%';
    // @ts-expect-error TS(2339): Property 'notificationLevel' does not exist on typ... Remove this comment to see the full error message
    result.status = ctx.levels.toStatusClass(result.notificationLevel);

    return result;
  };

  // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  dbsize.checkNotifications = function checkNotifications (sbx: any) {
    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = dbsize.getPrefs(sbx);

    if (!prefs.enableAlerts) { return; }

    var prop = sbx.properties.dbsize;

    if (prop.dataPercentage && prop.notificationLevel && prop.notificationLevel >= ctx.levels.WARN) {
      sbx.notifications.requestNotify({
        level: prop.notificationLevel
        , title: ctx.levels.toDisplay(prop.notificationLevel) + ' ' + translate('Database Size near its limits!')
        , message: translate('Database size is %1 MiB out of %2 MiB. Please backup and clean up database!', {
          params: [prop.details.dataSize, prop.details.maxSize]
        })
        , pushoverSound: 'echo'
        , group: 'Database Size'
        , plugin: dbsize
        , debug: prop
      });
    }
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  dbsize.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.dbsize;

    var infos = [{
        label: translate('Data size')
        , value: translate('%1 MiB of %2 MiB (%3%)', {
          params: [prop.details.dataSize, prop.details.maxSize, prop.dataPercentage]
        })
        }
    ];

    sbx.pluginBase.updatePillText(dbsize, {
      value: prop && prop.display
      , labelClass: 'plugicon-database'
      , pillClass: prop && prop.status
      , info: infos
      , hide: !(prop && prop.totalDataSize && prop.totalDataSize >= 0)
    });
  };

  function virtAsstDatabaseSizeHandler (next: any, slots: any, sbx: any) {
    var display = _.get(sbx, 'properties.dbsize.display');
    if (display) {
      var dataSize = _.get(sbx, 'properties.dbsize.details.dataSize');
      var dataPercentage = _.get(sbx, 'properties.dbsize.dataPercentage');
      var response = translate('virtAsstDatabaseSize', {
        params: [
          dataSize
          , dataPercentage
        ]
      });
      next(translate('virtAsstTitleDatabaseSize'), response);
    } else {
      next(translate('virtAsstTitleDatabaseSize'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339): Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  dbsize.virtAsst = {
    intentHandlers: [
      {
        intent: 'MetricNow'
        , metrics: ['db size']
        , intentHandler: virtAsstDatabaseSizeHandler
      }
    ]
  };

  return dbsize;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
