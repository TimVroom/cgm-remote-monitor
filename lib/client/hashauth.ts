'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'crypto'.
var crypto = require('crypto');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Storages = require('js-storage');

var hashauth = {
  initialized: false
};

// @ts-expect-error TS(2339): Property 'init' does not exist on type '{ initiali... Remove this comment to see the full error message
hashauth.init = function init (client: any, $: any) {

  // @ts-expect-error TS(2339): Property 'apisecret' does not exist on type '{ ini... Remove this comment to see the full error message
  hashauth.apisecret = '';
  // @ts-expect-error TS(2339): Property 'storeapisecret' does not exist on type '... Remove this comment to see the full error message
  hashauth.storeapisecret = false;
  // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
  hashauth.apisecrethash = null;
  // @ts-expect-error TS(2339): Property 'authenticated' does not exist on type '{... Remove this comment to see the full error message
  hashauth.authenticated = false;
  // @ts-expect-error TS(2339): Property 'tokenauthenticated' does not exist on ty... Remove this comment to see the full error message
  hashauth.tokenauthenticated = false;
  // @ts-expect-error TS(2339): Property 'hasReadPermission' does not exist on typ... Remove this comment to see the full error message
  hashauth.hasReadPermission = false;
  // @ts-expect-error TS(2339): Property 'isAdmin' does not exist on type '{ initi... Remove this comment to see the full error message
  hashauth.isAdmin = false;
  // @ts-expect-error TS(2339): Property 'hasWritePermission' does not exist on ty... Remove this comment to see the full error message
  hashauth.hasWritePermission = false;
  // @ts-expect-error TS(2339): Property 'permissionlevel' does not exist on type ... Remove this comment to see the full error message
  hashauth.permissionlevel = 'NONE';

  // @ts-expect-error TS(2339): Property 'verifyAuthentication' does not exist on ... Remove this comment to see the full error message
  hashauth.verifyAuthentication = function verifyAuthentication (next: any) {
    // @ts-expect-error TS(2339): Property 'authenticated' does not exist on type '{... Remove this comment to see the full error message
    hashauth.authenticated = false;
    $.ajax({
      method: 'GET'
      , url: '/api/v1/verifyauth?t=' + Date.now() //cache buster
      , headers: client.headers()
    }).done(function verifysuccess (response: any) {


      var message = response.message;

      // @ts-expect-error TS(2339): Property 'hasReadPermission' does not exist on typ... Remove this comment to see the full error message
      if (message.canRead) { hashauth.hasReadPermission = true; }
      // @ts-expect-error TS(2339): Property 'hasWritePermission' does not exist on ty... Remove this comment to see the full error message
      if (message.canWrite) { hashauth.hasWritePermission = true; }
      // @ts-expect-error TS(2339): Property 'isAdmin' does not exist on type '{ initi... Remove this comment to see the full error message
      if (message.isAdmin) { hashauth.isAdmin = true; }
      // @ts-expect-error TS(2339): Property 'permissionlevel' does not exist on type ... Remove this comment to see the full error message
      if (message.permissions) { hashauth.permissionlevel = message.permissions; }

      if (message.rolefound == 'FOUND') {
        // @ts-expect-error TS(2339): Property 'tokenauthenticated' does not exist on ty... Remove this comment to see the full error message
        hashauth.tokenauthenticated = true;
        console.log('Token Authentication passed.');
        next(true);
        return;
      }

      if (response.message === 'OK' || message.message === 'OK') {
        // @ts-expect-error TS(2339): Property 'authenticated' does not exist on type '{... Remove this comment to see the full error message
        hashauth.authenticated = true;
        console.log('Authentication passed.');
        next(true);
        return;
      }

      console.log('Authentication failed!', response);
      // @ts-expect-error TS(2339): Property 'removeAuthentication' does not exist on ... Remove this comment to see the full error message
      hashauth.removeAuthentication();
      next(false);
      return;

    }).fail(function verifyfail (err: any) {
      console.log('Authentication failure', err);
      // @ts-expect-error TS(2339): Property 'removeAuthentication' does not exist on ... Remove this comment to see the full error message
      hashauth.removeAuthentication();
      next(false);
    });
  };

  // @ts-expect-error TS(2339): Property 'injectHtml' does not exist on type '{ in... Remove this comment to see the full error message
  hashauth.injectHtml = function injectHtml () {
    // @ts-expect-error TS(2339): Property 'injectedHtml' does not exist on type '{ ... Remove this comment to see the full error message
    if (!hashauth.injectedHtml) {
      // @ts-expect-error TS(2339): Property 'inlineCode' does not exist on type '{ in... Remove this comment to see the full error message
      $('#authentication_placeholder').html(hashauth.inlineCode());
      // @ts-expect-error TS(2339): Property 'injectedHtml' does not exist on type '{ ... Remove this comment to see the full error message
      hashauth.injectedHtml = true;
    }
  };

  // @ts-expect-error TS(2339): Property 'initAuthentication' does not exist on ty... Remove this comment to see the full error message
  hashauth.initAuthentication = function initAuthentication (next: any) {
    // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
    hashauth.apisecrethash = hashauth.apisecrethash || Storages.localStorage.get('apisecrethash') || null;
    // @ts-expect-error TS(2339): Property 'verifyAuthentication' does not exist on ... Remove this comment to see the full error message
    hashauth.verifyAuthentication(function() {
      // @ts-expect-error TS(2339): Property 'injectHtml' does not exist on type '{ in... Remove this comment to see the full error message
      hashauth.injectHtml();
      // @ts-expect-error TS(2339): Property 'isAuthenticated' does not exist on type ... Remove this comment to see the full error message
      if (next) { next(hashauth.isAuthenticated()); }
    });
    return hashauth;
  };

  // @ts-expect-error TS(2339): Property 'removeAuthentication' does not exist on ... Remove this comment to see the full error message
  hashauth.removeAuthentication = function removeAuthentication (event: any) {

    Storages.localStorage.remove('apisecrethash');

    // @ts-expect-error TS(2339): Property 'authenticated' does not exist on type '{... Remove this comment to see the full error message
    if (hashauth.authenticated || hashauth.tokenauthenticated) {
      client.browserUtils.reload();
    }

    // clear everything just in case
    // @ts-expect-error TS(2339): Property 'apisecret' does not exist on type '{ ini... Remove this comment to see the full error message
    hashauth.apisecret = null;
    // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
    hashauth.apisecrethash = null;
    // @ts-expect-error TS(2339): Property 'authenticated' does not exist on type '{... Remove this comment to see the full error message
    hashauth.authenticated = false;

    if (event) {
      event.preventDefault();
    }
    return false;
  };

  // @ts-expect-error TS(2339): Property 'requestAuthentication' does not exist on... Remove this comment to see the full error message
  hashauth.requestAuthentication = function requestAuthentication (eventOrNext: any) {
    var translate = client.translate;
    // @ts-expect-error TS(2339): Property 'injectHtml' does not exist on type '{ in... Remove this comment to see the full error message
    hashauth.injectHtml();

    var clientWidth = window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;

    clientWidth = Math.min(400, clientWidth);

    $('#requestauthenticationdialog').dialog({
      width: clientWidth
      , height: 270
      , closeText: ''
      , buttons: [
        {
          id: 'requestauthenticationdialog-btn'
          , text: translate('Authenticate')
          , click: function() {
            var dialog = this;
            // @ts-expect-error TS(2339): Property 'processSecret' does not exist on type '{... Remove this comment to see the full error message
            hashauth.processSecret($('#apisecret').val(), $('#storeapisecret').is(':checked'), function done (close: any) {
              if (close) {
                if (eventOrNext && eventOrNext.call) {
                  eventOrNext(true);
                } else {
                  client.afterAuth(true);
                }
                $(dialog).dialog('close');
              } else {
                $('#apisecret').val('').focus();
              }
            });
          }
        }
      ]
      , open: function open () {
        $('#apisecret').off('keyup').on('keyup', function pressed (e: any) {
          if (e.keyCode === $.ui.keyCode.ENTER) {
            $('#requestauthenticationdialog-btn').trigger('click');
          }
        });
        $('#apisecret').val('').focus();
      }

    });

    if (eventOrNext && eventOrNext.preventDefault) {
      eventOrNext.preventDefault();
    }
    return false;
  };

  // @ts-expect-error TS(2339): Property 'processSecret' does not exist on type '{... Remove this comment to see the full error message
  hashauth.processSecret = function processSecret (apisecret: any, storeapisecret: any, callback: any) {
    var translate = client.translate;

    // @ts-expect-error TS(2339): Property 'apisecret' does not exist on type '{ ini... Remove this comment to see the full error message
    hashauth.apisecret = apisecret;
    // @ts-expect-error TS(2339): Property 'storeapisecret' does not exist on type '... Remove this comment to see the full error message
    hashauth.storeapisecret = storeapisecret;
    // @ts-expect-error TS(2339): Property 'apisecret' does not exist on type '{ ini... Remove this comment to see the full error message
    if (!hashauth.apisecret || hashauth.apisecret.length < 12) {
      window.alert(translate('Too short API secret'));
      if (callback) {
        callback(false);
      }
    } else {
      // @ts-expect-error TS(2339): Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
      var shasum = crypto.createHash('sha1');
      // @ts-expect-error TS(2339): Property 'apisecret' does not exist on type '{ ini... Remove this comment to see the full error message
      shasum.update(hashauth.apisecret);
      // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
      hashauth.apisecrethash = shasum.digest('hex');

      // @ts-expect-error TS(2339): Property 'verifyAuthentication' does not exist on ... Remove this comment to see the full error message
      hashauth.verifyAuthentication(function(isok: any) {
        if (isok) {
          // @ts-expect-error TS(2339): Property 'storeapisecret' does not exist on type '... Remove this comment to see the full error message
          if (hashauth.storeapisecret) {
            // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
            Storages.localStorage.set('apisecrethash', hashauth.apisecrethash);
            // TODO show dialog first, then reload
            // @ts-expect-error TS(2339): Property 'tokenauthenticated' does not exist on ty... Remove this comment to see the full error message
            if (hashauth.tokenauthenticated) client.browserUtils.reload();
          }
          // @ts-expect-error TS(2339): Property 'inlineCode' does not exist on type '{ in... Remove this comment to see the full error message
          $('#authentication_placeholder').html(hashauth.inlineCode());
          if (callback) {
            callback(true);
          }
        } else {
          alert(translate('Wrong API secret'));
          if (callback) {
            callback(false);
          }
        }
      });
    }
  };

  // @ts-expect-error TS(2339): Property 'inlineCode' does not exist on type '{ in... Remove this comment to see the full error message
  hashauth.inlineCode = function inlineCode () {
    var translate = client.translate;

    var status = null;

    // @ts-expect-error TS(2339): Property 'isAdmin' does not exist on type '{ initi... Remove this comment to see the full error message
    if (!hashauth.isAdmin) {
      $('.needsadminaccess').hide();
    } else {
      $('.needsadminaccess').show();
    }

    if (client.updateAdminMenu) client.updateAdminMenu();

    // @ts-expect-error TS(2339): Property 'tokenauthenticated' does not exist on ty... Remove this comment to see the full error message
    if (client.authorized || hashauth.tokenauthenticated) {
      status = translate('Authorized by token');
      if (client.authorized && client.authorized.sub) {
        status += '<br>' + translate('Auth role') + ': ' + client.authorized.sub;
        // @ts-expect-error TS(2339): Property 'hasReadPermission' does not exist on typ... Remove this comment to see the full error message
        if (hashauth.hasReadPermission) {  status += '<br>' + translate('Data reads enabled'); }
        // @ts-expect-error TS(2339): Property 'hasWritePermission' does not exist on ty... Remove this comment to see the full error message
        if (hashauth.hasWritePermission) { status += '<br>' + translate('Data writes enabled'); }
        // @ts-expect-error TS(2339): Property 'hasWritePermission' does not exist on ty... Remove this comment to see the full error message
        if (!hashauth.hasWritePermission) { status += '<br>' + translate('Data writes not enabled'); }
      }
      // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
      if (hashauth.apisecrethash) {
        status += '<br> <a href="#" onclick="Nightscout.client.hashauth.removeAuthentication(); return false;">(' + translate('Remove stored token') + ')</a>';
      } else {
        status += '<br><a href="/">(' + translate('view without token') + ')</a>';
      }

    // @ts-expect-error TS(2339): Property 'isAuthenticated' does not exist on type ... Remove this comment to see the full error message
    } else if (hashauth.isAuthenticated()) {
      status = translate('Admin authorized') + ' <a href="#" onclick="Nightscout.client.hashauth.removeAuthentication(); return false;">(' + translate('Remove') + ')</a>';
    } else {
      status = translate('Unauthorized') +
        '<br>' +
        translate('Reads enabled in default permissions') +
        '<br>' +
        ' <a href="#" onclick="Nightscout.client.hashauth.requestAuthentication(); return false;">(' +
        translate('Authenticate') + ')</a>';
    }

    var html =
      '<div id="requestauthenticationdialog" style="display:none" title="' + translate('Device authentication') + '">' +
      '<label for="apisecret">' + translate('Your API secret or token') + ': </label>' +
      '<input type="password" id="apisecret" size="20" style="width: 100%;"/>' +
      '<br>' +
      '<input type="checkbox" id="storeapisecret" /> <label for="storeapisecret">' + translate('Remember this device. (Do not enable this on public computers.)') + '</label>' +
      '</div>' +
      '<div id="authorizationstatus">' + status + '</div>';

    return html;
  };

  // @ts-expect-error TS(2339): Property 'updateSocketAuth' does not exist on type... Remove this comment to see the full error message
  hashauth.updateSocketAuth = function updateSocketAuth () {
    client.socket.emit(
      'authorize'
      , {
        client: 'web'
        , secret: client.authorized && client.authorized.token ? null : client.hashauth.hash()
        , token: client.authorized && client.authorized.token
      }
      , function authCallback (data: any) {
        if (!data.read && !client.authorized) {
          // @ts-expect-error TS(2339): Property 'requestAuthentication' does not exist on... Remove this comment to see the full error message
          hashauth.requestAuthentication();
        }
      }
    );
  };

  // @ts-expect-error TS(2339): Property 'hash' does not exist on type '{ initiali... Remove this comment to see the full error message
  hashauth.hash = function hash () {
    // @ts-expect-error TS(2339): Property 'apisecrethash' does not exist on type '{... Remove this comment to see the full error message
    return hashauth.apisecrethash;
  };

  // @ts-expect-error TS(2339): Property 'isAuthenticated' does not exist on type ... Remove this comment to see the full error message
  hashauth.isAuthenticated = function isAuthenticated () {
    // @ts-expect-error TS(2339): Property 'authenticated' does not exist on type '{... Remove this comment to see the full error message
    return hashauth.authenticated || hashauth.tokenauthenticated;
  };

  hashauth.initialized = true;

  return hashauth;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = hashauth;
