'use strict';

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const createDOMPurify = require('dompurify');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { JSDOM } = require('jsdom');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'window'.
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function init (env: any, ctx: any) {

  const purifier = {};

  function iterate (obj: any) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] == 'object')
          iterate(obj[property]);
        else
        if (isNaN(obj[property])) {
          const clean = DOMPurify.sanitize(obj[property]);
          if (obj[property] !== clean) {
            obj[property] = clean;
          }
        }
      }
    }
  }

  // @ts-expect-error TS(2339): Property 'purifyObject' does not exist on type '{}... Remove this comment to see the full error message
  purifier.purifyObject = function purifyObject (obj: any) {
    return iterate(obj);
  }

  return purifier;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
