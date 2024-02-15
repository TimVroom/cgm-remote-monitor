'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

var hourlystats = {
  name: 'hourlystats'
  , label: 'Hourly stats'
  , pluginType: 'report'
};

function init () {
  return hourlystats;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

// @ts-expect-error TS(2339) FIXME: Property 'html' does not exist on type '{ name: st... Remove this comment to see the full error message
hourlystats.html = function html (client: any) {
  var translate = client.translate;
  var ret =
    '<h2>' + translate('Hourly stats') + '</h2>' +
    '<div id="hourlystats-overviewchart"></div>' +
    '<div id="hourlystats-report"></div>';
  return ret;
};

// @ts-expect-error TS(2339) FIXME: Property 'css' does not exist on type '{ name: str... Remove this comment to see the full error message
hourlystats.css =
  '#hourlystats-overviewchart {' +
  '  width: 100%;' +
  '  min-width: 6.5in;' +
  '  height: 5in;' +
  '}' +
  '#hourlystats-placeholder td {' +
  '  text-align:center;' +
  '}';

// @ts-expect-error TS(2339) FIXME: Property 'report' does not exist on type '{ name: ... Remove this comment to see the full error message
hourlystats.report = function report_hourlystats (datastorage: any, sorteddaystoshow: any, options: any) {
  //console.log(window);
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var ss = require('simple-statistics');
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var Nightscout = window.Nightscout;
  var client = Nightscout.client;
  var translate = client.translate;
  var report_plugins = Nightscout.report_plugins;

  var report = $('#hourlystats-report');
  var stats: any = [];
  var pivotedByHour = {};

  var data = datastorage.allstatsrecords;

  for (var i = 0; i < 24; i++) {
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    pivotedByHour[i] = [];
  }

  data = data.filter(function(o: any) { return !isNaN(o.sgv); });

  data.forEach(function(record: any) {

    var d = new Date(record.displayTime);
    record.sgv = Number(record.sgv);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    pivotedByHour[d.getHours()].push(record);
  });

  var table = $('<table width="100%" border="1">');
  var thead = $('<tr/>');
  $('<th>' + translate('Time') + '</th>').appendTo(thead);
  $('<th>' + translate('Readings') + '</th>').appendTo(thead);
  $('<th>' + translate('Average') + '</th>').appendTo(thead);
  $('<th>' + translate('Min') + '</th>').appendTo(thead);
  $('<th>' + translate('Quartile') + ' 25</th>').appendTo(thead);
  $('<th>' + translate('Median') + '</th>').appendTo(thead);
  $('<th>' + translate('Quartile') + ' 75</th>').appendTo(thead);
  $('<th>' + translate('Max') + '</th>').appendTo(thead);
  $('<th>' + translate('Standard Deviation') + '</th>').appendTo(thead);
  thead.appendTo(table);

  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].forEach(function(hour) {
    var tr = $('<tr>');
    var display = new Date(0, 0, 1, hour, 0, 0, 0).toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var avg = Math.floor(pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    }).reduce(function(o: any, v: any) {
      return o + v;
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    }, 0) / pivotedByHour[hour].length);
    var d = new Date(times.hours(hour).msecs);

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var dev = ss.standard_deviation(pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    }));
    stats.push([
      new Date(d)
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      , ss.quantile(pivotedByHour[hour].map(function(r: any) {
        return r.sgv;
      }), 0.25)
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      , ss.quantile(pivotedByHour[hour].map(function(r: any) {
        return r.sgv;
      }), 0.75)
      , avg - dev
      , avg + dev
    ]);
    var tmp;
    $('<td>' + display + '</td>').appendTo(tr);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('<td>' + pivotedByHour[hour].length + ' (' + Math.floor(100 * pivotedByHour[hour].length / data.length) + '%)</td>').appendTo(tr);
    $('<td>' + avg + '</td>').appendTo(tr);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('<td>' + Math.min.apply(Math, pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    })) + '</td>').appendTo(tr);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    // eslint-disable-next-line no-cond-assign
    $('<td>' + ((tmp = ss.quantile(pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    }), 0.25)) ? tmp.toFixed(1) : 0) + '</td>').appendTo(tr);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    // eslint-disable-next-line no-cond-assign
    $('<td>' + ((tmp = ss.quantile(pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    }), 0.5)) ? tmp.toFixed(1) : 0) + '</td>').appendTo(tr);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    // eslint-disable-next-line no-cond-assign
    $('<td>' + ((tmp = ss.quantile(pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    }), 0.75)) ? tmp.toFixed(1) : 0) + '</td>').appendTo(tr);
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('<td>' + Math.max.apply(Math, pivotedByHour[hour].map(function(r: any) {
      return r.sgv;
    })) + '</td>').appendTo(tr);
    $('<td>' + Math.floor(dev * 10) / 10 + '</td>').appendTo(tr);
    table.append(tr);
  });

  report.empty();
  report.append(table);

  $.plot(
    '#hourlystats-overviewchart'
    , [{
      data: stats
      , candle: true
    }], {
      series: {
        candle: true
        , lines: false //Somehow it draws lines if you dont disable this. Should investigate and fix this ;)
      }
      , xaxis: {
        mode: 'time'
        , timeFormat: '%h:00'
        , min: 0
        , max: times.hours(24).msecs - times.secs(1).msecs
      }
      , yaxis: {
        min: 0
        , max: options.units === 'mmol' ? 22 : 400
        , show: true
      }
      , grid: {
        show: true
      }
    }
  );

  var totalPositive: any = [];
  var totalNegative: any = [];
  var positivesCount: any = [];
  var negativesCount: any = [];
  var totalNet: any = [];
  var days = 0;
  table = $('<table width="100%" border="1">');
  thead = $('<tr/>');
  ["", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].forEach(function(hour) {
    $('<th>' + hour + '</th>').appendTo(thead);
    totalPositive[hour] = 0;
    totalNegative[hour] = 0;
    positivesCount[hour] = 0;
    negativesCount[hour] = 0;
    totalNet[hour] = 0;
  });
  thead.appendTo(table);

  sorteddaystoshow.forEach(function(day: any) {
    if (datastorage[day].netBasalPositive) {
      days++;
      var tr = $('<tr>');
      $('<td>' + report_plugins.utils.localeDate(day) + '</td>').appendTo(tr);
      for (var h = 0; h < 24; h++) {
        var positive = datastorage[day].netBasalPositive[h];
        var negative = datastorage[day].netBasalNegative[h];
        var net = positive + negative;
        totalPositive[h] += positive;
        totalNegative[h] += negative;
        if (positive + negative > 0) positivesCount[h] += 1;
        else if (positive + negative < 0) negativesCount[h] += 1;
        totalNet[h] += net;
        var color = Math.abs(net) < 0.019 ? "black" : (net < 0 ? "red" : "lightgreen");
        $('<td>' +
          '<span style="color:black;">' + negative.toFixed(2) + '</span>' + '<br>' +
          '<span style="color:black;">' + positive.toFixed(2) + '</span>' + '<br>' +
          '<span style="color:' + color + ';font-weight:bold;">' + net.toFixed(2) + '</span>' +
          '</td>').appendTo(tr);
      }
      table.append(tr);
    }
  });
  if (days > 0) {
    var tr = $('<tr>');
    $('<td>' + '<span style="font-weight:bold;">' + translate('Average') + " " + days + " " + translate('days') + '</span>' + '</td>').appendTo(tr);
    for (var h = 0; h < 24; h++) {
      var color = Math.abs(totalNet[h]) < 0.01 ? "white" : (totalNet[h] < 0 ? "red" : "lightgreen");
      $('<td style="background-color:' + color + '";>' +
        '<span style="color:black;">' + (totalNegative[h] / days).toFixed(2) + ' (' + negativesCount[h] + ')' + '</span>' + '<br>' +
        '<span style="color:black;">' + (totalPositive[h] / days).toFixed(2) + ' (' + positivesCount[h] + ')' + '</span>' + '<br>' +
        '<span style="color:black;font-weight:bold;">' + (totalNet[h] / days).toFixed(2) + '</span>' +
        '</td>').appendTo(tr);
    }
    table.append(tr);
  }

  report.append('<br>');
  report.append('<h2>' + translate('netIOB stats') + '</h2>');
  report.append(translate('(temp basals must be rendered to display this report)'));
  report.append('<br><br>');
  report.append(table);
};
