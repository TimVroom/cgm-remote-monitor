'use strict';

var wares = {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  sendJSONStatus : require('./send-json-status'),
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  bodyParser : require('body-parser'),
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  compression : require('compression'),
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  obscureDeviceProvenance: require('./obscure-provenance')
};

function extensions (list: any) {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  return require('./express-extension-to-accept')(list);
}

function configure (env: any) {
  return {
    sendJSONStatus: wares.sendJSONStatus( ),
    bodyParser: wares.bodyParser,
    jsonParser: wares.bodyParser.json({
      limit: '1Mb',
    }),
    urlencodedParser: wares.bodyParser.urlencoded({
      limit: '1Mb',
      extended: true,
      parameterLimit: 50000
    }),
    rawParser: wares.bodyParser.raw({
      limit: '1Mb'
    }),
    compression: wares.compression,
    extensions: extensions,
    obscure_device: wares.obscureDeviceProvenance(env)
  };
}

configure.wares = wares;
// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
