/* eslint require-atomic-updates: 0 */
/* global should */
'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API3 READ', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , testConst = require('./fixtures/api3/const.json')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , opTools = require('../lib/api3/shared/operationTools')
  ;

  self.validDoc = {
    date: (new Date()).getTime(),
    app: testConst.TEST_APP,
    device: testConst.TEST_DEVICE + ' API3 READ',
    uploaderBattery: 58
  };
  self.validDoc.identifier = opTools.calculateIdentifier(self.validDoc);

  self.timeout(15000);


  // @ts-expect-error TS(2304): Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.col = 'devicestatus';
    self.url = `/api/v3/${self.col}`;

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'create',
      'read',
      'delete'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
    self.cache = self.instance.cacheMonitor;
  });


  // @ts-expect-error TS(2304): Cannot find name 'after'.
  after(() => {
    self.instance.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    self.cache.clear();
  });


  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    self.cache.shouldBeEmpty();
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should require authentication', async () => {
    let res = await self.instance.get(`${self.url}/FAKE_IDENTIFIER`)
      .expect(401);

    res.body.status.should.equal(401);
    res.body.message.should.equal('Missing or bad access token or JWT');
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing collection', async () => {
    let res = await self.instance.get(`/api/v3/NOT_EXIST/NOT_EXIST`, self.jwt.read)
      .send(self.validDoc)
      .expect(404);

    res.body.status.should.equal(404);
    should.not.exist(res.body.result);
    self.cache.shouldBeEmpty()
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not found not existing document', async () => {
    let res = await self.instance.get(`${self.url}/${self.validDoc.identifier}`, self.jwt.read)
      .expect(404);

    res.body.status.should.equal(404);
    should.not.exist(res.body.result);
    self.cache.shouldBeEmpty()
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should read just created document', async () => {
    let res = await self.instance.post(`${self.url}`, self.jwt.create)
      .send(self.validDoc)
      .expect(201);

    res.body.status.should.equal(201);

    res = await self.instance.get(`${self.url}/${self.validDoc.identifier}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    const result = res.body.result;
    result.should.containEql(self.validDoc);
    result.should.have.property('srvCreated').which.is.a.Number();
    result.should.have.property('srvModified').which.is.a.Number();
    result.should.have.property('subject');
    self.validDoc.subject = result.subject; // let's store subject for later tests

    self.cache.nextShouldEql(self.col, self.validDoc)
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should contain only selected fields', async () => {
    let res = await self.instance.get(`${self.url}/${self.validDoc.identifier}?fields=date,device,subject`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    const correct = {
      date: self.validDoc.date,
      device: self.validDoc.device,
      subject: self.validDoc.subject
    };
    res.body.result.should.eql(correct);
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should contain all fields', async () => {
    let res = await self.instance.get(`${self.url}/${self.validDoc.identifier}?fields=_all`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    for (let fieldName of ['app', 'date', 'device', 'identifier', 'srvModified', 'uploaderBattery', 'subject']) {
      res.body.result.should.have.property(fieldName);
    }
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not send unmodified document since', async () => {
    let res = await self.instance.get(`${self.url}/${self.validDoc.identifier}`, self.jwt.read)
      .set('If-Modified-Since', new Date(new Date().getTime() + 1000).toUTCString())
      .expect(304);

    res.body.should.be.empty();
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should send modified document since', async () => {
    let res = await self.instance.get(`${self.url}/${self.validDoc.identifier}`, self.jwt.read)
      .set('If-Modified-Since', new Date(new Date(self.validDoc.date).getTime() - 1000).toUTCString())
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.should.containEql(self.validDoc);
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should recognize softly deleted document', async () => {
    let res = await self.instance.delete(`${self.url}/${self.validDoc.identifier}`, self.jwt.delete)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldDeleteLast(self.col)

    res = await self.instance.get(`${self.url}/${self.validDoc.identifier}`, self.jwt.read)
      .expect(410);

    res.body.status.should.equal(410);
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not find permanently deleted document', async () => {
    let res = await self.instance.delete(`${self.url}/${self.validDoc.identifier}?permanent=true`, self.jwt.delete)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldDeleteLast(self.col)

    res = await self.instance.get(`${self.url}/${self.validDoc.identifier}`, self.jwt.read)
      .expect(404);

    res.body.status.should.equal(404);
    should.not.exist(res.body.result);
  });


  // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should find document created by APIv1', async () => {

    const doc = Object.assign({}, self.validDoc, {
      created_at: new Date(self.validDoc.date).toISOString()
    });
    delete doc.identifier;

    await new Promise((resolve, reject) => {
      self.instance.ctx.devicestatus.create([doc], async (err: any) => { // let's insert the document in APIv1's way

        should.not.exist(err);
        doc._id = doc._id.toString();
        self.cache.nextShouldEql(self.col, doc)

        err ? reject(err) : resolve(doc);
      });
    });

    const identifier = doc._id.toString();
    delete doc._id;

    let res = await self.instance.get(`${self.url}/${identifier}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.should.containEql(doc);

    res = await self.instance.delete(`${self.url}/${identifier}?permanent=true`, self.jwt.delete)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldDeleteLast(self.col)
  });


})
;

