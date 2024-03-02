/* eslint require-atomic-updates: 0 */
/* global should */
'use strict';

import 'should';
import * as should from 'should';

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API3 UPDATE', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , testConst = require('./fixtures/api3/const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , utils = require('./fixtures/api3/utils')
    ;

  self.validDoc = {
    identifier: utils.randomString('32', 'aA#'),
    date: (new Date()).getTime(),
    utcOffset: -180,
    app: testConst.TEST_APP,
    device: testConst.TEST_DEVICE + ' API3 UPDATE',
    eventType: 'Correction Bolus',
    insulin: 0.3
  };

  self.timeout(15000);


  /**
   * Get document detail for futher processing
   */
  self.get = async function get (identifier: any) {
    let res = await self.instance.get(`${self.url}/${identifier}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    return res.body.result;
  };


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.col = 'treatments'
    self.url = `/api/v3/${self.col}`;

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'read',
      'update',
      'delete',
      'all'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
    self.urlIdent = `${self.url}/${self.validDoc.identifier}`
    self.cache = self.instance.cacheMonitor;
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(() => {
    self.instance.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    self.cache.clear();
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    self.cache.shouldBeEmpty();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require authentication', async () => {
    let res = await self.instance.put(`${self.url}/FAKE_IDENTIFIER`)
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal('Missing or bad access token or JWT');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing collection', async () => {
    let res = await self.instance.put(`/api/v3/NOT_EXIST`, self.jwt.update)
      .send(self.validDoc)
      .expect(404);

    res.body.status.should.equal(404);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require update permission for upsert', async () => {
    let res = await self.instance.put(`${self.url}/${self.validDoc.identifier}`, self.jwt.update)
      .send(self.validDoc)
      .expect(403);

    res.body.status.should.equal(403);
    res.body.message.should.equal('Missing permission api:treatments:create');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should upsert not existing document', async () => {
    let res = await self.instance.put(`${self.url}/${self.validDoc.identifier}`, self.jwt.all)
      .send(self.validDoc)
      .expect(201);

    res.body.status.should.equal(201);
    res.body.identifier.should.equal(self.validDoc.identifier);
    self.cache.nextShouldEql(self.col, self.validDoc)

    const lastModified = new Date(res.headers['last-modified']).getTime(); // Last-Modified has trimmed milliseconds

    let body = await self.get(self.validDoc.identifier, self.jwt.read);
    body.should.containEql(self.validDoc);
    should.not.exist(body.modifiedBy);

    const ms = body.srvModified % 1000;
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'number'.
    (body.srvModified - ms).should.equal(lastModified);
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'number'.
    (body.srvCreated - ms).should.equal(lastModified);
    body.subject.should.equal(self.subject.apiAll.name);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should update the document', async () => {
    self.validDoc.carbs = 10;
    delete self.validDoc.insulin;

    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(self.validDoc)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldEql(self.col, self.validDoc)

    const lastModified = new Date(res.headers['last-modified']).getTime(); // Last-Modified has trimmed milliseconds

    let body = await self.get(self.validDoc.identifier, self.jwt.read);
    body.should.containEql(self.validDoc);
    should.not.exist(body.insulin);
    should.not.exist(body.modifiedBy);

    const ms = body.srvModified % 1000;
    // @ts-expect-error TS(2339) FIXME: Property 'should' does not exist on type 'number'.
    (body.srvModified - ms).should.equal(lastModified);
    body.subject.should.equal(self.subject.apiUpdate.name);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should update unmodified document since', async () => {
    const doc = Object.assign({}, self.validDoc, {
      carbs: 11
    });
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .set('If-Unmodified-Since', new Date(new Date().getTime() + 1000).toUTCString())
      .send(doc)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldEql(self.col, doc)

    let body = await self.get(self.validDoc.identifier, self.jwt.read);
    body.should.containEql(doc);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not update document modified since', async () => {
    const doc = Object.assign({}, self.validDoc, {
      carbs: 12
    });
    let body = await self.get(doc.identifier);
    self.validDoc = body;

    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .set('If-Unmodified-Since', new Date(new Date(body.srvModified).getTime() - 1000).toUTCString())
      .send(doc)
      .expect(412);

    res.body.status.should.equal(412);

    body = await self.get(doc.identifier, self.jwt.read);
    body.should.eql(self.validDoc);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject date alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { date: self.validDoc.date + 10000 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field date cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject utcOffset alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { utcOffset: self.utcOffset - 120 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field utcOffset cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject eventType alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { eventType: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field eventType cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject device alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { device: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field device cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject app alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { app: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field app cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject srvCreated alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { srvCreated: self.validDoc.date - 10000 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field srvCreated cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject subject alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { subject: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field subject cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject srvModified alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { srvModified: self.validDoc.date - 100000 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field srvModified cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject modifiedBy alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { modifiedBy: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field modifiedBy cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject isValid alteration', async () => {
    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { isValid: false }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field isValid cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should ignore identifier alteration in body', async () => {
    self.validDoc = await self.get(self.validDoc.identifier);

    let res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { identifier: 'MODIFIED' }))
      .expect(200);

    res.body.status.should.equal(200);
    delete self.validDoc.srvModified;
    self.cache.nextShouldEql(self.col, self.validDoc)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not update deleted document', async () => {
    let res = await self.instance.delete(self.urlIdent, self.jwt.delete)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldDeleteLast(self.col)

    res = await self.instance.put(self.urlIdent, self.jwt.update)
      .send(self.validDoc)
      .expect(410);

    res.body.status.should.equal(410);
  });

});

