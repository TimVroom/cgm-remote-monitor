
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment-timezone');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'language'.
const language = require('../lib/language')(fs);
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const settings = require('../lib/settings')();
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'levels'.
const levels = require('../lib/levels');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
function helper() {

    helper.ctx = {
        language: language
        , settings: settings
        , levels: levels
        , moment: moment
      };

    helper.getctx = function getctx () {
        return helper.ctx;
    }

    return helper;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = helper;
