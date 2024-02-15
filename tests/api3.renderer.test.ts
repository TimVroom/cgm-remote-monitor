/* eslint require-atomic-updates: 0 */
'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('API3 output renderers', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , testConst = require('./fixtures/api3/const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , opTools = require('../lib/api3/shared/operationTools')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , _ = require('lodash')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , xml2js = require('xml2js')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , csvParse = require('csv-parse/lib/sync')
    ;

  self.historyFrom = (new Date()).getTime() - 1000; // starting timestamp for HISTORY operations

  self.doc1 = testConst.SAMPLE_ENTRIES[0];
  self.doc1.date = (new Date()).getTime() - (5 * 60 * 1000);
  self.doc1.identifier = opTools.calculateIdentifier(self.doc1);

  self.doc2 = testConst.SAMPLE_ENTRIES[1];
  self.doc2.date = (new Date()).getTime();
  self.doc2.identifier = opTools.calculateIdentifier(self.doc2);

  self.xmlParser = new xml2js.Parser({
    explicitArray: false
  });

  self.csvParserOptions = {
    columns: true,
    skip_empty_lines: true
  };

  self.timeout(15000);


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({});

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.col = 'entries';
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


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(() => {
    self.instance.server.close();
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    self.cache.clear();
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    self.cache.shouldBeEmpty();
  });


  /**
   * Checks if all properties from obj1 are string identical in obj2
   * (comparison of properties is made using toString())
   * @param {Object} obj1
   * @param {Object} obj2
   */
  self.checkProps = function checkProps (obj1: any, obj2: any) {
    for (let propName in obj1) {
      obj1[propName].toString().should.eql(obj2[propName].toString());
    }
  };


  /**
   * Checks if all objects from arrModel exist in arr
   * (with string identical properties)
   * @param arrModel
   * @param arr
   */
  self.checkItems = function checkItems (arrModel: any, arr: any) {
    for (let itemModel of arrModel) {
      const item = _.find(arr, (doc: any) => doc.identifier === itemModel.identifier);
      item.should.not.be.empty();
      self.checkProps(itemModel, item);
    }
  };


  /**
   * Checks if given text is valid XML.
   * Next checks if all objects from arrModel exist in parsed array
   * (with string identical properties)
   * @param arrModel
   * @param xmlText
   * @returns {Promise}
   */
  self.checkXmlItems = async function checkXmlItems (arrModel: any, xmlText: any) {
    xmlText.should.startWith('<?xml version=\'1.0\' encoding=\'utf-8\'?>');

    const xml = await self.xmlParser.parseStringPromise(xmlText);
    xml.items.should.not.be.empty();
    let items = xml.items.item;
    items.should.be.Array();
    items.length.should.be.aboveOrEqual(arrModel.length);

    self.checkItems(arrModel, items);
  };


  /**
   * Checks if given text is valid CSV.
   * Next checks if all objects from arrModel exist in parsed array
   * (with string identical properties)
   * @param arrModel
   * @param csvText
   * @returns {Promise}
   */
  self.checkCsvItems = async function checkXmlItems (arrModel: any, csvText: any) {
    csvText.should.not.be.empty();

    const items = csvParse(csvText, self.csvParserOptions);
    items.should.be.Array();
    items.length.should.be.aboveOrEqual(arrModel.length);

    self.checkItems(arrModel, items);
  };


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should create 2 mock documents', async () => {

    async function createDoc (doc: any) {

      let res = await self.instance.post(`${self.url}`, self.jwt.create)
        .send(doc)
        .expect(201);

      res.body.status.should.equal(201);

      res = await self.instance.get(`${self.url}/${doc.identifier}`, self.jwt.read)
        .expect(200);
      return res.body;
    }

    self.doc1json = await createDoc(self.doc1);
    self.cache.nextShouldEql(self.col, self.doc1)

    self.doc2json = await createDoc(self.doc2);
    self.cache.nextShouldEql(self.col, self.doc2)
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ/SEARCH/HISTORY should not accept unsupported content type', async () => {

    async function check406 (request: any) {
      const res = await request
        .expect(406);
      res.status.should.equal(406);
      res.body.message.should.eql('Unsupported output format requested');
      should.not.exist(res.body.result);
    }

    await check406(self.instance.get(`${self.url}/${self.doc1.identifier}.ttf?fields=_all`, self.jwt.read));
    await check406(self.instance.get(`${self.url}/${self.doc1.identifier}?fields=_all`, self.jwt.read)
      .set('Accept', 'font/ttf'));

    await check406(self.instance.get(`${self.url}.ttf?fields=_all`, self.jwt.read));
    await check406(self.instance.get(`${self.url}?fields=_all`, self.jwt.read)
      .set('Accept', 'font/ttf'));

    await check406(self.instance.get(`${self.url}/history/${self.doc1.date}.ttf`, self.jwt.read));
    await check406(self.instance.get(`${self.url}/history/${self.doc1.date}`, self.jwt.read)
      .set('Accept', 'font/ttf'));
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ should accept xml content type', async () => {
    let res = await self.instance.get(`${self.url}/${self.doc1.identifier}.xml?fields=_all`, self.jwt.read)
      .expect(200);

    res.text.should.startWith('<?xml version=\'1.0\' encoding=\'utf-8\'?>');

    const xml = await self.xmlParser.parseStringPromise(res.text);
    xml.item.should.not.be.empty();
    self.checkProps(self.doc1, xml.item);

    let res2 = await self.instance.get(`${self.url}/${self.doc1.identifier}?fields=_all`, self.jwt.read)
      .set('Accept', 'application/xml')
      .expect(200);

    res.text.should.eql(res2.text);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('READ should accept csv content type', async () => {
    let res = await self.instance.get(`${self.url}/${self.doc1.identifier}.csv?fields=_all`, self.jwt.read)
      .expect(200);

    await self.checkCsvItems([self.doc1], res.text);

    let res2 = await self.instance.get(`${self.url}/${self.doc1.identifier}?fields=_all`, self.jwt.read)
      .set('Accept', 'text/csv')
      .expect(200);

    res.text.should.eql(res2.text);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH should accept xml content type', async () => {
    let res = await self.instance.get(`${self.url}.xml?date$gte=${self.doc1.date}`, self.jwt.read)
      .expect(200);

    await self.checkXmlItems([self.doc1, self.doc2], res.text);

    let res2 = await self.instance.get(`${self.url}?date$gte=${self.doc1.date}`, self.jwt.read)
      .set('Accept', 'application/xml')
      .expect(200);

    res.text.should.be.eql(res2.text);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('SEARCH should accept csv content type', async () => {
    let res = await self.instance.get(`${self.url}.csv?date$gte=${self.doc1.date}`, self.jwt.read)
      .expect(200);

    await self.checkCsvItems([self.doc1, self.doc2], res.text);

    let res2 = await self.instance.get(`${self.url}?date$gte=${self.doc1.date}`, self.jwt.read)
      .set('Accept', 'text/csv')
      .expect(200);

    res.text.should.be.eql(res2.text);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('HISTORY should accept xml content type', async () => {
    let res = await self.instance.get(`${self.url}/history/${self.historyFrom}.xml`, self.jwt.read)
      .expect(200);

    await self.checkXmlItems([self.doc1, self.doc2], res.text);

    let res2 = await self.instance.get(`${self.url}/history/${self.historyFrom}`, self.jwt.read)
      .set('Accept', 'application/xml')
      .expect(200);

    res.text.should.be.eql(res2.text);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('HISTORY should accept csv content type', async () => {
    let res = await self.instance.get(`${self.url}/history/${self.historyFrom}.csv`, self.jwt.read)
      .expect(200);

    await self.checkCsvItems([self.doc1, self.doc2], res.text);

    let res2 = await self.instance.get(`${self.url}/history/${self.historyFrom}`, self.jwt.read)
      .set('Accept', 'text/csv')
      .expect(200);

    res.text.should.be.eql(res2.text);
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should remove mock documents', async () => {

    async function deleteDoc (identifier: any) {
      let res = await self.instance.delete(`${self.url}/${identifier}`, self.jwt.delete)
        .query({ 'permanent': 'true' })
        .expect(200);

      res.body.status.should.equal(200);
      self.cache.nextShouldDeleteLast(self.col);
    }

    await deleteDoc(self.doc1.identifier);
    await deleteDoc(self.doc2.identifier);
  });
});

