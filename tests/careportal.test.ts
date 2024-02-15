'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var benv = require('benv');

// @ts-expect-error TS(2403): Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var nowData = {
  sgvs: [
    { mgdl: 100, mills: Date.now(), direction: 'Flat', type: 'sgv' }
  ]
  , treatments: []
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sleep'.
function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('careportal', function(this: any) {
  this.timeout(60000); // TODO: see why this test takes longer on Travis to complete

  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var headless = require('./fixtures/headless')(benv, this);

  // @ts-expect-error TS(2304): Cannot find name 'before'.
  before(function (done: any) {

    const t = Date.now();
    console.log('Starting headless setup for Careportal test');
    
    function d () {
      console.log('Done called by headless', Date.now() - t );
      done();
    }

    headless.setup({mockAjax: true}, d);
    console.log('Headless setup for Careportal test done');
  });

  // @ts-expect-error TS(2304): Cannot find name 'after'.
  after(function (done: any) {
    headless.teardown( );
    done( );
  });

  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it ('open careportal, and enter a treatment', async () =>{

    console.log('Careportal test client start');

// @ts-expect-error TS(2339): Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
	  var client = window.Nightscout.client;
	
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var hashauth = require('../lib/client/hashauth');
    hashauth.init(client,$);
    // @ts-expect-error TS(7006): Parameter 'next' implicitly has an 'any' type.
    hashauth.verifyAuthentication = function mockVerifyAuthentication(next) { 
      hashauth.authenticated = true;
      next(true); 
    };

    console.log('Careportal test client init');
    client.init();
    sleep(50);

    console.log('Careportal test client data update');
    client.dataUpdate(nowData, true);
    sleep(50);

    client.careportal.prepareEvents();

    $('#eventType').val('Snack Bolus');
    $('#glucoseValue').val('100');
    $('#carbsGiven').val('10');
    $('#insulinGiven').val('0.60');
    $('#preBolus').val(15);
    $('#notes').val('Testing');
    $('#enteredBy').val('Dad');

    //simulate some events
    client.careportal.eventTimeTypeChange();
    client.careportal.dateTimeFocus();
    client.careportal.dateTimeChange();

    window.confirm = function mockConfirm (message) {
      // @ts-expect-error TS(7006): Parameter 'line' implicitly has an 'any' type.
      function containsLine (line) {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        message.indexOf(line + '\n').should.be.greaterThan(0);
      }

      containsLine('Event Type: Snack Bolus');
      containsLine('Blood Glucose: 100');
      containsLine('Carbs Given: 10');
      containsLine('Insulin Given: 0.60');
      containsLine('Carb Time: 15 mins');
      containsLine('Notes: Testing');
      containsLine('Entered By: Dad');

      return true;
    };

    window.alert = function mockAlert(messages) { messages.should.equal(''); };
    
    console.log('Careportal test saving');

    client.careportal.save();

  });

});
