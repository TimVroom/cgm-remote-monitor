'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var benv = require('benv');
// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'read'.
var read = require('fs').readFileSync;
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var serverSettings = require('./fixtures/default-server-settings');

var nowData = {
  sgvs: [
    { mgdl: 100, mills: Date.now(), direction: 'Flat', type: 'sgv' }
  ]
};

var someData = {
  '/api/v1/devicestatus.json?count=500': [
    {
    '_id': {
        '$oid': '56096da3c5d0fef41b212362'
    },
    'uploaderBattery': 37,
    'created_at': '2015-09-28T16:41:07.144Z'
    },
    {
    '_id': {
        '$oid': '56096da3c5d0fef41b212363'
    },
    'uploaderBattery': 38,
    'created_at': '2025-09-28T16:41:07.144Z'
    }
  ],
  '/api/v1/devicestatus/?find[created_at][$lte]=': {
    n: 1
  },
  '/api/v1/treatments.json?&find[created_at][$gte]=': [
      {
        '_id':  '5609a9203c8104a8195b1c1e',
        'enteredBy': '',
        'eventType': 'Carb Correction',
        'carbs': 3,
        'created_at': '2025-09-28T20:54:00.000Z'
      }
    ],
  '/api/v1/treatments/?find[created_at][$lte]=': {
    n: 1
  },
  '/api/v1/entries.json?&find[date][$gte]=': [
      {
        '_id': '560983f326c5a592d9b9ae0c',
        'device': 'dexcom',
        'date': 1543464149000,
        'sgv': 83,
        'direction': 'Flat',
        'type': 'sgv',
        'filtered': 107632,
        'unfiltered': 106256,
        'rssi': 178,
        'noise': 1
      }
    ],
  '/api/v1/entries/?find[date][$lte]=': {
    n: 1
  },
};


// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('admintools', function(this: any) {
  var self = this;
  this.timeout(45000); // TODO: see why this test takes longer on CI to complete
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    benv.setup(function() {

// @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
	  benv.require(__dirname + '/../node_modules/.cache/_ns_cache/public/js/bundle.app.js');
          
      self.$ = $;
      
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      self.localCookieStorage = self.localStorage = self.$.localStorage = require('./fixtures/localstorage');

      self.$.fn.tooltip = function mockTooltip ( ) { };

      // @ts-expect-error TS(7006) FIXME: Parameter 'opts' implicitly has an 'any' type.
      self.$.fn.dialog = function mockDialog (opts) {
        // @ts-expect-error TS(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
        function maybeCall (name, obj) {
          if (obj[name] && obj[name].call) {
            obj[name]();
          }

        }
        maybeCall('open', opts);

        // @ts-expect-error TS(7006) FIXME: Parameter 'button' implicitly has an 'any' type.
        _.forEach(opts.buttons, function (button) {
          maybeCall('click', button);
        });
      };

      // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
      var indexHtml = read(__dirname + '/../views/adminindex.html', 'utf8');
      self.$('body').html(indexHtml);

      //var filesys = require('fs');
      //var logfile = filesys.createWriteStream('out.txt', { flags: 'a'} )
      
      // @ts-expect-error TS(7006) FIXME: Parameter 'url' implicitly has an 'any' type.
      self.$.ajax = function mockAjax (url, opts) {
        if (url && url.url) {
          url = url.url;
        }
        //logfile.write(url+'\n');
        //console.log('Mock ajax:',url,opts);
        if (opts && opts.success && opts.success.call) {
          if (url.indexOf('/api/v1/treatments.json?&find[created_at][$gte]=')===0) {
            url = '/api/v1/treatments.json?&find[created_at][$gte]=';
          } else if (url.indexOf('/api/v1/entries.json?&find[date][$gte]=')===0) {
            url = '/api/v1/entries.json?&find[date][$gte]=';
          } else if (url.indexOf('/api/v1/devicestatus/?find[created_at][$lte]=')===0) {
            url = '/api/v1/devicestatus/?find[created_at][$lte]=';
          } else if (url.indexOf('/api/v1/treatments/?find[created_at][$lte]=')===0) {
            url = '/api/v1/treatments/?find[created_at][$lte]=';
          } else if (url.indexOf('/api/v1/entries/?find[date][$lte]=')===0) {
            url = '/api/v1/entries/?find[date][$lte]=';
          }
          return {
            // @ts-expect-error TS(7006) FIXME: Parameter 'fn' implicitly has an 'any' type.
            done: function mockDone (fn) {
                // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (someData[url]) {
                  console.log('+++++Data for ' + url + ' sent');
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
          // @ts-expect-error TS(7006) FIXME: Parameter 'fn' implicitly has an 'any' type.
          done: function mockDone (fn) {
            if (url.indexOf('status.json') > -1) {
              fn(serverSettings);
            } else {
              fn({message: {message: 'OK'}});
            }
            return self.$.ajax();
            },
          fail: function mockFail () {
            return self.$.ajax();
            }
        };
      };

      self.$.plot = function mockPlot () {
      };

      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      var d3 = require('d3');
      //disable all d3 transitions so most of the other code can run with jsdom
      //d3.timer = function mockTimer() { };
      let timer = d3.timer(function mockTimer() { });
      timer.stop();
      
      var cookieStorageType = self.localStorage._type

      benv.expose({
        $: self.$
        , jQuery: self.$
        , d3: d3
        , serverSettings: serverSettings
        , localCookieStorage: self.localStorage
        , cookieStorageType: self.localStorage
		, localStorage: self.localStorage
        , io: {
          connect: function mockConnect ( ) {
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

      //benv.require(__dirname + '/../bundle/bundle.source.js');
      // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
      benv.require(__dirname + '/../static/admin/js/admin.js');

      done();
    });
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function (done) {
    benv.teardown(true);
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should produce some html', function (done) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    hashauth.init(client,$);
    // @ts-expect-error TS(7006) FIXME: Parameter 'next' implicitly has an 'any' type.
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next) {
      hashauth.authenticated = true;
      next(true);
    };

     window.confirm = function mockConfirm (text) {
       console.log('Confirm:', text);
       return true;
     };

     window.alert = function mockAlert () {
       return true;
     };

    client.init();
    
    client.dataUpdate(nowData);
    
    //var result = $('body').html();
    //var filesys = require('fs');
    //var logfile = filesys.createWriteStream('out.txt', { flags: 'a'} )
    //logfile.write($('body').html());
    
    //console.log(result);

    $('#admin_cleanstatusdb_0_html + button').text().should.equal('Delete all documents'); // devicestatus button
    $('#admin_cleanstatusdb_0_status').text().should.equal('Database contains 2 records'); // devicestatus init result
    
    $('#admin_cleanstatusdb_0_html + button').click();
    $('#admin_cleanstatusdb_0_status').text().should.equal('All records removed ...'); // devicestatus code result

    $('#admin_cleanstatusdb_1_html + button').text().should.equal('Delete old documents'); // devicestatus button
    $('#admin_cleanstatusdb_1_status').text().should.equal(''); // devicestatus init result

    $('#admin_cleanstatusdb_1_html + button').click();
    $('#admin_cleanstatusdb_1_status').text().should.equal('1 records deleted'); // devicestatus code result

    $('#admin_futureitems_0_html + button').text().should.equal('Remove treatments in the future'); // futureitems button 0
    $('#admin_futureitems_0_status').text().should.equal('Database contains 1 future records'); // futureitems init result 0
    
    $('#admin_futureitems_0_html + button').click();
    $('#admin_futureitems_0_status').text().should.equal('Record 5609a9203c8104a8195b1c1e removed ...'); // futureitems code result 0

    $('#admin_futureitems_1_html + button').text().should.equal('Remove entries in the future'); // futureitems button 1
    $('#admin_futureitems_1_status').text().should.equal('Database contains 1 future records'); // futureitems init result 1
    
    $('#admin_futureitems_1_html + button').click();
    $('#admin_futureitems_1_status').text().should.equal('Record 560983f326c5a592d9b9ae0c removed ...'); // futureitems code result 1

    $('#admin_cleantreatmentsdb_0_html + button').text().should.equal('Delete old documents'); // treatments button
    $('#admin_cleantreatmentsdb_0_status').text().should.equal(''); // treatments init result

    $('#admin_cleantreatmentsdb_0_html + button').click();
    $('#admin_cleantreatmentsdb_0_status').text().should.equal('1 records deleted'); // treatments code result

    $('#admin_cleanentriesdb_0_html + button').text().should.equal('Delete old documents'); // entries button
    $('#admin_cleanentriesdb_0_status').text().should.equal(''); // entries init result

    $('#admin_cleanentriesdb_0_html + button').click();
    $('#admin_cleanentriesdb_0_status').text().should.equal('1 records deleted'); // entries code result

    done();
  });

});
