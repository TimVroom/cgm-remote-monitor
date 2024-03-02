/* eslint require-atomic-updates: 0 */
'use strict';

import 'should';
import * as should from 'should';

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API3 SEARCH', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , testConst = require('./fixtures/api3/const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , opTools = require('../lib/api3/shared/operationTools')
    ;

  self.docs = testConst.SAMPLE_ENTRIES;

  self.timeout(15000);


  /**
   * Get document detail for futher processing
   */
  self.get = function get (identifier: any, done: any) {
    self.instance.get(`${self.url}/${identifier}`, self.jwt.read)
      .expect(200)
      .end((err: any, res: any) => {
        should.not.exist(err);
        done(res.body);
      });
  };


  /**
   * Create given document in a promise
   */
  self.create = (doc: any) => new Promise((resolve) => {
    doc.identifier = opTools.calculateIdentifier(doc);
    self.instance.post(`${self.url}`, self.jwt.all)
      .send(doc)
      .end((err: any) => {
        should.not.exist(err);
        self.get(doc.identifier, resolve);
      });
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.testStarted = new Date();
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.url = '/api/v3/entries';

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'read',
      'all'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
    self.urlTest = `${self.url}?srvModified$gte=${self.testStarted.getTime()}`;

    const promises = testConst.SAMPLE_ENTRIES.map((doc: any) => self.create(doc));
    self.docs = await Promise.all(promises);
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(() => {
    self.instance.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require authentication', async () => {
    let res = await self.instance.get(self.url)
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal('Missing or bad access token or JWT');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing collection', async () => {
    let res = await self.instance.get(`/api/v3/NOT_EXIST`, self.jwt.read)
      .send(self.validDoc)
      .expect(404);

    res.body.status.should.equal(404);
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should found at least 10 documents', async () => {
    let res = await self.instance.get(self.url, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.length.should.be.aboveOrEqual(self.docs.length);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should found at least 10 documents from test start', async () => {
    let res = await self.instance.get(self.urlTest, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.length.should.be.aboveOrEqual(self.docs.length);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject invalid limit - not a number', async () => {
    let res = await self.instance.get(`${self.url}?limit=INVALID`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameter limit out of tolerance');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject invalid limit - negative number', async () => {
    let res = await self.instance.get(`${self.url}?limit=-1`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameter limit out of tolerance');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject invalid limit - zero', async () => {
    let res = await self.instance.get(`${self.url}?limit=0`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameter limit out of tolerance');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should accept valid limit', async () => {
    let res = await self.instance.get(`${self.url}?limit=3`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.length.should.equal(3);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject invalid skip - not a number', async () => {
    let res = await self.instance.get(`${self.url}?skip=INVALID`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameter skip out of tolerance');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject invalid skip - negative number', async () => {
    let res = await self.instance.get(`${self.url}?skip=-5`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameter skip out of tolerance');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject both sort and sort$desc', async () => {
    let res = await self.instance.get(`${self.url}?sort=date&sort$desc=created_at`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameters sort and sort_desc cannot be combined');
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should sort well by date field', async () => {
    let res = await self.instance.get(`${self.urlTest}&sort=date`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    const ascending = res.body.result;
    const length = ascending.length;
    length.should.be.aboveOrEqual(self.docs.length);

    res = await self.instance.get(`${self.urlTest}&sort$desc=date`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    const descending = res.body.result;
    descending.length.should.equal(length);

    for (let i in ascending) {
      // @ts-expect-error TS(2363) FIXME: The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
      ascending[i].should.eql(descending[length - i - 1]);

      // @ts-expect-error TS(2365) FIXME: Operator '>' cannot be applied to types 'string' a... Remove this comment to see the full error message
      if (i > 0) {
        // @ts-expect-error TS(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
        ascending[i - 1].date.should.be.lessThanOrEqual(ascending[i].date);
      }
    }
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should skip documents', async () => {
    let res = await self.instance.get(`${self.url}?sort=date&limit=8`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    const fullDocs = res.body.result;
    fullDocs.length.should.equal(8);

    res = await self.instance.get(`${self.url}?sort=date&skip=3&limit=5`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    const skipDocs = res.body.result;
    skipDocs.length.should.equal(5);

    for (let i = 0; i < 3; i++) {
      skipDocs[i].should.be.eql(fullDocs[i + 3]);
    }
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should project selected fields', async () => {
    let res = await self.instance.get(`${self.url}?fields=date,app,subject`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.forEach((doc: any) => {
      const docFields = Object.getOwnPropertyNames(doc);
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'string[]... Remove this comment to see the full error message
      docFields.sort().should.be.eql(['app', 'date', 'subject']);
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should project all fields', async () => {
    let res = await self.instance.get(`${self.url}?fields=_all`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.forEach((doc: any) => {
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'number'.
      Object.getOwnPropertyNames(doc).length.should.be.aboveOrEqual(10);
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
      Object.prototype.hasOwnProperty.call(doc, '_id').should.not.be.true();
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
      Object.prototype.hasOwnProperty.call(doc, 'identifier').should.be.true();
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
      Object.prototype.hasOwnProperty.call(doc, 'srvModified').should.be.true();
      // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
      Object.prototype.hasOwnProperty.call(doc, 'srvCreated').should.be.true();
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not exceed the limit of docs count', async () => {
    const apiApp = self.instance.ctx.apiApp
      , limitBackup = apiApp.get('API3_MAX_LIMIT');
    apiApp.set('API3_MAX_LIMIT', 5);
    let res = await self.instance.get(`${self.url}?limit=10`, self.jwt.read)
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Parameter limit out of tolerance');
    apiApp.set('API3_MAX_LIMIT', limitBackup);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should respect the ceiling (hard) limit of docs', async () => {
    const apiApp = self.instance.ctx.apiApp
      , limitBackup = apiApp.get('API3_MAX_LIMIT');
    apiApp.set('API3_MAX_LIMIT', 5);
    let res = await self.instance.get(`${self.url}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.length.should.equal(5);
    apiApp.set('API3_MAX_LIMIT', limitBackup);
  });

});

