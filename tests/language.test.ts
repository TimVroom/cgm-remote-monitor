'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('language', function ( ) {

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('use English by default', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var language = require('../lib/language')();
    language.translate('Carbs').should.equal('Carbs');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('replace strings in translations', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var language = require('../lib/language')();
    language.translate('%1 records deleted', '1').should.equal('1 records deleted');
    language.translate('%1 records deleted', 1).should.equal('1 records deleted');
    language.translate('%1 records deleted', {params: ['1']}).should.equal('1 records deleted');
    language.translate('Sensor age %1 days %2 hours', '1', '2').should.equal('Sensor age 1 days 2 hours');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('translate to French', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var language = require('../lib/language')();
    language.set('fr');
    language.loadLocalization(fs);
    language.translate('Carbs').should.equal('Glucides');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('translate to Czech', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var language = require('../lib/language')();
    language.set('cs');
    language.loadLocalization(fs);
    language.translate('Carbs').should.equal('Sacharidy');
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('translate to Czech uppercase', function () {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var language = require('../lib/language')();
    language.set('cs');
    language.loadLocalization(fs);
    language.translate('carbs', { ci: true }).should.equal('Sacharidy');
  });

});
