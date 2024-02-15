'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '$'.
var $ = (global && global.$) || require('jquery');
// @ts-expect-error TS(2304) FIXME: Cannot find name 'global'.
var d3 = (global && global.d3) || require('d3');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'shiroTrie'... Remove this comment to see the full error message
var shiroTrie = require('shiro-trie');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Storages = require('js-storage');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../language')();
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var sandbox = require('../sandbox')();
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var units = require('../units')();
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../levels');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var receiveDData = require('./receiveddata');

var brushing = false;

var browserSettings;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
var moment = window.moment;
var timezones = moment.tz.names();

var client = {};

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var hashauth = require('./hashauth');
// @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
client.hashauth = hashauth.init(client, $);

$('#loadingMessageText').html('Connecting to server');

// @ts-expect-error TS(2339) FIXME: Property 'headers' does not exist on type '{}'.
client.headers = function headers () {
  // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
  if (client.authorized) {
    return {
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      Authorization: 'Bearer ' + client.authorized.token
    };
  // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
  } else if (client.hashauth) {
    return {
      // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
      'api-secret': client.hashauth.hash()
    };
  } else {
    return {};
  }
};

// @ts-expect-error TS(2339) FIXME: Property 'crashed' does not exist on type '{}'.
client.crashed = function crashed () {
  $('#centerMessagePanel').show();
  $('#loadingMessageText').html('It appears the server has crashed. Please go to Heroku or Azure and reboot the server.');
}

// @ts-expect-error TS(2339) FIXME: Property 'init' does not exist on type '{}'.
client.init = function init (callback: any) {

  // @ts-expect-error TS(2339) FIXME: Property 'browserUtils' does not exist on type '{}... Remove this comment to see the full error message
  client.browserUtils = require('./browser-utils')($);

  // @ts-expect-error TS(2339) FIXME: Property 'browserUtils' does not exist on type '{}... Remove this comment to see the full error message
  var token = client.browserUtils.queryParms().token;
  // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
  var secret = client.hashauth.apisecrethash || Storages.localStorage.get('apisecrethash');

  var src = '/api/v1/status.json?t=' + new Date().getTime();

  if (secret) {
    src += '&secret=' + secret;
  } else if (token) {
    src += '&token=' + token;
  }

  $.ajax({
    method: 'GET'
    , url: src
    // @ts-expect-error TS(2339) FIXME: Property 'headers' does not exist on type '{}'.
    , headers: client.headers()
  }).done(function success (serverSettings: any) {
    if (serverSettings.runtimeState !== 'loaded') {
      console.log('Server is still loading data');
      $('#loadingMessageText').html('Server is starting and still loading data, retrying load in 5 seconds');
      // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
      window.setTimeout(window.Nightscout.client.init, 5000);
      return;
    }
    // @ts-expect-error TS(2339) FIXME: Property 'settingsFailed' does not exist on type '... Remove this comment to see the full error message
    client.settingsFailed = false;
    // @ts-expect-error TS(2339) FIXME: Property 'loadLanguage' does not exist on type '{}... Remove this comment to see the full error message
    client.loadLanguage(serverSettings, callback);
  }).fail(function fail (jqXHR: any) {

    // check if we couldn't reach the server at all, show offline message
    if (!jqXHR.readyState) {
      console.log('Application appears to be OFFLINE');
      $('#loadingMessageText').html('Connecting to Nightscout server failed, retrying every 5 seconds');
      // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
      window.setTimeout(window.Nightscout.client.init(), 5000);
      return;
    }

    //no server setting available, use defaults, auth, etc
    // @ts-expect-error TS(2339) FIXME: Property 'settingsFailed' does not exist on type '... Remove this comment to see the full error message
    if (client.settingsFailed) {
      console.log('Already tried to get settings after auth, but failed');
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'settingsFailed' does not exist on type '... Remove this comment to see the full error message
      client.settingsFailed = true;

      // detect browser language
      // @ts-expect-error TS(2339) FIXME: Property 'userLanguage' does not exist on type 'Na... Remove this comment to see the full error message
      var lang = Storages.localStorage.get('language') || (navigator.language || navigator.userLanguage).toLowerCase();
      if (lang !== 'zh_cn' && lang !== 'zh-cn' && lang !== 'zh_tw' && lang !== 'zh-tw') {
        lang = lang.substring(0, 2);
      } else {
        lang = lang.replace('-', '_');
      }
      if (language.languages.find((l: any) => l.code === lang)) {
        language.set(lang);
      } else {
        language.set('en');
      }

      // @ts-expect-error TS(2339) FIXME: Property 'translate' does not exist on type '{}'.
      client.translate = language.translate;
      // auth failed, hide loader and request for key
      $('#centerMessagePanel').hide();
      // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
      client.hashauth.requestAuthentication(function afterRequest () {
        // @ts-expect-error TS(2339) FIXME: Property 'init' does not exist on type '{}'.
        window.setTimeout(client.init(callback), 5000);
      });
    }
  });

};

// @ts-expect-error TS(2339) FIXME: Property 'loadLanguage' does not exist on type '{}... Remove this comment to see the full error message
client.loadLanguage = function loadLanguage (serverSettings: any, callback: any) {

  $('#loadingMessageText').html('Loading language file');

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  browserSettings = require('./browser-settings');
  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  client.settings = browserSettings(client, serverSettings, $);
  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  console.log('language is', client.settings.language);

  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  let filename = language.getFilename(client.settings.language);

  $.ajax({
    method: 'GET'
    , url: '/translations/' + filename
  }).done(function success (localization: any) {
    language.offerTranslations(localization);
    console.log('Application appears to be online');
    $('#centerMessagePanel').hide();
    // @ts-expect-error TS(2339) FIXME: Property 'load' does not exist on type '{}'.
    client.load(serverSettings, callback);
  }).fail(function fail () {
    console.error('Loading localization failed, continuing with English');
    console.log('Application appears to be online');
    $('#centerMessagePanel').hide();
    // @ts-expect-error TS(2339) FIXME: Property 'load' does not exist on type '{}'.
    client.load(serverSettings, callback);
  });

}

