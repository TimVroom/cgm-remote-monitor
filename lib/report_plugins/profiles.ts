'use strict';

var profiles = {
  name: 'profiles'
  , label: 'Profiles'
  , pluginType: 'report'
};

function init () {
  return profiles;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

// @ts-expect-error TS(2339): Property 'html' does not exist on type '{ name: st... Remove this comment to see the full error message
profiles.html = function html (client: any) {
  var translate = client.translate;
  var ret =
    '<h2>' + translate('Profiles') + '</h2>' +
    '<br>' + translate('Database records') + '&nbsp' +
    '<br><select id="profiles-databaserecords"></select>' +
    '<br><span id="profiles-default"></span>' +
    '<div id="profiles-chart">' +
    '</div>';
  return ret;
};

// @ts-expect-error TS(2339): Property 'css' does not exist on type '{ name: str... Remove this comment to see the full error message
profiles.css =
  '#profiles-chart {' +
  '  width: 100%;' +
  '  height: 100%;' +
  '}';

// @ts-expect-error TS(2339): Property 'report' does not exist on type '{ name: ... Remove this comment to see the full error message
profiles.report = function report_profiles (datastorage: any) {
  // @ts-expect-error TS(2339): Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var Nightscout = window.Nightscout;
  var client = Nightscout.client;
  var translate = client.translate;

  var profileRecords = datastorage.profiles;
  var databaseRecords = $('#profiles-databaserecords');

  databaseRecords.empty();
  for (var r = 0; r < profileRecords.length; r++) {
    databaseRecords.append('<option value="' + r + '">' + translate('Valid from:') + ' ' + new Date(profileRecords[r].startDate).toLocaleString() + '</option>');
  }
  databaseRecords.unbind().bind('change', recordChange);

  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  recordChange();

  function recordChange (event: any) {
    if ($('#profiles-databaserecords option').length < 1)
      return;
    var currentindex = databaseRecords.val();
    var currentrecord = profileRecords[currentindex];

    var table = $('<table border="1">');
    var tr = $('<tr>');

    $('#profiles-default').val(currentrecord.defaultProfile);

    Object.keys(currentrecord.store).forEach(key => {
      tr.append(displayRecord(currentrecord.store[key], key));
    });

    table.append(tr);

    $('#profiles-chart').empty().append(table);

    if (event) {
      event.preventDefault();
    }
  }

  function displayRecord (record: any, name: any) {
    var td = $('<td>');
    var table = $('<table>');

    table.append($('<tr>').append($('<td>').append('<b>' + name + '</b>')));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Units') + '</b>:&nbsp' + record.units)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('DIA') + '</b>:&nbsp' + record.dia)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Timezone') + '</b>:&nbsp' + record.timezone)));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Carbs activity / absorption rate') + '</b>:&nbsp' + record.carbs_hr)));
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Insulin to carb ratio (I:C)') + '</b>:&nbsp' + '<br>' + displayRanges(record.carbratio))));
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Insulin Sensitivity Factor (ISF)') + '</b>:&nbsp' + '<br>' + displayRanges(record.sens))));
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Basal rates [unit/hour]') + '</b>:&nbsp' + '<br>' + displayRanges(record.basal))));
    table.append($('<tr>').append($('<td>').append('<b>' + translate('Target BG range [mg/dL,mmol/L]') + '</b>:&nbsp' + '<br>' + displayRanges(record.target_low, record.target_high))));

    td.append(table);
    return td;
  }

  function displayRanges (array: any, array2: any) {
    var text = '';

    if (array && array2) {
      for (let i = 0; i < array.length; i++) {
        text += array[i].time + '&nbsp:&nbsp' + array[i].value + (array2 ? ' - ' + array2[i].value : '') + '<br>';
      }
    } else {
      for (let i = 0; i < array.length; i++) {
        text += array[i].time + '&nbsp:&nbsp' + array[i].value  + '<br>';
      }
    }
    return text;
  }
};
