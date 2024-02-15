'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

var ALL_STATUS_FIELDS = ['reservoir', 'battery', 'clock', 'status', 'device'];

function init (ctx: any) {
  var moment = ctx.moment;
  var translate = ctx.language.translate;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var timeago = require('./timeago')(ctx);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var openaps = require('./openaps')(ctx);
  var levels = ctx.levels;

  var pump = {
    name: 'pump'
    , label: 'Pump'
    , pluginType: 'pill-status'
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  pump.getPrefs = function getPrefs (sbx: any) {

    function cleanList (value: any) {
      return decodeURIComponent(value || '').toLowerCase().split(' ');
    }

    function isEmpty (list: any) {
      return _.isEmpty(list) || _.isEmpty(list[0]);
    }

    var fields = cleanList(sbx.extendedSettings.fields);
    fields = isEmpty(fields) ? ['reservoir'] : fields;

    var retroFields = cleanList(sbx.extendedSettings.retroFields);
    retroFields = isEmpty(retroFields) ? ['reservoir', 'battery'] : retroFields;

    var profile = sbx.data.profile;
    var warnBattQuietNight = sbx.extendedSettings.warnBattQuietNight;

    if (warnBattQuietNight && (!profile || !profile.hasData() || !profile.getTimezone())) {
      console.warn('PUMP_WARN_BATT_QUIET_NIGHT requires a treatment profile with time zone set to obtain user time zone');
      warnBattQuietNight = false;
    }

    return {
      fields: fields
      , retroFields: retroFields
      , warnClock: sbx.extendedSettings.warnClock || 30
      , urgentClock: sbx.extendedSettings.urgentClock || 60
      , warnRes: sbx.extendedSettings.warnRes || 10
      , urgentRes: sbx.extendedSettings.urgentRes || 5
      , warnBattV: sbx.extendedSettings.warnBattV || 1.35
      , urgentBattV: sbx.extendedSettings.urgentBattV || 1.3
      , warnBattP: sbx.extendedSettings.warnBattP || 30
      , urgentBattP: sbx.extendedSettings.urgentBattP || 20
      , warnOnSuspend: sbx.extendedSettings.warnOnSuspend || false
      , enableAlerts: sbx.extendedSettings.enableAlerts || false
      , warnBattQuietNight: warnBattQuietNight || false
      , dayStart: sbx.settings.dayStart
      , dayEnd: sbx.settings.dayEnd
    };
  };

  // @ts-expect-error TS(2339) FIXME: Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  pump.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('pump', function setPump ( ) {

      // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
      var prefs = pump.getPrefs(sbx);
      var recentMills = sbx.time - times.mins(prefs.urgentClock * 2).msecs;

      var filtered = _.filter(sbx.data.devicestatus, function (status: any) {
        return ('pump' in status) && sbx.entryMills(status) <= sbx.time && sbx.entryMills(status) >= recentMills;
      });

      var pumpStatus: any = null;

      _.forEach(filtered, function each (status: any) {
        status.clockMills = status.pump && status.pump.clock ? moment(status.pump.clock).valueOf() : status.mills;
        if (!pumpStatus || status.clockMills > pumpStatus.clockMills) {
          pumpStatus = status;
        }
      });

      pumpStatus = pumpStatus || { };
      pumpStatus.data = prepareData(pumpStatus, prefs, sbx);

      return pumpStatus;
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  pump.checkNotifications = function checkNotifications (sbx: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = pump.getPrefs(sbx);

    if (!prefs.enableAlerts) { return; }

    // @ts-expect-error TS(2339) FIXME: Property 'warnOnSuspend' does not exist on type '{... Remove this comment to see the full error message
    pump.warnOnSuspend = prefs.warnOnSuspend;

    var data = prepareData(sbx.properties.pump, prefs, sbx);

    if (data.level >= levels.WARN) {
      sbx.notifications.requestNotify({
        level: data.level
        // @ts-expect-error TS(2339) FIXME: Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
        , title: data.title
        // @ts-expect-error TS(2339) FIXME: Property 'message' does not exist on type '{ level... Remove this comment to see the full error message
        , message: data.message
        , pushoverSound: 'echo'
        , group: 'Pump'
        , plugin: pump
      });
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  pump.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.pump;

    // @ts-expect-error TS(2339) FIXME: Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = pump.getPrefs(sbx);
    var result = prepareData(prop, prefs, sbx);

    var values: any = [ ];
    var info = [ ];

    var selectedFields = sbx.data.inRetroMode ? prefs.retroFields : prefs.fields;

    _.forEach(ALL_STATUS_FIELDS, function eachField (fieldName: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      var field = result[fieldName];
      if (field) {
        var selected = _.indexOf(selectedFields, fieldName) > -1;
        if (selected) {
          values.push(field.display);
        } else {
          info.push({label: field.label, value: field.display});
        }
      }
    });

    if (result.extended) {
      info.push({label: '------------', value: ''});
      _.forOwn(result.extended, function(value: any, key: any) {
         info.push({ label: key, value: value });
      });
    }

    sbx.pluginBase.updatePillText(pump, {
      value: values.join(' ')
      , info: info
      , label: translate('Pump')
      , pillClass: statusClass(result.level)
    });
  };

  function virtAsstReservoirHandler (next: any, slots: any, sbx: any) {
    var reservoir = _.get(sbx, 'properties.pump.pump.reservoir');
    if (reservoir || reservoir === 0) {
      var response = translate('virtAsstReservoir', {
        params: [
            reservoir
        ]
      });
      next(translate('virtAsstTitlePumpReservoir'), response);
    } else {
      next(translate('virtAsstTitlePumpReservoir'), translate('virtAsstUnknown'));
    }
  }

  function virtAsstBatteryHandler (next: any, slots: any, sbx: any) {
    var battery = _.get(sbx, 'properties.pump.data.battery');
    if (battery) {
      var response = translate('virtAsstPumpBattery', {
              params: [
                  battery.value,
                  battery.unit
              ]
          });
      next(translate('virtAsstTitlePumpBattery'), response);
    } else {
      next(translate('virtAsstTitlePumpBattery'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  pump.virtAsst = {
    intentHandlers:[
      {
        // backwards compatibility
        intent: 'InsulinRemaining',
        intentHandler: virtAsstReservoirHandler
      }
      , {
        // backwards compatibility
        intent: 'PumpBattery',
        intentHandler: virtAsstBatteryHandler
      }
      , {
        intent: 'MetricNow'
        , metrics: ['pump reservoir']
        , intentHandler: virtAsstReservoirHandler
      }
      , {
        intent: 'MetricNow'
        , metrics: ['pump battery']
        , intentHandler: virtAsstBatteryHandler
      }
    ]
  };

  function statusClass (level: any) {
    var cls = 'current';

    if (level === levels.WARN) {
      cls = 'warn';
    } else if (level === levels.URGENT) {
      cls = 'urgent';
    }

    return cls;
  }


  function updateClock (prefs: any, result: any, sbx: any) {
    if (result.clock) {
      result.clock.label = 'Last Clock';
      result.clock.display = timeFormat(result.clock.value, sbx);

      var urgent = moment(sbx.time).subtract(prefs.urgentClock, 'minutes');
      var warn = moment(sbx.time).subtract(prefs.warnClock, 'minutes');

      if (urgent.isAfter(result.clock.value)) {
        result.clock.level = levels.URGENT;
        result.clock.message = 'URGENT: Pump data stale';
      } else if (warn.isAfter(result.clock.value)) {
        result.clock.level = levels.WARN;
        result.clock.message = 'Warning, Pump data stale';
      } else {
        result.clock.level = levels.NONE;
      }
    }
  }

  function updateReservoir (prefs: any, result: any) {
    if (result.reservoir) {
      result.reservoir.label = 'Reservoir';
      result.reservoir.display = result.reservoir.value.toPrecision(3) + 'U';
      if (result.reservoir.value < prefs.urgentRes) {
        result.reservoir.level = levels.URGENT;
        result.reservoir.message = 'URGENT: Pump Reservoir Low';
      } else if (result.reservoir.value < prefs.warnRes) {
        result.reservoir.level = levels.WARN;
        result.reservoir.message = 'Warning, Pump Reservoir Low';
      } else {
        result.reservoir.level = levels.NONE;
      }
    } else if (result.manufacturer === 'Insulet') {
      result.reservoir = {
        label: 'Reservoir', display: '50+ U'
      }
    }
    if (result.reservoir_display_override) {
      result.reservoir.display = result.reservoir_display_override;
    }
    if (result.reservoir_level_override) {
      result.reservoir.level = result.reservoir_level_override;
    }
  }

  function updateBattery (type: any, prefs: any, result: any, batteryWarn: any) {
    if (result.battery) {
      result.battery.label = 'Battery';
      result.battery.display = result.battery.value + type;
      var urgent = type === 'v' ? prefs.urgentBattV : prefs.urgentBattP;
      var warn = type === 'v' ? prefs.warnBattV : prefs.warnBattP;

      if (result.battery.value < urgent && batteryWarn) {
        result.battery.level = levels.URGENT;
        result.battery.message = 'URGENT: Pump Battery Low';
      } else if (result.battery.value < warn && batteryWarn) {
        result.battery.level = levels.WARN;
        result.battery.message = 'Warning, Pump Battery Low';
      } else {
        result.battery.level = levels.NONE;
      }
    }
  }


  function buildMessage (result: any) {
    if (result.level > levels.NONE) {
      var message = [];

      if (result.battery) {
        message.push('Pump Battery: ' + result.battery.display);
      }

      if (result.reservoir) {
        message.push('Pump Reservoir: ' + result.reservoir.display);
      }

      result.message = message.join('\n');
    }
  }

  function updateStatus(pump: any, result: any) {
    if (pump.status) {
      var status = pump.status.status || 'normal';
      if (pump.status.bolusing) {
        status = 'bolusing';
      } else if (pump.status.suspended) {
        status = 'suspended';
        if (pump.warnOnSuspend && pump.status.suspended) {
          result.status.level = levels.WARN;
          result.status.message = 'Pump Suspended';
        }
      }
      result.status = { value: status, display: status, label: translate('Status') };
    }
  }

  function prepareData (prop: any, prefs: any, sbx: any) {
    var pump = (prop && prop.pump) || { };
    var time = (sbx.data.profile && sbx.data.profile.getTimezone()) ? moment(sbx.time).tz(sbx.data.profile.getTimezone()) : moment(sbx.time);
    var now = time.hours() + time.minutes() / 60.0 + time.seconds() / 3600.0;
    var batteryWarn = !(prefs.warnBattQuietNight && (now < prefs.dayStart || now > prefs.dayEnd));
    var result = {
      level: levels.NONE
      , clock: pump.clock ? { value: moment(pump.clock) } : null
      , reservoir: pump.reservoir || pump.reservoir === 0 ? { value: pump.reservoir } : null
      , reservoir_display_override: pump.reservoir_display_override || null
      , reservoir_level_override: pump.reservoir_level_override || null
      , manufacturer: pump.manufacturer
      , model: pump.model
      , extended: pump.extended || null
    };

    updateClock(prefs, result, sbx);
    updateReservoir(prefs, result);
    updateStatus(pump, result);

    if (pump.battery && pump.battery.percent) {
      // @ts-expect-error TS(2339) FIXME: Property 'battery' does not exist on type '{ level... Remove this comment to see the full error message
      result.battery = { value: pump.battery.percent, unit: 'percent' };
      updateBattery('%', prefs, result, batteryWarn);
    } else if (pump.battery && pump.battery.voltage) {
      // @ts-expect-error TS(2339) FIXME: Property 'battery' does not exist on type '{ level... Remove this comment to see the full error message
      result.battery = { value: pump.battery.voltage, unit: 'volts'};
      updateBattery('v', prefs, result, batteryWarn);
    }

    // @ts-expect-error TS(2339) FIXME: Property 'device' does not exist on type '{ level:... Remove this comment to see the full error message
    result.device = { label: translate('Device'), display: prop.device };

    // @ts-expect-error TS(2339) FIXME: Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
    result.title = 'Pump Status';
    result.level = levels.NONE;

    //TODO: A new Pump Offline marker?  Something generic?  Use something new instead of a treatment?
    if (openaps.findOfflineMarker(sbx)) {
      console.info('OpenAPS known offline, not checking for alerts');
    } else {
      _.forEach(ALL_STATUS_FIELDS, function eachField(fieldName: any) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var field = result[fieldName];
        if (field && field.level > result.level) {
          result.level = field.level;
          // @ts-expect-error TS(2339) FIXME: Property 'title' does not exist on type '{ level: ... Remove this comment to see the full error message
          result.title = field.message;
        }
      });
    }

    buildMessage(result);

    return result;
  }

  function timeFormat (m: any, sbx: any) {

    var when;
    if (m && sbx.data.inRetroMode) {
      when = m.format('LT');
    } else if (m) {
      when = formatAgo(m, sbx.time);
    } else {
      when = 'unknown';
    }

    return when;
  }

  function formatAgo (m: any, nowMills: any) {
    var ago = timeago.calcDisplay({mills: m.valueOf()}, nowMills);
    return translate('%1' + ago.shortLabel + (ago.shortLabel.length === 1 ? ' ago' : ''), { params: [(ago.value ? ago.value : '')]});
  }

  return pump;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
