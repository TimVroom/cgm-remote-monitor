'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var _map = require('lodash/map');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_each'.
var _each = require('lodash/each');

var TOOLTIP_WIDTH = 275;  //min-width + padding

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (majorPills: any, minorPills: any, statusPills: any, bgStatus: any, tooltip: any) {

  var pluginBase = { };

  // @ts-expect-error TS(2339) FIXME: Property 'forecastInfos' does not exist on type '{... Remove this comment to see the full error message
  pluginBase.forecastInfos = [];
  // @ts-expect-error TS(2339) FIXME: Property 'forecastPoints' does not exist on type '... Remove this comment to see the full error message
  pluginBase.forecastPoints = {};

  function findOrCreatePill (plugin: any) {
    var container = null;

    if (plugin.pluginType === 'pill-major') {
      container = majorPills;
    } else if (plugin.pluginType === 'pill-status') {
      container = statusPills;
    } else if (plugin.pluginType === 'bg-status') {
      container = bgStatus;
    } else {
      container = minorPills;
    }

    var pillName = 'span.pill.' + plugin.name;
    var pill = container.find(pillName);

    var classes = 'pill ' + plugin.name;

    if (!pill || pill.length === 0) {
      pill = $('<span class="' + classes + '">');
      var pillLabel = $('<label></label>');
      var pillValue = $('<em></em>');
      if (plugin.pillFlip) {
        pill.append(pillValue);
        pill.append(pillLabel);
      } else {
        pill.append(pillLabel);
        pill.append(pillValue);
      }

      container.append(pill);
    } else {
      //reset in case a pill class was added and needs to be removed
      pill.attr('class', classes);
    }

    return pill;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'updatePillText' does not exist on type '... Remove this comment to see the full error message
  pluginBase.updatePillText = function updatePillText (plugin: any, options: any) {

    var pill = findOrCreatePill(plugin);

    if (options.hide) {
      pill.addClass('hidden');
    } else {
      pill.removeClass('hidden');
    }

    pill.addClass(options.pillClass);

    if (options.directHTML) {
      pill.html(options.label);
    } else {
      if (options.directText) {
        pill.text(options.label);
      } else {
        pill.find('label').attr('class', options.labelClass).text(options.label);
        pill.find('em')
          .attr('class', options.valueClass)
          .toggle(options.value != null)
          .text(options.value)
        ;
      }
    }

    if (options.info  && options.info.length) {
      var html = _map(options.info, function mapInfo (i: any) {
        return '<strong>' + i.label + '</strong> ' + i.value;
      }).join('<br/>\n');

      pill.mouseover(function pillMouseover (event: any) {
        tooltip.style('opacity', .9);

        var windowWidth = $(tooltip.node()).parent().parent().width();
        var left = event.pageX + TOOLTIP_WIDTH < windowWidth ? event.pageX : windowWidth - TOOLTIP_WIDTH - 10;
        tooltip.html(html)
          .style('left', left + 'px')
          .style('top', (event.pageY + 15) + 'px');
      });

      pill.mouseout(function pillMouseout ( ) {
        tooltip.style('opacity', 0);
      });
    } else {
      pill.off('mouseover');
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'addForecastPoints' does not exist on typ... Remove this comment to see the full error message
  pluginBase.addForecastPoints = function addForecastPoints (points: any, info: any) {
    _each(points, function eachPoint (point: any) {
      point.type = 'forecast';
      point.info = info;
      if (point.mgdl < 13) {
        point.color = 'transparent';
      }
    });

    // @ts-expect-error TS(2339) FIXME: Property 'forecastInfos' does not exist on type '{... Remove this comment to see the full error message
    pluginBase.forecastInfos.push(info);
    // @ts-expect-error TS(2339) FIXME: Property 'forecastPoints' does not exist on type '... Remove this comment to see the full error message
    pluginBase.forecastPoints[info.type] = points;
  };

  return pluginBase;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
