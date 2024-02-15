'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');
const UPDATE_THROTTLE = 5000;

function boot (env: any, language: any) {

  function startBoot(ctx: any, next: any) {

    console.log('Executing startBoot');

    ctx.bootErrors = [ ];
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.moment = require('moment-timezone');
    ctx.runtimeState = 'booting';
    ctx.settings = env.settings;
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.bus = require('../bus')(env.settings, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.adminnotifies = require('../adminnotifies')(ctx);
    if (env.notifies) {
      for (var i = 0; i < env.notifies.length; i++) {
        ctx.adminnotifies.addNotify(env.notifies[i]);
      }
    }
    next();
  }

  //////////////////////////////////////////////////
  // Check Node version.
  // Latest Node LTS releases are recommended and supported.
  // Current Node releases MAY work, but are not recommended. Will be tested in CI
  // Older Node versions or Node versions with known security issues will not work.
  ///////////////////////////////////////////////////
  function checkNodeVersion (ctx: any, next: any) {

    console.log('Executing checkNodeVersion');

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var semver = require('semver');
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    var nodeVersion = process.version;

    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const isLTS = process.release.lts ? true : false;

    if (isLTS && (semver.satisfies(nodeVersion, '^20.0.0') || semver.satisfies(nodeVersion, '^18.0.0') || semver.satisfies(nodeVersion, '^16.0.0') || semver.satisfies(nodeVersion, '^14.0.0'))) {
      //Latest Node 14 LTS and Node 16 LTS are recommended and supported.
      //Require at least Node 14 without known security issues
      console.debug('Node LTS version ' + nodeVersion + ' is supported');
      next();
      return;
    }

    console.log( 'ERROR: Node version ' + nodeVersion + ' is not supported. Please use a secure LTS version or upgrade your Node');
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);

  }

  function checkEnv (ctx: any, next: any) {

    console.log('Executing checkEnv');

    ctx.language = language;
    if (env.err.length > 0) {
      ctx.bootErrors = ctx.bootErrors || [ ];
      ctx.bootErrors.push({'desc': 'ENV Error', err: env.err});
    }
    next();
  }

  function hasBootErrors(ctx: any) {
    return ctx.bootErrors && ctx.bootErrors.length > 0;
  }

  function augmentSettings (ctx: any, next: any) {

    console.log('Executing augmentSettings');

    var configURL = env.IMPORT_CONFIG || null;
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var url = require('url');
    var href: any = null;

    if (configURL) {
      try {
        href = url.parse(configURL).href;
      } catch (e) {
        console.error('Parsing config URL from IMPORT_CONFIG failed');
      }
    }

    if(configURL && href) {
      var axios_default = { headers: { 'Accept': 'application/json' } };
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      var axios = require('axios').create(axios_default);
      console.log('Getting settings from', href);
      return axios.get(href).then(function (resp: any) {
        var body = resp.data;
        var settings = body.settings || body;
        console.log('extending settings with', settings);
        _.merge(env.settings, settings);
        if (body.extendedSettings) {
          console.log('extending extendedSettings with', body.extendedSettings);
          _.merge(env.extendedSettings, body.extendedSettings);
        }
        next( );
      }).catch(function (err: any) {
        var synopsis = ['Attempt to fetch config', href, 'failed.'];
        console.log('Attempt to fetch config', href, 'failed.', err.response);
        ctx.bootErrors.push({desc: synopsis.join(' '), err});
        next( );

      });
    } else {
      next( );
    }
  }

  function checkSettings (ctx: any, next: any) {

    console.log('Executing checkSettings');

    ctx.bootErrors = ctx.bootErrors || [];

    console.log('Checking settings');

    if (!env.storageURI) {
      ctx.bootErrors.push({'desc': 'Mandatory setting missing',
      err: 'MONGODB_URI setting is missing, cannot connect to database'});
    }

    if (!env.enclave.isApiKeySet()) {
      ctx.bootErrors.push({'desc': 'Mandatory setting missing',
      err: 'API_SECRET setting is missing, cannot enable REST API'});
    }

    if (env.settings.authDefaultRoles == 'readable') {
      const message = {
        title: "Nightscout readable by world"
        ,message: "Your Nightscout installation is readable by anyone who knows the web page URL. Please consider closing access to the site by following the instructions in the <a href=\"http://nightscout.github.io/nightscout/security/#how-to-turn-off-unauthorized-access\" target=\"_new\">Nightscout documentation</a>."
        ,persistent: true
      };
      ctx.adminnotifies.addNotify(message);
    }

    next();
  }

  function setupStorage (ctx: any, next: any) {

    console.log('Executing setupStorage');

    if (hasBootErrors(ctx)) {
      return next();
    }

    try {
      if (_.startsWith(env.storageURI, 'openaps://')) {
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        require('../storage/openaps-storage')(env, function ready (err: any, store: any) {
          if (err) {
            throw err;
          }
          ctx.store = store;
          console.log('OpenAPS Storage system ready');
          next();
        });
      } else {
        //TODO assume mongo for now, when there are more storage options add a lookup
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        require('../storage/mongo-storage')(env, function ready(err: any, store: any) {
          // FIXME, error is always null, if there is an error, the index.js will throw an exception
          if (err) {
            console.info('ERROR CONNECTING TO MONGO', err);
            ctx.bootErrors = ctx.bootErrors || [ ];
            ctx.bootErrors.push({'desc': 'Unable to connect to Mongo', err: err.message});
          }
          console.log('Mongo Storage system ready');
          ctx.store = store;
          next();
        });
      }
    } catch (err) {
      console.info('ERROR CONNECTING TO MONGO', err);
      ctx.bootErrors = ctx.bootErrors || [ ];
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      ctx.bootErrors.push({'desc': 'Unable to connect to Mongo', err: err.message});
      next();
    }
  }

  function setupAuthorization (ctx: any, next: any) {

    console.log('Executing setupAuthorization');

    if (hasBootErrors(ctx)) {
      return next();
    }

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.authorization = require('../authorization')(env, ctx);
    ctx.authorization.storage.ensureIndexes();
    ctx.authorization.storage.reload(function loaded (err: any) {
      if (err) {
        ctx.bootErrors = ctx.bootErrors || [ ];
        ctx.bootErrors.push({'desc': 'Unable to setup authorization', err: err});
      }
      next();
    });
  }

  function setupInternals (ctx: any, next: any) {

    console.log('Executing setupInternals');

    if (hasBootErrors(ctx)) {
      return next();
    }

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.levels = require('../levels');
    ctx.levels.translate = ctx.language.translate;

    ///////////////////////////////////////////////////
    // api and json object variables
    ///////////////////////////////////////////////////
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.plugins = require('../plugins')({
      settings: env.settings
      , language: ctx.language
      , levels: ctx.levels
      , moment: ctx.moment
    }).registerServerDefaults();

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.wares = require('../middleware/')(env);

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.pushover = require('../plugins/pushover')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.maker = require('../plugins/maker')(env);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.pushnotify = require('./pushnotify')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.loop = require('./loop')(env, ctx);

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.activity = require('./activity')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.entries = require('./entries')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.treatments = require('./treatments')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.devicestatus = require('./devicestatus')(env.devicestatus_collection, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.profile = require('./profile')(env.profile_collection, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.food = require('./food')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.pebble = require('./pebble')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.properties = require('../api2/properties')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.ddata = require('../data/ddata')();
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.cache = require('./cache')(env,ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.dataloader = require('../data/dataloader')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.notifications = require('../notifications')(env, ctx);
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.purifier = require('./purifier')(env,ctx);

    if (env.settings.isEnabled('alexa') || env.settings.isEnabled('googlehome')) {
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      ctx.virtAsstBase = require('../plugins/virtAsstBase')(env, ctx);
    }

    if (env.settings.isEnabled('alexa')) {
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      ctx.alexa = require('../plugins/alexa')(env, ctx);
    }

    if (env.settings.isEnabled('googlehome')) {
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      ctx.googleHome = require('../plugins/googlehome')(env, ctx);
    }

    next( );
  }

  function ensureIndexes (ctx: any, next: any) {

    console.log('Executing ensureIndexes');

    if (hasBootErrors(ctx)) {
      return next();
    }

    console.info('Ensuring indexes');
    ctx.store.ensureIndexes(ctx.entries( ), ctx.entries.indexedFields);
    ctx.store.ensureIndexes(ctx.treatments( ), ctx.treatments.indexedFields);
    ctx.store.ensureIndexes(ctx.devicestatus( ), ctx.devicestatus.indexedFields);
    ctx.store.ensureIndexes(ctx.profile( ), ctx.profile.indexedFields);
    ctx.store.ensureIndexes(ctx.food( ), ctx.food.indexedFields);
    ctx.store.ensureIndexes(ctx.activity( ), ctx.activity.indexedFields);

    next( );
  }

  function setupListeners (ctx: any, next: any) {

    console.log('Executing setupListeners');
    
    if (hasBootErrors(ctx)) {
      return next();
    }

    var updateData = _.debounce(function debouncedUpdateData ( ) {
      ctx.dataloader.update(ctx.ddata, function dataUpdated () {
        ctx.bus.emit('data-loaded');
      });
    }, UPDATE_THROTTLE);

    ctx.bus.on('tick', function timedReloadData (tick: any) {
      console.info('tick', tick.now);
      updateData();
    });

    ctx.bus.on('data-received', function forceReloadData ( ) {
      console.info('got data-received event, requesting reload');
      updateData();
    });

    ctx.bus.on('data-loaded', function updatePlugins ( ) {
      console.info('data loaded: reloading sandbox data and updating plugins');
      // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      var sbx = require('../sandbox')().serverInit(env, ctx);
      ctx.plugins.setProperties(sbx);
      ctx.notifications.initRequests();
      ctx.plugins.checkNotifications(sbx);
      ctx.notifications.process(sbx);
      ctx.sbx = sbx;
      ctx.bus.emit('data-processed', sbx);
    });

    ctx.bus.on('data-processed', function processed ( ) {
      ctx.runtimeState = 'loaded';
    });

    ctx.bus.on('notification', ctx.pushnotify.emitNotification);

    next( );
  }

  function setupConnect (ctx: any, next: any) {
    console.log('Executing setupConnect');
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.nightscoutConnect = require('nightscout-connect')(env, ctx)
    // ctx.nightscoutConnect.
    return next( );
  }

  function setupBridge (ctx: any, next: any) {

    console.log('Executing setupBridge');

    if (hasBootErrors(ctx)) {
      return next();
    }

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.bridge = require('../plugins/bridge')(env, ctx.bus);
    if (ctx.bridge) {
      ctx.bridge.startEngine(ctx.entries);
      console.log("DEPRECATION WARNING", "PLEASE CONSIDER nightscout-connect instead.");
    }
    next( );
  }

  function setupMMConnect (ctx: any, next: any) {

    console.log('Executing setupMMConnect');

    if (hasBootErrors(ctx)) {
      return next();
    }

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    ctx.mmconnect = require('../plugins/mmconnect').init(env, ctx.entries, ctx.devicestatus, ctx.bus);
    if (ctx.mmconnect) {
      ctx.mmconnect.run();
      console.log("DEPRECATION WARNING", "PLEASE CONSIDER nightscout-connect instead.");
    }
    next( );
  }

  function finishBoot (ctx: any, next: any) {

    console.log('Executing finishBoot');

    if (hasBootErrors(ctx)) {
      return next();
    }
    ctx.bus.emit('finishBoot');

    ctx.runtimeState = 'booted';
    ctx.bus.uptime( );

    next( );
  }

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  return require('bootevent')( )
    .acquire(startBoot)
    .acquire(checkNodeVersion)
    .acquire(checkEnv)
    .acquire(augmentSettings)
    .acquire(checkSettings)
    .acquire(setupStorage)
    .acquire(setupAuthorization)
    .acquire(setupInternals)
    .acquire(ensureIndexes)
    .acquire(setupListeners)
    .acquire(setupConnect)
    .acquire(setupBridge)
    .acquire(setupMMConnect)
    .acquire(finishBoot);
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = boot;