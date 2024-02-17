'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'constants'... Remove this comment to see the full error message
var constants = require('./constants.json');

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init () {

  var settings = {
    units: 'mg/dl'
    , timeFormat: 12
    , dayStart: 7.0
    , dayEnd: 21.0
    , nightMode: false
    , editMode: true
    , showRawbg: 'never'
    , customTitle: 'Nightscout'
    , theme: 'default'
    , alarmUrgentHigh: true
    , alarmUrgentHighMins: [30, 60, 90, 120]
    , alarmHigh: true
    , alarmHighMins: [30, 60, 90, 120]
    , alarmLow: true
    , alarmLowMins: [15, 30, 45, 60]
    , alarmUrgentLow: true
    , alarmUrgentLowMins: [15, 30, 45]
    , alarmUrgentMins: [30, 60, 90, 120]
    , alarmWarnMins: [30, 60, 90, 120]
    , alarmTimeagoWarn: true
    , alarmTimeagoWarnMins: 15
    , alarmTimeagoUrgent: true
    , alarmTimeagoUrgentMins: 30
    , alarmPumpBatteryLow: false
    , language: 'en'
    , scaleY: 'log'
    , showPlugins: 'dbsize'
    , showForecast: 'ar2'
    , focusHours: 3
    , heartbeat: 60
    , baseURL: ''
    , authDefaultRoles: 'readable'
    , thresholds: {
      bgHigh: 260
      , bgTargetTop: 180
      , bgTargetBottom: 80
      , bgLow: 55
    }
    , insecureUseHttp: false
    , secureHstsHeader: true
    , secureHstsHeaderIncludeSubdomains: false
    , secureHstsHeaderPreload: false
    , secureCsp: false
    , deNormalizeDates: false
    , showClockDelta: false
    , showClockLastTime: false
    , frameUrl1: ''
    , frameUrl2: ''
    , frameUrl3: ''
    , frameUrl4: ''
    , frameUrl5: ''
    , frameUrl6: ''
    , frameUrl7: ''
    , frameUrl8: ''
    , frameName1: ''
    , frameName2: ''
    , frameName3: ''
    , frameName4: ''
    , frameName5: ''
    , frameName6: ''
    , frameName7: ''
    , frameName8: ''
    , authFailDelay: 5000
    , adminNotifiesEnabled: true
    , obscured: ''
    , obscureDeviceProvenance: ''
    , authenticationPromptOnLoad: false
  };

  var secureSettings = [
    'apnsKey'
    , 'apnsKeyId'
    , 'developerTeamId'
    , 'userName'
    , 'password'
    , 'obscured'
    , 'obscureDeviceProvenance'
  ];

  var valueMappers = {
    nightMode: mapTruthy
    , alarmUrgentHigh: mapTruthy
    , alarmUrgentHighMins: mapNumberArray
    , alarmHigh: mapTruthy
    , alarmHighMins: mapNumberArray
    , alarmLow: mapTruthy
    , alarmLowMins: mapNumberArray
    , alarmUrgentLow: mapTruthy
    , alarmUrgentLowMins: mapNumberArray
    , alarmUrgentMins: mapNumberArray
    , alarmTimeagoWarn: mapTruthy
    , alarmTimeagoUrgent: mapTruthy
    , alarmWarnMins: mapNumberArray
    , timeFormat: mapNumber
    , insecureUseHttp: mapTruthy
    , secureHstsHeader: mapTruthy
    , secureCsp: mapTruthy
    , deNormalizeDates: mapTruthy
    , showClockDelta: mapTruthy
    , showClockLastTime: mapTruthy
    , bgHigh: mapNumber
    , bgLow: mapNumber
    , bgTargetTop: mapNumber
    , bgTargetBottom: mapNumber
    , authFailDelay: mapNumber
    , adminNotifiesEnabled: mapTruthy
    , authenticationPromptOnLoad: mapTruthy
  };

  function filterObj(obj: any, secureKeys: any) {
    if (obj && typeof obj === 'object') {
        var allKeys = Object.keys(obj);
        for (var i = 0 ; i < allKeys.length ; i++) {
            var k = allKeys[i];
            if (secureKeys.includes(k)) {
              delete obj[k];
            } else {
             var value = obj[k];
             if ( typeof value === 'object') {
              filterObj(value, secureKeys);
             }
          }
        }
    }
    return obj;
  }

  function filteredSettings(settingsObject: any) {
    let so = _.cloneDeep(settingsObject);
    if (so.obscured) {
      so.enable = _.difference(so.enable, so.obscured);
    }
    return filterObj(so, secureSettings);
  }

  function mapNumberArray (value: any) {
    if (!value || _.isArray(value)) {
      return value;
    }

    if (isNaN(value)) {
      var rawValues = value && value.split(' ') || [];
      return _.map(rawValues, function(num: any) {
        return isNaN(num) ? null : Number(num);
      });
    } else {
      return [Number(value)];
    }
  }

  function mapNumber (value: any) {
    if (!value) {
      return value;
    }

    // @ts-expect-error TS(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
    if (typeof value === 'string' && isNaN(value)) {
      const decommaed = value.replace(',','.');
      // @ts-expect-error TS(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
      if (!isNaN(decommaed)) { value = decommaed; }
    }

    if (isNaN(value)) {
      return value;
    } else {
      return Number(value);
    }
  }

  function mapTruthy (value: any) {
    if (typeof value === 'string' && (value.toLowerCase() === 'on' || value.toLowerCase() === 'true')) { value = true; }
    if (typeof value === 'string' && (value.toLowerCase() === 'off' || value.toLowerCase() === 'false')) { value = false; }
    return value;
  }

  //TODO: getting sent in status.json, shouldn't be
  // @ts-expect-error TS(2339) FIXME: Property 'DEFAULT_FEATURES' does not exist on type... Remove this comment to see the full error message
  settings.DEFAULT_FEATURES = ['bgnow', 'delta', 'direction', 'timeago', 'devicestatus', 'upbat', 'errorcodes', 'profile', 'bolus', 'dbsize', 'runtimestate', 'basal', 'careportal'];

  var wasSet: any = [];

  function isSimple (value: any) {
    return _.isArray(value) || (typeof value !== 'function' && typeof value !== 'object');
  }

  function nameFromKey (key: any, nameType: any) {
    return nameType === 'env' ? _.snakeCase(key).toUpperCase() : key;
  }

  function eachSettingAs (nameType: any) {

    function mapKeys (accessor: any, keys: any) {
      _.forIn(keys, function each (value: any, key: any) {
        if (isSimple(value)) {
          var newValue = accessor(nameFromKey(key, nameType));
          if (newValue !== undefined) {
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            var mapper = valueMappers[key];
            wasSet.push(key);
            keys[key] = mapper ? mapper(newValue) : newValue;
          }
        }
      });
    }

    return function allKeys (accessor: any) {
      mapKeys(accessor, settings);
      mapKeys(accessor, settings.thresholds);
      enableAndDisableFeatures(accessor, nameType);
    };
  }

  function enableAndDisableFeatures (accessor: any, nameType: any) {

    function getAndPrepare (key: any) {
      var raw = accessor(nameFromKey(key, nameType)) || '';
      var cleaned = decodeURIComponent(raw).toLowerCase();
      // @ts-expect-error TS(2322) FIXME: Type 'string[]' is not assignable to type 'string'... Remove this comment to see the full error message
      cleaned = cleaned ? cleaned.split(' ') : [];
      cleaned = _.filter(cleaned, function(e: any) { return e !== ""; } );
      return cleaned;
    }

    function enableIf (feature: any, condition: any) {
      if (condition) {
        // @ts-expect-error TS(2339) FIXME: Property 'push' does not exist on type 'string'.
        enable.push(feature);
      }
    }

    function anyEnabled (features: any) {
      return _.findIndex(features, function(feature: any) {
        return enable.indexOf(feature) > -1;
      }) > -1;
    }

    function prepareAlarmTypes () {
      var alarmTypes = _.filter(getAndPrepare('alarmTypes'), function onlyKnownTypes (type: any) {
        return type === 'predict' || type === 'simple';
      });

      if (alarmTypes.length === 0) {
        var thresholdWasSet = _.findIndex(wasSet, function(name: any) {
          return name.indexOf('bg') === 0;
        }) > -1;
        alarmTypes = thresholdWasSet ? ['simple'] : ['predict'];
      }

      return alarmTypes;
    }

    var enable = getAndPrepare('enable');
    var disable = getAndPrepare('disable');
    var obscured = getAndPrepare('obscured');

    // @ts-expect-error TS(2339) FIXME: Property 'alarmTypes' does not exist on type '{ un... Remove this comment to see the full error message
    settings.alarmTypes = prepareAlarmTypes();

    //don't require pushover to be enabled to preserve backwards compatibility if there are extendedSettings for it
    enableIf('pushover', accessor(nameFromKey('pushoverApiToken', nameType)));

    enableIf('treatmentnotify', anyEnabled(['careportal', 'pushover', 'maker']));

    // @ts-expect-error TS(2339) FIXME: Property 'DEFAULT_FEATURES' does not exist on type... Remove this comment to see the full error message
    _.each(settings.DEFAULT_FEATURES, function eachDefault (feature: any) {
      enableIf(feature, enable.indexOf(feature) < 0);
    });

    //TODO: maybe get rid of ALARM_TYPES and only use enable?
    // @ts-expect-error TS(2339) FIXME: Property 'alarmTypes' does not exist on type '{ un... Remove this comment to see the full error message
    enableIf('simplealarms', settings.alarmTypes.indexOf('simple') > -1);
    // @ts-expect-error TS(2339) FIXME: Property 'alarmTypes' does not exist on type '{ un... Remove this comment to see the full error message
    enableIf('ar2', settings.alarmTypes.indexOf('predict') > -1);

    if (disable.length > 0) {
      console.info('disabling', disable);
    }

    //all enabled feature, without any that have been disabled
    // @ts-expect-error TS(2339) FIXME: Property 'enable' does not exist on type '{ units:... Remove this comment to see the full error message
    settings.enable = _.difference(enable, disable);
    settings.obscured = obscured;

    var thresholds = settings.thresholds;

    thresholds.bgHigh = Number(thresholds.bgHigh);
    thresholds.bgTargetTop = Number(thresholds.bgTargetTop);
    thresholds.bgTargetBottom = Number(thresholds.bgTargetBottom);
    thresholds.bgLow = Number(thresholds.bgLow);

    // Do not convert for old installs that have these set in mg/dl
    if (settings.units.toLowerCase().includes('mmol') && thresholds.bgHigh < 50) {
      thresholds.bgHigh = Math.round(thresholds.bgHigh * constants.MMOL_TO_MGDL);
      thresholds.bgTargetTop = Math.round(thresholds.bgTargetTop * constants.MMOL_TO_MGDL);
      thresholds.bgTargetBottom = Math.round(thresholds.bgTargetBottom * constants.MMOL_TO_MGDL);
      thresholds.bgLow = Math.round(thresholds.bgLow * constants.MMOL_TO_MGDL);
    }

    verifyThresholds();
    adjustShownPlugins();
  }

  function verifyThresholds () {
    var thresholds = settings.thresholds;

    if (thresholds.bgTargetBottom >= thresholds.bgTargetTop) {
      console.warn('BG_TARGET_BOTTOM(' + thresholds.bgTargetBottom + ') was >= BG_TARGET_TOP(' + thresholds.bgTargetTop + ')');
      thresholds.bgTargetBottom = thresholds.bgTargetTop - 1;
      console.warn('BG_TARGET_BOTTOM is now ' + thresholds.bgTargetBottom);
    }
    if (thresholds.bgTargetTop <= thresholds.bgTargetBottom) {
      console.warn('BG_TARGET_TOP(' + thresholds.bgTargetTop + ') was <= BG_TARGET_BOTTOM(' + thresholds.bgTargetBottom + ')');
      thresholds.bgTargetTop = thresholds.bgTargetBottom + 1;
      console.warn('BG_TARGET_TOP is now ' + thresholds.bgTargetTop);
    }
    if (thresholds.bgLow >= thresholds.bgTargetBottom) {
      console.warn('BG_LOW(' + thresholds.bgLow + ') was >= BG_TARGET_BOTTOM(' + thresholds.bgTargetBottom + ')');
      thresholds.bgLow = thresholds.bgTargetBottom - 1;
      console.warn('BG_LOW is now ' + thresholds.bgLow);
    }
    if (thresholds.bgHigh <= thresholds.bgTargetTop) {
      console.warn('BG_HIGH(' + thresholds.bgHigh + ') was <= BG_TARGET_TOP(' + thresholds.bgTargetTop + ')');
      thresholds.bgHigh = thresholds.bgTargetTop + 1;
      console.warn('BG_HIGH is now ' + thresholds.bgHigh);
    }
  }

  function adjustShownPlugins () {
    var showPluginsUnset = settings.showPlugins && 0 === settings.showPlugins.length;

    settings.showPlugins += ' delta direction upbat';
    if (settings.showRawbg === 'always' || settings.showRawbg === 'noise') {
      settings.showPlugins += ' rawbg';
    }

    if (showPluginsUnset) {
      //assume all enabled features are plugins and they should be shown for now
      //it would be better to use the registered plugins, but it's not loaded yet...
      // @ts-expect-error TS(2339) FIXME: Property 'enable' does not exist on type '{ units:... Remove this comment to see the full error message
      _.forEach(settings.enable, function showFeature (feature: any) {
        if (isEnabled(feature)) {
          settings.showPlugins += ' ' + feature;
        }
      });
    }
  }

  function isEnabled (feature: any) {
    var enabled = false;

    // @ts-expect-error TS(2339) FIXME: Property 'enable' does not exist on type '{ units:... Remove this comment to see the full error message
    if (settings.enable && typeof feature === 'object' && feature.length !== undefined) {
      enabled = _.find(feature, function eachFeature (f: any) {
        // @ts-expect-error TS(2339) FIXME: Property 'enable' does not exist on type '{ units:... Remove this comment to see the full error message
        return settings.enable.indexOf(f) > -1;
      }) !== undefined;
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'enable' does not exist on type '{ units:... Remove this comment to see the full error message
      enabled = settings.enable && settings.enable.indexOf(feature) > -1;
    }

    return enabled;
  }

  function isUrgentHighAlarmEnabled(notify: any) {
    return notify.eventName === 'high' && notify.level === constants.LEVEL_URGENT && settings.alarmUrgentHigh;
  }

  function isHighAlarmEnabled(notify: any) {
    return notify.eventName === 'high' && settings.alarmHigh;
  }

  function isUrgentLowAlarmEnabled(notify: any) {
    return notify.eventName === 'low' && notify.level === constants.LEVEL_URGENT && settings.alarmUrgentLow;
  }

  function isLowAlarmEnabled(notify: any) {
    return notify.eventName === 'low' && settings.alarmLow;
  }

  function isAlarmEventEnabled (notify: any) {
    return ('high' !== notify.eventName && 'low' !== notify.eventName)
     || isUrgentHighAlarmEnabled(notify)
     || isHighAlarmEnabled(notify)
     || isUrgentLowAlarmEnabled(notify)
     || isLowAlarmEnabled(notify);
  }

  function snoozeMinsForAlarmEvent (notify: any) {
    var snoozeTime;

    if (isUrgentHighAlarmEnabled(notify)) {
      snoozeTime = settings.alarmUrgentHighMins;
    } else if (isHighAlarmEnabled(notify)) {
      snoozeTime = settings.alarmHighMins;
    } else if (isUrgentLowAlarmEnabled(notify)) {
      snoozeTime = settings.alarmUrgentLowMins;
    } else if (isLowAlarmEnabled(notify)) {
      snoozeTime = settings.alarmLowMins;
    } else if (notify.level === constants.LEVEL_URGENT) {
      snoozeTime = settings.alarmUrgentMins;
    } else {
      snoozeTime = settings.alarmWarnMins;
    }

    return snoozeTime;
  }

  function snoozeFirstMinsForAlarmEvent (notify: any) {
    return _.first(snoozeMinsForAlarmEvent(notify));
  }

  // @ts-expect-error TS(2339) FIXME: Property 'eachSetting' does not exist on type '{ u... Remove this comment to see the full error message
  settings.eachSetting = eachSettingAs();
  // @ts-expect-error TS(2339) FIXME: Property 'eachSettingAsEnv' does not exist on type... Remove this comment to see the full error message
  settings.eachSettingAsEnv = eachSettingAs('env');
  // @ts-expect-error TS(2339) FIXME: Property 'isEnabled' does not exist on type '{ uni... Remove this comment to see the full error message
  settings.isEnabled = isEnabled;
  // @ts-expect-error TS(2339) FIXME: Property 'isAlarmEventEnabled' does not exist on t... Remove this comment to see the full error message
  settings.isAlarmEventEnabled = isAlarmEventEnabled;
  // @ts-expect-error TS(2339) FIXME: Property 'snoozeMinsForAlarmEvent' does not exist ... Remove this comment to see the full error message
  settings.snoozeMinsForAlarmEvent = snoozeMinsForAlarmEvent;
  // @ts-expect-error TS(2339) FIXME: Property 'snoozeFirstMinsForAlarmEvent' does not e... Remove this comment to see the full error message
  settings.snoozeFirstMinsForAlarmEvent = snoozeFirstMinsForAlarmEvent;
  // @ts-expect-error TS(2339) FIXME: Property 'filteredSettings' does not exist on type... Remove this comment to see the full error message
  settings.filteredSettings = filteredSettings;

  return settings;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
