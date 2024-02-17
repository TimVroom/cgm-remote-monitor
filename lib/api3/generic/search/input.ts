'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
  , dateTools = require('../../shared/dateTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'stringTool... Remove this comment to see the full error message
  , stringTools = require('../../shared/stringTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('../../shared/operationTools')
  ;

const filterRegex = /(.*)\$([a-zA-Z]+)/;


/**
 * Parse value of the parameter (to the correct data type)
 */
function parseValue(param: any, value: any) {

  value = stringTools.isNumberInString(value) ? parseFloat(value) : value; // convert number from string

  // convert boolean from string
  if (value === 'true')
    value = true;

  if (value === 'false')
    value = false;

  // unwrap string in single quotes
  if (typeof(value) === 'string' && value.startsWith('\'') && value.endsWith('\'')) {
    value = value.substr(1, value.length - 2);
  }

  if (['date', 'srvModified', 'srvCreated'].includes(param)) {
    let m = dateTools.parseToMoment(value);
    if (m && m.isValid()) {
      value = m.valueOf();
    }
  }

  if (param === 'created_at') {
    let m = dateTools.parseToMoment(value);
    if (m && m.isValid()) {
      value = m.toISOString();
    }
  }

  return value;
}


/**
 * Parse filtering criteria from query string
 */
// @ts-expect-error TS(2300): Duplicate identifier 'parseFilter'.
function parseFilter (req: any, res: any) {
  const filter = []
    , reservedParams = ['token', 'sort', 'sort$desc', 'limit', 'skip', 'fields', 'now']
    , operators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 're']
    ;

  for (let param in req.query) {
    if (!Object.prototype.hasOwnProperty.call(req.query, param)
      || reservedParams.includes(param)) continue;

    let field = param
      , operator = 'eq'
    ;

    const match = filterRegex.exec(param);
    if (match != null) {
      operator = match[2];
      field = match[1];

      if (!operators.includes(operator)) {
        opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST,
          apiConst.MSG.HTTP_400_UNSUPPORTED_FILTER_OPERATOR.replace('{0}', operator));
        return null;
      }
    }
    const value = parseValue(field, req.query[param]);

    filter.push({ field, operator, value });
  }

  return filter;
}


/**
 * Parse sorting from query string
 */
function parseSort (req: any, res: any) {
  let sort = {}
    , sortDirection = 1;

  if (req.query.sort && req.query.sort$desc) {
    opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_SORT_SORT_DESC);
    return null;
  }

  if (req.query.sort$desc) {
    sortDirection = -1;
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    sort[req.query.sort$desc] = sortDirection;
  }
  else {
    if (req.query.sort) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      sort[req.query.sort] = sortDirection;
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'identifier' does not exist on type '{}'.
  sort.identifier = sortDirection;
  // @ts-expect-error TS(2339) FIXME: Property 'created_at' does not exist on type '{}'.
  sort.created_at = sortDirection;
  // @ts-expect-error TS(2339) FIXME: Property 'date' does not exist on type '{}'.
  sort.date = sortDirection;

  return sort;
}


/**
 * Parse skip (offset) from query string
 */
function parseSkip (req: any, res: any) {
  let skip = 0;

  if (req.query.skip) {
    if (!isNaN(req.query.skip) && req.query.skip >= 0) {
      skip = parseInt(req.query.skip);
    }
    else {
      opTools.sendJSONStatus(res, apiConst.HTTP.BAD_REQUEST, apiConst.MSG.HTTP_400_BAD_SKIP);
      return null;
    }
  }

  return skip;
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  parseFilter,
  parseSort,
  parseSkip
};