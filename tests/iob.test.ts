'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
const should = require('should');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require('./inithelper')();

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('IOB', function() {

  let ctx = helper.ctx;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  ctx.settings = require('../lib/settings')();

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var iob = require('../lib/plugins/iob')(ctx);

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should handle virtAsst requests', function (done: any) {

    var sbx = {
      properties: {
        iob: {
          iob: 1.5
        }
      }
    };

    iob.virtAsst.intentHandlers.length.should.equal(1);
    iob.virtAsst.rollupHandlers.length.should.equal(1);

    iob.virtAsst.intentHandlers[0].intentHandler(function next(title: any, response: any) {
      title.should.equal('Current IOB');
      response.should.equal('You have 1.50 units of insulin on board');

      iob.virtAsst.rollupHandlers[0].rollupHandler([], sbx, function callback (err: any, response: any) {
        should.not.exist(err);
        response.results.should.equal('and you have 1.50 units of insulin on board.');
        response.priority.should.equal(2);
        done();
      });

    }, [], sbx);

  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('from treatments', function ( ) {

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should calculate IOB', function() {

      var time = Date.now()
        , treatments = [ {
            mills: time - 1,
            insulin: '1.00'
          }
        ];
      
 
    var profileData = {
      dia: 3,
      sens: 0};

     // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
     var profile = require('../lib/profilefunctions')([profileData], ctx);

      var rightAfterBolus = iob.calcTotal(treatments, [], profile, time);

      rightAfterBolus.display.should.equal('1.00');

      var afterSomeTime = iob.calcTotal(treatments, [], profile, time + (60 * 60 * 1000));

      afterSomeTime.iob.should.be.lessThan(1);
      afterSomeTime.iob.should.be.greaterThan(0);

      var afterDIA = iob.calcTotal(treatments, [], profile, time + (3 * 60 * 60 * 1000));

      afterDIA.iob.should.equal(0);

    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should calculate IOB using defaults', function() {

      var treatments = [{
        mills: Date.now() - 1,
        insulin: '1.00'
      }];

      var rightAfterBolus = iob.calcTotal(treatments, []);

      rightAfterBolus.display.should.equal('1.00');

    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not show a negative IOB when approaching 0', function() {

      var time = Date.now() - 1;

      var treatments = [{
        mills: time,
        insulin: '5.00'
      }];

      var whenApproaching0 = iob.calcTotal(treatments, [], undefined, time + (3 * 60 * 60 * 1000) - (90 * 1000));

      //before fix we got this: AssertionError: expected '-0.00' to be '0.00'
      whenApproaching0.display.should.equal('0.00');

    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should calculate IOB using a 4 hour duration', function() {

      var time = Date.now()
        , treatments = [ {
          mills: time - 1,
          insulin: '1.00'
        } ];
         
    var profileData = {
      dia: 4,
      sens: 0};

     // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
     var profile = require('../lib/profilefunctions')([profileData], ctx);

      var rightAfterBolus = iob.calcTotal(treatments, [], profile, time);

      rightAfterBolus.display.should.equal('1.00');

      var afterSomeTime = iob.calcTotal(treatments, [], profile, time + (60 * 60 * 1000));

      afterSomeTime.iob.should.be.lessThan(1);
      afterSomeTime.iob.should.be.greaterThan(0);

      var after3hDIA = iob.calcTotal(treatments, [], profile, time + (3 * 60 * 60 * 1000));

      after3hDIA.iob.should.greaterThan(0);

      var after4hDIA = iob.calcTotal(treatments, [], profile, time + (4 * 60 * 60 * 1000));

      after4hDIA.iob.should.equal(0);

    });


  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('from devicestatus', function () {
    var time = Date.now();
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var profile = require('../lib/profilefunctions')([{ dia: 3, sens: 0 }], ctx);
    var treatments = [{
      mills: time - 1,
      insulin: '3.00'
    }];
    var treatmentIOB = iob.fromTreatments(treatments, profile, time).iob;

    var OPENAPS_DEVICESTATUS = {
      device: 'openaps://pi1',
      openaps: {
        iob: {
           iob: 0.047,
           basaliob: -0.298,
           activity: 0.0147
         }
      }
    };

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fall back to treatment data if no devicestatus data', function() {
      iob.calcTotal(treatments, [], profile, time).should.containEql({
        source: 'Care Portal',
        iob: treatmentIOB
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fall back to treatments if openaps devicestatus is present but empty', function() {
      var devicestatus = [{
        device: 'openaps://pi1',
        mills: time - 1,
        openaps: {}
      }];
      iob.calcTotal(treatments, devicestatus, profile, time).iob.should.equal(treatmentIOB);
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should fall back to treatments if openaps devicestatus is present but too stale', function() {
      var devicestatus = [_.merge(OPENAPS_DEVICESTATUS, { mills: time - iob.RECENCY_THRESHOLD - 1, openaps: {iob: {timestamp: time - iob.RECENCY_THRESHOLD - 1} } })];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        source: 'Care Portal',
        iob: treatmentIOB
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return IOB data from openaps', function () {
      var devicestatus = [_.merge(OPENAPS_DEVICESTATUS, { mills: time - 1, openaps: {iob: {timestamp: time - 1} } })];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        iob: 0.047,
        basaliob: -0.298,
        activity: 0.0147,
        source: 'OpenAPS',
        device: 'openaps://pi1'
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not blow up with null IOB data from openaps', function () {
      var devicestatus = [_.merge(OPENAPS_DEVICESTATUS, { mills: time - 1, openaps: {iob: null } })];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        source: 'Care Portal',
        display: '3.00'
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return IOB data from openaps post AMA (an array)', function () {
      var devicestatus = [_.merge(OPENAPS_DEVICESTATUS, { mills: time - 1, openaps: {iob: [{
        iob: 0.047,
        basaliob: -0.298,
        activity: 0.0147,
        time: time - 1
      }]}})];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        iob: 0.047,
        basaliob: -0.298,
        activity: 0.0147,
        source: 'OpenAPS',
        device: 'openaps://pi1'
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return IOB data from Loop', function () {

      var LOOP_DEVICESTATUS = {
        device: 'loop://iPhone',
        loop: {
          iob: {
            iob: 0.75
          }
        }
      };

      var devicestatus = [_.merge(LOOP_DEVICESTATUS, { mills: time - 1, loop: {iob: {timestamp: time - 1} } })];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        iob: 0.75,
        source: 'Loop',
        device: 'loop://iPhone'
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return IOB data from openaps from multiple devices', function () {
      var devicestatus = [
        _.merge(OPENAPS_DEVICESTATUS, { mills: time - 1000, openaps: {iob: {timestamp: time - 1000} } })
        , _.merge(OPENAPS_DEVICESTATUS, { mills: time - 1, openaps: {iob: {timestamp: time - 1} } })
        , _.merge(OPENAPS_DEVICESTATUS, { mills: time - 20000, openaps: {iob: {timestamp: time - 20000} } })
      ];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        iob: 0.047,
        basaliob: -0.298,
        activity: 0.0147,
        source: 'OpenAPS',
        device: 'openaps://pi1'
      });
    });

    // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return IOB data from MiniMed Connect', function () {
      var devicestatus = [{
        device: 'connect://paradigm',
        mills: time - 1,
        pump: { iob: { bolusiob: 0.87 } },
        connect: { sensorState: 'copacetic' }
      }];
      iob.calcTotal(treatments, devicestatus, profile, time).should.containEql({
        iob: 0.87,
        source: 'MM Connect',
        device: 'connect://paradigm'
      });
    });

  });

});
