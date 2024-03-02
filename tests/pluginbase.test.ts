'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var benv = require('benv');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('pluginbase', function(this: any) {
  this.timeout(50000); // TODO: see why this test takes longer on Travis to complete

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var headless = require('./fixtures/headless')(benv, this);

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function (done: any) {
    done( );
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'after'.
  after(function (done: any) {
    done( );
  });

  // @ts-expect-error TS(2552) FIXME: Cannot find name 'beforeEach'. Did you mean '_forE... Remove this comment to see the full error message
  beforeEach(function (done: any) {
    headless.setup({ }, done);
  });

  // @ts-expect-error TS(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(function (done: any) {
    headless.teardown( );
    done( );
  });


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does stuff', function() {

    function div (clazz: any) {
      return $('<div class="' + clazz + '"></div>');
    }

    var container = div('container')
      , bgStatus = div('bgStatus').appendTo(container)
      , majorPills = div('majorPills').appendTo(bgStatus)
      , minorPills = div('minorPills').appendTo(bgStatus)
      , statusPills = div('statusPills').appendTo(bgStatus)
      , tooltip = div('tooltip').appendTo(container)
      ;

    var fake = {
      name: 'fake'
      , label: 'Insulin-on-Board'
      , pluginType: 'pill-major'
    };

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var pluginbase = require('../lib/plugins/pluginbase')(majorPills, minorPills, statusPills, bgStatus, tooltip);

    pluginbase.updatePillText(fake, {
      value: '123'
      , label: 'TEST'
      , info: [{label: 'Label', value: 'Value'}]
    });

    majorPills.length.should.equal(1);
  });

});
