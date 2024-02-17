'use strict';

// Craft a JSON friendly status (or error) message.
// @ts-expect-error TS(2300): Duplicate identifier 'sendJSONStatus'.
function sendJSONStatus(res: any, status: any, title: any, description: any, warning: any) {
  var json = {
    status: status,
    message: title,
    description: description
  };

  // Add optional warning message.
  // @ts-expect-error TS(2339) FIXME: Property 'warning' does not exist on type '{ statu... Remove this comment to see the full error message
  if (warning) { json.warning = warning; }

  res.status(status).json(json);
}

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure ( ) {
  function middleware (req: any, res: any, next: any) {
    res.sendJSONStatus = sendJSONStatus;
    next( );
  }
  return middleware;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
