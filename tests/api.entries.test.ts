'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
var request = require('supertest');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var load = require('./fixtures/load');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var bootevent = require('../lib/server/bootevent');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

const FIVE_MINUTES=1000*60*5;
 
// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Entries REST api', function(this: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var entries = require('../lib/api/entries/');
  var self = this;
  var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

  this.timeout(10000);
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.env = require('../lib/server/env')( );
    self.env.settings.authDefaultRoles = 'readable';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.wares = require('../lib/middleware/')(self.env);
    self.archive = null;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.app = require('express')( );
    self.app.enable('api');
    bootevent(self.env, language).boot(function booted (ctx: any) {
      self.app.use('/', entries(self.app, self.wares, ctx, self.env));
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      self.archive = require('../lib/server/entries')(self.env, ctx);
      self.ctx = ctx;
      done();
    });
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(function (done: any) {
    var creating = load('json');

    for (let i = 0; i < 20; i++) {
      const e = {type: 'sgv', sgv: 100, date: Date.now()};
      e.date = e.date - FIVE_MINUTES * i;
      creating.push(e);
    }

    creating = _.sortBy(creating, function(item: any) {
      return item.date;
    });

    function setupDone() {
      console.log('Setup complete');
      done();
    }

    function waitForASecond() {
      // wait for event processing of cache entries to actually finish
      setTimeout(function() {
        setupDone();
       }, 100);
    }

    self.archive.create(creating, waitForASecond);

  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(function (done: any) {
    self.archive( ).remove({ }, done);
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function (done: any) {
    self.archive( ).remove({ }, done);
  });

  // keep this test pinned at or near the top in order to validate all
  // entries successfully uploaded. if res.body.length is short of the
  // expected value, it may indicate a regression in the create
  // function callback logic in entries.js.
  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('gets requested number of entries', function (done: any) {
    var count = 30;
    request(self.app)
      .get('/entries.json?find[dateString][$gte]=2014-07-19&count=' + count)
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(count);
        done();
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('gets default number of entries', function (done: any) {
    var defaultCount = 10;
    request(self.app)
      .get('/entries/sgv.json?find[dateString][$gte]=2014-07-19&find[dateString][$lte]=2014-07-20')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(defaultCount);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('gets entries in right order', function (done: any) {
    var defaultCount = 10;
    request(self.app)
      .get('/entries/sgv.json?find[dateString][$gte]=2014-07-19&find[dateString][$lte]=2014-07-20')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(defaultCount);
        
        var array = res.body;
        var firstEntry = array[0];
        var secondEntry = array[1];
        
        firstEntry.date.should.be.above(secondEntry.date);
        
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('gets entries in right order without type specifier', function (done: any) {
    var defaultCount = 10;
    request(self.app)
      .get('/entries.json')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(defaultCount);
        
        var array = res.body;
        var firstEntry = array[0];
        var secondEntry = array[1];
        
        firstEntry.date.should.be.above(secondEntry.date);
        
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/echo/ api shows query', function (done: any) {
    request(self.app)
      .get('/echo/entries/sgv.json?find[dateString][$gte]=2014-07-19&find[dateString][$lte]=2014-07-20')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Object);
        res.body.query.should.be.instanceof(Object);
        res.body.input.should.be.instanceof(Object);
        res.body.input.find.should.be.instanceof(Object);
        res.body.storage.should.equal('entries');
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/slice/ can slice time', function (done: any) {
    var app = self.app;
    request(app)
      .get('/slice/entries/dateString/sgv/2014-07.json?count=20')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(20);
        done( );
      });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/times/echo can describe query', function (done: any) {
    var app = self.app;
    request(app)
      .get('/times/echo/2014-07/.*T{00..05}:.json?count=20&find[sgv][$gte]=160')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Object);
        res.body.req.should.have.property('query');
        res.body.should.have.property('pattern').with.lengthOf(6);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/slice/ can slice with multiple prefix', function (done: any) {
    var app = self.app;
    request(app)
      .get('/slice/entries/dateString/sgv/2014-07-{17..20}.json?count=20')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(20);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/slice/ can slice time with prefix and no results', function (done: any) {
    var app = self.app;
    request(app)
      .get('/slice/entries/dateString/sgv/1999-07.json?count=20&find[sgv][$lte]=401')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(0);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/times/ can get modal times', function (done: any) {
    var app = self.app;
    request(app)
      .get('/times/2014-07-/{0..30}T.json?')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(10);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/times/ can get modal minutes and times', function (done: any) {
    var app = self.app;
    request(app)
      .get('/times/20{14..15}-07/T{09..10}.json?')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(10);
        done( );
      });
  });
  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/times/ can get multiple prefixen and modal minutes and times', function (done: any) {
    var app = self.app;
    request(app)
      .get('/times/20{14..15}/T.*:{00..60}.json?')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(10);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/entries/current.json', function (done: any) {
    request(self.app)
      .get('/entries/current.json')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);
        res.body[0].sgv.should.equal(100);
        done();
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/entries/:id', function (done: any) {
    var app = self.app;
    self.archive.list({count: 1}, function(err: any, records: any) {
      var currentId = records.pop()._id.toString();
      request(app)
        .get('/entries/'+currentId+'.json')
        .expect(200)
        .end(function (err: any, res: any) {
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);
          res.body[0]._id.should.equal(currentId);
          done( );
        });
      });
    });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('/entries/:model', function (done: any) {
    var app = self.app;
    request(app)
      .get('/entries/sgv/.json?count=10&find[dateString][$gte]=2014')
      .expect(200)
      .end(function (err: any, res: any) {
        res.body.should.be.instanceof(Array).and.have.lengthOf(10);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('disallow POST by readable /entries/preview', function (done: any) {
    request(self.app)
      .post('/entries/preview.json')
      .send(load('json'))
      .expect(401)
      .end(function (err: any, res: any) {
        // res.body.should.be.instanceof(Array).and.have.lengthOf(30);
        done();
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('disallow deletes unauthorized', function (done: any) {
    var app = self.app;

    request(app)
      .delete('/entries/sgv?find[dateString][$gte]=2014-07-19&find[dateString][$lte]=2014-07-20')
      .expect(401)
      .end(function (err: any) {
        if (err) {
          done(err);
        } else {
          request(app)
            .get('/entries/sgv.json?find[dateString][$gte]=2014-07-19&find[dateString][$lte]=2014-07-20')
            .expect(200)
            .end(function (err: any, res: any) {
              res.body.should.be.instanceof(Array).and.have.lengthOf(10);
              done();
            });
        }
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post an entry, query, delete, verify gone', function (done: any) {
    // insert a glucose entry - needs to be unique from example data
    console.log('Inserting glucose entry')
    request(self.app)
      .post('/entries/')
      .set('api-secret', known || '')
      .send({
        "type": "sgv", "sgv": "199", "dateString": "2014-07-20T00:44:15.000-07:00"
        , "date": 1405791855000, "device": "dexcom", "direction": "NOT COMPUTABLE"
      })
      .expect(200)
      .end(function (err: any) {
        if (err) {
          done(err);
        } else {
          // make sure treatment was inserted successfully
          console.log('Ensuring glucose entry was inserted successfully');
          request(self.app)
            .get('/entries.json?find[dateString][$gte]=2014-07-20&count=100')
            .set('api-secret', known || '')
            .expect(200)
            .expect(function (response: any) {
              var entry = response.body[0];
              entry.sgv.should.equal('199');
              entry.utcOffset.should.equal(-420);
            })
            .end(function (err: any) {
              if (err) {
                done(err);
              } else {
                // delete the glucose entry
                console.log('Deleting test glucose entry');
                request(self.app)
                  .delete('/entries.json?find[dateString][$gte]=2014-07-20&count=100')
                  .set('api-secret', known || '')
                  .expect(200)
                  .end(function (err: any) {
                    if (err) {
                      done(err);
                    } else {
                      // make sure it was deleted
                      console.log('Testing if glucose entry was deleted');
                      request(self.app)
                        .get('/entries.json?find[dateString][$gte]=2014-07-20&count=100')
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

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('post multiple entries, query, delete, verify gone', function (done: any) {
    // insert a glucose entry - needs to be unique from example data
    console.log('Inserting glucose entry')
    request(self.app)
      .post('/entries/')
      .set('api-secret', known || '')
      .send([{
        "type": "sgv", "sgv": "199", "dateString": "2014-07-20T00:44:15.000-07:00"
        , "date": 1405791855000, "device": "dexcom", "direction": "NOT COMPUTABLE"
      }, {
        "type": "sgv", "sgv": "200", "dateString": "2014-07-20T00:44:15.001-07:00"
        , "date": 1405791855001, "device": "dexcom", "direction": "NOT COMPUTABLE"
      }])
      .expect(200)
      .end(function (err: any) {
        if (err) {
          done(err);
        } else {
          // make sure treatment was inserted successfully
          console.log('Ensuring glucose entry was inserted successfully');
          request(self.app)
            .get('/entries.json?find[dateString][$gte]=2014-07-20&count=100')
            .set('api-secret', known || '')
            .expect(200)
            .expect(function (response: any) {
              var entry = response.body[0];
              response.body.length.should.equal(2);
              entry.sgv.should.equal('200');
              entry.utcOffset.should.equal(-420);
            })
            .end(function (err: any) {
              if (err) {
                done(err);
              } else {
                // delete the glucose entry
                console.log('Deleting test glucose entry');
                request(self.app)
                  .delete('/entries.json?find[dateString][$gte]=2014-07-20&count=100')
                  .set('api-secret', known || '')
                  .expect(200)
                  .end(function (err: any) {
                    if (err) {
                      done(err);
                    } else {
                      // make sure it was deleted
                      console.log('Testing if glucose entries were deleted');
                      request(self.app)
                        .get('/entries.json?find[dateString][$gte]=2014-07-20&count=100')
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
