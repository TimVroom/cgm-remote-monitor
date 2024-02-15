'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var benv = require('benv');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var read = require('fs').readFileSync;

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var nowData = require('../lib/data/ddata')();
nowData.sgvs.push({ mgdl: 100, mills: Date.now(), direction: 'Flat', type: 'sgv' });

var exampleProfile = {
  defaultProfile : 'Default'
  , store: {
      'Default' : {
        //General values
        'dia':3,

        // Simple style values, 'from' are in minutes from midnight
        'carbratio': [
          {
            'time': '00:00',
            'value': 30
          }],
        'carbs_hr':30,
        'delay': 20,
        'sens': [
          {
            'time': '00:00',
            'value': 100
          }
          , {
            'time': '8:00',
            'value': 80
          }],
        'startDate': new Date(),
        'timezone': 'UTC',

        //perGIvalues style values
        'perGIvalues': false,
        'carbs_hr_high': 30,
        'carbs_hr_medium': 30,
        'carbs_hr_low': 30,
        'delay_high': 15,
        'delay_medium': 20,
        'delay_low': 20,

        'basal':[
          {
            'time': '00:00',
            'value': 0.1
          }],
        'target_low':[
          {
            'time': '00:00',
            'value': 100
          }],
        'target_high':[
          {
            'time': '00:00',
            'value': 120
          }]
      }
  }
};


// @ts-expect-error TS(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var someData = {
    '/api/v1/profile.json?count=20': [exampleProfile]
  };


// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Profile editor', function(this: any) {
  this.timeout(40000); //TODO: see why this test takes longer on Travis to complete
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var headless = require('./fixtures/headless')(benv, this);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    done( );
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function (done: any) {
    done( );
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(function (done: any) {
    var opts = {
      // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
      htmlFile: __dirname + '/../views/profileindex.html'
    , mockProfileEditor: true
    , mockAjax: someData
    , benvRequires: [
        // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
        __dirname + '/../static/js/profileinit.js'
      ]
    };
    headless.setup(opts, done);
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(function (done: any) {
    headless.teardown( );
    done( );
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('should produce some html', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var client = require('../lib/client');

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    hashauth.init(client,$);
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next: any) {
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

    // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
    window.Nightscout.profileclient();

    client.init();
    client.dataUpdate(nowData);
    
    // var result = $('body').html();
    // console.log(result);
    //var filesys = require('fs');
    //var logfile = filesys.createWriteStream('out.html', { flags: 'a'} )
    //logfile.write($('body').html());
    
    // database records manipulation
    $('#pe_databaserecords option').length.should.be.equal(1);
    $('#pe_records_add').click();
    $('#pe_databaserecords option').length.should.be.equal(2);
    $('#pe_records_remove').click();
    $('#pe_databaserecords option').length.should.be.equal(1);
    $('#pe_records_clone').click();
    $('#pe_databaserecords option').length.should.be.equal(2);
    $('#pe_databaserecords option').val(0);

    //console.log($('#pe_databaserecords').html());
    //console.log($('#pe_databaserecords').val());

    // database records manipulation
    $('#pe_profiles option').length.should.be.equal(1);
    $('#pe_profile_add').click();
    $('#pe_profiles option').length.should.be.equal(2);
    $('#pe_profile_name').val('Test');
    $('#pe_profiles option').val('Default');
    $('#pe_profiles option').val('Test');
    $('#pe_profile_remove').click();
    $('#pe_profiles option').length.should.be.equal(1);
    $('#pe_profile_clone').click();
    $('#pe_profiles option').length.should.be.equal(2);
    $('#pe_profiles option').val('Default');

    //console.log($('#pe_profiles').html());
    //console.log($('#pe_profiles').val());


    // I:C range
    $('#pe_ic_val_0').val().should.be.equal('30');
    $('#pe_ic_placeholder').find('img.addsingle').click();
    $('#pe_ic_val_0').val().should.be.equal('0');
    $('#pe_ic_val_1').val().should.be.equal('30');
    $('#pe_ic_placeholder').find('img.delsingle').click();
    $('#pe_ic_val_0').val().should.be.equal('30');

    // traget bg range
    $('#pe_targetbg_low_0').val().should.be.equal('100');
    $('#pe_targetbg_placeholder').find('img.addtargetbg').click();
    $('#pe_targetbg_low_0').val().should.be.equal('0');
    $('#pe_targetbg_low_1').val().should.be.equal('100');
    $('#pe_targetbg_placeholder').find('img.deltargetbg').click();
    $('#pe_targetbg_low_0').val().should.be.equal('100');


    $('#pe_submit').click();
    done();
  });

});
