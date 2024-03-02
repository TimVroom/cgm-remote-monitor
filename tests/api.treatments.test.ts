'use strict';

import 'should';
import * as should from 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _moment = require('moment');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Treatment API', function(this: any) {
  this.timeout(10000);
  var self = this;

  var api_secret_hash = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api = require('../lib/api/');
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(function(this: any, done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.env = require('../lib/server/env')();
    self.env.settings.authDefaultRoles = 'readable';
    self.env.settings.enable = ['careportal', 'api'];
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(self.env);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.app = require('express')();
    self.app.enable('api');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(self.env, language).boot(function booted(ctx: any) {
      self.ctx = ctx;
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      self.ctx.ddata = require('../lib/data/ddata')();
      self.app.use('/api', api(self.env, ctx));
      done();
    });
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function () {
    // delete process.env.API_SECRET;
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post single treatments', function (done: any) {

    self.ctx.treatments().remove({ }, function ( ) {
      var now = (new Date()).toISOString();
      request(self.app)
        .post('/api/treatments/')
        .set('api-secret', api_secret_hash || '')
        .send({eventType: 'Meal Bolus', created_at: now, carbs: '30', insulin: '2.00', preBolus: '15', glucose: 100, glucoseType: 'Finger', units: 'mg/dl', notes: '<IMG SRC="javascript:alert(\'XSS\');">'})
        .expect(200)
        .end(function (err: any) {
          if (err) {
            done(err);
          } else {
            self.ctx.treatments.list({}, function (err: any, list: any) {
              var sorted = _.sortBy(list, function (treatment: any) {
                return treatment.created_at;
              });
              sorted.length.should.equal(2);
              sorted[0].glucose.should.equal(100);
              sorted[0].notes.should.equal('<img>');
              should.not.exist(sorted[0].eventTime);
              sorted[0].insulin.should.equal(2);
              sorted[1].carbs.should.equal(30);
              done();
            });
          }
        });

    });
  });

  /*
  it('saving entry without created_at should fail', function (done) {

    self.ctx.treatments().remove({ }, function ( ) {
      request(self.app)
        .post('/api/treatments/')
        .set('api-secret', self.env.api_secret || '')
        .send({eventType: 'Meal Bolus', carbs: '30', insulin: '2.00', preBolus: '15', glucose: 100, glucoseType: 'Finger', units: 'mg/dl'})
        .expect(422)
        .end(function (err) {
          if (err) {
            done(err);
          } else {
              done();
          }
        });
    });
  });
*/

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post single treatments in zoned time format', function (done: any) {
   
    var current_time = Date.now();
    console.log('Testing date with local format: ', _moment(current_time).format("YYYY-MM-DDTHH:mm:ss.SSSZZ"));
      
    self.ctx.treatments().remove({ }, function ( ) {
      request(self.app)
        .post('/api/treatments/')
        .set('api-secret', api_secret_hash || '')
        .send({eventType: 'Meal Bolus', created_at: _moment(current_time).format("YYYY-MM-DDTHH:mm:ss.SSSZZ"), carbs: '30', insulin: '2.00', glucose: 100, glucoseType: 'Finger', units: 'mg/dl'})
        .expect(200)
        .end(function (err: any) {
          if (err) {
            done(err);
          } else {
            self.ctx.treatments.list({}, function (err: any, list: any) {
              var sorted = _.sortBy(list, function (treatment: any) {
                return treatment.created_at;
              });
              console.log(sorted);
              sorted.length.should.equal(1);
              sorted[0].glucose.should.equal(100);
              should.not.exist(sorted[0].eventTime);
              sorted[0].insulin.should.equal(2);
              sorted[0].carbs.should.equal(30);
              var zonedTime = _moment(current_time).utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
              sorted[0].created_at.should.equal(zonedTime);
              sorted[0].utcOffset.should.equal(-1* new Date().getTimezoneOffset());
              done();
            });
          }
        });

    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post a treatment array', function (done: any) {
    self.ctx.treatments().remove({ }, function ( ) {
      var now = (new Date()).toISOString();
      request(self.app)
        .post('/api/treatments/')
        .set('api-secret', api_secret_hash || '')
        .send([
          {eventType: 'BG Check', created_at: now, glucose: 100, preBolus: '0', glucoseType: 'Finger', units: 'mg/dl', notes: ''}
          , {eventType: 'Meal Bolus', created_at: now, carbs: '30', insulin: '2.00', preBolus: '15', glucose: 100, glucoseType: 'Finger', units: 'mg/dl'}
         ])
        .expect(200)
        .end(function (err: any) {
          if (err) {
            done(err);
          } else {
            self.ctx.treatments.list({}, function (err: any, list: any) {
              list.length.should.equal(3);
              should.not.exist(list[0].eventTime);
              should.not.exist(list[1].eventTime);

              done();
            });
          }
        });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post a treatment array and dedupe', function (done: any) {
    self.ctx.treatments().remove({ }, function ( ) {
      var now = (new Date()).toISOString();
      request(self.app)
        .post('/api/treatments/')
        .set('api-secret', api_secret_hash || '')
        .send([
          {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'BG Check', glucose: 100, units: 'mg/dl', created_at: now}
          , {eventType: 'Meal Bolus', created_at: now, carbs: '30', insulin: '2.00', preBolus: '15', glucose: 100, glucoseType: 'Finger', units: 'mg/dl'}
        ])
        .expect(200)
        .end(function (err: any) {
          if (err) {
            done(err);
          } else {
            self.ctx.treatments.list({}, function (err: any, list: any) {
              var sorted = _.sortBy(list, function (treatment: any) {
                return treatment.created_at;
              });

              if (sorted.length !== 3) {
                console.info('unexpected result length, sorted treatments:', sorted);
              }
              sorted.length.should.equal(3);
              sorted[0].glucose.should.equal(100);

              done();
            });
          }
        });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post a treatment, query, delete, verify gone', function (done: any) {
    // insert a treatment - needs to be unique from example data
    console.log('Inserting treatment entry');
    var now = (new Date()).toISOString();
    request(self.app)
      .post('/api/treatments/')
      .set('api-secret', api_secret_hash || '')
      .send({eventType: 'Meal Bolus', created_at: now, carbs: '99', insulin: '2.00', preBolus: '15', glucose: 100, glucoseType: 'Finger', units: 'mg/dl'})
      .expect(200)
      .end(function (err: any) {
        if (err) {
          done(err);
        } else {
          // make sure treatment was inserted successfully
          console.log('Ensuring treatment entry was inserted successfully');
          request(self.app)
            .get('/api/treatments/')
            .query('find[carbs]=99')
            .set('api-secret', api_secret_hash || '')
            .expect(200)
            .expect(function (response: any) {
              response.body[0].carbs.should.equal(99);
            })
            .end(function (err: any) {
              if (err) {
                done(err);
              } else {
                // delete the treatment
                console.log('Deleting test treatment entry');
                request(self.app)
                  .delete('/api/treatments/')
                  .query('find[carbs]=99')
                  .set('api-secret', api_secret_hash || '')
                  .expect(200)
                  .end(function (err: any) {
                    if (err) {
                      done(err);
                    } else {
                      // make sure it was deleted
                      console.log('Testing if entry was deleted');
                      request(self.app)
                        .get('/api/treatments/')
                        .query('find[carbs]=99')
                        .set('api-secret', api_secret_hash || '')
                        .expect(200)
                        .expect(function (response: any) {
                          response.body.length.should.equal(0);
                        })
                        .end(done);
                    }
                  });
              }
            });
        }
      });
  });
});
