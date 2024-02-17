'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _isEmpty = require('lodash/isEmpty');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _filter = require('lodash/filter');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _pick = require('lodash/pick');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
var express = require('express');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var sandbox = require('../sandbox')();

// @ts-expect-error TS(2300): Duplicate identifier 'create'.
function create (env: any, ctx: any) {
  var properties = express( );

  /**
   * Supports the paths:
   * /v2/properties - All properties
   * /v2/properties/prop1 - Only prop1
   * /v2/properties/prop1,prop3 - Only prop1 and prop3
   *
   * Expecting to define extended syntax and support for several query params
   */
  properties.use(ctx.authorization.isPermitted('api:entries:read'),
    ctx.authorization.isPermitted('api:treatments:read'));
  properties.get(['/', '/*'], function getProperties (req: any, res: any) {

    if (!ctx.sbx) res.json({});

    function notEmpty (part: any) {
      return ! _isEmpty(part);
    }

    var segments = _filter(req.path.split('/'), notEmpty);

    var selected = [ ];

    if (segments.length > 0) {
      selected = _filter(segments[0].split(','), notEmpty);
    }

    var result = ctx.sbx.properties;

    if (selected.length > 0) {
      result = _pick(ctx.sbx.properties, selected);
    }

    result = env.settings.filteredSettings(result);
    
    if (req.query && req.query.pretty) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(result, null, 2));
    } else {
      res.json(result);
    }

  });


  return properties;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = create;
