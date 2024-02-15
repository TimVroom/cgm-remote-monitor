'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'should'.
var should = require('should');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Plugins', function ( ) {


  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should find client plugins, but not server only plugins', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var plugins = require('../lib/plugins/')({
      settings: { }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
    }).registerClientDefaults();

    plugins('bgnow').name.should.equal('bgnow');
    plugins('rawbg').name.should.equal('rawbg');

    //server only plugin
    should.not.exist(plugins('treatmentnotify'));

    done( );
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should find sever plugins, but not client only plugins', function (done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var plugins = require('../lib/plugins/')({
      settings: { }
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , language: require('../lib/language')()
    }).registerServerDefaults();

    plugins('rawbg').name.should.equal('rawbg');
    plugins('treatmentnotify').name.should.equal('treatmentnotify');

    //client only plugin
    should.not.exist(plugins('cannulaage'));

    done( );
  });


});
