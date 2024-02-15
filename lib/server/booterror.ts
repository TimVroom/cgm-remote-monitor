'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function bootError(env: any, ctx: any) {

  const app = new express();
  let locals = {};

  app.set('view engine', 'ejs');
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  app.engine('html', require('ejs').renderFile);
  // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
  app.set("views", path.join(__dirname, "../../views/"));

  app.get('*', (req: any, res: any, next: any) => {

    if (req.url.includes('images')) return next();

    var errors = _.map(ctx.bootErrors, function (obj: any) {

      let message;

      if (typeof obj.err === 'string' || obj.err instanceof String) {
        message = obj.err;
      } else {
        message = JSON.stringify(_.pick(obj.err, Object.getOwnPropertyNames(obj.err)));
      }
      return '<dt><b>' + obj.desc + '</b></dt><dd>' + message.replace(/\\n/g, '<br/>') + '</dd>';
    }).join(' ');

    res.render('error.html', {
      errors,
      locals
    });

  });

  app.setLocals = function (_locals: any) {
    locals = _locals;
  }

  return app;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = bootError;