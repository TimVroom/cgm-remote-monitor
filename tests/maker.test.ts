// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
var levels = require('../lib/levels');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('maker', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var maker = require('../lib/plugins/maker')(
    {
      extendedSettings: {maker: {key: '12345'}}
      , levels: levels
  });

  //prevent any calls to iftt
  function noOpMakeRequest (key: any, event: any, eventName: any, callback: any) {
    if (callback) { callback(); }
  }

  maker.makeKeyRequest = noOpMakeRequest;

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('turn values to a query', function (done: any) {
    maker.valuesToQuery({
      value1: 'This is a title'
      , value2: 'This is the message'
    }).should.equal('?value1=This%20is%20a%20title&value2=This%20is%20the%20message');
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('send a request', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'toLowerCase' does not exist on type '{ U... Remove this comment to see the full error message
    maker.sendEvent({name: 'test', message: 'This is the message', level: levels.toLowerCase(levels.WARN)}, function sendCallback (err: any) {
      should.not.exist(err);
      done();
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('not send a request without a name', function (done: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'toLowerCase' does not exist on type '{ U... Remove this comment to see the full error message
    maker.sendEvent({level: levels.toLowerCase(levels.WARN)}, function sendCallback (err: any) {
      should.exist(err);
      done();
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('not send a request without a level', function (done: any) {
    maker.sendEvent({name: 'test'}, function sendCallback (err: any) {
      should.exist(err);
      done();
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('send a allclear, but only once', function (done: any) {
    function mockedToTestSingleDone (key: any, event: any, eventName: any, callback: any) {
      callback(); done();
    }

    maker.makeKeyRequest = mockedToTestSingleDone;
    maker.sendAllClear({}, function sendCallback (err: any, result: any) {
      should.not.exist(err);
      result.sent.should.equal(true);
    });

    //send again, if done is called again test will fail
    maker.sendAllClear({}, function sendCallback (err: any, result: any) {
      should.not.exist(err);
      result.sent.should.equal(false);
    });
  });
});


// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('multi announcement maker', function ( ) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var maker = require('../lib/plugins/maker')({extendedSettings: {maker: {key: 'use announcementKey instead', announcementKey: '12345 6789'}}});

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('send 2 requests for the 2 keys', function (done: any) {

    var key1Found = false;
    var key2Found = false;

    maker.makeKeyRequest = function expect2Keys (key: any, event: any, eventName: any, callback: any) {
      if (callback) { callback(); }

      key1Found = key1Found || key === '12345';
      key2Found = key2Found || key === '6789';

      if (eventName === 'ns-warning-test' && key1Found && key2Found) {
        done();
      }
    };

    // @ts-expect-error TS(2339) FIXME: Property 'toLowerCase' does not exist on type '{ U... Remove this comment to see the full error message
    maker.sendEvent({name: 'test', level: levels.toLowerCase(levels.WARN), isAnnouncement: true}, function sendCallback (err: any) {
      should.not.exist(err);
    });
  });

});
