'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
  , path = require('path')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
  , language = require('../../../lib/language')()
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , apiRoot = require('../../../lib/api/root')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'http'.
  , http = require('http')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'https'.
  , https = require('https')
  ;

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
        key: fs.readFileSync(path.join(__dirname, '../api3/localhost.key')),
        // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
        cert: fs.readFileSync(path.join(__dirname, '../api3/localhost.crt'))
      };
    }

    env.settings.authDefaultRoles = authDefaultRoles;
    env.settings.enable = enable;

    return env;
  };


  /*
   * Create new web server instance for testing purposes
   */
  // @ts-expect-error TS(2339) FIXME: Property 'create' does not exist on type '{}'.
  self.create = function createHttpServer ({
                                             apiSecret = 'this is my long pass phrase',
                                             useHttps = true,
                                             authDefaultRoles = '',
                                             enable = ['careportal', 'api']
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
          instance.ctx.apiRootApp = apiRoot(instance.env, ctx);

          // @ts-expect-error TS(2339) FIXME: Property 'app' does not exist on type '{}'.
          instance.app.use('/api', instance.ctx.apiRootApp);

          const transport = useHttps ? https : http;

          // @ts-expect-error TS(2339) FIXME: Property 'server' does not exist on type '{}'.
          instance.server = transport.createServer(instance.env.ssl || { }, instance.app).listen(0);
          // @ts-expect-error TS(2339) FIXME: Property 'env' does not exist on type '{}'.
          instance.env.PORT = instance.server.address().port;

          // @ts-expect-error TS(2339) FIXME: Property 'baseUrl' does not exist on type '{}'.
          instance.baseUrl = `${useHttps ? 'https' : 'http'}://${instance.env.HOSTNAME}:${instance.env.PORT}`;

          // @ts-expect-error TS(2339) FIXME: Property 'baseUrl' does not exist on type '{}'.
          console.log(`Started ${useHttps ? 'SSL' : 'HTTP'} instance on ${instance.baseUrl}`);
          hasBooted = true;
          resolve(instance);
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