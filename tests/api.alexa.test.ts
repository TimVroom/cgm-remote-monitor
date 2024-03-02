'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
const request = require('supertest');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
const language = require('../lib/language')(fs);

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'bodyParser... Remove this comment to see the full error message
const bodyParser = require('body-parser');

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Alexa REST api', function(this: any) {
  this.timeout(10000);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const apiRoot = require('../lib/api/root');
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const api = require('../lib/api/');
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'before'.
  before(function(this: any, done: any) {
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.API_SECRET;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.API_SECRET = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    var env = require('../lib/server/env')( );
    env.settings.enable = ['alexa'];
    env.settings.authDefaultRoles = 'readable';
    env.api_secret = 'this is my long pass phrase';
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.wares = require('../lib/middleware/')(env);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    this.app = require('express')( );
    this.app.enable('api');
    var self = this;
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    require('../lib/server/bootevent')(env, language).boot(function booted (ctx: any) {
      self.app.use('/api', bodyParser({
        limit: 1048576 * 50
      }), apiRoot(env, ctx));

      self.app.use('/api/v1', bodyParser({
        limit: 1048576 * 50
      }), api(env, ctx));
      done( );
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Launch Request', function(this: any, done: any) {
    request(this.app)
      .post('/api/v1/alexa')
      .send({
        "request": {
          "type": "LaunchRequest",
          "locale": "en-US"
        }
      })
      .expect(200)
      .end(function (err: any, res: any)  {
        if (err) return done(err);

        const launchText = 'What would you like to check on Nightscout?';

        res.body.response.outputSpeech.text.should.equal(launchText);
        res.body.response.reprompt.outputSpeech.text.should.equal(launchText);
        res.body.response.shouldEndSession.should.equal(false);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Launch Request With Intent', function(this: any, done: any) {
    request(this.app)
      .post('/api/v1/alexa')
      .send({
        "request": {
          "type": "LaunchRequest",
          "locale": "en-US",
          "intent": {
            "name": "UNKNOWN"
          }
        }
      })
      .expect(200)
      .end(function (err: any, res: any)  {
        if (err) return done(err);

        const unknownIntentText = 'I\'m sorry, I don\'t know what you\'re asking for.';

        res.body.response.outputSpeech.text.should.equal(unknownIntentText);
        res.body.response.shouldEndSession.should.equal(true);
        done( );
      });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Session Ended', function(this: any, done: any) {
    request(this.app)
      .post('/api/v1/alexa')
      .send({
        "request": {
          "type": "SessionEndedRequest",
          "locale": "en-US"
        }
      })
      .expect(200)
      .end(function (err: any)  {
        if (err) return done(err);

        done( );
      });
  });
});

