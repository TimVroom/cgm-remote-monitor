// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = function create_device_obscurity (env: any) {
  function obscure_device (req: any, res: any, next: any) {
    if (res.entries && env.settings.obscureDeviceProvenance) {
      var entries = _.cloneDeep(res.entries);
      for (var i = 0; i < entries.length; i++) {
        entries[i].device = env.settings.obscureDeviceProvenance;
      }
      res.entries = entries;
    }
    next( );
  }
  return obscure_device;
}
