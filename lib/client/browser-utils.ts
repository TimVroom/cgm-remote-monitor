'use strict';

var SMALL_SCREEN = 500;

function init ($: any) {
  var lastOpenedDrawer: any = null;

  // Tooltips can remain in the way on touch screens.
  if (!isTouch()) {
    $('.tip').tooltip();
  } else {
    // Drawer info tips should be displayed on touchscreens.
    $('#drawer').find('.tip').tooltip();
  }
  $.fn.tooltip.defaults = {
    fade: true
    , gravity: 'n'
    , opacity: 0.75
  };

  $('#drawerToggle').click(function(event: any) {
    // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 1.
    toggleDrawer('#drawer');
    event.preventDefault();
  });

  $('#notification').click(function(event: any) {
    closeNotification();
    event.preventDefault();
  });

  $('.navigation a').click(function navigationClick () {
    // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
    closeDrawer('#drawer');
  });

  function reload () {
    //strip '#' so form submission does not fail
    var url = window.location.href;
    url = url.replace(/#$/, '');
    window.location.href = url;
  }

  function queryParms () {
    var params = {};
    if ((typeof location !== 'undefined') && location.search) {
      location.search.substr(1).split('&').forEach(function(item) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        // eslint-disable-next-line no-useless-escape
        params[item.split('=')[0]] = item.split('=')[1].replace(/[_\+]/g, ' ');
      });
    }
    return params;
  }

  function isTouch () {
    try { document.createEvent('TouchEvent'); return true; } catch (e) { return false; }
  }

  function closeLastOpenedDrawer (callback: any) {
    if (lastOpenedDrawer) {
      closeDrawer(lastOpenedDrawer, callback);
    } else if (callback) {
      callback();
    }
  }

  function closeDrawer (id: any, callback: any) {
    lastOpenedDrawer = null;
    $('html, body').css({ scrollTop: 0 });
    $(id).css({ display: 'none', right: '-300px' });
    if (callback) { callback(); }
  }

  function openDrawer (id: any, prepare: any) {
    function closeOpenDraw (callback: any) {
      if (lastOpenedDrawer) {
        closeDrawer(lastOpenedDrawer, callback);
      } else {
        callback();
      }
    }

    closeOpenDraw(function() {
      lastOpenedDrawer = id;
      if (prepare) { prepare(); }

      var style = { display: 'block', right: '0' };

      var windowWidth = $(window).width();
      var windowHeight = $(window).height();
      //var chartTop = $('#chartContainer').offset().top - 45;
      //var chartHeight = windowHeight - chartTop - 45;
      if (windowWidth < SMALL_SCREEN || (windowHeight < SMALL_SCREEN) && windowWidth < 800) {
        // @ts-expect-error TS(2339) FIXME: Property 'top' does not exist on type '{ display: ... Remove this comment to see the full error message
        style.top = '0px';
        // @ts-expect-error TS(2339) FIXME: Property 'height' does not exist on type '{ displa... Remove this comment to see the full error message
        style.height = windowHeight + 'px';
        // @ts-expect-error TS(2339) FIXME: Property 'width' does not exist on type '{ display... Remove this comment to see the full error message
        style.width = windowWidth + 'px';
        //TODO: maybe detect iOS and do this, doesn't work good with android
        //if (chartHeight > windowHeight * 0.4) {
        //  style.top = chartTop + 'px';
        //  style.height = chartHeight + 'px';
        //}
      } else {
        // @ts-expect-error TS(2339) FIXME: Property 'top' does not exist on type '{ display: ... Remove this comment to see the full error message
        style.top = '0px';
        // @ts-expect-error TS(2339) FIXME: Property 'height' does not exist on type '{ displa... Remove this comment to see the full error message
        style.height = (windowHeight - 45) + 'px';
        // @ts-expect-error TS(2339) FIXME: Property 'width' does not exist on type '{ display... Remove this comment to see the full error message
        style.width = '350px';
      }

      $(id).css(style);
    });

  }

  function toggleDrawer (id: any, openPrepare: any, closeCallback: any) {
    if (lastOpenedDrawer === id) {
      closeDrawer(id, closeCallback);
    } else {
      openDrawer(id, openPrepare);
    }
  }

  function closeNotification () {
    var notify = $('#notification');
    notify.hide();
    notify.find('span').html('');
  }

  function showNotification (note: any, type: any) {
    var notify = $('#notification');
    notify.hide();

    // Notification types: 'info', 'warn', 'success', 'urgent'.
    // - default: 'urgent'
    notify.removeClass('info warn urgent');
    notify.addClass(type ? type : 'urgent');

    notify.find('span').html(note);
    var windowWidth = $(window).width();
    var left = (windowWidth - notify.width()) / 2;
    notify.css('left', left + 'px');
    notify.show();
  }

  function getLastOpenedDrawer () {
    return lastOpenedDrawer;
  }

  return {
    reload: reload
    , queryParms: queryParms
    , closeDrawer: closeDrawer
    , closeLastOpenedDrawer: closeLastOpenedDrawer
    , toggleDrawer: toggleDrawer
    , closeNotification: closeNotification
    , showNotification: showNotification
    , getLastOpenedDrawer: getLastOpenedDrawer
  };
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
