'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'express'.
const express = require('express')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'bodyParser... Remove this comment to see the full error message
  , bodyParser = require('body-parser')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'renderer'.
  , renderer = require('./shared/renderer')
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , storageSocket = require('./storageSocket')
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , alarmSocket = require('./alarmSocket')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'apiConst'.
  , apiConst = require('./const.json')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'security'.
  , security = require('./security')
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , genericSetup = require('./generic/setup')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('./shared/operationTools')
  ;

function configure (env: any, ctx: any) {

  const self = { }
    , app = express()
    ;

  // @ts-expect-error TS(2339): Property 'setENVTruthy' does not exist on type '{}... Remove this comment to see the full error message
  self.setENVTruthy = function setENVTruthy (varName: any, defaultValue: any) {
    //for some reason Azure uses this prefix, maybe there is a good reason
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    let value = process.env['CUSTOMCONNSTR_' + varName]
      // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      || process.env['CUSTOMCONNSTR_' + varName.toLowerCase()]
      // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      || process.env[varName]
      // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      || process.env[varName.toLowerCase()];

    value = value != null ? value : defaultValue;

    if (typeof value === 'string' && (value.toLowerCase() === 'on' || value.toLowerCase() === 'true')) { value = true; }
    if (typeof value === 'string' && (value.toLowerCase() === 'off' || value.toLowerCase() === 'false')) { value = false; }

    app.set(varName, value);
    return value;
  };
  // @ts-expect-error TS(2339): Property 'setENVTruthy' does not exist on type '{}... Remove this comment to see the full error message
  app.setENVTruthy = self.setENVTruthy;


  // @ts-expect-error TS(2339): Property 'setupApiEnvironment' does not exist on t... Remove this comment to see the full error message
  self.setupApiEnvironment = function setupApiEnvironment () {

    app.use(bodyParser.json({
      limit: 1048576 * 50
    }), function errorHandler (err: any, req: any, res: any, next: any) {
      console.error(err);
      res.status(apiConst.HTTP.INTERNAL_ERROR).json({
        status: apiConst.HTTP.INTERNAL_ERROR,
        message: apiConst.MSG.HTTP_500_INTERNAL_ERROR
      });
      if (next) { // we need 4th parameter next to behave like error handler, but we have to use it to prevent "unused variable" message
      }
    });

    app.use(renderer.extension2accept);

    // we don't need these here
    app.set('etag', false);
    app.set('x-powered-by', false); // this seems to be unreliable
    app.use(function (req: any, res: any, next: any) {
      res.removeHeader('x-powered-by');
      next();
    });

    app.set('name', env.name);
    app.set('version', env.version);
    app.set('apiVersion', apiConst.API3_VERSION);
    app.set('units', env.DISPLAY_UNITS);
    // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    app.set('ci', process.env['CI'] ? true: false);
    app.set('enabledCollections', ['devicestatus', 'entries', 'food', 'profile', 'settings', 'treatments']);

    // @ts-expect-error TS(2339): Property 'setENVTruthy' does not exist on type '{}... Remove this comment to see the full error message
    self.setENVTruthy('API3_SECURITY_ENABLE', apiConst.API3_SECURITY_ENABLE);
    // @ts-expect-error TS(2339): Property 'setENVTruthy' does not exist on type '{}... Remove this comment to see the full error message
    self.setENVTruthy('API3_DEDUP_FALLBACK_ENABLED', apiConst.API3_DEDUP_FALLBACK_ENABLED);
    // @ts-expect-error TS(2339): Property 'setENVTruthy' does not exist on type '{}... Remove this comment to see the full error message
    self.setENVTruthy('API3_CREATED_AT_FALLBACK_ENABLED', apiConst.API3_CREATED_AT_FALLBACK_ENABLED);
    // @ts-expect-error TS(2339): Property 'setENVTruthy' does not exist on type '{}... Remove this comment to see the full error message
    self.setENVTruthy('API3_MAX_LIMIT', apiConst.API3_MAX_LIMIT);
  };


  // @ts-expect-error TS(2339): Property 'setupApiRoutes' does not exist on type '... Remove this comment to see the full error message
  self.setupApiRoutes = function setupApiRoutes () {

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    app.get('/version', require('./specific/version')(app, ctx, env));

    if (app.get('env') === 'development' || app.get('ci')) { // for development and testing purposes only
      app.get('/test', async function test (req: any, res: any) {

        try {
          const opCtx = {app, ctx, env, req, res};
          // @ts-expect-error TS(2339): Property 'auth' does not exist on type '{ app: any... Remove this comment to see the full error message
          opCtx.auth = await security.authenticate(opCtx);
          await security.demandPermission(opCtx, 'api:entries:read');
          res.status(apiConst.HTTP.OK).end();
        } catch (error) {
          console.error(error);
        }
      });
    }

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    app.get('/lastModified', require('./specific/lastModified')(app, ctx, env));

    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    app.get('/status', require('./specific/status')(app, ctx, env));
  };


  // @ts-expect-error TS(2339): Property 'setupApiEnvironment' does not exist on t... Remove this comment to see the full error message
  self.setupApiEnvironment();
  genericSetup(ctx, env, app);
  // @ts-expect-error TS(2339): Property 'setupApiRoutes' does not exist on type '... Remove this comment to see the full error message
  self.setupApiRoutes();

  app.use('/swagger-ui-dist', (req: any, res: any) => {
    res.redirect(307, '../../../api3-docs');
  });

  app.use((req: any, res: any) => {
    opTools.sendJSONStatus(res, apiConst.HTTP.NOT_FOUND, apiConst.MSG.HTTP_404_BAD_OPERATION);
  })

  ctx.storageSocket = new storageSocket(app, env, ctx);
  ctx.alarmSocket = new alarmSocket(app, env, ctx);

  return app;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
