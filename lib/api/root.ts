'use strict';

function configure () {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const express = require('express')
    , api = express.Router( )
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , apiConst = require('./const')
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , api3Const = require('../api3/const')
    ;

  api.get('/versions', function getVersion (req: any, res: any) {

    const versions = [
      { version: apiConst.API1_VERSION, url: '/api/v1' },
      { version: apiConst.API2_VERSION, url: '/api/v2' },
      { version: api3Const.API3_VERSION, url: '/api/v3' }
    ];

    res.json(versions);
  });

  return api;
}
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
