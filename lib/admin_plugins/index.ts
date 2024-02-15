'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _find = require('lodash/find');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_each'.
var _each = require('lodash/each');

function init(ctx: any) {
    var allPlugins = [
        // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        require('./subjects')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./roles')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./cleanstatusdb')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./cleantreatmentsdb')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./cleanentriesdb')(ctx)
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      , require('./futureitems')(ctx)
    ];

  function plugins(name: any) {
    if (name) {
      return _find(allPlugins, {name: name});
    } else {
      return plugins;
    }
  }

  plugins.eachPlugin = function eachPlugin(f: any) {
    _each(allPlugins, f);
  };

  plugins.createHTML = function createHTML(client: any) {
    var translate = client.translate;
    plugins.eachPlugin(function addHtml(p: any) {
      var fs = $('<fieldset>');
      $('#admin_placeholder').append(fs);
      fs.append($('<legend>').append(translate(p.label)));
      for (var i = 0; i < p.actions.length; i++) {
        if (i !== 0) {
          fs.append('<hr>');
        }
        var a = p.actions[i];
        // add main plugin html
        if (a.name) {
          fs.append($('<b>').css('text-decoration','underline').append(translate(a.name)));
          fs.append('<br>');
        }
        fs.append($('<i>').append(translate(a.description)));
        fs.append($('<div>').attr('id','admin_' + p.name + '_' + i + '_html'));
        fs.append($('<button>').addClass('adminButton').attr('plugin',p.name).attr('action',i).append(translate(a.buttonLabel)));
        fs.append($('<span>').attr('id','admin_' + p.name + '_' + i + '_status'));
        if (a.init) {
          a.init(client);
        }
      }
      // add css
      if (p.css) {
        $('<style>')
          .prop('type', 'text/css')
          .html(p.css)
          .appendTo('head');
      }
    });
    $('.adminButton').click(plugins.doAction);
  };

  plugins.doAction = function doAction(event: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
    var Nightscout = window.Nightscout;
    var plugin = $(this).attr('plugin');
    var action = $(this).attr('action');
    var a = plugins(plugin).actions[action];
    var ok = true;
    if (a.confirmText) {
      ok = window.confirm(Nightscout.client.translate(a.confirmText));
    }
    if (ok) {
      console.log('Running action', action, 'on plugin', plugin);
      a.code(Nightscout.client);

      if (!a.preventClose) {
        $(this).css('display', 'none');
      }
    }
    if (event) {
      event.preventDefault();
    }
  };

  // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
  return plugins();

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
