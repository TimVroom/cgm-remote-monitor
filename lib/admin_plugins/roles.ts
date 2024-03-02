'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');

var roles = {
  name: 'roles'
  , label: 'Roles - Groups of People, Devices, etc'
  , pluginType: 'admin'
};

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init () {
  return roles;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

var $status: any = null;

// @ts-expect-error TS(2339) FIXME: Property 'actions' does not exist on type '{ name:... Remove this comment to see the full error message
roles.actions = [{
  description: 'Each role will have a 1 or more permissions.  The <em>*</em> permission is a wildcard, permissions are a hierarchy using <em>:</em> as a separator.'
  , buttonLabel: 'Add new Role'
  , init: function init (client: any, callback: any) {
    $status = $('#admin_' + roles.name + '_0_status');
    $status.hide().text(client.translate('Loading database ...')).fadeIn('slow');
    var table = $('<table id="admin_roles_table">').css('margin-top', '10px');
    $('#admin_' + roles.name + '_0_html').append(table).append(genDialog(client));
    reload(client, callback);
  }
  , preventClose: true
  , code: function createNewRole (client: any, callback: any) {
    var role = {};
    // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 3.
    openDialog(role, client, callback);
  }
}];

function createOrSaveRole (role: any, client: any, callback: any) {

  var method = _.isEmpty(role._id) ? 'POST' : 'PUT';

  $.ajax({
    method: method
    , url: '/api/v2/authorization/roles/'
    , headers: client.headers()
    , data: role
  }).done(function success () {
    reload(client, callback);
  }).fail(function fail (err: any) {
    console.error('Unable to ' + method + ' Role', err.responseText);
    window.alert(client.translate('Unable to save Role'));
    if (callback) {
      callback(err);
    }
  });
}

function deleteRole (role: any, client: any, callback: any) {
  $.ajax({
    method: 'DELETE'
    , url: '/api/v2/authorization/roles/' + role._id
    , headers: client.headers()
  }).done(function success () {
    reload(client, callback);
  }).fail(function fail (err: any) {
    console.error('Unable to delete Role', err.responseText);
    window.alert(client.translate('Unable to delete Role'));
    if (callback) {
      callback(err);
    }
  });
}

// @ts-expect-error TS(2393) FIXME: Duplicate function implementation.
function reload (client: any, callback: any) {
  $.ajax({
    method: 'GET'
    , url: '/api/v2/authorization/roles'
    , headers: client.headers()
  }).done(function success (records: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'records' does not exist on type '{ name:... Remove this comment to see the full error message
    roles.records = records;
    $status.hide().text(client.translate('Database contains %1 roles', { params: [records.length] })).fadeIn('slow');
    showRoles(records, client);
    if (callback) {
      callback();
    }
  }).fail(function fail (err: any) {
    $status.hide().text(client.translate('Error loading database')).fadeIn('slow');
    // @ts-expect-error TS(2339) FIXME: Property 'records' does not exist on type '{ name:... Remove this comment to see the full error message
    roles.records = [];
    if (callback) {
      callback(err);
    }
  });
}

// @ts-expect-error TS(2393) FIXME: Duplicate function implementation.
function genDialog (client: any) {
  var ret =
    '<div id="editroledialog" style="display:none" title="' + client.translate('Edit Role') + '">' +
    '      <label for="edrole_name">' +
    client.translate('Name') +
    '          <input id="edrole_name" placeholder="' + client.translate('admin, school, family, etc') + '"/>' +
    '      </label>' +
    '      <br>' +
    '      <label for="edrole_permissions">' + client.translate('Permissions') + '</label>' +
    '      <textarea id="edrole_permissions" rows="3" style="width:300px"></textarea><br>' +
    '      <br>' +
    '      <label for="edrole_notes">' + client.translate('Additional Notes, Comments') + '</label>' +
    '      <textarea id="edrole_notes" style="width:300px"></textarea><br>' +
    '   </div>';

  return $(ret);
}

// @ts-expect-error TS(2393) FIXME: Duplicate function implementation.
function openDialog (role: any, client: any) {
  $('#editroledialog').dialog({
    width: 360
    , height: 360
    , buttons: [
      {
        text: client.translate('Save')
        , class: 'leftButton'
        , click: function () {

          role.name = $('#edrole_name').val();
          role.permissions =
            _.chain($('#edrole_permissions').val().toLowerCase().split(/[;, ]/))
              .map(_.trim)
              .reject(_.isEmpty)
              .sort()
              .value();
          role.notes = $('#edrole_notes').val();

          var self = this;
          delete role.autoGenerated;
          createOrSaveRole(role, client, function callback () {
            $(self).dialog('close');
          });
        }
      }
      , {
        text: client.translate('Cancel')
        , click: function () {
          $(this).dialog('close');
        }
      }
    ]
    , open: function () {
      $(this).parent().css('box-shadow', '20px 20px 20px 0px black');
      $(this).parent().find('.ui-dialog-buttonset').css({ 'width': '100%', 'text-align': 'right' });
      $(this).parent().find('button:contains("' + client.translate('Save') + '")').css({ 'float': 'left' });
      $('#edrole_name').val(role.name || '').focus();
      $('#edrole_permissions').val(role.permissions ? role.permissions.join(' ') : '');
      $('#edrole_notes').val(role.notes || '');
    }

  });

}

function showRole (role: any & { permissions: string[] }, table: any, client: any) {
  var editIcon = $('<img title="' + client.translate('Edit this role') + '" style="cursor:pointer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABEUlEQVQ4jZ3MMUsCYQDG8ee8IySQbNCLyyEKG/RLNAXicqvQcAeNLrcFLlE0+xHuNpt8wy04rrYm8Q4HQRE56BSC3lSqU1BwCoxM39dnffj9BWyxXvVeEzvtctBwHyRebNu2Nk2lzMlrgJB+qBEeTByiKYpihl+fIO8jTI9PDJEVF1+K2iw+M6PhDuyag4NkQi/c3FkCK5Z3ZbM76qLltpCbn+vXxq0FABsDy9hzPdBvqvtXvvXzrw1swmsDLPjfACteGeDBfwK8+FdgGwwAIgC0ncsjxGRSH/eiPBgAJADY2z8sJ4JBfNBsDqlADVYMANIzKalv/bHaefKsTH9iPFb8ISsGAJym0+Qinz3jQktbAHcxvx3559eSAAAAAElFTkSuQmCC">');
  editIcon.click(function clicked () {
    openDialog(role, client);
  });

  var deleteIcon = '';
  if (role._id) {
    deleteIcon = $('<img title="Delete this role" class="titletranslate" style="cursor:pointer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACrElEQVQ4T42Ty2sTQRzHv5tmk2yyjRNtpfZhL8V6s2KoUNC2XqwgaCsVQcGiFqpHi0c9iRdR/ANE9KR40FIQX4cueKoPaKFoLdSYNtE0abKT1+5s9iW7aUMiHtzTzO7v85md+c6PA4DrHbsPCKIgOWO1pA7dT6YXnXH949SE/F63pqwZtRrO+SCKgjQ5NUV+azpmHj2krMwaJC4c8Erj+/eRyloMMwWFKgbn1nC3ervlK1evkXBLGBZT8SOewotnTylTNLdgeg/pDgZDC2cPHSR8bB22DVC9hFe0SG/H0xFXcHlykjRHRDBWgJcZSCY38Xx2lhqMnRYE34Px/sN9vlQWeoHBAx2yXsRruVAVuFsIBaSJ8+eJGPaBqQV4NROJjTzez89jLBoFn6FgybQL54wS3uTyVDFQ3cL2IYpBv3RhdJSIIQ80tQyv7gEqJvS8AmUlBs7UXPhtjtZgh3UFNYngk86NHCfNAg9dMwHVBPu+CpsVkTXKeJeVG+AGgTOZ3tt6MSKKjy+NjEBjFrR4ElZmA4pdxstMFsyyJu6tZZ7Ux9vwB6EAL50ZGiRECEPPUOixVTRxHlicgSVWxEdZpuZWfNuS2hk48NjwMIkIYZglBnV5Cbqtws/5IaAJmsfCglrEl2y2QeKmEBJ80tixKmxrFpSVr0gV0viQoxho2YUuPohmeFD22PiklLC4ma5JuBvdrfLJI0dJd0s7bM0ES8aR/BXDXGaTskqlL+D3Lwy0tZEePoAd4EA5YF4tYymdonfjmQh3s6dTPjU4SHYGwjAKecSXFyGlM1TdytntE56T+ts7SC/vhw3gm6njc2Kd3vm5Ub1IwQAvnYhGiZpYw1wiWYPrIw7wnBTt7CLOOwdmut14kQQvqt24tfK/utGR6LaF+iRqMf4N/O/8D28HiiCRYqzAAAAAAElFTkSuQmCC">');
    // @ts-expect-error TS(2339) FIXME: Property 'click' does not exist on type 'string'.
    deleteIcon.click(function clicked () {
      var ok = window.confirm(client.translate('Are you sure you want to delete: ') + role.name);
      if (ok) {
        // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
        deleteRole(role, client);
      }
    });
  }

  table.append($('<tr>').css('background-color', '#0f0f0f')
    .append($('<td>').attr('width', '20%').append(editIcon).append(deleteIcon).append(role.name))
    .append($('<td>').attr('width', '20%').append(_.isEmpty(role.permissions) ? '[none]' : Array.isArray(role.permissions) ? role.permissions.join(' ') : role.permissions))
    .append($('<td>').attr('width', '10%').append(role._id ? (role.notes ? role.notes : '') : '[system default]'))
  );
}

function showRoles (roles: any, client: any) {
  var table = $('#admin_roles_table');
  table.empty().append($('<tr>').css('background', '#040404')
    .append($('<th>').css('width', '100px').attr('align', 'left').append(client.translate('Name')))
    .append($('<th>').css('width', '150px').attr('align', 'left').append(client.translate('Permissions')))
    .append($('<th>').css('width', '150px').attr('align', 'left').append(client.translate('Notes')))
  );
  for (var t = 0; t < roles.length; t++) {
    showRole(roles[t], table, client);
  }
}
