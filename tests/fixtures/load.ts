
// @ts-expect-error TS(2304) FIXME: Cannot find name '__dirname'.
var dir = __dirname;
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
var fs = require('fs');

function text ( ) {
  return sync(dir + '/example.txt').toString( );
}

function json ( ) {
  return JSON.parse(sync(dir + '/example.json'));
}

function source (src: any) {
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return source[src]( );
}
source.text = text;
source.json = json;

function sync (src: any) {
  return fs.readFileSync(src);
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = source;
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports.sync = sync;
