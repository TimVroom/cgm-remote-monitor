'use strict';

/**
 * Check the string for strictly valid number (no other characters present)
 * @param {any} str
 */
function isNumberInString (str: any) {
  return !isNaN(parseFloat(str)) && isFinite(str);
}


/**
 * Check the string for non-whitespace characters presence
 * @param {any} input
 */
function isNullOrWhitespace (input: any) {

  if (typeof input === 'undefined' || input == null) return true;

  return input.replace(/\s/g, '').length < 1;
}



// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  isNumberInString,
  isNullOrWhitespace
};
