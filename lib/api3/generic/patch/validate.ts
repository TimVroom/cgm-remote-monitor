'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const updateValidate = require('../update/validate')
  ;


/**
 * Validate document to patch
 * @param {Object} opCtx
 * @param {Object} doc
 * @param {Object} storageDoc
 * @returns string - null if validation fails
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'validate'.
function validate (opCtx: any, doc: any, storageDoc: any) {

  return updateValidate(opCtx, doc, storageDoc, { isPatching: true });
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = validate;