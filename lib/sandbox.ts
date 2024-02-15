'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var units = require('./units')();
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
var times = require('./times');

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init () {
  var sbx = {};

  function reset () {
    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    sbx.properties = {};
  }

  function extend () {
    // @ts-expect-error TS(2339): Property 'unitsLabel' does not exist on type '{}'.
    sbx.unitsLabel = unitsLabel();
    // @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
    sbx.data = sbx.data || {};
    //default to prevent adding checks everywhere
    // @ts-expect-error TS(2339): Property 'extendedSettings' does not exist on type... Remove this comment to see the full error message
    sbx.extendedSettings = { empty: true };
  }

  function withExtendedSettings (plugin: any, allExtendedSettings: any, sbx: any) {
    var sbx2 = _.extend({}, sbx);
    sbx2.extendedSettings = allExtendedSettings && allExtendedSettings[plugin.name] || {};
    return sbx2;
  }

  /**
   * A view into the safe notification functions for plugins
   *
   * @param ctx
   * @returns  {{notification}}
   */
  function safeNotifications (ctx: any) {
    return _.pick(ctx.notifications, ['requestNotify', 'requestSnooze', 'requestClear']);
  }

  /**
   * Initialize the sandbox using server state
   *
   * @param env - .js
   * @param ctx - created from bootevent
   * @returns {{sbx}}
   */
  // @ts-expect-error TS(2339): Property 'serverInit' does not exist on type '{}'.
  sbx.serverInit = function serverInit (env: any, ctx: any) {
    reset();

    // @ts-expect-error TS(2339): Property 'runtimeEnvironment' does not exist on ty... Remove this comment to see the full error message
    sbx.runtimeEnvironment = 'server';
    // @ts-expect-error TS(2339): Property 'runtimeState' does not exist on type '{}... Remove this comment to see the full error message
    sbx.runtimeState = ctx.runtimeState;
    // @ts-expect-error TS(2339): Property 'time' does not exist on type '{}'.
    sbx.time = Date.now();
    // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
    sbx.settings = env.settings;
    // @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
    sbx.data = ctx.ddata.clone();
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    sbx.notifications = safeNotifications(ctx);

    // @ts-expect-error TS(2339): Property 'levels' does not exist on type '{}'.
    sbx.levels = ctx.levels;
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{}'.
    sbx.language = ctx.language;
    // @ts-expect-error TS(2339): Property 'translate' does not exist on type '{}'.
    sbx.translate = ctx.language.translate;

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var profile = require('./profilefunctions')(null, ctx);
    //Plugins will expect the right profile based on time
    profile.loadData(_.cloneDeep(ctx.ddata.profiles));
    profile.updateTreatments(ctx.ddata.profileTreatments, ctx.ddata.tempbasalTreatments, ctx.ddata.combobolusTreatments);
    // @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
    sbx.data.profile = profile;
    // @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
    delete sbx.data.profiles;

    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    sbx.properties = {};

    // @ts-expect-error TS(2339): Property 'withExtendedSettings' does not exist on ... Remove this comment to see the full error message
    sbx.withExtendedSettings = function getPluginExtendedSettingsOnly (plugin: any) {
      return withExtendedSettings(plugin, env.extendedSettings, sbx);
    };

    extend();

    return sbx;
  };

  /**
   * Initialize the sandbox using client state
   *
   * @param settings - specific settings from the client, starting with the defaults
   * @param time - could be a retro time
   * @param pluginBase - used by visualization plugins to update the UI
   * @param data - svgs, treatments, profile, etc
   * @returns {{sbx}}
   */
  // @ts-expect-error TS(2339): Property 'clientInit' does not exist on type '{}'.
  sbx.clientInit = function clientInit (ctx: any, time: any, data: any) {
    reset();

    // @ts-expect-error TS(2339): Property 'runtimeEnvironment' does not exist on ty... Remove this comment to see the full error message
    sbx.runtimeEnvironment = 'client';
    // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
    sbx.settings = ctx.settings;
    // @ts-expect-error TS(2339): Property 'showPlugins' does not exist on type '{}'... Remove this comment to see the full error message
    sbx.showPlugins = ctx.settings.showPlugins;
    // @ts-expect-error TS(2339): Property 'time' does not exist on type '{}'.
    sbx.time = time;
    // @ts-expect-error TS(2339): Property 'data' does not exist on type '{}'.
    sbx.data = data;
    // @ts-expect-error TS(2339): Property 'pluginBase' does not exist on type '{}'.
    sbx.pluginBase = ctx.pluginBase;
    // @ts-expect-error TS(2339): Property 'notifications' does not exist on type '{... Remove this comment to see the full error message
    sbx.notifications = safeNotifications(ctx);

    // @ts-expect-error TS(2339): Property 'levels' does not exist on type '{}'.
    sbx.levels = ctx.levels;
    // @ts-expect-error TS(2339): Property 'language' does not exist on type '{}'.
    sbx.language = ctx.language;
    // @ts-expect-error TS(2339): Property 'translate' does not exist on type '{}'.
    sbx.translate = ctx.language.translate;

    // @ts-expect-error TS(2339): Property 'pluginBase' does not exist on type '{}'.
    if (sbx.pluginBase) {
      // @ts-expect-error TS(2339): Property 'pluginBase' does not exist on type '{}'.
      sbx.pluginBase.forecastInfos = [];
      // @ts-expect-error TS(2339): Property 'pluginBase' does not exist on type '{}'.
      sbx.pluginBase.forecastPoints = {};
    }

    // @ts-expect-error TS(2339): Property 'extendedSettings' does not exist on type... Remove this comment to see the full error message
    sbx.extendedSettings = { empty: true };
    // @ts-expect-error TS(2339): Property 'withExtendedSettings' does not exist on ... Remove this comment to see the full error message
    sbx.withExtendedSettings = function getPluginExtendedSettingsOnly (plugin: any) {
      // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
      return withExtendedSettings(plugin, sbx.settings.extendedSettings, sbx);
    };

    extend();

    return sbx;
  };

  /**
   * Properties are immutable, first plugin to set it wins, plugins should be in the correct order
   *
   * @param name
   * @param setter
   */
  // @ts-expect-error TS(2339): Property 'offerProperty' does not exist on type '{... Remove this comment to see the full error message
  sbx.offerProperty = function offerProperty (name: any, setter: any) {
    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    if (!Object.keys(sbx.properties).includes(name)) {
      var value = setter();
      if (value) {
        // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
        sbx.properties[name] = value;
      }
    }
  };

  // @ts-expect-error TS(2339): Property 'isCurrent' does not exist on type '{}'.
  sbx.isCurrent = function isCurrent (entry: any) {
    // @ts-expect-error TS(2339): Property 'time' does not exist on type '{}'.
    return entry && sbx.time - entry.mills <= times.mins(15).msecs;
  };

  // @ts-expect-error TS(2339): Property 'lastEntry' does not exist on type '{}'.
  sbx.lastEntry = function lastEntry (entries: any) {
    return _.findLast(entries, function notInTheFuture (entry: any) {
      // @ts-expect-error TS(2339): Property 'entryMills' does not exist on type '{}'.
      return sbx.entryMills(entry) <= sbx.time;
    });
  };

  // @ts-expect-error TS(2339): Property 'lastNEntries' does not exist on type '{}... Remove this comment to see the full error message
  sbx.lastNEntries = function lastNEntries (entries: any, n: any) {
    var lastN: any = [];

    _.takeRightWhile(entries, function(entry: any) {
      // @ts-expect-error TS(2339): Property 'entryMills' does not exist on type '{}'.
      if (sbx.entryMills(entry) <= sbx.time) {
        lastN.push(entry);
      }
      return lastN.length < n;
    });

    lastN.reverse();

    return lastN;
  };

  // @ts-expect-error TS(2339): Property 'prevEntry' does not exist on type '{}'.
  sbx.prevEntry = function prevEntry (entries: any) {
    // @ts-expect-error TS(2339): Property 'lastNEntries' does not exist on type '{}... Remove this comment to see the full error message
    var last2 = sbx.lastNEntries(entries, 2);
    return _.first(last2);
  };

  // @ts-expect-error TS(2339): Property 'prevSGVEntry' does not exist on type '{}... Remove this comment to see the full error message
  sbx.prevSGVEntry = function prevSGVEntry () {
    // @ts-expect-error TS(2339): Property 'prevEntry' does not exist on type '{}'.
    return sbx.prevEntry(sbx.data.sgvs);
  };

  // @ts-expect-error TS(2339): Property 'lastSGVEntry' does not exist on type '{}... Remove this comment to see the full error message
  sbx.lastSGVEntry = function lastSGVEntry () {
    // @ts-expect-error TS(2339): Property 'lastEntry' does not exist on type '{}'.
    return sbx.lastEntry(sbx.data.sgvs);
  };

  // @ts-expect-error TS(2339): Property 'lastSGVMgdl' does not exist on type '{}'... Remove this comment to see the full error message
  sbx.lastSGVMgdl = function lastSGVMgdl () {
    // @ts-expect-error TS(2339): Property 'lastSGVEntry' does not exist on type '{}... Remove this comment to see the full error message
    var last = sbx.lastSGVEntry();
    return last && last.mgdl;
  };

  // @ts-expect-error TS(2339): Property 'lastSGVMills' does not exist on type '{}... Remove this comment to see the full error message
  sbx.lastSGVMills = function lastSGVMills () {
    // @ts-expect-error TS(2339): Property 'entryMills' does not exist on type '{}'.
    return sbx.entryMills(sbx.lastSGVEntry());
  };

  // @ts-expect-error TS(2339): Property 'entryMills' does not exist on type '{}'.
  sbx.entryMills = function entryMills (entry: any) {
    return entry && entry.mills;
  };

  // @ts-expect-error TS(2339): Property 'lastScaledSGV' does not exist on type '{... Remove this comment to see the full error message
  sbx.lastScaledSGV = function lastScaledSVG () {
    // @ts-expect-error TS(2339): Property 'scaleEntry' does not exist on type '{}'.
    return sbx.scaleEntry(sbx.lastSGVEntry());
  };

  // @ts-expect-error TS(2339): Property 'lastDisplaySVG' does not exist on type '... Remove this comment to see the full error message
  sbx.lastDisplaySVG = function lastDisplaySVG () {
    // @ts-expect-error TS(2339): Property 'displayBg' does not exist on type '{}'.
    return sbx.displayBg(sbx.lastSGVEntry());
  };

  // @ts-expect-error TS(2339): Property 'buildBGNowLine' does not exist on type '... Remove this comment to see the full error message
  sbx.buildBGNowLine = function buildBGNowLine () {
    // @ts-expect-error TS(2339): Property 'lastDisplaySVG' does not exist on type '... Remove this comment to see the full error message
    var line = 'BG Now: ' + sbx.lastDisplaySVG();

    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    var delta = sbx.properties.delta && sbx.properties.delta.display;
    if (delta) {
      line += ' ' + delta;
    }

    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    var direction = sbx.properties.direction && sbx.properties.direction.label;
    if (direction) {
      line += ' ' + direction;
    }

    // @ts-expect-error TS(2339): Property 'unitsLabel' does not exist on type '{}'.
    line += ' ' + sbx.unitsLabel;

    return line;
  };

  // @ts-expect-error TS(2339): Property 'propertyLine' does not exist on type '{}... Remove this comment to see the full error message
  sbx.propertyLine = function propertyLine (propertyName: any) {
    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    return sbx.properties[propertyName] && sbx.properties[propertyName].displayLine;
  };

  // @ts-expect-error TS(2339): Property 'appendPropertyLine' does not exist on ty... Remove this comment to see the full error message
  sbx.appendPropertyLine = function appendPropertyLine (propertyName: any, lines: any) {
    lines = lines || [];

    // @ts-expect-error TS(2339): Property 'propertyLine' does not exist on type '{}... Remove this comment to see the full error message
    var displayLine = sbx.propertyLine(propertyName);
    if (displayLine) {
      lines.push(displayLine);
    }

    return lines;
  };

  // @ts-expect-error TS(2339): Property 'prepareDefaultLines' does not exist on t... Remove this comment to see the full error message
  sbx.prepareDefaultLines = function prepareDefaultLines () {
    // @ts-expect-error TS(2339): Property 'buildBGNowLine' does not exist on type '... Remove this comment to see the full error message
    var lines = [sbx.buildBGNowLine()];
    // @ts-expect-error TS(2339): Property 'appendPropertyLine' does not exist on ty... Remove this comment to see the full error message
    sbx.appendPropertyLine('rawbg', lines);
    // @ts-expect-error TS(2339): Property 'appendPropertyLine' does not exist on ty... Remove this comment to see the full error message
    sbx.appendPropertyLine('ar2', lines);
    // @ts-expect-error TS(2339): Property 'appendPropertyLine' does not exist on ty... Remove this comment to see the full error message
    sbx.appendPropertyLine('bwp', lines);
    // @ts-expect-error TS(2339): Property 'appendPropertyLine' does not exist on ty... Remove this comment to see the full error message
    sbx.appendPropertyLine('iob', lines);
    // @ts-expect-error TS(2339): Property 'appendPropertyLine' does not exist on ty... Remove this comment to see the full error message
    sbx.appendPropertyLine('cob', lines);

    return lines;
  };

  // @ts-expect-error TS(2339): Property 'buildDefaultMessage' does not exist on t... Remove this comment to see the full error message
  sbx.buildDefaultMessage = function buildDefaultMessage () {
    // @ts-expect-error TS(2339): Property 'prepareDefaultLines' does not exist on t... Remove this comment to see the full error message
    return sbx.prepareDefaultLines().join('\n');
  };

  // @ts-expect-error TS(2339): Property 'displayBg' does not exist on type '{}'.
  sbx.displayBg = function displayBg (entry: any) {
    if (Number(entry.mgdl) === 39) {
      return 'LOW';
    } else if (Number(entry.mgdl) === 401) {
      return 'HIGH';
    } else {
      // @ts-expect-error TS(2339): Property 'scaleEntry' does not exist on type '{}'.
      return sbx.scaleEntry(entry);
    }
  };

  // @ts-expect-error TS(2339): Property 'scaleEntry' does not exist on type '{}'.
  sbx.scaleEntry = function scaleEntry (entry: any) {

    if (entry && entry.scaled === undefined) {
      // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
      if (sbx.settings.units === 'mmol') {
        entry.scaled = entry.mmol || units.mgdlToMMOL(entry.mgdl);
      } else {
        entry.scaled = entry.mgdl || units.mmolToMgdl(entry.mmol);
      }
    }

    return entry && Number(entry.scaled);
  };

  // @ts-expect-error TS(2339): Property 'scaleMgdl' does not exist on type '{}'.
  sbx.scaleMgdl = function scaleMgdl (mgdl: any) {
    // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
    if (sbx.settings.units === 'mmol' && mgdl) {
      return Number(units.mgdlToMMOL(mgdl));
    } else {
      return Number(mgdl);
    }
  };

  // @ts-expect-error TS(2339): Property 'roundInsulinForDisplayFormat' does not e... Remove this comment to see the full error message
  sbx.roundInsulinForDisplayFormat = function roundInsulinForDisplayFormat (insulin: any) {

    if (insulin === 0) {
      return '0';
    }

    // @ts-expect-error TS(2339): Property 'properties' does not exist on type '{}'.
    if (sbx.properties.roundingStyle === 'medtronic') {
      var denominator = 0.1;
      var digits = 1;
      if (insulin <= 0.5) {
        denominator = 0.05;
        digits = 2;
      }
      return (Math.floor(insulin / denominator) * denominator).toFixed(digits);
    }

    return (Math.floor(insulin / 0.01) * 0.01).toFixed(2);

  };

  function unitsLabel () {
    // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
    return sbx.settings.units === 'mmol' ? 'mmol/L' : 'mg/dl';
  }

  // @ts-expect-error TS(2339): Property 'roundBGToDisplayFormat' does not exist o... Remove this comment to see the full error message
  sbx.roundBGToDisplayFormat = function roundBGToDisplayFormat (bg: any) {
    // @ts-expect-error TS(2339): Property 'settings' does not exist on type '{}'.
    return sbx.settings.units === 'mmol' ? Math.round(bg * 10) / 10 : Math.round(bg);
  };

  return sbx;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
