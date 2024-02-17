'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const MongoClient = require('mongodb').MongoClient;

const mongo = {
  client: null,
  db: null,
};

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init(env: any, cb: any, forceNewConnection: any) {

  function maybe_connect(cb: any) {

    if (mongo.db != null && !forceNewConnection) {
      console.log('Reusing MongoDB connection handler');
      // If there is a valid callback, then return the Mongo-object

      if (cb && cb.call) {
        cb(null, mongo);
      }
    } else {
      if (!env.storageURI) {
        throw new Error('MongoDB connection string is missing. Please set MONGODB_URI environment variable');
      }

      console.log('Setting up new connection to MongoDB');
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      const connect_with_retry = async function (i: any) {

        mongo.client = new MongoClient(env.storageURI, options);
        try {
          // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
          await mongo.client.connect();

          console.log('Successfully established connection to MongoDB');

          // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
          const dbName = mongo.client.s.options.dbName;
          // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
          mongo.db = mongo.client.db(dbName);

          // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
          const result = await mongo.db.command({ connectionStatus: 1 });
          const roles = result.authInfo.authenticatedUserRoles;
          if (roles.length > 0 && roles[0].role == 'readAnyDatabase') {
            console.error('Mongo user is read only');
            cb(new Error('MongoDB connection is in read only mode! Go back to MongoDB configuration and check your database user has read and write access.'), null);
          }

          console.log('Mongo user role seems ok:', roles);

          // If there is a valid callback, then invoke the function to perform the callback
          if (cb && cb.call) {
            cb(null, mongo);
          }
        } catch (err) {
          // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
          if (err.message && err.message.includes('AuthenticationFailed')) {
            console.log('Authentication to Mongo failed');
            cb(new Error('MongoDB authentication failed! Double check the URL has the right username and password in MONGODB_URI.'), null);
            return;
          }

          // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
          if (err.name && err.name === "MongoServerSelectionError") {
            const timeout = (i > 15) ? 60000 : i * 3000;
            console.log('Error connecting to MongoDB: %j - retrying in ' + timeout / 1000 + ' sec', err);
            setTimeout(connect_with_retry, timeout, i + 1);
            if (i == 1) cb(new Error('MongoDB connection failed! Double check the MONGODB_URI setting in Heroku.'), null);
          } else {
            // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
            cb(new Error('MONGODB_URI seems invalid: ' + err.message));
          }
        }
      };

      return connect_with_retry(1);

    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'collection' does not exist on type '{ cl... Remove this comment to see the full error message
  mongo.collection = function get_collection(name: any) {
    // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
    return mongo.db.collection(name);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'ensureIndexes' does not exist on type '{... Remove this comment to see the full error message
  mongo.ensureIndexes = function ensureIndexes(collection: any, fields: any) {
    fields.forEach(function (field: any) {
      console.info('ensuring index for: ' + field);
      collection.createIndex(field, { 'background': true }, function (err: any) {
        if (err) {
          console.error('unable to ensureIndex for: ' + field + ' - ' + err);
        }
      });
    });
  };

  return maybe_connect(cb);
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
