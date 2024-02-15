'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _find = require('lodash/find');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_each'.
var _each = require('lodash/each');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _filter = require('lodash/filter');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_get'.
var _get = require('lodash/get');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_isArray'.
var _isArray = require('lodash/isArray');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _map = require('lodash/map');

function init (ctx: any) {

  var allPlugins: any = []
    , enabledPlugins: any = [];

  function plugins (name: any) {
    if (name) {
      return _find(allPlugins, {
        name: name
      });
    } else {
      return plugins;
    }
  }

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  plugins.base = require('./pluginbase');

  var clientDefaultPlugins = [
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('./bgnow')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./rawbg')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./direction')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./timeago')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./upbat')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./ar2')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./errorcodes')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./iob')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./cob')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./careportal')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./pump')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./openaps')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./xdripjs')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./loop')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./override')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./boluswizardpreview')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./cannulaage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./sensorage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./insulinage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./batteryage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./basalprofile')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./bolus')(ctx) // fake plugin to hold extended settings
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./boluscalc')(ctx) // fake plugin to show/hide
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./profile')(ctx) // fake plugin to hold extended settings
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./speech')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./dbsize')(ctx)
  ];

  var serverDefaultPlugins = [
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('./bgnow')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./rawbg')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./direction')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./upbat')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./ar2')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./simplealarms')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./errorcodes')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./iob')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./cob')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./pump')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./openaps')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./xdripjs')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./loop')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./boluswizardpreview')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./cannulaage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./sensorage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./insulinage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./batteryage')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./treatmentnotify')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./timeago')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./basalprofile')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./dbsize')(ctx)
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , require('./runtimestate')(ctx)
  ];

  plugins.registerServerDefaults = function registerServerDefaults () {
    plugins.register(serverDefaultPlugins);
    return plugins;
  };

  plugins.registerClientDefaults = function registerClientDefaults () {
    plugins.register(clientDefaultPlugins);
    return plugins;
  };

  plugins.register = function register (all: any) {
    _each(all, function eachPlugin (plugin: any) {
      allPlugins.push(plugin);
    });

    enabledPlugins = [];

    var enable = _get(ctx, 'settings.enable');

    function isEnabled (plugin: any) {
      //TODO: unify client/server env/app
      return enable && enable.indexOf(plugin.name) > -1;
    }

    _each(allPlugins, function eachPlugin (plugin: any) {
      plugin.enabled = isEnabled(plugin);
      if (plugin.enabled) {
        enabledPlugins.push(plugin);
      }
    });
  };

  plugins.isPluginEnabled = function isPluginEnabled (pluginName: any) {
    var p = _find(enabledPlugins, 'name', pluginName);
    return (p !== null);
  }

  plugins.getPlugin = function getPlugin (pluginName: any) {
    return _find(enabledPlugins, 'name', pluginName);
  }

  plugins.eachPlugin = function eachPlugin (f: any) {
    _each(allPlugins, f);
  };

  plugins.eachEnabledPlugin = function eachEnabledPlugin (f: any) {
    _each(enabledPlugins, f);
  };

  //these plugins are either always on or have custom settings
  plugins.specialPlugins = 'ar2 bgnow delta direction timeago upbat rawbg errorcodes profile bolus';

  plugins.shownPlugins = function(sbx: any) {
    return _filter(enabledPlugins, function filterPlugins (plugin: any) {
      return plugins.specialPlugins.indexOf(plugin.name) > -1 || (sbx && sbx.showPlugins && sbx.showPlugins.indexOf(plugin.name) > -1);
    });
  };

  plugins.eachShownPlugins = function eachShownPlugins (sbx: any, f: any) {
    _each(plugins.shownPlugins(sbx), f);
  };

  plugins.hasShownType = function hasShownType (pluginType: any, sbx: any) {
    return _find(plugins.shownPlugins(sbx), function findWithType (plugin: any) {
      return plugin.pluginType === pluginType;
    }) !== undefined;
  };

  plugins.setProperties = function setProperties (sbx: any) {
    plugins.eachEnabledPlugin(function eachPlugin (plugin: any) {
      if (plugin.setProperties) {
        try {
          plugin.setProperties(sbx.withExtendedSettings(plugin));
        } catch (error) {
          console.error('Plugin error on setProperties(): ', plugin.name, error);
        }
      }
    });
  };

  plugins.checkNotifications = function checkNotifications (sbx: any) {
    plugins.eachEnabledPlugin(function eachPlugin (plugin: any) {
      if (plugin.checkNotifications) {
        try {
          plugin.checkNotifications(sbx.withExtendedSettings(plugin));
        } catch (error) {
          console.error('Plugin error on checkNotifications(): ', plugin.name, error);
        }
      }
    });
  };

  plugins.visualizeAlarm = function visualizeAlarm (sbx: any, alarm: any, alarmMessage: any) {
    plugins.eachShownPlugins(sbx, function eachPlugin (plugin: any) {
      if (plugin.visualizeAlarm) {
        try {
          plugin.visualizeAlarm(sbx.withExtendedSettings(plugin), alarm, alarmMessage);
        } catch (error) {
          console.error('Plugin error on visualizeAlarm(): ', plugin.name, error);
        }
      }
    });
  };

  plugins.updateVisualisations = function updateVisualisations (sbx: any) {
    plugins.eachShownPlugins(sbx, function eachPlugin (plugin: any) {
      if (plugin.updateVisualisation) {
        try {
          plugin.updateVisualisation(sbx.withExtendedSettings(plugin));
        } catch (error) {
          console.error('Plugin error on visualizeAlarm(): ', plugin.name, error);
        }
      }
    });
  };

  plugins.getAllEventTypes = function getAllEventTypes (sbx: any) {
    var all: any = [];
    plugins.eachEnabledPlugin(function eachPlugin (plugin: any) {
      if (plugin.getEventTypes) {
        var eventTypes = plugin.getEventTypes(sbx.withExtendedSettings(plugin));
        if (_isArray(eventTypes)) {
          all = all.concat(eventTypes);
        }
      }
    });

    return all;
  };

  plugins.enabledPluginNames = function enabledPluginNames () {
    return _map(enabledPlugins, function mapped (plugin: any) {
      return plugin.name;
    }).join(' ');
  };

  plugins.extendedClientSettings = function extendedClientSettings (allExtendedSettings: any) {
    var clientSettings = {};
    _each(clientDefaultPlugins, function eachClientPlugin (plugin: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      clientSettings[plugin.name] = allExtendedSettings[plugin.name];
    });

    //HACK:  include devicestatus
    // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
    clientSettings.devicestatus = allExtendedSettings.devicestatus;

    return clientSettings;
  };

  // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
  return plugins();

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
