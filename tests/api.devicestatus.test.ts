'use strict';

import 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Devicestatus API', function(this: any) {
  this.timeout(10000);
  var self = this;
  var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

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

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post a devicestatus, query, delete, verify gone', function (done: any) {
    // insert a devicestatus - needs to be unique from example data
    console.log('Inserting devicestatus entry');
    request(self.app)
      .post('/api/devicestatus/')
      .set('api-secret', known || '')
      .send({
        device: 'xdripjs://rigName'
        , xdripjs: {
          state: 6
          , stateString: 'OK'
          , txStatus: 0
          , txStatusString: 'OK'
        }
        , created_at: '2018-12-16T01:00:52Z'
      })
      .expect(200)
      .end(function (err: any) {
        if (err) {
          done(err);
        } else {
          // make sure devicestatus was inserted successfully
          console.log('Ensuring devicestatus entry was inserted successfully');
          request(self.app)
            .get('/api/devicestatus/')
            .query('find[created_at][$gte]=2018-12-16')
            .query('find[created_at][$lte]=2018-12-17')
            .set('api-secret', known || '')
            .expect(200)
            .expect(function (response: any) {
              console.log(JSON.stringify(response.body[0]));
              response.body[0].xdripjs.state.should.equal(6);
              response.body[0].utcOffset.should.equal(0);
            })
            .end(function (err: any) {
              if (err) {
                done(err);
              } else {
                // delete the treatment
                console.log('Deleting test treatment entry');
                request(self.app)
                  .delete('/api/devicestatus/')
                  .query('find[created_at][$gte]=2018-12-16')
                  .set('api-secret', known || '')
                  .expect(200)
                  .end(function (err: any) {
                    if (err) {
                      done(err);
                    } else {
                      // make sure it was deleted
                      console.log('Testing if devicestatus was deleted');
                      request(self.app)
                        .get('/api/devicestatus/')
                        .query('find[created_at][$lte]=2018-12-16')
                        .set('api-secret', known || '')
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
