'use strict';
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Stream = require('stream');

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init (settings: any) {
  var beats = 0;
  var started = new Date( );
  var interval = settings.heartbeat * 1000;
  let busInterval: any;

  var stream = new Stream;

  function ictus ( ) {
    return {
      now: new Date( )
    , type: 'heartbeat'
    , sig: 'internal://' + ['heartbeat', beats ].join('/')
    , beat: beats++
    , interval: interval
    , started: started
    };
  }

  function repeat ( ) {
    stream.emit('tick', ictus( ));
  }

  stream.teardown = function ( ) {
    console.log('Initiating server teardown');
    clearInterval(busInterval);
    stream.emit('teardown');
  };

  stream.readable = true;
  stream.uptime = repeat;
  busInterval = setInterval(repeat, interval);
  return stream;
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

