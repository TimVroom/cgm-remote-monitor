'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function init(ctx: any) {
  var consts = {
        SCALE_LINEAR: 0
      , SCALE_LOG: 1
      , ORDER_OLDESTONTOP: 0
      , ORDER_NEWESTONTOP: 1
      }
    , allPlugins = [
        // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        require('./daytoday')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./weektoweek')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./dailystats')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./glucosedistribution')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./hourlystats')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./percentile')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./success')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./calibrations')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./treatments')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./profiles')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./loopalyzer')(ctx)
    ];

  // @ts-expect-error TS(2339) FIXME: Property 'scaleYFromSettings' does not exist on ty... Remove this comment to see the full error message
  consts.scaleYFromSettings = function scaleYFromSettings (client: any) {
    return client.settings.scaleY === 'linear' ? consts.SCALE_LINEAR : consts.SCALE_LOG;
  };

  function plugins(name: any) {
    if (name) {
      return _.find(allPlugins, {name: name});
    } else {
      return plugins;
    }
  }

  plugins.eachPlugin = function eachPlugin(f: any) {
    _.each(allPlugins, f);
  };

  plugins.consts = consts;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  plugins.utils = require('./utils')({
    //TODO: refactor so all this happens after init somehow
    //  until then use some defaults so things don't blow up
    language: ctx.language
    , settings: {}
  });

  plugins.addHtmlFromPlugins = function addHtmlFromPlugins(client: any) {
    plugins.eachPlugin(function addHtml(p: any) {
      // add main plugin html
      if (p.html && ! $('#' + p.name + '-placeholder').length) {
        $('#pluginchartplaceholders').append($('<div>').attr('id',p.name + '-placeholder').addClass('tabplaceholder').css('display','none').append(p.html(client)));
      }
      // add menu item
      if (p.html && ! $('#' + p.name).length) {
        $('#tabnav').append($('<li>').attr('id',p.name).addClass('menutab').append(client.translate(p.label)));
      }
      // add css
      if (p.css) {
        $('<style>')
          .prop('type', 'text/css')
          .html(p.css)
          .appendTo('head');
      }
    });
    // select 1st tab
    $('#tabnav > li:first').addClass('selected');
    // show 1st report
    $('#pluginchartplaceholders > div:first').css('display','');
  };

  // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
  return plugins();

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
