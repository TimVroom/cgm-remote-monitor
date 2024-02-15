'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'apiConst'.
const apiConst = require('../const.json')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'mime'.
  , mime = require('mime')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'url'.
  , url = require('url')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'opTools'.
  , opTools = require('./operationTools')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , EasyXml = require('easyxml')
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  , csvStringify = require('csv-stringify')
  ;


/**
 * Middleware that converts url's extension to Accept HTTP request header
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function extension2accept (req: any, res: any, next: any) {

  const pathSplit = req.path.split('.');

  if (pathSplit.length < 2)
    return next();

  const pathBase = pathSplit[0]
    , extension = pathSplit.slice(1).join('.');

  if (!extension)
    return next();

  const mimeType = mime.getType(extension);
  if (!mimeType)
    return opTools.sendJSONStatus(res, apiConst.HTTP.NOT_ACCEPTABLE, apiConst.MSG.HTTP_406_UNSUPPORTED_FORMAT);

  req.extToAccept = {
    url: req.url,
    accept: req.headers.accept
  };

  req.headers.accept = mimeType;
  const parsed = url.parse(req.url);
  parsed.pathname = pathBase;
  req.url = url.format(parsed);

  next();
}


/**
 * Sends data to output using the client's desired format
 * @param {Object} res
 * @param {any} data
 */
function render (res: any, data: any) {
  res.format({
    'json': () => renderJson(res, data),
    'csv': () => renderCsv(res, data),
    'xml': () => renderXml(res, data),
    'default': () =>
      opTools.sendJSONStatus(res, apiConst.HTTP.NOT_ACCEPTABLE, apiConst.MSG.HTTP_406_UNSUPPORTED_FORMAT)
  });
}


/**
 * Format data to output as JSON
 * @param {Object} res
 * @param {any} data
 */
function renderJson (res: any, data: any) {
  res.send({
    status: apiConst.HTTP.OK,
    result: data
  });
}


/**
 * Format data to output as .csv
 * @param {Object} res
 * @param {any} data
 */
function renderCsv (res: any, data: any) {
  const csvSource = Array.isArray(data) ? data : [data];
  csvStringify(csvSource, {
      header: true
    },
    function csvStringified (err: any, output: any) {
      res.send(output);
    });
}


/**
 * Format data to output as .xml
 * @param {Object} res
 * @param {any} data
 */
function renderXml (res: any, data: any) {
  const serializer = new EasyXml({
    rootElement: 'item',
    dateFormat: 'ISO',
    manifest: true
  });
  res.send(serializer.render(data));
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  extension2accept,
  render
};
