'use strict';

function getStorageVersion (app: any) {

  return new Promise(function (resolve, reject) {

    try {
      const storage = app.get('entriesCollection').storage;
      let storageVersion = app.get('storageVersion');

      if (storageVersion) {
        // @ts-expect-error TS(2591): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.nextTick(() => {
          resolve(storageVersion);
        });
      } else {
        storage.version()
          .then((storageVersion: any) => {

            app.set('storageVersion', storageVersion);
            resolve(storageVersion);
          }, reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}


function getVersionInfo(app: any) {

  return new Promise(function (resolve, reject) {

    try {
      const srvDate = new Date()
        , info = { version: app.get('version')
        , apiVersion: app.get('apiVersion')
        , srvDate: srvDate.getTime()
      };

      getStorageVersion(app)
        .then(storageVersion => {

          if (!storageVersion)
            throw new Error('empty storageVersion');

          // @ts-expect-error TS(2339): Property 'storage' does not exist on type '{ versi... Remove this comment to see the full error message
          info.storage = storageVersion;

          resolve(info);

        }, reject);

    } catch(error) {
      reject(error);
    }
  });
}


// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  getStorageVersion,
  getVersionInfo
};
