'use strict';

import 'should';
import * as should from 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var load = require('./fixtures/load');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('authed REST api', function(this: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var entries = require('../lib/api/entries/');

  this.timeout(20000);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function(this: any, done: any) {
    var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.settings.authDefaultRoles = 'readable';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(env);
    this.archive = null;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.app = require('express')( );
    this.app.enable('api');
    var self = this;
    self.known_key = known;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(env, language).boot(function booted (ctx: any) {
      self.app.use('/', entries(self.app, self.wares, ctx, env));
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      self.archive = require('../lib/server/entries')(env, ctx);

      var creating = load('json');
      // creating.push({type: 'sgv', sgv: 100, date: Date.now()});
      self.archive.create(creating, done);
    });
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(function(this: any, done: any) {
    var creating = load('json');
    creating.push({type: 'sgv', sgv: 100, date: Date.now()});
    this.archive.create(creating, done);
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(function(this: any, done: any) {
    this.archive( ).remove({ }, done);
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function(this: any, done: any) {
    this.archive( ).remove({ }, done);
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('disallow unauthorized POST', function(this: any, done: any) {
    var app = this.app;

    var new_entry = {type: 'sgv', sgv: 100, date: Date.now() };
    // @ts-expect-error TS(2339) FIXME: Property 'dateString' does not exist on type '{ ty... Remove this comment to see the full error message
    new_entry.dateString = new Date(new_entry.date).toISOString( );
    request(app)
      .post('/entries.json?')
      .send([new_entry])
      .expect(401)
      .end(function (err: any, res: any) {
        res.body.status.should.equal(401);
        res.body.message.should.equal('Unauthorized');
        should.exist(res.body.description);
        done(err);
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/entries/preview', function(this: any, done: any) {
    var known_key = this.known_key;
    request(this.app)
      .post('/entries/preview.json')
      .set('api-secret', known_key)
      .send(load('json'))
      .expect(201)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(30);
        done();
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('allow authorized POST', function(this: any, done: any) {
    var app = this.app;
    var known_key = this.known_key;

    var new_entry = {type: 'sgv', sgv: 100, date: Date.now() };
    // @ts-expect-error TS(2339) FIXME: Property 'dateString' does not exist on type '{ ty... Remove this comment to see the full error message
    new_entry.dateString = new Date(new_entry.date).toISOString( );
    request(app)
      .post('/entries.json?')
      .set('api-secret', known_key)
      .send([new_entry])
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);
        request(app)
          // @ts-expect-error TS(2339) FIXME: Property 'dateString' does not exist on type '{ ty... Remove this comment to see the full error message
          .get('/slice/entries/dateString/sgv/' + new_entry.dateString.split('T')[0] + '.json')
          .expect(200)
          .end(function (err: any, res: any) {
            res.body.should.be.instanceof(Array).and.have.lengthOf(1);
            
            if (err) {
              done(err);
            } else {
              request(app)
                // @ts-expect-error TS(2339) FIXME: Property 'dateString' does not exist on type '{ ty... Remove this comment to see the full error message
                .delete('/entries/sgv?find[dateString]=' + new_entry.dateString)
                .set('api-secret', known_key)
                .expect(200)
                .end(function (err: any) {
                  done(err);
                });
              }
          });
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('disallow deletes unauthorized', function(this: any, done: any) {
    var app = this.app;

    request(app)
      .get('/entries.json?find[dateString][$gte]=2014-07-18')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(10);
        request(app)
          .delete('/entries/sgv?find[dateString][$gte]=2014-07-18&find[dateString][$lte]=2014-07-20')
          // .set('api-secret', 'missing')
          .expect(401)
          .end(function (err: any) {
            if (err) {
              done(err);
            } else {
              request(app)
                .get('/entries/sgv.json?find[dateString][$gte]=2014-07-18&find[dateString][$lte]=2014-07-20')
                .expect(200)
                .end(function (err: any, res: any) {
                  res.body.should.be.instanceof(Array).and.have.lengthOf(10);
                  done();
                });
            }
          });
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('allow deletes when authorized', function(this: any, done: any) {
    var app = this.app;

    request(app)
      .delete('/entries/sgv?find[dateString][$gte]=2014-07-18&find[dateString][$lte]=2014-07-20')
      .set('api-secret', this.known_key)
      .expect(200)
      .end(function (err: any) {
        if (err) {
          done(err);
        } else {
          request(app)
            .get('/entries/sgv.json?find[dateString][$gte]=2014-07-18&find[dateString][$lte]=2014-07-20')
            .expect(200)
            .end(function (err: any, res: any) {
              res.body.should.be.instanceof(Array).and.have.lengthOf(0);
              done();
            });
        }
      });
  });



});
