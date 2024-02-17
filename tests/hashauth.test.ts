'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var benv = require('benv');
// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'read'.
var read = require('fs').readFileSync;
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var serverSettings = require('./fixtures/default-server-settings');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('hashauth', function(this: any) {
  this.timeout(50000); // TODO: see why this test takes longer on Travis to complete

  var self = this;
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var headless = require('./fixtures/headless')(benv, this);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    done( );
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function (done: any) {
    // cleanup js-storage as it evaluates if the test is running in the window or not when first required
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    delete require.cache[require.resolve('js-storage')];
    done( );
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(function (done: any) {
    headless.setup({mockAjax: true}, done);
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(function (done: any) {
    headless.teardown( );
    done( );
  });
  /*
  before(function (done) {
    benv.setup(function() {
      self.$ = require('jquery');
      self.$.localStorage = require('./fixtures/localstorage');

      self.$.fn.tooltip = function mockTooltip ( ) { };

      var indexHtml = read(__dirname + '/../static/index.html', 'utf8');
      self.$('body').html(indexHtml);

      var d3 = require('d3');
      //disable all d3 transitions so most of the other code can run with jsdom
      d3.timer = function mockTimer() { };

      benv.expose({
        $: self.$
        , jQuery: self.$
        , d3: d3
        , io: {
          connect: function mockConnect ( ) {
            return {
              on: function mockOn ( ) { }
            };
          }
        }
      });
      done();
    });
  });

  after(function (done) {
    benv.teardown();
    done();
  });
  */

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should make module unauthorized', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    
    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next: any) { 
      hashauth.authenticated = false;
      next(true); 
    };

    client.init();

    hashauth.inlineCode().indexOf('Unauthorized').should.be.greaterThan(0);
    hashauth.isAuthenticated().should.equal(false);
    var testnull = (hashauth.hash()===null);
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
    testnull.should.equal(true);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should make module authorized', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    
    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next: any) { 
      hashauth.authenticated = true;
      next(true); 
    };

    client.init();

    hashauth.inlineCode().indexOf('Admin authorized').should.be.greaterThan(0);
    hashauth.isAuthenticated().should.equal(true);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should store hash and the remove authentication', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var localStorage = require('./fixtures/localstorage');   
    
    localStorage.remove('apisecrethash');
    
    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next: any) { 
      hashauth.authenticated = true;
      next(true); 
    };
    hashauth.updateSocketAuth = function mockUpdateSocketAuth() {};

    client.init();

    hashauth.processSecret('this is my long pass phrase',true);
    
    hashauth.hash().should.equal('b723e97aa97846eb92d5264f084b2823f57c4aa1');
    localStorage.get('apisecrethash').should.equal('b723e97aa97846eb92d5264f084b2823f57c4aa1');
    hashauth.isAuthenticated().should.equal(true);
    
    hashauth.removeAuthentication();
    hashauth.isAuthenticated().should.equal(false);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should not store hash', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var localStorage = require('./fixtures/localstorage');   
    
    localStorage.remove('apisecrethash');

    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next: any) { 
      hashauth.authenticated = true;
      next(true); 
    };

    client.init();

    hashauth.processSecret('this is my long pass phrase',false);
    
    hashauth.hash().should.equal('b723e97aa97846eb92d5264f084b2823f57c4aa1');
    var testnull = (localStorage.get('apisecrethash')===null);
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
    testnull.should.equal(true);
    hashauth.isAuthenticated().should.equal(true);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should report secret too short', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var localStorage = require('./fixtures/localstorage');   
    
    localStorage.remove('apisecrethash');

    hashauth.init(client, self.$);

    client.init();

    window.alert = function mockConfirm (message) {
      function containsLine (line: any) {
        message.indexOf(line).should.be.greaterThan(-1);
      }
      containsLine('Too short API secret');
      return true;
    };

    hashauth.processSecret('short passp',false);
  });
});
