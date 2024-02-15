'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
var times = require('../times');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');

// var ALL_STATUS_FIELDS = ['status-symbol', 'status-label', 'iob', 'meal-assist', 'freq', 'rssi']; Unused variable

function init (ctx: any) {
  var moment = ctx.moment;
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var utils = require('../utils')(ctx);
  var openaps = {
    name: 'openaps'
    , label: 'OpenAPS'
    , pluginType: 'pill-status'
  };
  var translate = ctx.language.translate;
  var firstPrefs = true;
  var levels = ctx.levels;

  // @ts-expect-error TS(2339): Property 'getClientPrefs' does not exist on type '... Remove this comment to see the full error message
  openaps.getClientPrefs = function getClientPrefs() {
    return ([{
      label: "Color prediction lines",
      id: "colorPredictionLines",
      type: "boolean"
    }]);
  }

  // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
  openaps.getPrefs = function getPrefs (sbx: any) {

    function cleanList (value: any) {
      return decodeURIComponent(value || '').toLowerCase().split(' ');
    }

    function isEmpty (list: any) {
      return _.isEmpty(list) || _.isEmpty(list[0]);
    }

    const settings = sbx.extendedSettings || {};

    var fields = cleanList(settings.fields);
    fields = isEmpty(fields) ? ['status-symbol', 'status-label', 'iob', 'meal-assist', 'rssi'] : fields;

    var retroFields = cleanList(settings.retroFields);
    retroFields = isEmpty(retroFields) ? ['status-symbol', 'status-label', 'iob', 'meal-assist', 'rssi'] : retroFields;

    if (typeof settings.colorPredictionLines == 'undefined') {
      settings.colorPredictionLines = true;
    }

    var prefs = {
      fields: fields
      , retroFields: retroFields
      , warn: settings.warn ? settings.warn : 30
      , urgent: settings.urgent ? settings.urgent : 60
      , enableAlerts: settings.enableAlerts
      , predIOBColor: settings.predIobColor ? settings.predIobColor : '#1e88e5'
      , predCOBColor: settings.predCobColor ? settings.predCobColor : '#FB8C00'
      , predACOBColor: settings.predAcobColor ? settings.predAcobColor : '#FB8C00'
      , predZTColor: settings.predZtColor ? settings.predZtColor : '#00d2d2'
      , predUAMColor: settings.predUamColor ? settings.predUamColor : '#c9bd60'
      , colorPredictionLines: settings.colorPredictionLines
    };

    if (firstPrefs) {
      firstPrefs = false;
    }

    return prefs;
  };

  // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  openaps.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('openaps', function setOpenAPS () {
      // @ts-expect-error TS(2339): Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
      return openaps.analyzeData(sbx);
    });
  };

  // @ts-expect-error TS(2339): Property 'analyzeData' does not exist on type '{ n... Remove this comment to see the full error message
  openaps.analyzeData = function analyzeData (sbx: any) {
    var recentHours = 6; //TODO dia*2
    var recentMills = sbx.time - times.hours(recentHours).msecs;

    var recentData = _.chain(sbx.data.devicestatus)
      .filter(function(status: any) {
        return ('openaps' in status) && sbx.entryMills(status) <= sbx.time && sbx.entryMills(status) >= recentMills;
      })
      .map(function(status: any) {
        if (status.openaps && _.isArray(status.openaps.iob) && status.openaps.iob.length > 0) {
          status.openaps.iob = status.openaps.iob[0];
          if (status.openaps.iob.time) {
            status.openaps.iob.timestamp = status.openaps.iob.time;
          }
        }
        return status;
      })
      .value();

    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = openaps.getPrefs(sbx);
    var recent = moment(sbx.time).subtract(prefs.warn / 2, 'minutes');

    var result = {
      seenDevices: {}
      , lastEnacted: null
      , lastNotEnacted: null
      , lastSuggested: null
      , lastIOB: null
      , lastMMTune: null
      , lastPredBGs: null
    };

    function getDevice (status: any) {
      var uri = status.device || 'device';
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      var device = result.seenDevices[uri];

      if (!device) {
        device = {
          name: utils.deviceName(uri)
          , uri: uri
        };

        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        result.seenDevices[uri] = device;
      }
      return device;
    }

    function toMoments (status: any) {
      var enacted = false;
      var notEnacted = false;
      if (status.openaps.enacted && status.openaps.enacted.timestamp && (status.openaps.enacted.recieved || status.openaps.enacted.received)) {
        if (status.openaps.enacted.mills) {
          enacted = moment(status.openaps.enacted.mills);
        } else {
          enacted = moment(status.openaps.enacted.timestamp);
        }
      } else if (status.openaps.enacted && status.openaps.enacted.timestamp && !(status.openaps.enacted.recieved || status.openaps.enacted.received)) {
        if (status.openaps.enacted.mills) {
          notEnacted = moment(status.openaps.enacted.mills)
        } else {
          notEnacted = moment(status.openaps.enacted.timestamp)
        }
      }

      var suggested = false;
      if (status.openaps.suggested && status.openaps.suggested.mills) {
        suggested = moment(status.openaps.suggested.mills);
      } else if (status.openaps.suggested && status.openaps.suggested.timestamp) {
        suggested = moment(status.openaps.suggested.timestamp);
      }

      var iob = false;
      if (status.openaps.iob && status.openaps.iob.mills) {
        iob = moment(status.openaps.iob.mills);
      } else if (status.openaps.iob && status.openaps.iob.timestamp) {
        iob = moment(status.openaps.iob.timestamp);
      }

      return {
        when: moment(status.mills)
        , enacted
        , notEnacted
        , suggested
        , iob
      };
    }

    function momentsToLoopStatus (moments: any, noWarning: any) {

      var status = {
        symbol: '⚠'
        , code: 'warning'
        , label: 'Warning'
      };

      if (moments.notEnacted && (
          (moments.enacted && moments.notEnacted.isAfter(moments.enacted)) || (!moments.enacted && moments.notEnacted.isAfter(recent)))) {
        status.symbol = 'x';
        status.code = 'notenacted';
        status.label = 'Not Enacted';
      } else if (moments.enacted && moments.enacted.isAfter(recent)) {
        status.symbol = '⌁';
        status.code = 'enacted';
        status.label = 'Enacted';
      } else if (moments.suggested && moments.suggested.isAfter(recent)) {
        status.symbol = '↻';
        status.code = 'looping';
        status.label = 'Looping';
      } else if (moments.when && (noWarning || moments.when.isAfter(recent))) {
        status.symbol = '◉';
        status.code = 'waiting';
        status.label = 'Waiting';
      }

      return status;
    }

    _.forEach(recentData, function eachStatus (status: any) {
      var device = getDevice(status);

      var moments = toMoments(status);
      var loopStatus = momentsToLoopStatus(moments, true);

      if (!device.status || moments.when.isAfter(device.status.when)) {
        device.status = loopStatus;
        device.status.when = moments.when;
      }

      var enacted = status.openaps && status.openaps.enacted;
      // @ts-expect-error TS(2339): Property 'isAfter' does not exist on type 'true'.
      if (enacted && moments.enacted && (!result.lastEnacted || moments.enacted.isAfter(result.lastEnacted.moment))) {
        if (enacted.mills) {
          enacted.moment = moment(enacted.mills);
        } else {
          enacted.moment = moment(enacted.timestamp);
        }
        result.lastEnacted = enacted;
        // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
        if (enacted.predBGs && (!result.lastPredBGs || enacted.moment.isAfter(result.lastPredBGs.moment))) {
          result.lastPredBGs = _.isArray(enacted.predBGs) ? { values: enacted.predBGs } : enacted.predBGs;
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          result.lastPredBGs.moment = enacted.moment;
        }
      }

      // @ts-expect-error TS(2339): Property 'isAfter' does not exist on type 'true'.
      if (enacted && moments.notEnacted && (!result.lastNotEnacted || moments.notEnacted.isAfter(result.lastNotEnacted.moment))) {
        if (enacted.mills) {
          enacted.moment = moment(enacted.mills);
        } else {
          enacted.moment = moment(enacted.timestamp);
        }
        result.lastNotEnacted = enacted;
      }

      var suggested = status.openaps && status.openaps.suggested;
      // @ts-expect-error TS(2339): Property 'isAfter' does not exist on type 'true'.
      if (suggested && moments.suggested && (!result.lastSuggested || moments.suggested.isAfter(result.lastSuggested.moment))) {
        if (suggested.mills) {
          suggested.moment = moment(suggested.mills);
        } else {
          suggested.moment = moment(suggested.timestamp);
        }
        result.lastSuggested = suggested;
        // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
        if (suggested.predBGs && (!result.lastPredBGs || suggested.moment.isAfter(result.lastPredBGs.moment))) {
          result.lastPredBGs = _.isArray(suggested.predBGs) ? { values: suggested.predBGs } : suggested.predBGs;
          // @ts-expect-error TS(2531): Object is possibly 'null'.
          result.lastPredBGs.moment = suggested.moment;
        }
      }

      var iob = status.openaps && status.openaps.iob;
      // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
      if (moments.iob && (!result.lastIOB || moment(iob.timestamp).isAfter(result.lastIOB.moment))) {
        iob.moment = moments.iob;
        result.lastIOB = iob;
      }

      if (status.mmtune && status.mmtune.timestamp) {
        status.mmtune.moment = moment(status.mmtune.timestamp);
        if (!device.mmtune || moments.when.isAfter(device.mmtune.moment)) {
          device.mmtune = status.mmtune;
        }
      }
    });

    if (result.lastEnacted && result.lastSuggested) {
      // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
      if (result.lastEnacted.moment.isAfter(result.lastSuggested.moment)) {
        // @ts-expect-error TS(2339): Property 'lastLoopMoment' does not exist on type '... Remove this comment to see the full error message
        result.lastLoopMoment = result.lastEnacted.moment;
        // @ts-expect-error TS(2339): Property 'lastEventualBG' does not exist on type '... Remove this comment to see the full error message
        result.lastEventualBG = result.lastEnacted.eventualBG;
      } else {
        // @ts-expect-error TS(2339): Property 'lastLoopMoment' does not exist on type '... Remove this comment to see the full error message
        result.lastLoopMoment = result.lastSuggested.moment;
        // @ts-expect-error TS(2339): Property 'lastEventualBG' does not exist on type '... Remove this comment to see the full error message
        result.lastEventualBG = result.lastSuggested.eventualBG;
      }
    // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
    } else if (result.lastEnacted && result.lastEnacted.moment) {
      // @ts-expect-error TS(2339): Property 'lastLoopMoment' does not exist on type '... Remove this comment to see the full error message
      result.lastLoopMoment = result.lastEnacted.moment;
      // @ts-expect-error TS(2339): Property 'lastEventualBG' does not exist on type '... Remove this comment to see the full error message
      result.lastEventualBG = result.lastEnacted.eventualBG;
    // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
    } else if (result.lastSuggested && result.lastSuggested.moment) {
      // @ts-expect-error TS(2339): Property 'lastLoopMoment' does not exist on type '... Remove this comment to see the full error message
      result.lastLoopMoment = result.lastSuggested.moment;
      // @ts-expect-error TS(2339): Property 'lastEventualBG' does not exist on type '... Remove this comment to see the full error message
      result.lastEventualBG = result.lastSuggested.eventualBG;
    }

    // @ts-expect-error TS(2339): Property 'status' does not exist on type '{ seenDe... Remove this comment to see the full error message
    result.status = momentsToLoopStatus({
      // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
      enacted: result.lastEnacted && result.lastEnacted.moment
      // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
      , notEnacted: result.lastNotEnacted && result.lastNotEnacted.moment
      // @ts-expect-error TS(2339): Property 'moment' does not exist on type 'never'.
      , suggested: result.lastSuggested && result.lastSuggested.moment
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 3.
    }, false, recent);

    return result;
  };

  // @ts-expect-error TS(2339): Property 'getEventTypes' does not exist on type '{... Remove this comment to see the full error message
  openaps.getEventTypes = function getEventTypes (sbx: any) {

    var units = sbx.settings.units;
    console.log('units', units);

    var reasonconf = [];

    if (units == 'mmol') {
      reasonconf.push({ name: translate('Eating Soon'), targetTop: 4.5, targetBottom: 4.5, duration: 60 });
      reasonconf.push({ name: translate('Activity'), targetTop: 8, targetBottom: 6.5, duration: 120 });
    } else {
      reasonconf.push({ name: translate('Eating Soon'), targetTop: 80, targetBottom: 80, duration: 60 });
      reasonconf.push({ name: translate('Activity'), targetTop: 140, targetBottom: 120, duration: 120 });
    }

    reasonconf.push({ name: 'Manual' });

    return [
      {
        val: 'Temporary Target'
        , name: 'Temporary Target'
        , bg: false
        , insulin: false
        , carbs: false
        , prebolus: false
        , duration: true
        , percent: false
        , absolute: false
        , profile: false
        , split: false
        , targets: true
        , reasons: reasonconf
      }
      , {
        val: 'Temporary Target Cancel'
        , name: 'Temporary Target Cancel'
        , bg: false
        , insulin: false
        , carbs: false
        , prebolus: false
        , duration: false
        , percent: false
        , absolute: false
        , profile: false
        , split: false
      }      
      , {
        val: 'OpenAPS Offline'
        , name: 'OpenAPS Offline'
        , bg: false
        , insulin: false
        , carbs: false
        , prebolus: false
        , duration: true
        , percent: false
        , absolute: false
        , profile: false
        , split: false
      }
    ];
  };

  // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
  openaps.checkNotifications = function checkNotifications (sbx: any) {
    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = openaps.getPrefs(sbx);

    if (!prefs.enableAlerts) { return; }

    var prop = sbx.properties.openaps;

    if (!prop.lastLoopMoment) {
      console.info('OpenAPS hasn\'t reported a loop yet');
      return;
    }

    var now = moment();
    var level = statusLevel(prop, prefs, sbx);
    if (level >= levels.WARN) {
      sbx.notifications.requestNotify({
        level: level
        , title: 'OpenAPS isn\'t looping'
        , message: 'Last Loop: ' + utils.formatAgo(prop.lastLoopMoment, now.valueOf())
        , pushoverSound: 'echo'
        , group: 'OpenAPS'
        , plugin: openaps
        , debug: prop
      });
    }
  };

  // @ts-expect-error TS(2339): Property 'findOfflineMarker' does not exist on typ... Remove this comment to see the full error message
  openaps.findOfflineMarker = function findOfflineMarker (sbx: any) {
    return _.findLast(sbx.data.treatments, function match (treatment: any) {
      var eventTime = sbx.entryMills(treatment);
      var eventEnd = treatment.duration ? eventTime + times.mins(treatment.duration).msecs : eventTime;
      return eventTime <= sbx.time && treatment.eventType === 'OpenAPS Offline' && eventEnd >= sbx.time;
    });
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  openaps.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.openaps;

    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    var prefs = openaps.getPrefs(sbx);

    var selectedFields = sbx.data.inRetroMode ? prefs.retroFields : prefs.fields;

    function valueString (prefix: any, value: any) {
      return value ? prefix + value : '';
    }

    var events = [];

    function addSuggestion () {
      if (prop.lastSuggested) {
        var bg = prop.lastSuggested.bg;
        var units = sbx.data.profile.getUnits();

        if (units === 'mmol') {
          bg = Math.round(bg / consts.MMOL_TO_MGDL * 10) / 10;
        }

        var valueParts = [
          valueString('BG: ', bg)
          , valueString(', ', prop.lastSuggested.reason)
          , prop.lastSuggested.sensitivityRatio ? ', <b>Sensitivity Ratio:</b> ' + prop.lastSuggested.sensitivityRatio : ''
        ];

        if (_.includes(selectedFields, 'iob')) {
          valueParts = concatIOB(valueParts);
        }

        events.push({
          time: prop.lastSuggested.moment
          , value: valueParts.join('')
        });
      }
    }

    function concatIOB (valueParts: any) {
      if (prop.lastIOB) {
        valueParts = valueParts.concat([
          ', IOB: '
          , sbx.roundInsulinForDisplayFormat(prop.lastIOB.iob) + 'U'
          , prop.lastIOB.basaliob ? ', Basal IOB ' + sbx.roundInsulinForDisplayFormat(prop.lastIOB.basaliob) + 'U' : ''
          , prop.lastIOB.bolusiob ? ', Bolus IOB ' + sbx.roundInsulinForDisplayFormat(prop.lastIOB.bolusiob) + 'U' : ''
        ]);
      }

      return valueParts;
    }

    function getForecastPoints () {
      var points: any = [];

      function toPoints (offset: any, forecastType: any) {
        return function toPoint (value: any, index: any) {
          var colors = {
            'Values': '#ff00ff'
            , 'IOB': prefs.predIOBColor
            , 'Zero-Temp': prefs.predZTColor
            , 'COB': prefs.predCOBColor
            , 'Accel-COB': prefs.predACOBColor
            , 'UAM': prefs.predUAMColor
          }
          
          return {
            mgdl: value
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            , color: prefs.colorPredictionLines ? colors[forecastType] : '#ff00ff'
            , mills: prop.lastPredBGs.moment.valueOf() + times.mins(5 * index).msecs + offset
            , noFade: true
            , forecastType: forecastType
          };
        };
      }

      if (prop.lastPredBGs) {
        if (prop.lastPredBGs.values) {
          points = points.concat(_.map(prop.lastPredBGs.values, toPoints(0, "Values")));
        }
        if (prop.lastPredBGs.IOB) {
          points = points.concat(_.map(prop.lastPredBGs.IOB, toPoints(3333, "IOB")));
        }
        if (prop.lastPredBGs.ZT) {
          points = points.concat(_.map(prop.lastPredBGs.ZT, toPoints(4444, "Zero-Temp")));
        }
        if (prop.lastPredBGs.aCOB) {
          points = points.concat(_.map(prop.lastPredBGs.aCOB, toPoints(5555, "Accel-COB")));
        }
        if (prop.lastPredBGs.COB) {
          points = points.concat(_.map(prop.lastPredBGs.COB, toPoints(7777, "COB")));
        }
        if (prop.lastPredBGs.UAM) {
          points = points.concat(_.map(prop.lastPredBGs.UAM, toPoints(9999, "UAM")));
        }
      }

      return points;
    }

    if ('enacted' === prop.status.code) {
      var canceled = prop.lastEnacted.rate === 0 && prop.lastEnacted.duration === 0;

      var valueParts = [
        valueString('BG: ', prop.lastEnacted.bg)
        , ', <b>Temp Basal' + (canceled ? ' Canceled' : ' Started') + '</b>'
        , canceled ? '' : ' ' + prop.lastEnacted.rate.toFixed(2) + ' for ' + prop.lastEnacted.duration + 'm'
        , valueString(', ', prop.lastEnacted.reason)
        , prop.lastEnacted.mealAssist && _.includes(selectedFields, 'meal-assist') ? ' <b>Meal Assist:</b> ' + prop.lastEnacted.mealAssist : ''
      ];

      if (prop.lastSuggested && prop.lastSuggested.moment.isAfter(prop.lastEnacted.moment)) {
        addSuggestion();
      } else {
        valueParts = concatIOB(valueParts);
      }

      events.push({
        time: prop.lastEnacted.moment
        , value: valueParts.join('')
      });
    } else {
      addSuggestion();
    }

    _.forIn(prop.seenDevices, function seenDevice (device: any) {
      var deviceInfo = [device.name];

      if (_.includes(selectedFields, 'status-symbol')) {
        deviceInfo.push(device.status.symbol);
      }

      if (_.includes(selectedFields, 'status-label')) {
        deviceInfo.push(device.status.label);
      }

      if (device.mmtune) {
        var best = _.maxBy(device.mmtune.scanDetails, function(d: any) {
          return d[2];
        });

        if (_.includes(selectedFields, 'freq')) {
          deviceInfo.push(device.mmtune.setFreq + 'MHz');
        }
        if (best && best.length > 2 && _.includes(selectedFields, 'rssi')) {
          deviceInfo.push('@ ' + best[2] + 'dB');
        }
      }
      events.push({
        time: device.status.when
        , value: deviceInfo.join(' ')
      });
    });

    var sorted = _.sortBy(events, function toMill (event: any) {
      return event.time.valueOf();
    }).reverse();

    var info = _.map(sorted, function eventToInfo (event: any) {
      return {
        label: utils.timeAt(false, sbx) + utils.timeFormat(event.time, sbx)
        , value: event.value
      };
    });

    var label = 'OpenAPS';
    if (_.includes(selectedFields, 'status-symbol')) {
      label += ' ' + prop.status.symbol;
    }

    sbx.pluginBase.updatePillText(openaps, {
      value: utils.timeFormat(prop.lastLoopMoment, sbx)
      , label: label
      , info: info
      , pillClass: statusClass(prop, prefs, sbx)
    });

    var forecastPoints = getForecastPoints();
    if (forecastPoints && forecastPoints.length > 0) {
      sbx.pluginBase.addForecastPoints(forecastPoints, { type: 'openaps', label: 'OpenAPS Forecasts' });
    }
  };

  function virtAsstForecastHandler (next: any, slots: any, sbx: any) {
    var lastEventualBG = _.get(sbx, 'properties.openaps.lastEventualBG');
    if (lastEventualBG) {
      var response = translate('virtAsstOpenAPSForecast', {
        params: [
          lastEventualBG
        ]
      });
      next(translate('virtAsstTitleOpenAPSForecast'), response);
    } else {
      next(translate('virtAsstTitleOpenAPSForecast'), translate('virtAsstUnknown'));
    }
  }

  function virtAsstLastLoopHandler (next: any, slots: any, sbx: any) {
    var lastLoopMoment = _.get(sbx, 'properties.openaps.lastLoopMoment');
    if (lastLoopMoment) {
      var response = translate('virtAsstLastLoop', {
        params: [
          moment(lastLoopMoment).from(moment(sbx.time))
        ]
      });
      next(translate('virtAsstTitleLastLoop'), response);
    } else {
      next(translate('virtAsstTitleLastLoop'), translate('virtAsstUnknown'));
    }
  }

  // @ts-expect-error TS(2339): Property 'virtAsst' does not exist on type '{ name... Remove this comment to see the full error message
  openaps.virtAsst = {
    intentHandlers: [{
      intent: 'MetricNow'
      , metrics: ['openaps forecast', 'forecast']
      , intentHandler: virtAsstForecastHandler
    }, {
      intent: 'LastLoop'
      , intentHandler: virtAsstLastLoopHandler
    }]
  };

  function statusClass (prop: any, prefs: any, sbx: any) {
    var level = statusLevel(prop, prefs, sbx);
    return levels.toStatusClass(level);
  }

  function statusLevel (prop: any, prefs: any, sbx: any) {
    var level = levels.NONE;
    var now = moment(sbx.time);

    // @ts-expect-error TS(2339): Property 'findOfflineMarker' does not exist on typ... Remove this comment to see the full error message
    if (openaps.findOfflineMarker(sbx)) {
      console.info('OpenAPS known offline, not checking for alerts');
    } else if (prop.lastLoopMoment) {
      var urgentTime = prop.lastLoopMoment.clone().add(prefs.urgent, 'minutes');
      var warningTime = prop.lastLoopMoment.clone().add(prefs.warn, 'minutes');

      if (urgentTime.isBefore(now)) {
        level = levels.URGENT;
      } else if (warningTime.isBefore(now)) {
        level = levels.WARN;
      }
    }

    return level;
  }

  return openaps;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
