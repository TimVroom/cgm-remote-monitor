'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('openaps storage', function () {

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var env = require('../lib/server/env')();


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    delete env.api_secret;
    env.storageURI = 'openaps://../../tests/fixtures/openaps-storage/config';
    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('The module class should be OK.', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/storage/openaps-storage')(env, function callback (err: any, storage: any) {
      should.not.exist(err);
      should.exist(storage.collection);
      should.exist(storage.ensureIndexes);
      done();
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('find sgv entries', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/storage/openaps-storage')(env, function callback (err: any, storage: any) {
      should.not.exist(err);
      should.exist(storage.collection);

      storage.collection('entries').find({type: 'sgv'}).toArray(function callback (err: any, results: any) {
        should.not.exist(err);
        should.exist(results);

        results.length.should.equal(4);
        results[0].sgv.should.equal(102);

        done();
      });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('find cal entries', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/storage/openaps-storage')(env, function callback (err: any, storage: any) {
      should.not.exist(err);
      should.exist(storage.collection);

      storage.collection('entries').find({type: 'cal'}).toArray(function callback (err: any, results: any) {
        should.not.exist(err);
        should.exist(results);

        results.length.should.equal(1);
        results[0].slope.should.equal(841.6474113376482);

        done();
      });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('find devicestatus entries', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/storage/openaps-storage')(env, function callback (err: any, storage: any) {
      should.not.exist(err);
      should.exist(storage.collection);

      storage.collection('devicestatus').find({}).toArray(function callback (err: any, results: any) {
        should.not.exist(err);
        should.exist(results);

        results.length.should.equal(1);
        results[0].openaps.enacted.eventualBG.should.equal(82);

        done();
      });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('find treatments', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/storage/openaps-storage')(env, function callback (err: any, storage: any) {
      should.not.exist(err);
      should.exist(storage.collection);

      storage.collection('treatments').find({}).toArray(function callback (err: any, results: any) {
        should.not.exist(err);
        should.exist(results);

        results.length.should.equal(2);
        results[0].eventType.should.equal('Temp Basal');

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
      return require('../lib/storage/openaps-storage')(env);
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type '() => an... Remove this comment to see the full error message
    }).should.throw('openaps config uri is missing or invalid');

    done();
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('An invalid connection-string should throw an error.', function (done: any) {
    env.storageURI = 'This is not an openaps config path';

    (function () {
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      return require('../lib/storage/openaps-storage')(env);
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type '() => an... Remove this comment to see the full error message
    }).should.throw(Error);

    done();
  });

});

