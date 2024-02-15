'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'apiConst'.
const  apiConst = require('../../const.json')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'stringTool... Remove this comment to see the full error message
  , stringTools = require('../../shared/stringTools')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;


/**
 * Validation of document to create
 * @param {Object} opCtx
 * @param {Object} doc
 * @returns string with error message if validation fails, true in case of success
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'validate'.
function validate (opCtx: any, doc: any) {

  const { res } = opCtx;

  if (typeof(doc.identifier) !== 'string' || stringTools.isNullOrWhitespace(doc.identifier)) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_FIELD_IDENTIFIER);
  }

  return opTools.validateCommon(doc, res);
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = validate;