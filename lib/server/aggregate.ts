// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var find_options = require('./query');

// @ts-expect-error TS(2300): Duplicate identifier 'create'.
function create (conf: any, api: any) {

  var template = function ( ) {
    return [
        {
          $group: {
            _id: null
          , count: { $sum: 1 }
          }
        }
      ];
  };

  // var collection = api( );
  function aggregate (opts: any, done: any) {
    var query = find_options(opts);

    var pipeline = (conf.pipeline || [ ]).concat(opts.pipeline || [ ]);
    // @ts-expect-error TS(2769) FIXME: No overload matches this call.
    var groupBy = [ {$match: query } ].concat(pipeline).concat(template( ));
    console.log('$match query', query);
    console.log('AGGREGATE', groupBy);
    api( ).aggregate(groupBy, done);
  }

  return aggregate;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = create;

