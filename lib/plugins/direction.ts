'use strict';

function init() {

  var direction = {
    name: 'direction'
    , label: 'BG direction'
    , pluginType: 'bg-status'
  };

  // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
  direction.setProperties = function setProperties (sbx: any) {
    sbx.offerProperty('direction', function setDirection ( ) {
      if (!sbx.isCurrent(sbx.lastSGVEntry())) {
        return undefined;
      } else {
        // @ts-expect-error TS(2339): Property 'info' does not exist on type '{ name: st... Remove this comment to see the full error message
        return direction.info(sbx.lastSGVEntry());
      }
    });
  };

  // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
  direction.updateVisualisation = function updateVisualisation (sbx: any) {
    var prop = sbx.properties.direction;

    if (!prop || !prop.value) {
      sbx.pluginBase.updatePillText(direction, {
        hide: true
      });
    } else {
      if (sbx.lastSGVMgdl() < 39) {
        prop.value = 'CGM ERROR';
        prop.label = '✖';
      }

      sbx.pluginBase.updatePillText(direction, {
        label: prop && prop.label + '&#xfe0e;'
        , directHTML: true
      });
    }
  };

  // @ts-expect-error TS(2339): Property 'info' does not exist on type '{ name: st... Remove this comment to see the full error message
  direction.info = function info(sgv: any) {
    var result = { display: null };

    if (!sgv) { return result; }

    // @ts-expect-error TS(2339): Property 'value' does not exist on type '{ display... Remove this comment to see the full error message
    result.value = sgv.direction;
    // @ts-expect-error TS(2339): Property 'label' does not exist on type '{ display... Remove this comment to see the full error message
    result.label = directionToChar(result.value);
    // @ts-expect-error TS(2339): Property 'entity' does not exist on type '{ displa... Remove this comment to see the full error message
    result.entity = charToEntity(result.label);

    return result;
  };

  var dir2Char = {
    NONE: '⇼'
    , TripleUp: '⤊'
    , DoubleUp: '⇈'
    , SingleUp: '↑'
    , FortyFiveUp: '↗'
    , Flat: '→'
    , FortyFiveDown: '↘'
    , SingleDown: '↓'
    , DoubleDown: '⇊'
    , TripleDown: '⤋'
    , 'NOT COMPUTABLE': '-'
    , 'RATE OUT OF RANGE': '⇕'
  };

  function charToEntity(char: any) {
    return char && char.length && '&#' + char.charCodeAt(0) + ';';
  }

  function directionToChar(direction: any) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return dir2Char[direction] || '-';
  }

  return direction;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;