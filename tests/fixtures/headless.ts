// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'read'.
var read = require('fs').readFileSync;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function headless (benv: any, binding: any) {
  var self = binding;

  function root () {
    return benv;
  }

  function init (opts: any, callback: any) {

    var localStorage = opts.localStorage || './localstorage';
    const t = Date.now();

    console.log('Headless init');

    // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
    var htmlFile = opts.htmlFile || __dirname + '/../../views/index.html';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var serverSettings = opts.serverSettings || require('./default-server-settings');
    var someData = opts.mockAjax || {};

    console.log('Entering setup', Date.now() - t);

    benv.setup(async function () {

      console.log('Setting up benv', Date.now() - t);

      // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
      benv.require(__dirname + '/../../node_modules/.cache/_ns_cache/public/js/bundle.app.js');

      console.log('Bundle loaded', Date.now() - t);

      self.$ = $;

      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      self.localCookieStorage = self.localStorage = self.$.localStorage = require(localStorage);

      self.$.fn.tooltip = function mockTooltip () {
      };

      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 2.
      var indexHtml = read(htmlFile, 'utf8');
      self.$('body').html(indexHtml);

      console.log('HTML set', Date.now() - t);

      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      var d3 = require('d3');

      if (opts.mockProfileEditor) {
        self.$.plot = function mockPlot () {
        };

        self.$.fn.tooltip = function mockTooltip () {
        };

        self.$.fn.dialog = function mockDialog (opts: any) {
          function maybeCall (name: any, obj: any) {
            if (obj[name] && obj[name].call) {
              obj[name]();
            }

          }

          maybeCall('open', opts);

          _.forEach(opts.buttons, function (button: any) {
            maybeCall('click', button);
          });
        };
      }
      if (opts.mockSimpleAjax) {
        someData = opts.mockSimpleAjax;
        self.$.ajax = function mockAjax (url: any, opts: any) {
          if (url && url.url) {
            url = url.url;
          }

          var returnVal = someData[url] || [];
          if (opts && typeof opts.success === 'function') {
            opts.success(returnVal);
            return self.$.Deferred().resolveWith(returnVal);
          } else {
            return {
              done: function mockDone (fn: any) {
                if (url.indexOf('status.json') > -1) {
                  fn(serverSettings);
                } else {
                  fn({ message: 'OK' });
                }
                return self.$.ajax();
              },
              fail: function mockFail () {
                return self.$.ajax();
              }
            };
          }
        };
      }
      if (opts.mockAjax) {
        self.$.ajax = function mockAjax (url: any, opts: any) {

          if (url && url.url) {
            url = url.url;
          }

          //logfile.write(url+'\n');
          //console.log(url,opts);
          if (opts && opts.success && opts.success.call) {
            return {
              done: function mockDone (fn: any) {
                if (someData[url]) {
                  console.log('+++++Data for ' + url + ' sent');
                  opts.success(someData[url]);
                } else {
                  console.log('-----Data for ' + url + ' missing');
                  opts.success([]);
                }
                fn();
                return self.$.ajax();
              },
              fail: function mockFail () {
                return self.$.ajax();
              }
            };
          }
          return {
            done: function mockDone (fn: any) {
              if (url.indexOf('status.json') > -1) {
                fn(serverSettings);
              } else {
                fn({ message: 'OK' });
              }
              return self.$.ajax();
            },
            fail: function mockFail () {
              return self.$.ajax();
            }
          };
        };
      }

      console.log('Benv expose', Date.now() - t);

      benv.expose({
        $: self.$
        , jQuery: self.$
        , d3: {
          ...d3,
          //disable all d3 transitions so most of the other code can run with jsdom
          timer: function mockTimer() {}
        }
        , serverSettings: serverSettings
        , localCookieStorage: self.localStorage
        , cookieStorageType: self.localStorage
        , localStorage: self.localStorage
        , io: {
          connect: function mockConnect () {
            return {
              // @ts-expect-error TS(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
              on: function mockOn (event, callback) {
                if ('connect' === event && callback) {
                  callback();
                }
              }
              // @ts-expect-error TS(7006) FIXME: Parameter 'event' implicitly has an 'any' type.
              , emit: function mockEmit (event, data, callback) {
                if ('authorize' === event && callback) {
                  callback({
                    read: true
                  });
                }
              }
            };
          }
        }
      });

      var extraRequires = opts.benvRequires || [];
      // @ts-expect-error TS(7006) FIXME: Parameter 'req' implicitly has an 'any' type.
      extraRequires.forEach(function (req) {
        benv.require(req);
      });
      callback();
    });

  }

  function teardown () {
    benv.teardown();
  }

  root.setup = init;
  root.teardown = teardown;

  return root;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = headless;
