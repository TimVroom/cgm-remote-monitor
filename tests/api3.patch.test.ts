/* eslint require-atomic-updates: 0 */
'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API3 PATCH', function(this: any) {
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

  self.validDoc = {
    date: (new Date()).getTime(),
    utcOffset: -180,
    app: testConst.TEST_APP,
    device: testConst.TEST_DEVICE + ' API3 PATCH',
    eventType: 'Correction Bolus',
    insulin: 0.3
  };
  self.validDoc.identifier = opTools.calculateIdentifier(self.validDoc);

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
    self.col = 'treatments';
    self.url = `/api/v3/${self.col}`;

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'create',
      'update',
      'read'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
    self.urlIdent = `${self.url}/${self.validDoc.identifier}`;
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
    let res = await self.instance.patch(`${self.url}/FAKE_IDENTIFIER`)
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal('Missing or bad access token or JWT');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing collection', async () => {
    let res = await self.instance.patch(`/api/v3/NOT_EXIST`, self.jwt.update)
      .send(self.validDoc)
      .expect(404);

    res.body.status.should.equal(404);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing document', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(self.validDoc)
      .expect(404);

    res.body.status.should.equal(404);

    // now let's insert the document for further patching
    res = await self.instance.post(`${self.url}`, self.jwt.create)
      .send(self.validDoc)
      .expect(201);

    res.body.status.should.equal(201);
    self.cache.nextShouldEql(self.col, self.validDoc)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject identifier alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { identifier: 'MODIFIED'}))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field identifier cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject date alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { date: self.validDoc.date + 10000 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field date cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject utcOffset alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { utcOffset: self.utcOffset - 120 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field utcOffset cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject eventType alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { eventType: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field eventType cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject device alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { device: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field device cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject app alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { app: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field app cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject srvCreated alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { srvCreated: self.validDoc.date - 10000 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field srvCreated cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject subject alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { subject: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field subject cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject srvModified alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { srvModified: self.validDoc.date - 100000 }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field srvModified cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject modifiedBy alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { modifiedBy: 'MODIFIED' }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field modifiedBy cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should reject isValid alteration', async () => {
    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(Object.assign({}, self.validDoc, { isValid: false }))
      .expect(400);

    res.body.status.should.equal(400);
    res.body.message.should.equal('Field isValid cannot be modified by the client');
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should patch document', async () => {
    self.validDoc.carbs = 10;

    let res = await self.instance.patch(self.urlIdent, self.jwt.update)
      .send(self.validDoc)
      .expect(200);

    res.body.status.should.equal(200);

    let body = await self.get(self.validDoc.identifier);
    body.carbs.should.equal(10);
    body.insulin.should.equal(0.3);
    body.subject.should.equal(self.subject.apiCreate.name);
    body.modifiedBy.should.equal(self.subject.apiUpdate.name);

    self.cache.nextShouldEql(self.col, body)
  });

});