// @ts-expect-error TS(2339) FIXME: Property 'load' does not exist on type '{}'.
client.load = function load (serverSettings: any, callback: any) {

  var FORMAT_TIME_12 = '%-I:%M %p'
    , FORMAT_TIME_12_COMPACT = '%-I:%M'
    , FORMAT_TIME_24 = '%H:%M%'
    , FORMAT_TIME_12_SCALE = '%-I %p'
    , FORMAT_TIME_24_SCALE = '%H';

  var history = 48;

  var chart: any
    , socket: any
// @ts-expect-error TS(7034) FIXME: Variable 'alarmSocket' implicitly has type 'any' i... Remove this comment to see the full error message
	, alarmSocket
    , isInitialData = false
    , opacity = { current: 1, DAY: 1, NIGHT: 0.5 }
    , clientAlarms = {}
    , alarmInProgress = false
    // @ts-expect-error TS(7034) FIXME: Variable 'alarmMessage' implicitly has type 'any' ... Remove this comment to see the full error message
    , alarmMessage
    // @ts-expect-error TS(7034) FIXME: Variable 'currentNotify' implicitly has type 'any'... Remove this comment to see the full error message
    , currentNotify
    // @ts-expect-error TS(7034) FIXME: Variable 'currentAnnouncement' implicitly has type... Remove this comment to see the full error message
    , currentAnnouncement
    , alarmSound = 'alarm.mp3'
    , urgentAlarmSound = 'alarm2.mp3'
    // @ts-expect-error TS(7034) FIXME: Variable 'previousNotifyTimestamp' implicitly has ... Remove this comment to see the full error message
    , previousNotifyTimestamp;

  // @ts-expect-error TS(2339) FIXME: Property 'entryToDate' does not exist on type '{}'... Remove this comment to see the full error message
  client.entryToDate = function entryToDate (entry) {
    if (entry.date) return entry.date;
    entry.date = new Date(entry.mills);
    return entry.date;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
  client.now = Date.now();
  // @ts-expect-error TS(2339) FIXME: Property 'dataLastUpdated' does not exist on type ... Remove this comment to see the full error message
  client.dataLastUpdated = 0;
  // @ts-expect-error TS(2339) FIXME: Property 'lastPluginUpdateTime' does not exist on ... Remove this comment to see the full error message
  client.lastPluginUpdateTime = 0;
  // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
  client.ddata = require('../data/ddata')();
  // @ts-expect-error TS(2339) FIXME: Property 'defaultForecastTime' does not exist on t... Remove this comment to see the full error message
  client.defaultForecastTime = times.mins(30).msecs;
  // @ts-expect-error TS(2339) FIXME: Property 'forecastTime' does not exist on type '{}... Remove this comment to see the full error message
  client.forecastTime = client.now + client.defaultForecastTime;
  // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
  client.entries = [];
  // @ts-expect-error TS(2339) FIXME: Property 'ticks' does not exist on type '{}'.
  client.ticks = require('./ticks');

  //containers
  var container = $('.container')
    , bgStatus = $('.bgStatus')
    , currentBG = $('.bgStatus .currentBG')
    , majorPills = $('.bgStatus .majorPills')
    , minorPills = $('.bgStatus .minorPills')
    , statusPills = $('.status .statusPills')
    , primary = $('.primary')
    , editButton = $('#editbutton');

  // @ts-expect-error TS(2339) FIXME: Property 'tooltip' does not exist on type '{}'.
  client.tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  client.settings = browserSettings(client, serverSettings, $);

  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  language.set(client.settings.language).DOMtranslate($);
  // @ts-expect-error TS(2339) FIXME: Property 'translate' does not exist on type '{}'.
  client.translate = language.translate;
  // @ts-expect-error TS(2339) FIXME: Property 'language' does not exist on type '{}'.
  client.language = language;

  // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
  client.plugins = require('../plugins/')({
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    settings: client.settings
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    , extendedSettings: client.settings.extendedSettings
    , language: language
    , levels: levels
    , moment: moment
  }).registerClientDefaults();

  browserSettings.loadPluginSettings(client);

  // @ts-expect-error TS(2339) FIXME: Property 'utils' does not exist on type '{}'.
  client.utils = require('../utils')({
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    settings: client.settings
    , language: language
    , moment: moment
  });

  // @ts-expect-error TS(2339) FIXME: Property 'rawbg' does not exist on type '{}'.
  client.rawbg = client.plugins('rawbg');
  // @ts-expect-error TS(2339) FIXME: Property 'delta' does not exist on type '{}'.
  client.delta = client.plugins('delta');
  // @ts-expect-error TS(2339) FIXME: Property 'timeago' does not exist on type '{}'.
  client.timeago = client.plugins('timeago');
  // @ts-expect-error TS(2339) FIXME: Property 'direction' does not exist on type '{}'.
  client.direction = client.plugins('direction');
  // @ts-expect-error TS(2339) FIXME: Property 'errorcodes' does not exist on type '{}'.
  client.errorcodes = client.plugins('errorcodes');

  // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
  client.ctx = {
    data: {}
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , bus: require('../bus')(client.settings, client.ctx)
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    , settings: client.settings
    // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
    , pluginBase: client.plugins.base(majorPills, minorPills, statusPills, bgStatus, client.tooltip, Storages.localStorage)
    , moment: moment
    , timezones: timezones
  };

  // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
  client.ctx.language = language;
  // @ts-expect-error TS(2339) FIXME: Property 'translate' does not exist on type '{ URG... Remove this comment to see the full error message
  levels.translate = language.translate;
  // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
  client.ctx.levels = levels;

  // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
  client.ctx.notifications = require('../notifications')(client.settings, client.ctx);

  // @ts-expect-error TS(2339) FIXME: Property 'sbx' does not exist on type '{}'.
  client.sbx = sandbox.clientInit(client.ctx, client.now);
  // @ts-expect-error TS(2339) FIXME: Property 'renderer' does not exist on type '{}'.
  client.renderer = require('./renderer')(client, d3, $);

  //After plugins are initialized with browser settings;
  browserSettings.loadAndWireForm();

  // @ts-expect-error TS(2339) FIXME: Property 'adminnotifies' does not exist on type '{... Remove this comment to see the full error message
  client.adminnotifies = require('./adminnotifiesclient')(client, $);

  if (serverSettings && serverSettings.authorized) {
    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    client.authorized = serverSettings.authorized;
    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    client.authorized.lat = Date.now();
    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    client.authorized.shiros = _.map(client.authorized.permissionGroups, function toShiro (group) {
      var shiro = shiroTrie.new();
      // @ts-expect-error TS(7006) FIXME: Parameter 'permission' implicitly has an 'any' typ... Remove this comment to see the full error message
      _.forEach(group, function eachPermission (permission) {
        shiro.add(permission);
      });
      return shiro;
    });

    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    client.authorized.check = function check (permission) {
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      var found = _.find(client.authorized.shiros, function checkEach (shiro) {
        return shiro.check(permission);
      });

      return _.isObject(found);
    };
  }

  // @ts-expect-error TS(2339) FIXME: Property 'afterAuth' does not exist on type '{}'.
  client.afterAuth = function afterAuth (isAuthenticated) {

    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    var treatmentCreateAllowed = client.authorized ? client.authorized.check('api:treatments:create') : isAuthenticated;
    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    var treatmentUpdateAllowed = client.authorized ? client.authorized.check('api:treatments:update') : isAuthenticated;

    // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
    $('#lockedToggle').click(client.hashauth.requestAuthentication).toggle(!treatmentCreateAllowed && client.settings.showPlugins.indexOf('careportal') > -1);
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    $('#treatmentDrawerToggle').toggle(treatmentCreateAllowed && client.settings.showPlugins.indexOf('careportal') > -1);
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    $('#boluscalcDrawerToggle').toggle(treatmentCreateAllowed && client.settings.showPlugins.indexOf('boluscalc') > -1);

    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    if (isAuthenticated) client.notifies.updateAdminNotifies();

    // Edit mode
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    editButton.toggle(client.settings.editMode && treatmentUpdateAllowed);
    // @ts-expect-error TS(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
    editButton.click(function editModeClick (event) {
      // @ts-expect-error TS(2339) FIXME: Property 'editMode' does not exist on type '{}'.
      client.editMode = !client.editMode;
      // @ts-expect-error TS(2339) FIXME: Property 'editMode' does not exist on type '{}'.
      if (client.editMode) {
        // @ts-expect-error TS(2339) FIXME: Property 'renderer' does not exist on type '{}'.
        client.renderer.drawTreatments(client);
        editButton.find('i').addClass('selected');
      } else {
        chart.focus.selectAll('.draggable-treatment')
          .style('cursor', 'default')
          .on('mousedown.drag', null);
        editButton.find('i').removeClass('selected');
      }
      if (event) { event.preventDefault(); }
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
  client.hashauth.initAuthentication(client.afterAuth);

  // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
  client.focusRangeMS = times.hours(client.settings.focusHours).msecs;
  // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
  $('.focus-range li[data-hours=' + client.settings.focusHours + ']').addClass('selected');
  // @ts-expect-error TS(2339) FIXME: Property 'brushed' does not exist on type '{}'.
  client.brushed = brushed;
  // @ts-expect-error TS(2339) FIXME: Property 'formatTime' does not exist on type '{}'.
  client.formatTime = formatTime;
  // @ts-expect-error TS(2339) FIXME: Property 'dataUpdate' does not exist on type '{}'.
  client.dataUpdate = dataUpdate;

  // @ts-expect-error TS(2339) FIXME: Property 'careportal' does not exist on type '{}'.
  client.careportal = require('./careportal')(client, $);
  // @ts-expect-error TS(2339) FIXME: Property 'boluscalc' does not exist on type '{}'.
  client.boluscalc = require('./boluscalc')(client, $);

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var profile = require('../profilefunctions')(null, client.ctx);

  // @ts-expect-error TS(2339) FIXME: Property 'profilefunctions' does not exist on type... Remove this comment to see the full error message
  client.profilefunctions = profile;

  // @ts-expect-error TS(2339) FIXME: Property 'editMode' does not exist on type '{}'.
  client.editMode = false;

  //TODO: use the bus for updates and notifications
  //client.ctx.bus.on('tick', function timedReload (tick) {
  //  console.info('tick', tick.now);
  //});
  //broadcast 'tock' event each minute, start a new setTimeout each time it fires make it happen on the minute
  //see updateClock
  //start the bus after setting up listeners
  //client.ctx.bus.uptime( );

  // @ts-expect-error TS(2339) FIXME: Property 'dataExtent' does not exist on type '{}'.
  client.dataExtent = function dataExtent () {
    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    if (client.entries.length > 0) {
      // @ts-expect-error TS(2339) FIXME: Property 'entryToDate' does not exist on type '{}'... Remove this comment to see the full error message
      return [client.entryToDate(client.entries[0]), client.entryToDate(client.entries[client.entries.length - 1])];
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
      return [new Date(client.now - times.hours(history).msecs), new Date(client.now)];
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'bottomOfPills' does not exist on type '{... Remove this comment to see the full error message
  client.bottomOfPills = function bottomOfPills () {
    //the offset's might not exist for some tests
    var bottomOfPrimary = primary.offset() ? primary.offset().top + primary.height() : 0;
    var bottomOfMinorPills = minorPills.offset() ? minorPills.offset().top + minorPills.height() : 0;
    var bottomOfStatusPills = statusPills.offset() ? statusPills.offset().top + statusPills.height() : 0;
    return Math.max(bottomOfPrimary, bottomOfMinorPills, bottomOfStatusPills);
  };

  // @ts-expect-error TS(7006) FIXME: Parameter 'time' implicitly has an 'any' type.
  function formatTime (time, compact) {
    var timeFormat = getTimeFormat(false, compact);
    time = d3.timeFormat(timeFormat)(time);
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    if (client.settings.timeFormat !== 24) {
      time = time.toLowerCase();
    }
    return time;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'isForScale' implicitly has an 'any' typ... Remove this comment to see the full error message
  function getTimeFormat (isForScale, compact) {
    var timeFormat = FORMAT_TIME_12;
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    if (client.settings.timeFormat === 24) {
      timeFormat = isForScale ? FORMAT_TIME_24_SCALE : FORMAT_TIME_24;
    } else {
      timeFormat = isForScale ? FORMAT_TIME_12_SCALE : (compact ? FORMAT_TIME_12_COMPACT : FORMAT_TIME_12);
    }

    return timeFormat;
  }

  //TODO: replace with utils.scaleMgdl and/or utils.roundBGForDisplay
  // @ts-expect-error TS(7006) FIXME: Parameter 'bg' implicitly has an 'any' type.
  function scaleBg (bg) {
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    if (client.settings.units === 'mmol') {
      return units.mgdlToMMOL(bg);
    } else {
      return bg;
    }
  }

  function generateTitle () {
    // @ts-expect-error TS(7006) FIXME: Parameter 'value' implicitly has an 'any' type.
    function s (value, sep) { return value ? value + ' ' : sep || ''; }

    var title = '';

    // @ts-expect-error TS(2339) FIXME: Property 'timeago' does not exist on type '{}'.
    var status = client.timeago.checkStatus(client.sbx);

    if (status !== 'current') {
      // @ts-expect-error TS(2339) FIXME: Property 'timeago' does not exist on type '{}'.
      var ago = client.timeago.calcDisplay(client.sbx.lastSGVEntry(), client.sbx.time);
      // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
      title = s(ago.value) + s(ago.label, ' - ') + title;
    // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
    } else if (client.latestSGV) {
      // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
      var currentMgdl = client.latestSGV.mgdl;

      if (currentMgdl < 39) {
        // @ts-expect-error TS(2339) FIXME: Property 'errorcodes' does not exist on type '{}'.
        title = s(client.errorcodes.toDisplay(currentMgdl), ' - ') + title;
      } else {
        // @ts-expect-error TS(2339) FIXME: Property 'nowSBX' does not exist on type '{}'.
        var delta = client.nowSBX.properties.delta;
        if (delta) {
          var deltaDisplay = delta.display;
          // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
          title = s(scaleBg(currentMgdl)) + s(deltaDisplay) + s(client.direction.info(client.latestSGV).label) + title;
        }
      }
    }
    return title;
  }

  function resetCustomTitle () {
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    var customTitle = client.settings.customTitle || 'Nightscout';
    $('.customTitle').text(customTitle);
  }

  function checkAnnouncement () {
    var result = {
      // @ts-expect-error TS(7005) FIXME: Variable 'currentAnnouncement' implicitly has an '... Remove this comment to see the full error message
      inProgress: currentAnnouncement ? Date.now() - currentAnnouncement.received < times.mins(5).msecs : false
    };

    if (result.inProgress) {
      // @ts-expect-error TS(7005) FIXME: Variable 'currentAnnouncement' implicitly has an '... Remove this comment to see the full error message
      var message = currentAnnouncement.message.length > 1 ? currentAnnouncement.message : currentAnnouncement.title;
      // @ts-expect-error TS(2339) FIXME: Property 'message' does not exist on type '{ inPro... Remove this comment to see the full error message
      result.message = message;
      $('.customTitle').text(message);
    // @ts-expect-error TS(7005) FIXME: Variable 'currentAnnouncement' implicitly has an '... Remove this comment to see the full error message
    } else if (currentAnnouncement) {
      currentAnnouncement = null;
      console.info('cleared announcement');
    }

    return result;
  }

  function updateTitle () {

    var windowTitle;
    var announcementStatus = checkAnnouncement();

    // @ts-expect-error TS(7005) FIXME: Variable 'alarmMessage' implicitly has an 'any' ty... Remove this comment to see the full error message
    if (alarmMessage && alarmInProgress) {
      // @ts-expect-error TS(7005) FIXME: Variable 'alarmMessage' implicitly has an 'any' ty... Remove this comment to see the full error message
      $('.customTitle').text(alarmMessage);
      if (!isTimeAgoAlarmType()) {
        // @ts-expect-error TS(7005) FIXME: Variable 'alarmMessage' implicitly has an 'any' ty... Remove this comment to see the full error message
        windowTitle = alarmMessage + ': ' + generateTitle();
      }
    // @ts-expect-error TS(2339) FIXME: Property 'message' does not exist on type '{ inPro... Remove this comment to see the full error message
    } else if (announcementStatus.inProgress && announcementStatus.message) {
      // @ts-expect-error TS(2339) FIXME: Property 'message' does not exist on type '{ inPro... Remove this comment to see the full error message
      windowTitle = announcementStatus.message + ': ' + generateTitle();
    } else {
      resetCustomTitle();
    }

    container.toggleClass('announcing', announcementStatus.inProgress);

    $(document).attr('title', windowTitle || generateTitle());
  }

  // clears the current user brush and resets to the current real time data
  // @ts-expect-error TS(7006) FIXME: Parameter 'skipBrushing' implicitly has an 'any' t... Remove this comment to see the full error message
  function updateBrushToNow (skipBrushing) {

    // update brush and focus chart with recent data
    // @ts-expect-error TS(2339) FIXME: Property 'dataExtent' does not exist on type '{}'.
    var brushExtent = client.dataExtent();

    // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
    brushExtent[0] = new Date(brushExtent[1].getTime() - client.focusRangeMS);

    // console.log('updateBrushToNow(): Resetting brush: ', brushExtent);

    if (chart.theBrush) {
      chart.theBrush.call(chart.brush)
      chart.theBrush.call(chart.brush.move, brushExtent.map(chart.xScale2));
    }

    if (!skipBrushing) {
      brushed();
    }
  }

  function alarmingNow () {
    return container.hasClass('alarming');
  }

  function inRetroMode () {
    return chart && chart.inRetroMode();
  }

  function brushed () {
    // Brush not initialized
    if (!chart.theBrush) {
      return;
    }

    if (brushing) {
      return;
    }

    brushing = true;

    // default to most recent focus period
    // @ts-expect-error TS(2339) FIXME: Property 'dataExtent' does not exist on type '{}'.
    var brushExtent = client.dataExtent();
    // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
    brushExtent[0] = new Date(brushExtent[1].getTime() - client.focusRangeMS);

    var brushedRange = d3.brushSelection(chart.theBrush.node());

    // console.log("brushed(): coordinates: ", brushedRange);

    if (brushedRange) {
      brushExtent = brushedRange.map(chart.xScale2.invert);
    }

    // console.log('brushed(): Brushed to: ', brushExtent);

    // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
    if (!brushedRange || (brushExtent[1].getTime() - brushExtent[0].getTime() !== client.focusRangeMS)) {
      // ensure that brush updating is with the time range
      // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
      if (brushExtent[0].getTime() + client.focusRangeMS > client.dataExtent()[1].getTime()) {
        // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
        brushExtent[0] = new Date(brushExtent[1].getTime() - client.focusRangeMS);
      } else {
        // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
        brushExtent[1] = new Date(brushExtent[0].getTime() + client.focusRangeMS);
      }

      // console.log('brushed(): updating to: ', brushExtent);

      chart.theBrush.call(chart.brush.move, brushExtent.map(chart.xScale2));
    }

    // @ts-expect-error TS(7006) FIXME: Parameter 'value' implicitly has an 'any' type.
    function adjustCurrentSGVClasses (value, isCurrent) {
      var reallyCurrentAndNotAlarming = isCurrent && !inRetroMode() && !alarmingNow();

      bgStatus.toggleClass('current', alarmingNow() || reallyCurrentAndNotAlarming);
      if (!alarmingNow()) {
        container.removeClass('urgent warning inrange');
        if (reallyCurrentAndNotAlarming) {
          container.addClass(sgvToColoredRange(value));
        }
      }
      currentBG.toggleClass('icon-hourglass', value === 9);
      currentBG.toggleClass('error-code', value < 39);
      currentBG.toggleClass('bg-limit', value === 39 || value > 400);
    }

    // @ts-expect-error TS(7006) FIXME: Parameter 'entry' implicitly has an 'any' type.
    function updateCurrentSGV (entry) {
      var value = entry.mgdl
        // @ts-expect-error TS(2339) FIXME: Property 'timeago' does not exist on type '{}'.
        , isCurrent = 'current' === client.timeago.checkStatus(client.sbx);

      if (value === 9) {
        currentBG.text('');
      } else if (value < 39) {
        // @ts-expect-error TS(2339) FIXME: Property 'errorcodes' does not exist on type '{}'.
        currentBG.html(client.errorcodes.toDisplay(value));
      } else if (value < 40) {
        currentBG.text('LOW');
      } else if (value > 400) {
        currentBG.text('HIGH');
      } else {
        currentBG.text(scaleBg(value));
      }

      adjustCurrentSGVClasses(value, isCurrent);
    }

    // @ts-expect-error TS(7006) FIXME: Parameter 'retro' implicitly has an 'any' type.
    function mergeDeviceStatus (retro, ddata) {
      if (!retro) {
        return ddata;
      }

      // @ts-expect-error TS(7006) FIXME: Parameter 'x' implicitly has an 'any' type.
      var result = retro.map(x => Object.assign(x, ddata.find(y => y._id == x._id)));

      // @ts-expect-error TS(7006) FIXME: Parameter 'y' implicitly has an 'any' type.
      var missingInRetro = ddata.filter(y => !retro.find(x => x._id == y._id));

      result.push(...missingInRetro);

      return result;
    }

    // @ts-expect-error TS(7006) FIXME: Parameter 'time' implicitly has an 'any' type.
    function updatePlugins (time) {

      // @ts-expect-error TS(2339) FIXME: Property 'lastPluginUpdateTime' does not exist on ... Remove this comment to see the full error message
      if (time > client.lastPluginUpdateTime && time > client.dataLastUpdated) {
        // @ts-expect-error TS(2339) FIXME: Property 'lastPluginUpdateTime' does not exist on ... Remove this comment to see the full error message
        if ((time - client.lastPluginUpdateTime) < 1000) {
          return; // Don't update the plugins more than once a second
        }
        // @ts-expect-error TS(2339) FIXME: Property 'lastPluginUpdateTime' does not exist on ... Remove this comment to see the full error message
        client.lastPluginUpdateTime = time;
      }

      //TODO: doing a clone was slow, but ok to let plugins muck with data?
      //var ddata = client.ddata.clone();

      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      client.ddata.inRetroMode = inRetroMode();
      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      client.ddata.profile = profile;

      // retro data only ever contains device statuses
      // Cleate a clone of the data for the sandbox given to plugins

      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      var mergedStatuses = client.ddata.devicestatus;

      // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
      if (client.retro.data) {
        // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
        mergedStatuses = mergeDeviceStatus(client.retro.data.devicestatus, client.ddata.devicestatus);
      }

      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      var clonedData = _.clone(client.ddata);
      clonedData.devicestatus = mergedStatuses;

      // @ts-expect-error TS(2339) FIXME: Property 'sbx' does not exist on type '{}'.
      client.sbx = sandbox.clientInit(
        // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
        client.ctx
        , new Date(time).getTime() //make sure we send a timestamp
        , clonedData
      );

      //all enabled plugins get a chance to set properties, even if they aren't shown
      // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
      client.plugins.setProperties(client.sbx);

      //only shown plugins get a chance to update visualisations
      // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
      client.plugins.updateVisualisations(client.sbx);

      var viewMenu = $('#viewMenu');
      viewMenu.empty();

      // @ts-expect-error TS(2339) FIXME: Property 'sbx' does not exist on type '{}'.
      _.each(client.sbx.pluginBase.forecastInfos, function eachInfo (info) {
        var forecastOption = $('<li/>');
        var forecastLabel = $('<label/>');
        var forecastCheckbox = $('<input type="checkbox" data-forecast-type="' + info.type + '"/>');
        // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
        forecastCheckbox.prop('checked', client.settings.showForecast.indexOf(info.type) > -1);
        forecastOption.append(forecastLabel);
        forecastLabel.append(forecastCheckbox);
        forecastLabel.append('<span>Show ' + info.label + '</span>');
        // @ts-expect-error TS(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
        forecastCheckbox.change(function onChange (event) {
          var checkbox = $(event.target);
          var type = checkbox.attr('data-forecast-type');
          var checked = checkbox.prop('checked');
          if (checked) {
            // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
            client.settings.showForecast += ' ' + type;
          } else {
            // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
            client.settings.showForecast = _.chain(client.settings.showForecast.split(' '))
              // @ts-expect-error TS(7006) FIXME: Parameter 'forecast' implicitly has an 'any' type.
              .filter(function(forecast) { return forecast !== type; })
              .value()
              .join(' ');
          }
          // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
          Storages.localStorage.set('showForecast', client.settings.showForecast);
          refreshChart(true);
        });
        viewMenu.append(forecastOption);
      });

      //send data to boluscalc too
      // @ts-expect-error TS(2339) FIXME: Property 'boluscalc' does not exist on type '{}'.
      client.boluscalc.updateVisualisations(client.sbx);
    }

    function clearCurrentSGV () {
      currentBG.text('---');
      container.removeClass('alarming urgent warning inrange');
    }

    var nowDate = null;
    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    var nowData = client.entries.filter(function(d) {
      return d.type === 'sgv' && d.mills <= brushExtent[1].getTime();
    });
    var focusPoint = _.last(nowData);

    function updateHeader () {
      if (inRetroMode()) {
        nowDate = brushExtent[1];
        $('#currentTime')
          .text(formatTime(nowDate, true))
          .css('text-decoration', 'line-through');
      } else {
        // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
        nowDate = new Date(client.now);
        updateClockDisplay();
      }

      if (focusPoint) {
        if (brushExtent[1].getTime() - focusPoint.mills > times.mins(15).msecs) {
          clearCurrentSGV();
        } else {
          updateCurrentSGV(focusPoint);
        }
        updatePlugins(nowDate.getTime());
      } else {
        clearCurrentSGV();
        updatePlugins(nowDate);
      }
    }

    updateHeader();
    updateTimeAgo();
    if (chart.prevChartHeight) {
      chart.scroll(nowDate);
    }

    // @ts-expect-error TS(2339) FIXME: Property 'bottomOfPills' does not exist on type '{... Remove this comment to see the full error message
    var top = (client.bottomOfPills() + 5);
    $('#chartContainer').css({ top: top + 'px', height: $(window).height() - top - 10 });
    container.removeClass('loading');

    brushing = false;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'sgv' implicitly has an 'any' type.
  function sgvToColor (sgv) {
    var color = 'grey';

    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    if (client.settings.theme !== 'default') {
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      if (sgv > client.settings.thresholds.bgHigh) {
        color = 'red';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv > client.settings.thresholds.bgTargetTop) {
        color = 'yellow';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv >= client.settings.thresholds.bgTargetBottom && sgv <= client.settings.thresholds.bgTargetTop && client.settings.theme === 'colors') {
        color = '#4cff00';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv < client.settings.thresholds.bgLow) {
        color = 'red';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv < client.settings.thresholds.bgTargetBottom) {
        color = 'yellow';
      }
    }

    return color;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'sgv' implicitly has an 'any' type.
  function sgvToColoredRange (sgv) {
    var range = '';

    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    if (client.settings.theme !== 'default') {
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      if (sgv > client.settings.thresholds.bgHigh) {
        range = 'urgent';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv > client.settings.thresholds.bgTargetTop) {
        range = 'warning';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv >= client.settings.thresholds.bgTargetBottom && sgv <= client.settings.thresholds.bgTargetTop && client.settings.theme === 'colors') {
        range = 'inrange';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv < client.settings.thresholds.bgLow) {
        range = 'urgent';
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      } else if (sgv < client.settings.thresholds.bgTargetBottom) {
        range = 'warning';
      }
    }

    return range;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  function formatAlarmMessage (notify) {
    var announcementMessage = notify && notify.isAnnouncement && notify.message && notify.message.length > 1;

    if (announcementMessage) {
      // @ts-expect-error TS(2339) FIXME: Property 'toDisplay' does not exist on type '{ URG... Remove this comment to see the full error message
      return levels.toDisplay(notify.level) + ': ' + notify.message;
    } else if (notify) {
      return notify.title;
    }
    return null;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  function setAlarmMessage (notify) {
    alarmMessage = formatAlarmMessage(notify);
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'file' implicitly has an 'any' type.
  function generateAlarm (file, notify) {
    alarmInProgress = true;

    currentNotify = notify;
    setAlarmMessage(notify);
    var selector = '.audio.alarms audio.' + file;

    if (!alarmingNow()) {
      d3.select(selector).each(function() {
        // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        var audio = this;
        playAlarm(audio);
        // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
        $(this).addClass('playing');
      });

      console.log('Asking plugins to visualize alarms');
      // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
      client.plugins.visualizeAlarm(client.sbx, notify, alarmMessage);
    }

    container.addClass('alarming').addClass(file === urgentAlarmSound ? 'urgent' : 'warning');

    var silenceBtn = $('#silenceBtn');
    silenceBtn.empty();

    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    _.each(client.settings.snoozeMinsForAlarmEvent(notify), function eachOption (mins) {
      // @ts-expect-error TS(2339) FIXME: Property 'translate' does not exist on type '{}'.
      var snoozeOption = $('<li><a data-snooze-time="' + times.mins(mins).msecs + '">' + client.translate('Silence for %1 minutes', { params: [mins] }) + '</a></li>');
      snoozeOption.click(snoozeAlarm);
      silenceBtn.append(snoozeOption);
    });

    updateTitle();
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
  function snoozeAlarm (event) {
    // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
    stopAlarm(true, $(event.target).data('snooze-time'));
    event.preventDefault();
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'audio' implicitly has an 'any' type.
  function playAlarm (audio) {
    // ?mute=true disables alarms to testers.
    // @ts-expect-error TS(2339) FIXME: Property 'browserUtils' does not exist on type '{}... Remove this comment to see the full error message
    if (client.browserUtils.queryParms().mute !== 'true') {
      audio.play();
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'browserUtils' does not exist on type '{}... Remove this comment to see the full error message
      client.browserUtils.showNotification('Alarm was muted (?mute=true)');
    }
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'isClient' implicitly has an 'any' type.
  function stopAlarm (isClient, silenceTime, notify) {
    alarmInProgress = false;
    alarmMessage = null;
    container.removeClass('urgent warning');
    d3.selectAll('audio.playing').each(function() {
      // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      var audio = this;
      audio.pause();
      // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      $(this).removeClass('playing');
    });

    // @ts-expect-error TS(2339) FIXME: Property 'browserUtils' does not exist on type '{}... Remove this comment to see the full error message
    client.browserUtils.closeNotification();
    container.removeClass('alarming');

    updateTitle();

    silenceTime = silenceTime || times.mins(5).msecs;

    var alarm = null;

    if (notify) {
      if (notify.level) {
        alarm = getClientAlarm(notify.level, notify.group);
      } else if (notify.group) {
        // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
        alarm = getClientAlarm(currentNotify.level, notify.group);
      } else {
        // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
        alarm = getClientAlarm(currentNotify.level, currentNotify.group);
      }
    // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
    } else if (currentNotify) {
      // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
      alarm = getClientAlarm(currentNotify.level, currentNotify.group);
    }

    if (alarm) {
      alarm.lastAckTime = Date.now();
      alarm.silenceTime = silenceTime;
      if (alarm.group === 'Time Ago') {
        container.removeClass('alarming-timeago');
      }
    } else {
      // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
      console.info('No alarm to ack for', notify || currentNotify);
    }

    // only emit ack if client invoke by button press
    // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
    if (isClient && currentNotify) {
      // @ts-expect-error TS(7005) FIXME: Variable 'alarmSocket' implicitly has an 'any' typ... Remove this comment to see the full error message
      alarmSocket.emit('ack', currentNotify.level, currentNotify.group, silenceTime);
    }

    currentNotify = null;

    brushed();
  }

  function refreshAuthIfNeeded () {
    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    var clientToken = client.authorized ? client.authorized.token : null;
    // @ts-expect-error TS(2339) FIXME: Property 'browserUtils' does not exist on type '{}... Remove this comment to see the full error message
    var token = client.browserUtils.queryParms().token || clientToken;
    // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
    if (token && client.authorized) {
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      var renewTime = (client.authorized.exp * 1000) - times.mins(15).msecs - Math.abs((client.authorized.iat * 1000) - client.authorized.lat);
      // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
      var refreshIn = Math.round((renewTime - client.now) / 1000);
      // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
      if (client.now > renewTime) {
        console.info('Refreshing authorization renewal');
        $.ajax('/api/v2/authorization/request/' + token, {
          // @ts-expect-error TS(7006) FIXME: Parameter 'authorized' implicitly has an 'any' typ... Remove this comment to see the full error message
          success: function(authorized) {
            if (authorized) {
              console.info('Got new authorization', authorized);
              // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
              authorized.lat = client.now;
              // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
              client.authorized = authorized;
            }
          }
        });
      } else if (refreshIn < times.mins(5).secs) {
        console.info('authorization refresh in ' + refreshIn + 's');
      }
    }
  }

  function updateClock () {
    updateClockDisplay();
    // Update at least every 15 seconds
    var interval = Math.min(15 * 1000, (60 - (new Date()).getSeconds()) * 1000 + 5);
    setTimeout(updateClock, interval);

    updateTimeAgo();
    if (chart) {
      brushed();
    }

    // Dim the screen by reducing the opacity when at nighttime
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    if (client.settings.nightMode) {
      var dateTime = new Date();
      if (opacity.current !== opacity.NIGHT && (dateTime.getHours() > 21 || dateTime.getHours() < 7)) {
        $('body').css({ 'opacity': opacity.NIGHT });
      } else {
        $('body').css({ 'opacity': opacity.DAY });
      }
    }
    refreshAuthIfNeeded();
    // @ts-expect-error TS(2339) FIXME: Property 'resetRetroIfNeeded' does not exist on ty... Remove this comment to see the full error message
    if (client.resetRetroIfNeeded) {
      // @ts-expect-error TS(2339) FIXME: Property 'resetRetroIfNeeded' does not exist on ty... Remove this comment to see the full error message
      client.resetRetroIfNeeded();
    }
  }

  function updateClockDisplay () {
    if (inRetroMode()) {
      return;
    }
    // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
    client.now = Date.now();
    // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
    $('#currentTime').text(formatTime(new Date(client.now), true)).css('text-decoration', '');
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'level' implicitly has an 'any' type.
  function getClientAlarm (level, group) {
    var key = level + '-' + group;
    var alarm = null;
    // validate the key before getting the alarm
    if (Object.prototype.hasOwnProperty.call(clientAlarms, key)) {
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      alarm = clientAlarms[key];
    }
    if (!alarm) {
      alarm = { level: level, group: group };
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      clientAlarms[key] = alarm;
    }
    return alarm;
  }

  function isTimeAgoAlarmType () {
    // @ts-expect-error TS(7005) FIXME: Variable 'currentNotify' implicitly has an 'any' t... Remove this comment to see the full error message
    return currentNotify && currentNotify.group === 'Time Ago';
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'status' implicitly has an 'any' type.
  function isStale (status) {
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    return client.settings.alarmTimeagoWarn && status === 'warn' ||
      // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
      client.settings.alarmTimeagoUrgent && status === 'urgent';
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'alarm' implicitly has an 'any' type.
  function notAcked (alarm) {
    return Date.now() >= (alarm.lastAckTime || 0) + (alarm.silenceTime || 0);
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'status' implicitly has an 'any' type.
  function checkTimeAgoAlarm (status) {
    var level = status === 'urgent' ? levels.URGENT : levels.WARN;
    var alarm = getClientAlarm(level, 'Time Ago');

    if (isStale(status) && notAcked(alarm)) {
      console.info('generating timeAgoAlarm', alarm);
      container.addClass('alarming-timeago');
      // @ts-expect-error TS(2339) FIXME: Property 'timeago' does not exist on type '{}'.
      var display = client.timeago.calcDisplay(client.sbx.lastSGVEntry(), client.sbx.time);
      // @ts-expect-error TS(2339) FIXME: Property 'translate' does not exist on type '{}'.
      var translate = client.translate;
      var notify = {
        title: translate('Last data received') + ' ' + display.value + ' ' + translate(display.label)
        , level: status === 'urgent' ? 2 : 1
        , group: 'Time Ago'
      };
      var sound = status === 'warn' ? alarmSound : urgentAlarmSound;
      generateAlarm(sound, notify);
    }

    container.toggleClass('alarming-timeago', status !== 'current');

    if (status === 'warn') {
      container.addClass('warn');
    } else if (status === 'urgent') {
      container.addClass('urgent');
    }

    if (alarmingNow() && status === 'current' && isTimeAgoAlarmType()) {
      // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
      stopAlarm(true, times.min().msecs);
    }
  }

  function updateTimeAgo () {
    // @ts-expect-error TS(2339) FIXME: Property 'timeago' does not exist on type '{}'.
    var status = client.timeago.checkStatus(client.sbx);
    if (status !== 'current') {
      updateTitle();
    }
    checkTimeAgoAlarm(status);
  }

  function updateTimeAgoSoon () {
    setTimeout(function updatingTimeAgoNow () {
      updateTimeAgo();
    }, times.secs(10).msecs);
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'updateToNow' implicitly has an 'any' ty... Remove this comment to see the full error message
  function refreshChart (updateToNow) {
    if (updateToNow) {
      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
      updateBrushToNow();
    }
    chart.update(false);
  }

  (function watchVisibility () {
    // Set the name of the hidden property and the change event for visibility
    // @ts-expect-error TS(7034) FIXME: Variable 'hidden' implicitly has type 'any' in som... Remove this comment to see the full error message
    var hidden, visibilityChange;
    if (typeof document.hidden !== 'undefined') {
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    // @ts-expect-error TS(2339) FIXME: Property 'mozHidden' does not exist on type 'Docum... Remove this comment to see the full error message
    } else if (typeof document.mozHidden !== 'undefined') {
      hidden = 'mozHidden';
      visibilityChange = 'mozvisibilitychange';
    // @ts-expect-error TS(2551) FIXME: Property 'msHidden' does not exist on type 'Docume... Remove this comment to see the full error message
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    // @ts-expect-error TS(2339) FIXME: Property 'webkitHidden' does not exist on type 'Do... Remove this comment to see the full error message
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    // @ts-expect-error TS(2769) FIXME: No overload matches this call.
    document.addEventListener(visibilityChange, function visibilityChanged () {
      // @ts-expect-error TS(2339) FIXME: Property 'documentHidden' does not exist on type '... Remove this comment to see the full error message
      var prevHidden = client.documentHidden;
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      // @ts-expect-error TS(2339) FIXME: Property 'documentHidden' does not exist on type '... Remove this comment to see the full error message
      client.documentHidden = document[hidden];

      // @ts-expect-error TS(2339) FIXME: Property 'documentHidden' does not exist on type '... Remove this comment to see the full error message
      if (prevHidden && !client.documentHidden) {
        console.info('Document now visible, updating - ' + new Date());
        refreshChart(true);
      }
    });
  })();

  window.onresize = refreshChart;

  updateClock();
  updateTimeAgoSoon();

  // @ts-expect-error TS(7006) FIXME: Parameter 'el' implicitly has an 'any' type.
  function Dropdown (el) {
    // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.ddmenuitem = 0;

    // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    this.$el = $(el);
    // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    var that = this;

    $(document).click(function() { that.close(); });
  }
  Dropdown.prototype.close = function() {
    if (this.ddmenuitem) {
      this.ddmenuitem.css('visibility', 'hidden');
      this.ddmenuitem = 0;
    }
  };
  // @ts-expect-error TS(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
  Dropdown.prototype.open = function(e) {
    this.close();
    this.ddmenuitem = $(this.$el).css('visibility', 'visible');
    e.stopPropagation();
  };

  // @ts-expect-error TS(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
  var silenceDropdown = new Dropdown('#silenceBtn');
  // @ts-expect-error TS(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
  var viewDropdown = new Dropdown('#viewMenu');

  // @ts-expect-error TS(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
  $('.bgButton').click(function(e) {
    if (alarmingNow()) {
      /* eslint-disable-next-line security/detect-non-literal-fs-filename */ // verified false positive
      silenceDropdown.open(e);
    }
  });

  // @ts-expect-error TS(7006) FIXME: Parameter 'e' implicitly has an 'any' type.
  $('.focus-range li').click(function(e) {
    var li = $(e.target);
    if (li.attr('data-hours')) {
      $('.focus-range li').removeClass('selected');
      li.addClass('selected');
      var hours = Number(li.data('hours'));
      // @ts-expect-error TS(2339) FIXME: Property 'focusRangeMS' does not exist on type '{}... Remove this comment to see the full error message
      client.focusRangeMS = times.hours(hours).msecs;
      Storages.localStorage.set('focusHours', hours);
      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
      refreshChart();
    } else {
      /* eslint-disable-next-line security/detect-non-literal-fs-filename */ // verified false positive
      viewDropdown.open(e);
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Client-side code to connect to server and handle incoming data
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /* global io */
  // @ts-expect-error TS(2339) FIXME: Property 'socket' does not exist on type '{}'.
  client.socket = socket = io.connect({ transports: ["polling"] });
  // @ts-expect-error TS(2339) FIXME: Property 'alarmSocket' does not exist on type '{}'... Remove this comment to see the full error message
  client.alarmSocket = alarmSocket = io.connect("/alarm", { multiplex: true, transports: ["polling"] });

  socket.on('dataUpdate', dataUpdate);

  function resetRetro () {
    // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
    client.retro = {
      loadedMills: 0
      , loadStartedMills: 0
    };
  }

  // @ts-expect-error TS(2339) FIXME: Property 'resetRetroIfNeeded' does not exist on ty... Remove this comment to see the full error message
  client.resetRetroIfNeeded = function resetRetroIfNeeded () {
    // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
    if (client.retro.loadedMills > 0 && Date.now() - client.retro.loadedMills > times.mins(5).msecs) {
      resetRetro();
      console.info('Cleared retro data to free memory');
    }
  };

  resetRetro();

  // @ts-expect-error TS(2339) FIXME: Property 'loadRetroIfNeeded' does not exist on typ... Remove this comment to see the full error message
  client.loadRetroIfNeeded = function loadRetroIfNeeded () {
    var now = Date.now();
    // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
    if (now - client.retro.loadStartedMills < times.secs(30).msecs) {
      // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
      console.info('retro already loading, started', new Date(client.retro.loadStartedMills));
      return;
    }

    // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
    if (now - client.retro.loadedMills > times.mins(3).msecs) {
      // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
      client.retro.loadStartedMills = now;
      // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
      console.info('retro not fresh load started', new Date(client.retro.loadStartedMills));
      socket.emit('loadRetro', {
        // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
        loadedMills: client.retro.loadedMills
      });
    }
  };

  // @ts-expect-error TS(7006) FIXME: Parameter 'retroData' implicitly has an 'any' type... Remove this comment to see the full error message
  socket.on('retroUpdate', function retroUpdate (retroData) {
    // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
    console.info('got retroUpdate', retroData, new Date(client.now));
    // @ts-expect-error TS(2339) FIXME: Property 'retro' does not exist on type '{}'.
    client.retro = {
      loadedMills: Date.now()
      , loadStartedMills: 0
      , data: retroData
    };
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Alarms and Text handling
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // @ts-expect-error TS(2339) FIXME: Property 'authorizeSocket' does not exist on type ... Remove this comment to see the full error message
  client.authorizeSocket = function authorizeSocket () {

    console.log('Authorizing socket');
    var auth_data = {
      client: 'web'
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      , secret: client.authorized && client.authorized.token ? null : client.hashauth.hash()
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      , token: client.authorized && client.authorized.token
      , history: history
    };

    socket.emit(
      'authorize'
      , auth_data
      // @ts-expect-error TS(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
      , function authCallback (data) {
        if (!data) {
          console.log('Crashed!');
          // @ts-expect-error TS(2339) FIXME: Property 'crashed' does not exist on type '{}'.
          client.crashed();
        }

        if (!data.read || !hasRequiredPermission()) {
          // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
          client.hashauth.requestAuthentication(function afterRequest () {
            // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
            client.hashauth.updateSocketAuth();
            if (callback) {
              callback();
            }
          });
        } else if (callback) {
          callback();
        }
      }
    );
  }

  socket.on('connect', function() {
    console.log('Client connected to server.');
    // @ts-expect-error TS(2339) FIXME: Property 'authorizeSocket' does not exist on type ... Remove this comment to see the full error message
    client.authorizeSocket();
  });

  // @ts-expect-error TS(2339) FIXME: Property 'subscribeForAlarms' does not exist on ty... Remove this comment to see the full error message
  client.subscribeForAlarms = function subscribeForAlarms () {

    var auth_data = {
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      secret: client.authorized && client.authorized.token ? null : client.hashauth.hash()
      // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
      , jwtToken: client.authorized && client.authorized.token
    };

    // @ts-expect-error TS(7005) FIXME: Variable 'alarmSocket' implicitly has an 'any' typ... Remove this comment to see the full error message
    alarmSocket.emit(
      'subscribe'
      , auth_data
      // @ts-expect-error TS(7006) FIXME: Parameter 'data' implicitly has an 'any' type.
      , function subscribeCallback (data) {
        if (!data) {
          console.log('Crashed!');
          // @ts-expect-error TS(2339) FIXME: Property 'crashed' does not exist on type '{}'.
          client.crashed();
        }

        console.log('Subscribed for alarms', data);
        // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
        var shouldAuthenticationPromptOnLoad = client.settings.authenticationPromptOnLoad ;
        if (!data.success) {
          if (!data.read || !hasRequiredPermission() || shouldAuthenticationPromptOnLoad) {
            // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
            return client.hashauth.requestAuthentication(function afterRequest () {
              // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
              return client.hashauth.updateSocketAuth();
            });
          }
        }
      }
    );
  }

  alarmSocket.on('connect', function() {
    // @ts-expect-error TS(2339) FIXME: Property 'subscribeForAlarms' does not exist on ty... Remove this comment to see the full error message
    client.subscribeForAlarms();
  });

  function hasRequiredPermission () {
    // @ts-expect-error TS(2339) FIXME: Property 'requiredPermission' does not exist on ty... Remove this comment to see the full error message
    if (client.requiredPermission) {
      // @ts-expect-error TS(2339) FIXME: Property 'hashauth' does not exist on type '{}'.
      if (client.hashauth && client.hashauth.isAuthenticated()) {
        return true;
      } else {
        // @ts-expect-error TS(2339) FIXME: Property 'authorized' does not exist on type '{}'.
        return client.authorized && client.authorized.check(client.requiredPermission);
      }
    } else {
      return true;
    }
  }

  //with predicted alarms, latestSGV may still be in target so to see if the alarm
  //  is for a HIGH we can only check if it's >= the bottom of the target
  function isAlarmForHigh () {
    // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
    return client.latestSGV && client.latestSGV.mgdl >= client.settings.thresholds.bgTargetBottom;
  }

  //with predicted alarms, latestSGV may still be in target so to see if the alarm
  //  is for a LOW we can only check if it's <= the top of the target
  function isAlarmForLow () {
    // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
    return client.latestSGV && client.latestSGV.mgdl <= client.settings.thresholds.bgTargetTop;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  alarmSocket.on('notification', function(notify) {
    console.log('notification from server:', notify);
    // @ts-expect-error TS(7005) FIXME: Variable 'previousNotifyTimestamp' implicitly has ... Remove this comment to see the full error message
    if (notify.timestamp && previousNotifyTimestamp !== notify.timestamp) {
      previousNotifyTimestamp = notify.timestamp;
      // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
      client.plugins.visualizeAlarm(client.sbx, notify, notify.title + ' ' + notify.message);
    } else {
      console.log('No timestamp found for notify, not passing to plugins');
    }
  });

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  alarmSocket.on('announcement', function(notify) {
    console.info('announcement received from server');
    currentAnnouncement = notify;
    currentAnnouncement.received = Date.now();
    updateTitle();
  });

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  alarmSocket.on('alarm', function(notify) {
    console.info('alarm received from server');
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    var enabled = (isAlarmForHigh() && client.settings.alarmHigh) || (isAlarmForLow() && client.settings.alarmLow);
    if (enabled) {
      console.log('Alarm raised!');
      generateAlarm(alarmSound, notify);
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
      console.info('alarm was disabled locally', client.latestSGV.mgdl, client.settings);
    }
    chart.update(false);
  });

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  alarmSocket.on('urgent_alarm', function(notify) {
    console.info('urgent alarm received from server');
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    var enabled = (isAlarmForHigh() && client.settings.alarmUrgentHigh) || (isAlarmForLow() && client.settings.alarmUrgentLow);
    if (enabled) {
      console.log('Urgent alarm raised!');
      generateAlarm(urgentAlarmSound, notify);
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
      console.info('urgent alarm was disabled locally', client.latestSGV.mgdl, client.settings);
    }
    chart.update(false);
  });

  // @ts-expect-error TS(7006) FIXME: Parameter 'notify' implicitly has an 'any' type.
  alarmSocket.on('clear_alarm', function(notify) {
    if (alarmInProgress) {
      console.log('clearing alarm');
      stopAlarm(false, null, notify);
    }
  });
  /*
  *
  // TODO: When an unauthorized client attempts to silence an alarm, we should
  // allow silencing locally, request for authorization, and if the
  // authorization succeeds even republish the ACK notification. something like...
  alarmSocket.on('authorization_needed', function(details) {
    if (alarmInProgress) {
      console.log('clearing alarm');
      stopAlarm(true, details.silenceTime, currentNotify);
    }
    client.hashauth.requestAuthentication(function afterRequest () {
      console.log("SUCCESSFULLY AUTHORIZED, REPUBLISHED ACK?");
      // easiest way to update permission set on server side is to send another message.
      alarmSocket.emit('resubscribe', currentNotify, details);

      if (isClient && currentNotify) {
        alarmSocket.emit('ack', currentNotify.level, currentNotify.group, details.silenceTime);
      }
    });
  });

  */

  // @ts-expect-error TS(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
  $('#testAlarms').click(function(event) {

    // Speech synthesis also requires on iOS that user triggers a speech event for it to speak anything
    // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
    if (client.plugins('speech').isEnabled) {
      var msg = new SpeechSynthesisUtterance('Ok ok.');
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }

    d3.selectAll('.audio.alarms audio').each(function() {
      // @ts-expect-error TS(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
      var audio = this;
      playAlarm(audio);
      setTimeout(function() {
        audio.pause();
      }, 4000);
    });
    event.preventDefault();
  });

  if (serverSettings) {
    $('.appName').text(serverSettings.name);
    $('.version').text(serverSettings.version);
    $('.head').text(serverSettings.head);
    if (serverSettings.apiEnabled) {
      $('.serverSettings').show();
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'updateAdminMenu' does not exist on type ... Remove this comment to see the full error message
  client.updateAdminMenu = function updateAdminMenu() {
    // hide food control if not enabled
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    $('.foodcontrol').toggle(client.settings.enable.indexOf('food') > -1);
    // hide cob control if not enabled
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    $('.cobcontrol').toggle(client.settings.enable.indexOf('cob') > -1);
}

  // @ts-expect-error TS(2339) FIXME: Property 'updateAdminMenu' does not exist on type ... Remove this comment to see the full error message
  client.updateAdminMenu();

  // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
  container.toggleClass('has-minor-pills', client.plugins.hasShownType('pill-minor', client.settings));

  function prepareEntries () {
    // Post processing after data is in
    var temp1 = [];
    // @ts-expect-error TS(2339) FIXME: Property 'sbx' does not exist on type '{}'.
    var sbx = client.sbx.withExtendedSettings(client.rawbg);

    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    if (client.ddata.cal && client.rawbg.isEnabled(sbx)) {
      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      temp1 = client.ddata.sgvs.map(function(entry) {
        // @ts-expect-error TS(2339) FIXME: Property 'rawbg' does not exist on type '{}'.
        var rawbgValue = client.rawbg.showRawBGs(entry.mgdl, entry.noise, client.ddata.cal, sbx) ? client.rawbg.calc(entry, client.ddata.cal, sbx) : 0;
        if (rawbgValue > 0) {
          return { mills: entry.mills - 2000, mgdl: rawbgValue, color: 'white', type: 'rawbg' };
        } else {
          return null;
        }
      // @ts-expect-error TS(7006) FIXME: Parameter 'entry' implicitly has an 'any' type.
      }).filter(function(entry) {
        return entry !== null;
      });
    }
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    var temp2 = client.ddata.sgvs.map(function(obj) {
      return { mills: obj.mills, mgdl: obj.mgdl, direction: obj.direction, color: sgvToColor(obj.mgdl), type: 'sgv', noise: obj.noise, filtered: obj.filtered, unfiltered: obj.unfiltered };
    });
    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    client.entries = [];
    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    client.entries = client.entries.concat(temp1, temp2);

    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    client.entries = client.entries.concat(client.ddata.mbgs.map(function(obj) {
      return { mills: obj.mills, mgdl: obj.mgdl, color: 'red', type: 'mbg', device: obj.device };
    }));

    // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
    var tooOld = client.now - times.hours(48).msecs;
    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    client.entries = _.filter(client.entries, function notTooOld (entry) {
      return entry.mills > tooOld;
    });

    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    client.entries.forEach(function(point) {
      if (point.mgdl < 39) {
        point.color = 'transparent';
      }
    });

    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    client.entries.sort(function sorter (a: any, b) {
      return a.mills - b.mills;
    });
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'received' implicitly has an 'any' type.
  function dataUpdate (received, headless) {
    // @ts-expect-error TS(2339) FIXME: Property 'now' does not exist on type '{}'.
    console.info('got dataUpdate', new Date(client.now));

    var lastUpdated = Date.now();
    // @ts-expect-error TS(2339) FIXME: Property 'dataLastUpdated' does not exist on type ... Remove this comment to see the full error message
    client.dataLastUpdated = lastUpdated;

    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    receiveDData(received, client.ddata, client.settings);

    // Resend new treatments to profile
    // @ts-expect-error TS(2339) FIXME: Property 'profilefunctions' does not exist on type... Remove this comment to see the full error message
    client.profilefunctions.updateTreatments(client.ddata.profileTreatments, client.ddata.tempbasalTreatments, client.ddata.combobolusTreatments);

    if (received.profiles) {
      profile.loadData(received.profiles);
    }

    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    if (client.ddata.sgvs) {
      // TODO change the next line so that it uses the prediction if the signal gets lost (max 1/2 hr)
      // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
      client.ctx.data.lastUpdated = lastUpdated;
      // @ts-expect-error TS(2339) FIXME: Property 'latestSGV' does not exist on type '{}'.
      client.latestSGV = client.ddata.sgvs[client.ddata.sgvs.length - 1];
    }

    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    client.ddata.inRetroMode = false;
    // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
    client.ddata.profile = profile;

    // @ts-expect-error TS(2339) FIXME: Property 'nowSBX' does not exist on type '{}'.
    client.nowSBX = sandbox.clientInit(
      // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
      client.ctx
      , lastUpdated
      // @ts-expect-error TS(2339) FIXME: Property 'ddata' does not exist on type '{}'.
      , client.ddata
    );

    //all enabled plugins get a chance to set properties, even if they aren't shown
    // @ts-expect-error TS(2339) FIXME: Property 'plugins' does not exist on type '{}'.
    client.plugins.setProperties(client.nowSBX);

    prepareEntries();
    updateTitle();

    // Don't invoke D3 in headless mode

    if (headless) return;

    if (!isInitialData) {
      isInitialData = true;
      // @ts-expect-error TS(2339) FIXME: Property 'chart' does not exist on type '{}'.
      chart = client.chart = require('./chart')(client, d3, $);
      chart.update(true);
      brushed();
      chart.update(false);
    } else if (!inRetroMode()) {
      brushed();
      chart.update(false);
    } else {
      chart.updateContext();
    }
  }
};

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = client;
