'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../const.json')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'stringTool... Remove this comment to see the full error message
  , stringTools = require('./stringTools')
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , uuid = require('uuid')
  // @ts-expect-error TS(2591): Cannot find name 'Buffer'. Do you need to install ... Remove this comment to see the full error message
  , uuidNamespace = [...Buffer.from("NightscoutRocks!", "ascii")] // official namespace for NS :-)
  ;


function sendJSON ({
  res,
  result,
  status,
  fields
}: any) {

  const json = {
    status: status || apiConst.HTTP.OK,
    result: result
  };

  if (result) {
    json.result = result
  }

  if (fields) {
    Object.assign(json, fields);
  }

  res.status(json.status).json(json);
}


// @ts-expect-error TS(2393): Duplicate function implementation.
function sendJSONStatus (res: any, status: any, title: any, description: any, warning: any) {

  const json = {
    status: status
  };

  // @ts-expect-error TS(2339): Property 'message' does not exist on type '{ statu... Remove this comment to see the full error message
  if (title) { json.message = title }

  // @ts-expect-error TS(2339): Property 'description' does not exist on type '{ s... Remove this comment to see the full error message
  if (description) { json.description = description }

  // Add optional warning message.
  // @ts-expect-error TS(2339): Property 'warning' does not exist on type '{ statu... Remove this comment to see the full error message
  if (warning) { json.warning = warning; }

  res.status(status)
    .json(json);

  return title;
}


/**
 * Validate document's common fields
 * @param {Object} doc
 * @param {any} res
 * @param {Object} options
 * @returns {any} - string with error message if validation fails, true in case of success
 */
function validateCommon (doc: any, res: any, options: any) {

  const { isPatching } = options || {};


  if ((!isPatching || typeof(doc.date) !== 'undefined')

    && (typeof(doc.date) !== 'number'
      || doc.date <= apiConst.MIN_TIMESTAMP)
  ) {
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    return sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_FIELD_DATE);
  }


  if ((!isPatching || typeof(doc.utcOffset) !== 'undefined')

    && (typeof(doc.utcOffset) !== 'number'
      || doc.utcOffset < apiConst.MIN_UTC_OFFSET
      || doc.utcOffset > apiConst.MAX_UTC_OFFSET)
  ) {
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    return sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_FIELD_UTC);
  }


  if ((!isPatching || typeof(doc.app) !== 'undefined')

    && (typeof(doc.app) !== 'string'
        || stringTools.isNullOrWhitespace(doc.app))
  ) {
    // @ts-expect-error TS(2554): Expected 5 arguments, but got 3.
    return sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_FIELD_APP);
  }

  return true;
}


/**
 * Calculate identifier for the document
 * @param {Object} doc
 * @returns string
 */
function calculateIdentifier (doc: any) {
  if (!doc)
    return undefined;

  let key = doc.device + '_' + doc.date;
  if (doc.eventType) {
    key += '_' + doc.eventType;
  }

  return uuid.v5(key, uuidNamespace);
}


/**
 * Validate identifier in the document
 * @param {Object} doc
 */
function resolveIdentifier (doc: any) {

  let identifier = calculateIdentifier(doc);
  if (doc.identifier) {
    if (doc.identifier !== identifier) {
      console.warn(`APIv3: Identifier mismatch (expected: ${identifier}, received: ${doc.identifier})`);
      console.log(doc);
    }
  }
  else {
    doc.identifier = identifier;
  }
}


// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  sendJSON,
  sendJSONStatus,
  validateCommon,
  calculateIdentifier,
  resolveIdentifier
};
