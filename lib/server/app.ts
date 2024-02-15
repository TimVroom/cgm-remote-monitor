'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_get'.
const _get = require('lodash/get');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const compression = require('compression');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'bodyParser... Remove this comment to see the full error message
const bodyParser = require('body-parser');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const randomToken = require('random-token');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const ejs = require('ejs');

function resolvePath(filePath: any) {

  if (fs.existsSync(filePath)) return filePath;
  // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
  let p = path.join(__dirname, filePath);
  if (fs.existsSync(p)) return p;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  p = path.join(process.cwd(), filePath);
  if (fs.existsSync(p)) return p;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  return require.resolve(filePath);
}

function create (env: any, ctx: any) {
  var app = express();
  var appInfo = env.name + ' ' + env.version;
  app.set('title', appInfo);
  app.enable('trust proxy'); // Allows req.secure test on heroku https connections.
  var insecureUseHttp = env.insecureUseHttp;
  var secureHstsHeader = env.secureHstsHeader;
  if (!insecureUseHttp) {
    console.info('Redirecting http traffic to https because INSECURE_USE_HTTP=', insecureUseHttp);
    app.use((req: any, res: any, next: any) => {
      if (req.header('x-forwarded-proto') === 'https' || req.secure) {
        next();
      } else {
        res.redirect(307, `https://${req.header('host')}${req.url}`);
      }
    });
    if (secureHstsHeader) { // Add HSTS (HTTP Strict Transport Security) header

      const enableCSP = env.secureCsp ? true : false;

      let cspPolicy = false;

      if (enableCSP) {
        var secureCspReportOnly = env.secureCspReportOnly;
        if (secureCspReportOnly) {
          console.info('Enabled SECURE_CSP (Content Security Policy header). Not enforcing. Report only.');
        } else {
          console.info('Enabled SECURE_CSP (Content Security Policy header). Enforcing.');
        }

        let frameAncestors = ["'self'"];

        for (let i = 0; i <= 8; i++) {
          let u = env.settings['frameUrl' + i];
          if (u) {
            frameAncestors.push(u);
          }
        }

        // @ts-expect-error TS(2322) FIXME: Type '{ directives: { defaultSrc: string[]; styleS... Remove this comment to see the full error message
        cspPolicy = { //TODO make NS work without 'unsafe-inline'
          directives: {
            defaultSrc: ["'self'"]
            , styleSrc: ["'self'", 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/', "'unsafe-inline'"]
            , scriptSrc: ["'self'", "'unsafe-inline'"]
            , fontSrc: ["'self'", 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/', 'data:']
            , imgSrc: ["'self'", 'data:']
            , objectSrc: ["'none'"] // Restricts <object>, <embed>, and <applet> elements
            , reportUri: '/report-violation'
            , baseUri: ["'none'"] // Restricts use of the <base> tag
            , formAction: ["'self'"] // Restricts where <form> contents may be submitted
            , connectSrc: ["'self'", "ws:", "wss:", 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/']
            , frameSrc: ["'self'"]
            , frameAncestors: frameAncestors
          }
          , reportOnly: secureCspReportOnly
        };
      }


      console.info('Enabled SECURE_HSTS_HEADER (HTTP Strict Transport Security)');
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      const helmet = require('helmet');
      var includeSubDomainsValue = env.secureHstsHeaderIncludeSubdomains;
      var preloadValue = env.secureHstsHeaderPreload;
      app.use(helmet({
        hsts: {
          maxAge: 31536000
          , includeSubDomains: includeSubDomainsValue
          , preload: preloadValue
        }
        , frameguard: false
        , contentSecurityPolicy: cspPolicy
      }));

      if (enableCSP) {

        app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
        app.use(bodyParser.json({ type: ['json', 'application/csp-report'] }));
        app.post('/report-violation', (req: any, res: any) => {
          if (req.body) {
            console.log('CSP Violation: ', req.body);
          } else {
            console.log('CSP Violation: No data received!');
          }
          res.status(204).end();
        })
      }
    }
  } else {
    console.info('Security settings: INSECURE_USE_HTTP=', insecureUseHttp, ', SECURE_HSTS_HEADER=', secureHstsHeader);
  }

  app.set('view engine', 'ejs');
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  app.engine('html', require('ejs').renderFile);
  app.set("views", resolvePath('/views'));

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  let cacheBuster = process.env.NODE_ENV == 'development' ? 'developmentMode': randomToken(16);
  app.locals.cachebuster = cacheBuster;

  let lastModified = new Date();

  app.get("/robots.txt", (req: any, res: any) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(['User-agent: *','Disallow: /'].join('\n'));
  });

  const swcontent = fs.readFileSync(resolvePath('/views/service-worker.js'), { encoding: 'utf-8' });

  app.get("/sw.js", (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/javascript');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    if (process.env.NODE_ENV !== 'development') {
      res.setHeader('Last-Modified', lastModified.toUTCString());
    }
    res.send(ejs.render(swcontent, { locals: app.locals} ));
  });

  // Allow static resources to be cached for week
  var maxAge = 7 * 24 * 60 * 60 * 1000;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.env.NODE_ENV === 'development') {
    maxAge = 1;
    console.log('Development environment detected, setting static file cache age to 1 second');
  }

  var staticFiles = express.static(resolvePath(env.static_files), {
    maxAge
  });

  // serve the static content
  app.use(staticFiles);

  app.use('/translations', express.static(resolvePath('/translations'), {
    maxAge
  }));

  if (ctx.bootErrors && ctx.bootErrors.length > 0) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const bootErrorView = require('./booterror')(env, ctx);
    bootErrorView.setLocals(app.locals);
    app.get('*', bootErrorView);
    return app;
  }

  if (env.settings.isEnabled('cors')) {
    var allowOrigin = _get(env, 'extendedSettings.cors.allowOrigin') || '*';
    console.info('Enabled CORS, allow-origin:', allowOrigin);
    app.use(function allowCrossDomain (req: any, res: any, next: any) {
      res.header('Access-Control-Allow-Origin', allowOrigin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      // intercept OPTIONS method
      if ('OPTIONS' === req.method) {
        res.send(200);
      } else {
        next();
      }
    });
  }

  ///////////////////////////////////////////////////
  // api and json object variables
  ///////////////////////////////////////////////////
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const apiRoot = require('../api/root')(env, ctx);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api = require('../api/')(env, ctx);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api2 = require('../api2/')(env,ctx, api);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api3 = require('../api3/')(env, ctx);

  app.use(compression({
    filter: function shouldCompress (req: any, res: any) {
      //TODO: return false here if we find a condition where we don't want to compress
      // fallback to standard filter function
      return compression.filter(req, res);
    }
  }));

  var appPages = {
    "/": {
      file: "index.html"
      , type: "index"
    }
    , "/admin": {
      file: "adminindex.html"
      , title: 'Admin Tools'
      , type: 'admin'
    }
    , "/food": {
      file: "foodindex.html"
      , title: 'Food Editor'
      , type: 'food'
    }
    , "/profile": {
      file: "profileindex.html"
      , title: 'Profile Editor'
      , type: 'profile'
    }
    , "/report": {
      file: "reportindex.html"
      , title: 'Nightscout reporting'
      , type: 'report'
    }
    , "/split": {
      file: "frame.html"
      , title: '8-user view'
      , type: 'index'
    }
  };

  Object.keys(appPages).forEach(function(page) {
    app.get(page, (req: any, res: any) => {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      res.render(appPages[page].file, {
        locals: app.locals,
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        title: appPages[page].title ? appPages[page].title : '',
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        type: appPages[page].type ? appPages[page].type : '',
        settings: env.settings
      });
    });
  });

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const clockviews = require('./clocks.js')(env, ctx);
  clockviews.setLocals(app.locals);

  app.use("/clock", clockviews);

  app.use('/api', apiRoot);
  app.use('/api/v1', api);
  app.use('/api/v2', api2);
  app.use('/api/v3', api3);

  // pebble data
  app.get('/pebble', ctx.pebble);

  // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
  const swaggerjson = fs.readFileSync(resolvePath(__dirname + '/swagger.json'), { encoding: 'utf-8' });
  // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
  const swaggeryaml = fs.readFileSync(resolvePath(__dirname + '/swagger.yaml'), { encoding: 'utf-8' });

  // expose swagger.json
  app.get('/swagger.json', function(req: any, res: any) {
    res.setHeader("Content-Type", 'application/json');
    res.send(swaggerjson);
  });

  // expose swagger.yaml
  app.get('/swagger.yaml', function(req: any, res: any) {
    res.setHeader("Content-Type", 'text/vnd.yaml');
    res.send(swaggeryaml);
  });

  // API docs

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const swaggerUi = require('swagger-ui-express');
  const swaggerUseSchema = (schema: any) => (...args: any[]) => swaggerUi.setup(schema)(...args);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const swaggerDocument = require('./swagger.json');
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const swaggerDocumentApiV3 = require('../api3/swagger.json');

  app.use('/api-docs', swaggerUi.serve, swaggerUseSchema(swaggerDocument));
  app.use('/api3-docs', swaggerUi.serve, swaggerUseSchema(swaggerDocumentApiV3));

  app.use('/swagger-ui-dist', (req: any, res: any) => {
    res.redirect(307, '/api-docs');
  });

  // if this is dev environment, package scripts on the fly
  // if production, rely on postinstall script to run packaging for us

  app.locals.bundle = '/bundle';
  app.locals.mode = 'production';

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.env.NODE_ENV === 'development') {

    console.log('Development mode');

    app.locals.mode = 'development';
    app.locals.bundle = '/devbundle';

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const webpack = require('webpack');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const webpack_conf = require('../../webpack/webpack.config');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const middleware = require('webpack-dev-middleware');
    const compiler = webpack(webpack_conf);

    app.use(
      middleware(compiler, {
        // webpack-dev-middleware options
        publicPath: webpack_conf.output.publicPath
      })
    );

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    app.use(require("webpack-hot-middleware")(compiler, {
      heartbeat: 1000
    }));
  }

  // Production bundling
  const tmpFiles =  express.static(resolvePath('/node_modules/.cache/_ns_cache/public'), {
    maxAge: maxAge
  });

  // serve the static content
  app.use('/bundle', tmpFiles);

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  if (process.env.NODE_ENV !== 'development') {

    console.log('Production environment detected, enabling Minify');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var minify = require('express-minify');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var myCssmin = require('cssmin');

    app.use(minify({
      js_match: /\.js/
      , css_match: /\.css/
      , sass_match: /scss/
      , less_match: /less/
      , stylus_match: /stylus/
      , coffee_match: /coffeescript/
      , json_match: /json/
      , cssmin: myCssmin
      , cache: resolvePath('/node_modules/.cache/_ns_cache/public')
      , onerror: undefined
    , }));

  }

  // Handle errors with express's errorhandler, to display more readable error messages.
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var errorhandler = require('errorhandler');
  //if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler());
  //}
  return app;
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = create;
