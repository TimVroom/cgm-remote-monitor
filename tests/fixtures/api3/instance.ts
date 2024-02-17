'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
var fs = require('fs')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
  , language = require('../../../lib/language')()
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , api = require('../../../lib/api3/')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'http'.
  , http = require('http')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'https'.
  , https = require('https')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , request = require('supertest')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , websocket = require('../../../lib/server/websocket')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , io = require('socket.io-client')
  // @ts-expect-error TS(2300) FIXME: Duplicate identifier 'CacheMonitor'.
  , CacheMonitor = require('./cacheMonitor')
  ;

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure () {
  const self = { };

  // @ts-expect-error TS(2339) FIXME: Property 'prepareEnv' does not exist on type '{}'.
  self.prepareEnv = function prepareEnv({
    apiSecret,
    useHttps,
    authDefaultRoles,
    enable
  }: any) {

    if (useHttps) {
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    else {
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.env.INSECURE_USE_HTTP = true;
    }
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = apiSecret;

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.HOSTNAME = 'localhost';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const env = require('../../../lib/server/env')();

    if (useHttps) {
      env.ssl = {
        // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
        key: fs.readFileSync(__dirname + '/localhost.key'),
        // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
        cert: fs.readFileSync(__dirname + '/localhost.crt')
      };
    }

    env.settings.authDefaultRoles = authDefaultRoles;
    env.settings.enable = enable;

    return env;
  };


  function addJwt (req: any, jwt: any) {
    return jwt
      ? req.set('Authorization', `Bearer ${jwt}`)
      : req;
  }


  // @ts-expect-error TS(2339) FIXME: Property 'addSecuredOperations' does not exist on ... Remove this comment to see the full error message
  self.addSecuredOperations = function addSecuredOperations (instance: any) {

    instance.get = (url: any, jwt: any) => addJwt(request(instance.baseUrl).get(url), jwt);

    instance.post = (url: any, jwt: any) => addJwt(request(instance.baseUrl).post(url), jwt);

    instance.put = (url: any, jwt: any) => addJwt(request(instance.baseUrl).put(url), jwt);

    instance.patch = (url: any, jwt: any) => addJwt(request(instance.baseUrl).patch(url), jwt);

    instance.delete = (url: any, jwt: any) => addJwt(request(instance.baseUrl).delete(url), jwt);
  };



  // @ts-expect-error TS(2339) FIXME: Property 'bindSocket' does not exist on type '{}'.
  self.bindSocket = function bindSocket (storageSocket: any, instance: any) {

    return new Promise(function (resolve, reject) {
      if (!storageSocket) {
        // @ts-expect-error TS(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        resolve();
      }
      else {
        let socket = io(`${instance.baseUrl}/storage`, {
          origins:"*",
          transports: ['websocket', 'flashsocket', 'polling'],
          rejectUnauthorized: false
        });

        socket.on('connect', function () {
          resolve(socket);
        });
        socket.on('connect_error', function (error: any) {
          console.error(error);
          reject(error);
        });
      }
    });
  };


  // @ts-expect-error TS(2339) FIXME: Property 'unbindSocket' does not exist on type '{}... Remove this comment to see the full error message
  self.unbindSocket = function unbindSocket (instance: any) {
    if (instance.clientSocket.connected) {
      instance.clientSocket.disconnect();
    }
  };

  /*
   * Create new web server instance for testing purposes
   */
  // @ts-expect-error TS(2339) FIXME: Property 'create' does not exist on type '{}'.
  self.create = function createHttpServer ({
    apiSecret = 'this is my long pass phrase',
    disableSecurity = false,
    useHttps = true,
    authDefaultRoles = '',
    enable = ['careportal', 'api'],
    storageSocket = null
    }) {

    return new Promise(function (resolve, reject) {

      try {
        let instance = { },
          hasBooted = false
          ;

        // @ts-expect-error TS(2339) FIXME: Property 'env' does not exist on type '{}'.
        instance.env = self.prepareEnv({ apiSecret, useHttps, authDefaultRoles, enable });

        // @ts-expect-error TS(2339) FIXME: Property 'wares' does not exist on type '{}'.
        self.wares = require('../../../lib/middleware/')(instance.env);
        // @ts-expect-error TS(2339) FIXME: Property 'app' does not exist on type '{}'.
        instance.app = require('express')();
        // @ts-expect-error TS(2339) FIXME: Property 'app' does not exist on type '{}'.
        instance.app.enable('api');

        // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        require('../../../lib/server/bootevent')(instance.env, language).boot(function booted (ctx: any) {
          // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
          instance.ctx = ctx;
          // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
          instance.ctx.ddata = require('../../../lib/data/ddata')();
          // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
          instance.ctx.apiApp = api(instance.env, ctx);

          if (disableSecurity) {
            // @ts-expect-error TS(2339) FIXME: Property 'ctx' does not exist on type '{}'.
            instance.ctx.apiApp.set('API3_SECURITY_ENABLE', false);
          }

          // @ts-expect-error TS(2339) FIXME: Property 'app' does not exist on type '{}'.
          instance.app.use('/api/v3', instance.ctx.apiApp);
          // @ts-expect-error TS(2339) FIXME: Property 'app' does not exist on type '{}'.
          instance.app.use('/api/v2/authorization', instance.ctx.authorization.endpoints);

          const transport = useHttps ? https : http;

          // @ts-expect-error TS(2339) FIXME: Property 'server' does not exist on type '{}'.
          instance.server = transport.createServer(instance.env.ssl || { }, instance.app).listen(0);
          // @ts-expect-error TS(2339) FIXME: Property 'env' does not exist on type '{}'.
          instance.env.PORT = instance.server.address().port;

          // @ts-expect-error TS(2339) FIXME: Property 'baseUrl' does not exist on type '{}'.
          instance.baseUrl = `${useHttps ? 'https' : 'http'}://${instance.env.HOSTNAME}:${instance.env.PORT}`;

          // @ts-expect-error TS(2339) FIXME: Property 'addSecuredOperations' does not exist on ... Remove this comment to see the full error message
          self.addSecuredOperations(instance);
          // @ts-expect-error TS(2339) FIXME: Property 'cacheMonitor' does not exist on type '{}... Remove this comment to see the full error message
          instance.cacheMonitor = new CacheMonitor(instance).listen();

          // @ts-expect-error TS(2339) FIXME: Property 'env' does not exist on type '{}'.
          websocket(instance.env, instance.ctx, instance.server);

          // @ts-expect-error TS(2339) FIXME: Property 'bindSocket' does not exist on type '{}'.
          self.bindSocket(storageSocket, instance)
            .then((socket: any) => {
              // @ts-expect-error TS(2339) FIXME: Property 'clientSocket' does not exist on type '{}... Remove this comment to see the full error message
              instance.clientSocket = socket;

              // @ts-expect-error TS(2339) FIXME: Property 'baseUrl' does not exist on type '{}'.
              console.log(`Started ${useHttps ? 'SSL' : 'HTTP'} instance on ${instance.baseUrl}`);
              hasBooted = true;
              resolve(instance);
            })
            .catch((reason: any) => {
              console.error(reason);
              reject(reason);
            });
        });

        setTimeout(function watchDog() {
          if (!hasBooted)
            reject('timeout');
        }, 30000);

      } catch (err) {
        reject(err);
      }
    });
  };

  return self;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure();
