'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path');

function clockviews() {

  const app = new express();
  let locals = {};

  app.set('view engine', 'ejs');
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  app.engine('html', require('ejs').renderFile);
  // @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
  app.set("views", path.join(__dirname, "../../views/clockviews/"));

  app.get('/:face', (req: any, res: any) => {

    const face = req.params.face;
    console.log('Clockface requested:', face);

    res.render('clock.html', {
      face,
      locals
    });

  });

  app.setLocals = function (_locals: any) {
    locals = _locals;
  }

  return app;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = clockviews;