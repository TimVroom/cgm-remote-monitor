'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
var language = require('../lib/language')();

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Clean MONGO after tests', function(this: any) {
  this.timeout(10000);
  var self = this;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var api = require('../lib/api/');
  // @ts-expect-error TS(2552) FIXME: Cannot find name 'beforeEach'. Did you mean '_forE... Remove this comment to see the full error message
  beforeEach(function(this: any, done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.env = require('../lib/server/env')();
    self.env.settings.authDefaultRoles = 'readable';
    self.env.settings.enable = ['careportal', 'api'];
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(self.env);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    self.app = require('express')();
    self.app.enable('api');
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(self.env, language).boot(function booted(ctx: any) {
      self.ctx = ctx;
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      self.ctx.ddata = require('../lib/data/ddata')();
      self.app.use('/api', api(self.env, ctx));
      done();
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('wipe treatment data', function (done: any) {
    self.ctx.treatments().remove({ }, function ( ) {
        done();
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('wipe entries data', function (done: any) {
    self.ctx.entries().remove({ }, function ( ) {
        done();
    });
  });
  
});
