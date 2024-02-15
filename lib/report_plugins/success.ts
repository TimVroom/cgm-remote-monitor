'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');

var success = {
  name: 'success'
  , label: 'Weekly Distribution'
  , pluginType: 'report'
};

function init () {
  return success;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;

// @ts-expect-error TS(2339) FIXME: Property 'html' does not exist on type '{ name: st... Remove this comment to see the full error message
success.html = function html (client: any) {
  var translate = client.translate;
  var ret =
    '<h2>' + translate('Weekly Distribution') + '</h2>' +
    '<div id="success-grid"></div>';
  return ret;
};

// @ts-expect-error TS(2339) FIXME: Property 'css' does not exist on type '{ name: str... Remove this comment to see the full error message
success.css =
  `#success-placeholder td {
  	border: 1px #ccc solid;
  	margin: 0;
  	padding: 1px;
   text-align:center;
  }
  #success-placeholder .bad {
  	background-color: #fcc;
  }
  #success-placeholder .good {
  	background-color: #cfc;
  }
  #success-placeholder th:first-child {
  	width: 30%;
  }
  #success-placeholder th {
  	width: 10%;
  }
  #success-placeholder table {
  	width: 100%;
  }`;

// @ts-expect-error TS(2339) FIXME: Property 'report' does not exist on type '{ name: ... Remove this comment to see the full error message
success.report = function report_success (datastorage, sorteddaystoshow, options) {
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var Nightscout = window.Nightscout;
  var client = Nightscout.client;
  var translate = client.translate;

  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  var ss = require('simple-statistics');

  var low = options.targetLow
    , high = options.targetHigh;

  var data = datastorage.allstatsrecords;

  var now = Date.now();
  var period = 7 * times.hours(24).msecs;
  // @ts-expect-error TS(7006) FIXME: Parameter 'min' implicitly has an 'any' type.
  var firstDataPoint = data.reduce(function(min, record) {
    return Math.min(min, record.displayTime);
  }, Number.MAX_VALUE);
  if (firstDataPoint < 1390000000000) {
    firstDataPoint = 1390000000000;
  }
  var quarters = Math.floor((Date.now() - firstDataPoint) / period);

  var grid = $('#success-grid');
  grid.empty();
  var table = $('<table/>');

  if (quarters === 0) {
    // insufficent data
    grid.append('<p>' + translate('There is not sufficient data to run this report. Select more days.') + '</p>');
    return;
  }

  // @ts-expect-error TS(7006) FIXME: Parameter 'n' implicitly has an 'any' type.
  var dim = function(n) {
    var a = [];
    for (var i = 0; i < n; i++) {
      a[i] = 0;
    }
    return a;
  };
  // @ts-expect-error TS(7006) FIXME: Parameter 'a' implicitly has an 'any' type.
  var sum = function(a) {
    // @ts-expect-error TS(7006) FIXME: Parameter 'sum' implicitly has an 'any' type.
    return a.reduce(function(sum, v) {
      return sum + v;
    }, 0);
  };
  var averages = {
    percentLow: 0
    , percentInRange: 0
    , percentHigh: 0
    , standardDeviation: 0
    , lowerQuartile: 0
    , upperQuartile: 0
    , average: 0
  };
  // @ts-expect-error TS(2322) FIXME: Type '{ starting: Date; ending: Date; records: any... Remove this comment to see the full error message
  quarters = dim(quarters).map(function(blank, n) {
    var starting = new Date(now - (n + 1) * period)
      , ending = new Date(now - n * period);
    return {
      starting: starting
      , ending: ending
      // @ts-expect-error TS(7006) FIXME: Parameter 'record' implicitly has an 'any' type.
      , records: data.filter(function(record) {
        return record.displayTime > starting && record.displayTime <= ending;
      })
    };
  }).filter(function(quarter) {
    return quarter.records.length > 0;
  }).map(function(quarter, ix, all) {
    // @ts-expect-error TS(7006) FIXME: Parameter 'record' implicitly has an 'any' type.
    var bgValues = quarter.records.map(function(record) {
      return record.sgv;
    });
    // @ts-expect-error TS(2339) FIXME: Property 'standardDeviation' does not exist on typ... Remove this comment to see the full error message
    quarter.standardDeviation = ss.standard_deviation(bgValues);
    // @ts-expect-error TS(2339) FIXME: Property 'average' does not exist on type '{ start... Remove this comment to see the full error message
    quarter.average = bgValues.length > 0 ? (sum(bgValues) / bgValues.length) : 'N/A';
    // @ts-expect-error TS(2339) FIXME: Property 'lowerQuartile' does not exist on type '{... Remove this comment to see the full error message
    quarter.lowerQuartile = ss.quantile(bgValues, 0.25);
    // @ts-expect-error TS(2339) FIXME: Property 'upperQuartile' does not exist on type '{... Remove this comment to see the full error message
    quarter.upperQuartile = ss.quantile(bgValues, 0.75);
    // @ts-expect-error TS(2339) FIXME: Property 'numberLow' does not exist on type '{ sta... Remove this comment to see the full error message
    quarter.numberLow = bgValues.filter(function(bg) {
      return bg < low;
    }).length;
    // @ts-expect-error TS(2339) FIXME: Property 'numberHigh' does not exist on type '{ st... Remove this comment to see the full error message
    quarter.numberHigh = bgValues.filter(function(bg) {
      return bg >= high;
    }).length;
    // @ts-expect-error TS(2339) FIXME: Property 'numberInRange' does not exist on type '{... Remove this comment to see the full error message
    quarter.numberInRange = bgValues.length - (quarter.numberHigh + quarter.numberLow);

    // @ts-expect-error TS(2339) FIXME: Property 'percentLow' does not exist on type '{ st... Remove this comment to see the full error message
    quarter.percentLow = (quarter.numberLow / bgValues.length) * 100;
    // @ts-expect-error TS(2339) FIXME: Property 'percentInRange' does not exist on type '... Remove this comment to see the full error message
    quarter.percentInRange = (quarter.numberInRange / bgValues.length) * 100;
    // @ts-expect-error TS(2339) FIXME: Property 'percentHigh' does not exist on type '{ s... Remove this comment to see the full error message
    quarter.percentHigh = (quarter.numberHigh / bgValues.length) * 100;

    // @ts-expect-error TS(2339) FIXME: Property 'percentLow' does not exist on type '{ st... Remove this comment to see the full error message
    averages.percentLow += quarter.percentLow / all.length;
    // @ts-expect-error TS(2339) FIXME: Property 'percentInRange' does not exist on type '... Remove this comment to see the full error message
    averages.percentInRange += quarter.percentInRange / all.length;
    // @ts-expect-error TS(2339) FIXME: Property 'percentHigh' does not exist on type '{ s... Remove this comment to see the full error message
    averages.percentHigh += quarter.percentHigh / all.length;
    // @ts-expect-error TS(2339) FIXME: Property 'lowerQuartile' does not exist on type '{... Remove this comment to see the full error message
    averages.lowerQuartile += quarter.lowerQuartile / all.length;
    // @ts-expect-error TS(2339) FIXME: Property 'upperQuartile' does not exist on type '{... Remove this comment to see the full error message
    averages.upperQuartile += quarter.upperQuartile / all.length;
    // @ts-expect-error TS(2339) FIXME: Property 'average' does not exist on type '{ start... Remove this comment to see the full error message
    averages.average += quarter.average / all.length;
    // @ts-expect-error TS(2339) FIXME: Property 'standardDeviation' does not exist on typ... Remove this comment to see the full error message
    averages.standardDeviation += quarter.standardDeviation / all.length;
    return quarter;
  });

  // @ts-expect-error TS(7006) FIXME: Parameter 'quarter' implicitly has an 'any' type.
  var lowComparison = function(quarter, averages, field, invert) {
    if (quarter[field] < averages[field] * 0.8) {
      return (invert ? 'bad' : 'good');
    } else if (quarter[field] > averages[field] * 1.2) {
      return (invert ? 'good' : 'bad');
    } else {
      return '';
    }
  };

  // @ts-expect-error TS(7006) FIXME: Parameter 'quarter' implicitly has an 'any' type.
  var lowQuartileEvaluation = function(quarter, averages) {
    if (quarter.lowerQuartile < low) {
      return 'bad';
    } else {
      // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
      return lowComparison(quarter, averages, 'lowerQuartile');
    }
  };

  // @ts-expect-error TS(7006) FIXME: Parameter 'quarter' implicitly has an 'any' type.
  var upperQuartileEvaluation = function(quarter, averages) {
    if (quarter.upperQuartile > high) {
      return 'bad';
    } else {
      // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
      return lowComparison(quarter, averages, 'upperQuartile');
    }
  };

  table.append('<thead><tr><th>' + translate('Period') + '</th><th>' + translate('Low') + '</th><th>' + translate('In Range') + '</th><th>' + translate('High') + '</th><th>' + translate('Standard Deviation') + '</th><th>' + translate('Low Quartile') + '</th><th>' + translate('Average') + '</th><th>' + translate('Upper Quartile') + '</th></tr></thead>');
  // @ts-expect-error TS(2339) FIXME: Property 'filter' does not exist on type 'number'.
  table.append('<tbody>' + quarters.filter(function(quarter) {
    return quarter.records.length > 0;
  // @ts-expect-error TS(7006) FIXME: Parameter 'quarter' implicitly has an 'any' type.
  }).map(function(quarter) {
    var INVERT = true;
    return '<tr>' + [
      quarter.starting.toLocaleDateString() + ' - ' + quarter.ending.toLocaleDateString()
      , {
        // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
        klass: lowComparison(quarter, averages, 'percentLow')
        , text: Math.round(quarter.percentLow) + '%'
      }
      , {
        klass: lowComparison(quarter, averages, 'percentInRange', INVERT)
        , text: Math.round(quarter.percentInRange) + '%'
      }
      , {
        // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
        klass: lowComparison(quarter, averages, 'percentHigh')
        , text: Math.round(quarter.percentHigh) + '%'
      }
      , {
        // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
        klass: lowComparison(quarter, averages, 'standardDeviation')
        , text: (quarter.standardDeviation > 10 ? Math.round(quarter.standardDeviation) : quarter.standardDeviation.toFixed(1))
      }
      , {
        klass: lowQuartileEvaluation(quarter, averages)
        , text: quarter.lowerQuartile
      }
      , {
        // @ts-expect-error TS(2554) FIXME: Expected 4 arguments, but got 3.
        klass: lowComparison(quarter, averages, 'average')
        , text: quarter.average.toFixed(1)
      }
      , {
        klass: upperQuartileEvaluation(quarter, averages)
        , text: quarter.upperQuartile
      }
    ].map(function(v) {
      if (typeof v === 'object') {
        return '<td class="' + v.klass + '">' + v.text + '</td>';
      } else {
        return '<td>' + v + '</td>';
      }
    }).join('') + '</tr>';
  }).join('') + '</tbody>');
  table.appendTo(grid);

};
