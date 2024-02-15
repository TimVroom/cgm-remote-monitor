'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
var moment: any;

var cleanentriesdb = {
  name: 'cleanentriesdb'
  , label: 'Clean Mongo entries (glucose entries) database'
  , pluginType: 'admin'
};

function init(ctx: any) {
  // @ts-expect-error TS(2588) FIXME: Cannot assign to 'moment' because it is a constant... Remove this comment to see the full error message
  moment = ctx.moment;
  return cleanentriesdb;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

// @ts-expect-error TS(2339) FIXME: Property 'actions' does not exist on type '{ name:... Remove this comment to see the full error message
cleanentriesdb.actions = [
    {
        name: 'Delete all documents from entries collection older than 180 days'
      , description: 'This task removes all documents from entries collection that are older than 180 days. Useful when uploader battery status is not properly updated.'
      , buttonLabel: 'Delete old documents'
      , confirmText: 'Delete old documents from entries collection?'
      , preventClose: true
    }
  ];

// @ts-expect-error TS(2339) FIXME: Property 'actions' does not exist on type '{ name:... Remove this comment to see the full error message
cleanentriesdb.actions[0].init = function init(client: any, callback: any) {
  var translate = client.translate;
  var $status = $('#admin_' + cleanentriesdb.name + '_0_status');

  $status.hide();

  var numDays =  '<br/>'
      + '<label for="admin_entries_days">'
      + translate('Number of Days to Keep:')
      + '  <input id="admin_entries_days" value="180" size="3" min="1"/>'
      + '</label>';

  $('#admin_' + cleanentriesdb.name + '_0_html').html(numDays);

  if (callback) { callback(); }
};

// @ts-expect-error TS(2339) FIXME: Property 'actions' does not exist on type '{ name:... Remove this comment to see the full error message
cleanentriesdb.actions[0].code =  function deleteOldRecords(client: any, callback: any) {
  var translate = client.translate;
  var $status = $('#admin_' + cleanentriesdb.name + '_0_status');
  var numDays = Number($('#admin_entries_days').val());

  if (isNaN(numDays) || (numDays < 3)) {
    alert(translate('%1 is not a valid number - must be more than 2', { params: [$('#admin_entries_days').val()] }));
    if (callback) { callback(); }
    return;
  }
  var endDate = moment().subtract(numDays, 'days');

  if (!client.hashauth.isAuthenticated()) {
    alert(translate('Your device is not authenticated yet'));
    if (callback) {
      callback();
    }
    return;
  }

  $status.hide().text(translate('Deleting records ...')).fadeIn('slow');
  $.ajax('/api/v1/entries/?find[date][$lte]=' + endDate.valueOf(), {
      method: 'DELETE'
    , headers: client.headers()
    , success: function (retVal: any) {
      $status.hide().text(translate('%1 records deleted',{ params: [retVal.n] })).fadeIn('slow');
    }
    , error: function () {
      $status.hide().text(translate('Error')).fadeIn('slow');
    }
  }).done(function success () {
    if (callback) { callback(); }
  }).fail(function fail() {
    if (callback) { callback(); }
  });

};
