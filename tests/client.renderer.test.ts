'use strict';

// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
import 'should';
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
let _ = require('lodash');

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'renderer'.
let renderer = require('../lib/client/renderer');

// @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('renderer', () => {
  // @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('bubbleScale', () => {
    const MAX_DELTA = 0.0001;
    const PREV_CHART_WIDTHS = [
      { width: 400, expectedScale: 3.5 }
      , { width: 500, expectedScale: 2.625 }
      , { width: 900, expectedScale: 1.75 }
    ];

    _.forEach(PREV_CHART_WIDTHS, (prev: any) => {
      // @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
      describe(`prevChartWidth < ${prev.width}`, () => {
        let mockClient = {
          utils: true
          , chart: { prevChartWidth: prev.width }
          , focusRangeMS: true
        };
        // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('scales correctly', () => {
          renderer(mockClient, {}).bubbleScale().should.be.approximately(prev.expectedScale, MAX_DELTA);
        });
      });
    });
  });

  // @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('highlightBrushPoints', () => {
    const BRUSH_EXTENTS = [
      { mills: 100, times: [200, 300], expectedOpacity: 0.5, expectation: 'Uses default opacity' }
      , { mills: 300, times: [100, 200], expectedOpacity: 0.5, expectation: 'Uses default opacity' }
      , { mills: 200, times: [100, 300], expectedOpacity: 1, expectation: 'Calculates opacity' }
    ];

    _.forEach(BRUSH_EXTENTS, (extent: any) => {
      let mockData = {
        mills: extent.mills
      };

      let mockClient = {
        chart: {
          brush: { 
            extent: () => {
              let extents = [];
              for (let time of extent.times) {
                extents.push({ getTime: () => {
                  return time;
                }});
              }
              return extents; 
            }
          }
          , futureOpacity: (millsDifference: any) => { return 1; }
          , createAdjustedRange: () => { return [
            { getTime: () => { return extent.times[0]}},
            { getTime: () => { return extent.times[1]}}
          ] }
        }
        , latestSGV: { mills: 120 }
      };

      // @ts-expect-error TS(2593) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
      describe(`data.mills ${extent.mills} and chart().brush.extent() times ${extent.times}`, () => {
        // @ts-expect-error TS(2593) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it(extent.expectation, () => {
          var selectedRange = mockClient.chart.createAdjustedRange();
          var from = selectedRange[0].getTime();
          var to = selectedRange[1].getTime();
          renderer(mockClient, {}).highlightBrushPoints(mockData, from, to).should.equal(extent.expectedOpacity);
        });
      });
    });
  });
});
