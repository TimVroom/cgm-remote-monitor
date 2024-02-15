/* eslint require-atomic-updates: 0 */
/* global should */
'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Socket.IO in REST API3', function(this: any) {
  const self = this
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , testConst = require('./fixtures/api3/const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , apiConst = require('../lib/api3/const.json')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , instance = require('./fixtures/api3/instance')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , authSubject = require('./fixtures/api3/authSubject')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , utils = require('./fixtures/api3/utils')
    ;

  self.identifier = utils.randomString('32', 'aA#'); // let's have a brand new identifier for your testing document

  self.docOriginal = {
    identifier: self.identifier,
    eventType: 'Correction Bolus',
    insulin: 1,
    date: (new Date()).getTime(),
    app: testConst.TEST_APP
  };

  this.timeout(30000);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(async () => {
    self.instance = await instance.create({
      storageSocket: true
    });

    self.app = self.instance.app;
    self.env = self.instance.env;
    self.colName = 'treatments';
    self.urlCol = `/api/v3/${self.colName}`;
    self.urlResource = self.urlCol + '/' + self.identifier;
    self.urlHistory = self.urlCol + '/history';

    let authResult = await authSubject(self.instance.ctx.authorization.storage, [
      'create',
      'update',
      'delete'
    ], self.instance.app);

    self.subject = authResult.subject;
    self.jwt = authResult.jwt;
    self.accessToken = authResult.accessToken;
    self.socket = self.instance.clientSocket;
  });


  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(() => {
    if(self.instance && self.instance.clientSocket && self.instance.clientSocket.connected) {
      self.instance.clientSocket.disconnect();
    }
    self.instance.ctx.bus.teardown();
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not subscribe without accessToken', (done: any) => {
    self.socket.emit('subscribe', { }, function (data: any) {
      data.success.should.not.equal(true);
      data.message.should.equal(apiConst.MSG.SOCKET_MISSING_OR_BAD_ACCESS_TOKEN);
      done();
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not subscribe by invalid accessToken', (done: any) => {
    self.socket.emit('subscribe', { accessToken: 'INVALID' }, function (data: any) {
      data.success.should.not.equal(true);
      data.message.should.equal(apiConst.MSG.SOCKET_MISSING_OR_BAD_ACCESS_TOKEN);
      done();
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not subscribe by subject with no rights', (done: any) => {
    self.socket.emit('subscribe', { accessToken: self.accessToken.denied }, function (data: any) {
      data.success.should.not.equal(true);
      data.message.should.equal(apiConst.MSG.SOCKET_UNAUTHORIZED_TO_ANY);
      done();
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should subscribe by valid accessToken', (done: any) => {
    const cols = ['entries', 'treatments'];

    self.socket.emit('subscribe', {
      accessToken: self.accessToken.all,
      collections: cols
    }, function (data: any) {
      data.success.should.equal(true);
      should(data.collections.sort()).be.eql(cols);
      done();
    });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should emit create event on CREATE', (done: any) => {

    self.socket.once('create', (event: any) => {
      event.colName.should.equal(self.colName);
      event.doc.should.containEql(self.docOriginal);
      delete event.doc.subject;
      self.docActual = event.doc;
      done();
    });

    self.instance.post(`${self.urlCol}`, self.jwt.create)
      .send(self.docOriginal)
      .expect(201)
      .end((err: any) => {
        should.not.exist(err);
      });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should emit update event on UPDATE', (done: any) => {

    self.docActual.insulin = 0.5;

    self.socket.once('update', (event: any) => {
      delete self.docActual.srvModified;
      event.colName.should.equal(self.colName);
      event.doc.should.containEql(self.docActual);
      delete event.doc.subject;
      self.docActual = event.doc;
      done();
    });

    self.instance.put(`${self.urlResource}`, self.jwt.update)
      .send(self.docActual)
      .expect(200)
      .end((err: any) => {
        should.not.exist(err);
        self.docActual.subject = self.subject.apiUpdate.name;
      });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should emit update event on PATCH', (done: any) => {

    self.docActual.carbs = 5;
    self.docActual.insulin = 0.4;

    self.socket.once('update', (event: any) => {
      delete self.docActual.srvModified;
      event.colName.should.equal(self.colName);
      event.doc.should.containEql(self.docActual);
      delete event.doc.subject;
      self.docActual = event.doc;
      done();
    });

    self.instance.patch(`${self.urlResource}`, self.jwt.update)
      .send({ 'carbs': self.docActual.carbs, 'insulin': self.docActual.insulin })
      .expect(200)
      .end((err: any) => {
        should.not.exist(err);
      });
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should emit delete event on DELETE', (done: any) => {

    self.socket.once('delete', (event: any) => {
      event.colName.should.equal(self.colName);
      event.identifier.should.equal(self.identifier);
      done();
    });

    self.instance.delete(`${self.urlResource}`, self.jwt.delete)
      .expect(200)
      .end((err: any) => {
        should.not.exist(err);
      });
  });

});

