'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_each'.
const _each = require('lodash/each');

/**
  * Decoder of 'fields' parameter providing storage projections
  * @param {string} fieldsString - fields parameter from user
  */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'FieldsProj... Remove this comment to see the full error message
function FieldsProjector(this: any, fieldsString: any) {
  
  const self = this
    , exclude: any = [];
  let specific: any = null;

  switch (fieldsString)
  {
    case '_all':
      break;

    default:
      if (fieldsString) {
        specific = fieldsString.split(',');
      }
  }

  const systemFields = ['identifier', 'srvCreated', 'created_at', 'date'];

  /**
   * Prepare projection definition for storage query 
   * */
  self.storageProjection = function storageProjection () {
    const projection = { };

    if (specific) {
      _each(specific, function include (field: any) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        projection[field] = 1;
      });

      _each(systemFields, function include (field: any) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        projection[field] = 1;
      });
    }
    else {
      _each(exclude, function exclude (field: any) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        projection[field] = 0;
      });

      _each(exclude, function exclude (field: any) {
        if (systemFields.indexOf(field) >= 0) {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          delete projection[field];
        }
      });
    }

    return projection;
  };


  /**
   * Cut off unwanted fields from given document
   * @param {Object} doc
   */
  self.applyProjection = function applyProjection (doc: any) {

    if (specific) {
      for(const field in doc) {
        if (specific.indexOf(field) === -1) {
          delete doc[field];
        }
      }
    }
    else {
      _each(exclude, function include (field: any) {
        if (typeof(doc[field]) !== 'undefined') {
          delete doc[field];
        }
      });
    }
  };
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = FieldsProjector;