'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;


/**
 * Validation of document to update
 * @param {Object} opCtx
 * @param {Object} doc
 * @param {Object} storageDoc
 * @param {Object} options
 * @returns string with error message if validation fails, true in case of success
 */
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
function validate (opCtx: any, doc: any, storageDoc: any, options: any) {

  const { res } = opCtx;
  const { isPatching, isDeduplication } = options || {};

  const immutable = ['identifier', 'date', 'utcOffset', 'eventType', 'device', 'app',
    'srvCreated', 'subject', 'srvModified', 'modifiedBy', 'isValid'];

  if (storageDoc.isReadOnly === true || storageDoc.readOnly === true || storageDoc.readonly === true) {
    return opTools.sendJSONStatus(res, apiConst.HTTP.UNPROCESSABLE_ENTITY,
      apiConst.MSG.HTTP_422_READONLY_MODIFICATION);
  }

  for (const field of immutable) {

    // change of identifier is allowed in deduplication (for APIv1 documents)
    if (field === 'identifier' && isDeduplication)
      continue;

    // changing deleted document is without restrictions
    if (storageDoc.isValid === false)
      continue;

    if (typeof(doc[field]) !== 'undefined' && doc[field] !== storageDoc[field]) {
      return opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST,
        apiConst.MSG.HTTP_400_IMMUTABLE_FIELD.replace('{0}', field));
    }
  }

  return opTools.validateCommon(doc, res, { isPatching });
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = validate;
