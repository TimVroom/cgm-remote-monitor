'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var assert = require('assert');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('mongo storage', function () {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    delete env.api_secret;
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('The module should be OK.', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    should.exist(require('../lib/storage/mongo-storage'));
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('After initializing the storage class it should re-use the open connection', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var store = require('../lib/storage/mongo-storage');
    store(env, function (err1: any, db1: any) {
      should.not.exist(err1);

      store(env, function (err2: any, db2: any) {
        should.not.exist(err2);
        assert(db1.db, db2.db, 'Check if the handlers are the same.');

        done();
      });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('When no connection-string is given the storage-class should throw an error.', function (done: any) {
    delete env.storageURI;
    should.not.exist(env.storageURI);

    (function () {
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      return require('../lib/storage/mongo-storage')(env, false, true);
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type '() => an... Remove this comment to see the full error message
    }).should.throw('MongoDB connection string is missing. Please set MONGODB_URI environment variable');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('An invalid connection-string should throw an error.', function (done: any) {
    env.storageURI = 'This is not a MongoDB connection-string';

    (async function () {
      try {
        // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        let foo = await require('../lib/storage/mongo-storage')(env, false, true);
        // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'false'.
        false.should.be.true();
      }
      catch (err) {
        console.log('We have failed, this is good!');
        done();
      }
    })();
    
  });

});

