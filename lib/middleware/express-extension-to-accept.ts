// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'mime'.
var mime = require('mime')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'url'.
var url = require('url')

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = function (formats: any) {
  if (!Array.isArray(formats))
    throw new TypeError('Formats must be an array.')

  var getType = Object.create(null)

  formats.forEach(function (format) {
    if (!/^\w+$/.test(format))
      throw new TypeError('Invalid format - must be a word.')

    var type = getType[format] = mime.getType(format)
    if (!type || type === 'application/octet-stream')
      throw new Error('Invalid format.')
  })

  var regexp = new RegExp('\\.(' + formats.join('|') + ')$', 'i')

  return function (req: any, res: any, next: any) {
    var match = req.path.match(regexp)
    if (!match)
      return next()
    var type = getType[match[1]]
    if (!type)
      return next()

    req.extToAccept = {
      url: req.url,
      accept: req.headers.accept
    }

    req.headers.accept = type
    var parsed = url.parse(req.url)
    parsed.pathname = req.path.replace(regexp, '')
    req.url = url.format(parsed)

    next()
  };
}