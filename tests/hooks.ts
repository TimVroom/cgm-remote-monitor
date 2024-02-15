'use strict;'

function clearRequireCache () {
  // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  Object.keys(require.cache).forEach(function(key) {
    // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    delete require.cache[key];
  });
}

// @ts-expect-error TS(2304): Cannot find name 'exports'.
exports.mochaHooks = {
  afterEach (done: any) {
    clearRequireCache();
    done();
  }
};
