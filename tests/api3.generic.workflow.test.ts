/* eslint require-atomic-updates: 0 */
'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Generic REST API3', function(this: any) {
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

  self.urlLastModified = '/api/v3/lastModified';
  self.historyTimestamp = 0;

  self.docOriginal = {
    eventType: 'Correction Bolus',
    insulin: 1,
    date: (new Date()).getTime(),
    app: testConst.TEST_APP,
    device: testConst.TEST_DEVICE + ' Generic REST API3'
  };
  self.identifier = opTools.calculateIdentifier(self.docOriginal);
  self.docOriginal.identifier = self.identifier;

    this.timeout(30000);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.col = 'treatments';
    self.urlCol = `/api/v3/${self.col}`;
    self.urlResource = self.urlCol + '/' + self.identifier;
    self.urlHistory = self.urlCol + '/history';

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'create',
      'update',
      'read',
      'delete'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
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


  self.checkHistoryExistence = async function checkHistoryExistence (assertions: any) {

    let res = await self.instance.get(`${self.urlHistory}/${self.historyTimestamp}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.length.should.be.above(0);
    res.body.result.should.matchAny((value: any) => {
      value.identifier.should.be.eql(self.identifier);
      value.srvModified.should.be.above(self.historyTimestamp);

      if (typeof(assertions) === 'function') {
        assertions(value);
      }

      self.historyTimestamp = value.srvModified;
    });
  };


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('LAST MODIFIED to get actual server timestamp', async () => {
    let res = await self.instance.get(`${self.urlLastModified}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    self.historyTimestamp = res.body.result.collections.treatments;
    if (!self.historyTimestamp) {
      self.historyTimestamp = res.body.result.srvDate - (10 * 60 * 1000);
    }
    self.historyTimestamp.should.be.aboveOrEqual(testConst.YEAR_2019);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('STATUS to get actual server timestamp', async () => {
    let res = await self.instance.get(`/api/v3/status`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    self.historyTimestamp = res.body.result.srvDate;
    self.historyTimestamp.should.be.aboveOrEqual(testConst.YEAR_2019);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ of not existing document is not found', async () => {
    await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(404);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH of not existing document (not found)', async () => {
    let res = await self.instance.get(`${self.urlCol}`, self.jwt.read)
      .query({ 'identifier_eq': self.identifier })
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.should.have.length(0);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('DELETE of not existing document is not found', async () => {
    await self.instance.delete(`${self.urlResource}`, self.jwt.delete)
      .expect(404);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('CREATE new document', async () => {
    await self.instance.post(`${self.urlCol}`, self.jwt.create)
      .send(self.docOriginal)
      .expect(201);

    self.cache.nextShouldEql(self.col, self.docOriginal)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ existing document', async () => {
    let res = await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.should.containEql(self.docOriginal);
    self.docActual = res.body.result;

    if (self.historyTimestamp >= self.docActual.srvModified) {
      self.historyTimestamp = self.docActual.srvModified - 1;
    }
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH existing document (found)', async () => {
    let res = await self.instance.get(`${self.urlCol}`, self.jwt.read)
      .query({ 'identifier$eq': self.identifier })
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.length.should.be.above(0);
    res.body.result.should.matchAny((value: any) => {
      value.identifier.should.be.eql(self.identifier);
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('new document in HISTORY', async () => {
    await self.checkHistoryExistence();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('UPDATE document', async () => {
    self.docActual.insulin = 0.5;

    let res = await self.instance.put(`${self.urlResource}`, self.jwt.update)
      .send(self.docActual)
      .expect(200);

    res.body.status.should.equal(200);
    self.docActual.subject = self.subject.apiUpdate.name;
    delete self.docActual.srvModified;

    self.cache.nextShouldEql(self.col, self.docActual)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('document changed in HISTORY', async () => {
    await self.checkHistoryExistence();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('document changed in READ', async () => {
    let res = await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    delete self.docActual.srvModified;
    res.body.result.should.containEql(self.docActual);
    self.docActual = res.body.result;
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('PATCH document', async () => {
    self.docActual.carbs = 5;
    self.docActual.insulin = 0.4;

    let res = await self.instance.patch(`${self.urlResource}`, self.jwt.update)
      .send({ 'carbs': self.docActual.carbs, 'insulin': self.docActual.insulin })
      .expect(200);

    res.body.status.should.equal(200);
    delete self.docActual.srvModified;

    self.cache.nextShouldEql(self.col, self.docActual)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('document changed in HISTORY', async () => {
    await self.checkHistoryExistence();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('document changed in READ', async () => {
    let res = await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    delete self.docActual.srvModified;
    res.body.result.should.containEql(self.docActual);
    self.docActual = res.body.result;
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('soft DELETE', async () => {
    let res = await self.instance.delete(`${self.urlResource}`, self.jwt.delete)
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldDeleteLast(self.col)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ of deleted is gone', async () => {
    await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(410);
  });



  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH of deleted document missing it', async () => {
    let res = await self.instance.get(`${self.urlCol}`, self.jwt.read)
      .query({ 'identifier_eq': self.identifier })
      .expect(200);

    res.body.status.should.equal(200);
    res.body.result.should.have.length(0);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('document deleted in HISTORY', async () => {
    await self.checkHistoryExistence((value: any) => {
      value.isValid.should.be.eql(false);
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('permanent DELETE', async () => {
    let res = await self.instance.delete(`${self.urlResource}`, self.jwt.delete)
      .query({ 'permanent': 'true' })
      .expect(200);

    res.body.status.should.equal(200);
    self.cache.nextShouldDeleteLast(self.col)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ of permanently deleted is not found', async () => {
    await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(404);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('document permanently deleted not in HISTORY', async () => {
    let res = await self.instance.get(`${self.urlHistory}/${self.historyTimestamp}`, self.jwt.read);

    res.body.status.should.equal(200);
    res.body.result.should.matchEach((value: any) => {
      value.identifier.should.not.be.eql(self.identifier);
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not modify read-only document', async () => {
    await self.instance.post(`${self.urlCol}`, self.jwt.create)
      .send(Object.assign({}, self.docOriginal, { isReadOnly: true }))
      .expect(201);

    let res = await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(200);

    res.body.status.should.equal(200);
    self.docActual = res.body.result;
    delete self.docActual.srvModified;
    const readOnlyMessage = 'Trying to modify read-only document';

    self.cache.nextShouldEql(self.col, self.docActual)
    self.cache.shouldBeEmpty()

    res = await self.instance.post(`${self.urlCol}`, self.jwt.update)
      .send(Object.assign({}, self.docActual, { insulin: 0.41 }))
      .expect(422);
    res.body.message.should.equal(readOnlyMessage);

    res = await self.instance.put(`${self.urlResource}`, self.jwt.update)
      .send(Object.assign({}, self.docActual, { insulin: 0.42 }))
      .expect(422);
    res.body.message.should.equal(readOnlyMessage);

    res = await self.instance.patch(`${self.urlResource}`, self.jwt.update)
      .send({ insulin: 0.43 })
      .expect(422);
    res.body.message.should.equal(readOnlyMessage);

    res = await self.instance.delete(`${self.urlResource}`, self.jwt.delete)
      .query({ 'permanent': 'true' })
      .expect(422);
    res.body.message.should.equal(readOnlyMessage);

    res = await self.instance.get(`${self.urlResource}`, self.jwt.read)
      .expect(200);
    res.body.status.should.equal(200);
    res.body.result.should.containEql(self.docOriginal);
  });

});

