'use strict';

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init (client: any, $: any) {

  var notifies = {};

  client.notifies = notifies;

  // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
  notifies.notifies = [];
  // @ts-expect-error TS(2339) FIXME: Property 'drawer' does not exist on type '{}'.
  notifies.drawer = $('#adminNotifiesDrawer');
  // @ts-expect-error TS(2339) FIXME: Property 'button' does not exist on type '{}'.
  notifies.button = $('#adminnotifies');

  // @ts-expect-error TS(2339) FIXME: Property 'updateAdminNotifies' does not exist on t... Remove this comment to see the full error message
  notifies.updateAdminNotifies = function updateAdminNotifies() {

    var src = '/api/v1/adminnotifies?t=' + new Date().getTime();

    $.ajax({
      method: 'GET'
      , url: src
      , headers: client.headers()
    }).done(function success (results: any) {
      if (results.message) {
        var m = results.message;
        client.notifies.notifies = m.notifies;
        client.notifies.notifyCount = m.notifyCount;
        if (m.notifyCount > 0) {
          // @ts-expect-error TS(2339) FIXME: Property 'button' does not exist on type '{}'.
          notifies.button.show();
        }
      }
      // @ts-expect-error TS(2339) FIXME: Property 'updateAdminNotifies' does not exist on t... Remove this comment to see the full error message
      window.setTimeout(notifies.updateAdminNotifies, 1000*60);
    }).fail(function fail () {
      console.error('Failed to load notifies');
      // @ts-expect-error TS(2339) FIXME: Property 'updateAdminNotifies' does not exist on t... Remove this comment to see the full error message
      window.setTimeout(notifies.updateAdminNotifies, 1000*60);
    });
  }

  // @ts-expect-error TS(2339) FIXME: Property 'updateAdminNotifies' does not exist on t... Remove this comment to see the full error message
  notifies.updateAdminNotifies();

  function wrapmessage(title: any, message: any, count: any, ago: any, persistent: any) {
    let html = '<hr><p><b>' + title + '</b></p><p class="adminNotifyMessage">' + message + '</p>';

    let additional = '';

    if (count > 1) additional += client.translate('Event repeated %1 times.', count) + ' ';
    let units = client.translate('minutes');
    if (ago > 60) {
      ago = ago / 60;
      ago = Math.round((ago + Number.EPSILON) * 10) / 10;
      units = client.translate('hours');
    }
    if (ago == 0) { ago = client.translate('less than 1'); }
    if (!persistent && ago) additional += client.translate('Last recorded %1 %2 ago.', ago, units);

    if (additional) html += '<p class="adminNotifyMessageAdditionalInfo">' + additional + '</p>'
    return html;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'prepare' does not exist on type '{}'.
  notifies.prepare = function prepare() {

    var translate = client.translate;

    var html = '<div id="adminNotifyContent">';
    var messages = client.notifies.notifies;
    var messageCount = client.notifies.notifyCount;

    if (messages && messages.length > 0) {
      html += '<p><b>' + translate('You have administration messages') + '</b></p>';
      for(var i = 0 ; i < messages.length; i++) {
        /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
        var m = messages[i];
        const ago = Math.round((Date.now() - m.lastRecorded) / 60000);
        html += wrapmessage(translate(m.title), translate(m.message), m.count, ago, m.persistent);
      }
    } else {
      if (messageCount > 0) {
        // @ts-expect-error TS(2554) FIXME: Expected 5 arguments, but got 2.
        html = wrapmessage(translate('Admin messages in queue'), translate('Please sign in using the API_SECRET to see your administration messages'));
      } else {
        // @ts-expect-error TS(2554) FIXME: Expected 5 arguments, but got 2.
        html = wrapmessage(translate('Queue empty'), translate('There are no admin messages in queue'));
      }
    }
    html += '<hr></div>';
    // @ts-expect-error TS(2339) FIXME: Property 'drawer' does not exist on type '{}'.
    notifies.drawer.html(html);
  }

  function maybePrevent (event: any) {
    if (event) {
      event.preventDefault();
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'toggleDrawer' does not exist on type '{}... Remove this comment to see the full error message
  notifies.toggleDrawer = function toggleDrawer (event: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'prepare' does not exist on type '{}'.
    client.browserUtils.toggleDrawer('#adminNotifiesDrawer', notifies.prepare);
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'button' does not exist on type '{}'.
  notifies.button.click(notifies.toggleDrawer);
  // @ts-expect-error TS(2339) FIXME: Property 'button' does not exist on type '{}'.
  notifies.button.css('color','red');

  return notifies;

}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
