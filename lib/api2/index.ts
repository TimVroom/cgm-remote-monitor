'use strict';

// @ts-expect-error TS(2300): Duplicate identifier 'create'.
function create (env: any, ctx: any, apiv1: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var express = require('express')
    ,  app = express( )
    ;

    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const ddata = require('../data/endpoints')(env, ctx);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const notificationsV2 = require('./notifications-v2')(app, ctx);
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    const summary = require('./summary')(env, ctx);

    app.use('/', apiv1);
    app.use('/properties', ctx.properties);
    app.use('/authorization', ctx.authorization.endpoints);
    app.use('/ddata', ddata);
    app.use('/notifications', notificationsV2);
    app.use('/summary', summary);
    
  return app;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = create;
