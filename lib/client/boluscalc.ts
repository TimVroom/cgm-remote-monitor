'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'times'.
var times = require('../times');
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Storages = require('js-storage');

// @ts-expect-error TS(2300): Duplicate identifier 'init'.
function init (client: any, $: any) {
  var boluscalc = {};

  var translate = client.translate;
  var storage = Storages.localStorage;
  var iob = client.plugins('iob');
  var cob = client.plugins('cob');

  var eventTime = $('#bc_eventTimeValue');
  var eventDate = $('#bc_eventDateValue');

  var quickpicks: any = [];
  var foods: any = [];

  var icon_remove = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACrElEQVQ4T42Ty2sTQRzHv5tmk2yyjRNtpfZhL8V6s2KoUNC2XqwgaCsVQcGiFqpHi0c9iRdR/ANE9KR40FIQX4cueKoPaKFoLdSYNtE0abKT1+5s9iW7aUMiHtzTzO7v85md+c6PA4DrHbsPCKIgOWO1pA7dT6YXnXH949SE/F63pqwZtRrO+SCKgjQ5NUV+azpmHj2krMwaJC4c8Erj+/eRyloMMwWFKgbn1nC3ervlK1evkXBLGBZT8SOewotnTylTNLdgeg/pDgZDC2cPHSR8bB22DVC9hFe0SG/H0xFXcHlykjRHRDBWgJcZSCY38Xx2lhqMnRYE34Px/sN9vlQWeoHBAx2yXsRruVAVuFsIBaSJ8+eJGPaBqQV4NROJjTzez89jLBoFn6FgybQL54wS3uTyVDFQ3cL2IYpBv3RhdJSIIQ80tQyv7gEqJvS8AmUlBs7UXPhtjtZgh3UFNYngk86NHCfNAg9dMwHVBPu+CpsVkTXKeJeVG+AGgTOZ3tt6MSKKjy+NjEBjFrR4ElZmA4pdxstMFsyyJu6tZZ7Ux9vwB6EAL50ZGiRECEPPUOixVTRxHlicgSVWxEdZpuZWfNuS2hk48NjwMIkIYZglBnV5Cbqtws/5IaAJmsfCglrEl2y2QeKmEBJ80tixKmxrFpSVr0gV0viQoxho2YUuPohmeFD22PiklLC4ma5JuBvdrfLJI0dJd0s7bM0ES8aR/BXDXGaTskqlL+D3Lwy0tZEePoAd4EA5YF4tYymdonfjmQh3s6dTPjU4SHYGwjAKecSXFyGlM1TdytntE56T+ts7SC/vhw3gm6njc2Kd3vm5Ub1IwQAvnYhGiZpYw1wiWYPrIw7wnBTt7CLOOwdmut14kQQvqt24tfK/utGR6LaF+iRqMf4N/O/8D28HiiCRYqzAAAAAAElFTkSuQmCC';

  function roundTo (x: any, step: any) {
    if (x) {
      return Math.round(x / step) * step;
    }
    return 0;
  }

  function maybePrevent (event: any) {
    if (event) {
      event.preventDefault();
    }
  }

  function isProfileEnabled (profiles: any) {
    return client.settings.enable.indexOf('profile') > -1 &&
      client.settings.extendedSettings.profile &&
      client.settings.extendedSettings.profile.multiple &&
      profiles.length > 1;
  }

  function isTouch () {
    try { document.createEvent('TouchEvent'); return true; } catch (e) { return false; }
  }

  function setDateAndTime (time: any) {
    time = time || new Date();
    eventTime.val(time.getHours() + ":" + time.getMinutes());
    eventDate.val(time.toISOString().split('T')[0]);
  }

  function mergeDateAndTime () {
    return client.utils.mergeInputTime(eventTime.val(), eventDate.val());
  }

  function updateTime (ele: any, time: any) {
    ele.attr('oldminutes', time.minutes());
    ele.attr('oldhours', time.hours());
  }

  function setBG (sgv: any, selectedTime: any) {
    var sensorbg = 0;
    // @ts-expect-error TS(2339): Property 'oldbg' does not exist on type '{}'.
    boluscalc.oldbg = false;
    if (sgv) {
      sensorbg = sgv.mgdl;
      if (sensorbg < 39) {
        sensorbg = 0;
      } else {
        sensorbg = client.utils.scaleMgdl(sensorbg);
      }
      if (selectedTime.getTime() - sgv.mills > 10 * 60 * 1000) {
        // @ts-expect-error TS(2339): Property 'oldbg' does not exist on type '{}'.
        boluscalc.oldbg = true; // Do not use if record is older than 10 min
        sensorbg = 0;
      }
    }

    // Set BG
    if ($('#bc_bgfromsensor').is(':checked')) {
      $('#bc_bg').val(sensorbg ? sensorbg : '');
    }
  }

  // @ts-expect-error TS(2339): Property 'updateVisualisations' does not exist on ... Remove this comment to see the full error message
  boluscalc.updateVisualisations = function updateVisualisations (sbx: any) {
    // update BG in GUI
    setBG(sbx.lastSGVEntry(), mergeDateAndTime().toDate());

    if (client.browserUtils.getLastOpenedDrawer !== '#boluscalcDrawer') {
      return;
    }
    if ($('#bc_nowtime').is(':checked')) {
      // Update time
      // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
      setDateAndTime();

      // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
      boluscalc.calculateInsulin();
    }
  };

  // @ts-expect-error TS(2339): Property 'dateTimeFocus' does not exist on type '{... Remove this comment to see the full error message
  boluscalc.dateTimeFocus = function dateTimeFocus (event: any) {
    $('#bc_othertime').prop('checked', true);
    updateTime($(this), mergeDateAndTime());
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339): Property 'dateTimeChange' does not exist on type '... Remove this comment to see the full error message
  boluscalc.dateTimeChange = function dateTimeChange (event: any) {
    $('#bc_othertime').prop('checked', true);
    //    client.utils.setYAxisOffset(50); //50% of extend
    var ele = $(this);
    var merged = mergeDateAndTime();

    if (ele.attr('oldminutes') === '59' && merged.minutes() === 0) {
      merged.add(1, 'hours');
    }
    if (ele.attr('oldminutes') === '0' && merged.minutes() === 59) {
      merged.add(-1, 'hours');
    }

    setDateAndTime(merged);
    updateTime(ele, merged);
    // @ts-expect-error TS(2339): Property 'eventTimeTypeChange' does not exist on t... Remove this comment to see the full error message
    boluscalc.eventTimeTypeChange();

    // update BG from sgv to this time
    setBG(findClosestSGVToPastTime(merged.toDate()), merged.toDate());

    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    boluscalc.calculateInsulin();
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339): Property 'eventTimeTypeChange' does not exist on t... Remove this comment to see the full error message
  boluscalc.eventTimeTypeChange = function eventTimeTypeChange (event: any) {
    if ($('#bc_othertime').is(':checked')) {
      $('#bc_eventTimeValue').focus();
      $('#bc_retro').css('display', '');
      if (mergeDateAndTime() < Date.now()) {
        $('#bc_retro').css('background-color', 'red').text(translate('RETRO MODE'));
      } else if (mergeDateAndTime() > Date.now()) {
        $('#bc_retro').css('background-color', 'blue').text(translate('IN THE FUTURE'));
      } else {
        $('#bc_retro').css('display', 'none');
      }
    } else {
      $('#bc_retro').css('display', 'none');
      // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
      setDateAndTime();
      // @ts-expect-error TS(2339): Property 'updateVisualisations' does not exist on ... Remove this comment to see the full error message
      boluscalc.updateVisualisations(client.sbx);
      if (event) {
        // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
        boluscalc.calculateInsulin();
      }
      //        Nightscout.utils.setYAxisOffset(50); //50% of extend
      //        Nightscout.utils.updateBrushToTime(Nightscout.utils.mergeInputTime($('#bc_eventTimeValue').val(), $('#bc_eventDateValue').val()).toDate());
    }
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339): Property 'toggleDrawer' does not exist on type '{}... Remove this comment to see the full error message
  boluscalc.toggleDrawer = function toggleDrawer (event: any) {
    // @ts-expect-error TS(2339): Property 'prepare' does not exist on type '{}'.
    boluscalc.prepare();
    client.browserUtils.toggleDrawer('#boluscalcDrawer');
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339): Property 'prepare' does not exist on type '{}'.
  boluscalc.prepare = function prepare () {
    foods = [];
    $('#bc_profile').empty();
    var profiles = client.profilefunctions.listBasalProfiles();
    profiles.forEach(function(p: any) {
      $('#bc_profile').append('<option val="' + p + '">' + p + '</option>');
    });
    $('#bc_profileLabel').toggle(isProfileEnabled(profiles));

    $('#bc_usebg').prop('checked', 'checked');
    $('#bc_usecarbs').prop('checked', 'checked');
    $('#bc_usecob').prop('checked', '');
    $('#bc_useiob').prop('checked', 'checked');
    $('#bc_bgfromsensor').prop('checked', 'checked');
    $('#bc_carbs').val('');
    $('#bc_quickpick').val(-1);
    $('#bc_preBolus').val(0);
    $('#bc_notes').val('');
    $('#bc_enteredBy').val(Storages.localStorage.get('enteredBy') || '');
    $('#bc_nowtime').prop('checked', true);
    $('#bc_othercorrection').val(0);
    $('#bc_profile').val(client.profilefunctions.activeProfileToTime());
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    setDateAndTime();
    // @ts-expect-error TS(2339): Property 'eventTimeTypeChange' does not exist on t... Remove this comment to see the full error message
    boluscalc.eventTimeTypeChange();
    // @ts-expect-error TS(2339): Property 'updateVisualisations' does not exist on ... Remove this comment to see the full error message
    boluscalc.updateVisualisations(client.sbx);
    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    boluscalc.calculateInsulin();
  };

  // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
  boluscalc.calculateInsulin = function calculateInsulin (event: any) {
    maybePrevent(event);
    // @ts-expect-error TS(2339): Property 'gatherBoluscalcData' does not exist on t... Remove this comment to see the full error message
    boluscalc.gatherBoluscalcData();
    // @ts-expect-error TS(2339): Property 'updateGui' does not exist on type '{}'.
    boluscalc.updateGui(boluscalc.record);
    // @ts-expect-error TS(2339): Property 'record' does not exist on type '{}'.
    return boluscalc.record;
  };

  // @ts-expect-error TS(2339): Property 'updateGui' does not exist on type '{}'.
  boluscalc.updateGui = function updateGui (record: any) {
    // @ts-expect-error TS(2339): Property 'record' does not exist on type '{}'.
    record = record || boluscalc.record;

    if (record.eventTime === undefined) {
      return;
    }

    var targetBGLow = record.targetBGLow;
    var targetBGHigh = record.targetBGHigh;
    var isf = record.isf;
    var ic = record.ic;

    // Clear results before calculation
    $('#bc_insulintotal').text('0.00');
    $('#bc_carbsneeded').text('0.00');
    $('#bc_inzulinbg').text('0.00');
    $('#bc_inzulincarbs').text('0.00');

    // Show IOB
    if ($('#bc_useiob').is(':checked')) {
      $('#bc_iob').text((record.iob > 0 ? '-' : '') + record.iob.toFixed(2));
    } else {
      $('#bc_iob').text('');
    }

    // Show COB
    if ($('#bc_usecob').is(':checked')) {
      $('#bc_cob').text(record.cob.toFixed(2));
      $('#bc_cobu').text(record.insulincob.toFixed(2));
    } else {
      $('#bc_cob').text('');
      $('#bc_cobu').text('');
    }

    // Show BG
    if ($('#bc_usebg').is(':checked')) {
      // @ts-expect-error TS(2339): Property 'oldbg' does not exist on type '{}'.
      if (record.bg === 0 || (boluscalc.oldbg && $('#bc_bgfromsensor').is(':checked'))) {
        $('#bc_bg').css('background-color', 'red');
      } else {
        $('#bc_bg').css('background-color', '');
      }
      $('#bc_inzulinbg').text(record.insulinbg.toFixed(2));
      $('#bc_inzulinbg').attr('title'
        , 'Target BG range: ' + targetBGLow + ' - ' + targetBGHigh +
        '\nISF: ' + isf +
        '\nBG diff: ' + record.bgdiff.toFixed(1)
      );
    } else {
      $('#bc_inzulinbgtd').css('background-color', '');
      $('#bc_bg').css('background-color', '');
      $('#bc_inzulinbg').text('');
      $('#bc_inzulinbg').attr('title', '');
    }

    // Show foods
    if (record.foods.length) {
      var html = '<table  style="float:right;margin-right:20px;font-size:12px">';
      var carbs = 0;
      for (var fi = 0; fi < record.foods.length; fi++) {
        /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
        var f = record.foods[fi];
        carbs += f.carbs * f.portions;
        html += '<tr>';
        html += '<td>';
        if ($('#bc_quickpick').val() < 0) { // do not allow deleting while quickpick active
          html += '<img style="cursor:pointer" title="Delete record" src="' + icon_remove + '" href="#" class="deleteFoodRecord" index="' + fi + '">';
        }
        html += '</td>';
        html += '<td>' + f.name + '</td>';
        html += '<td>' + (f.portion * f.portions).toFixed(1) + ' ' + translate(f.unit) + '</td>';
        html += '<td>(' + (f.carbs * f.portions).toFixed(1) + ' g)</td>';
        html += '</tr>';
      }
      html += '</table>';
      $('#bc_food').html(html);
      $('.deleteFoodRecord').click(deleteFoodRecord);
      $('#bc_carbs').val(carbs.toFixed(0));
      $('#bc_carbs').attr('disabled', true);
      $('#bc_gi').css('display', 'none');
      $('#bc_gicalculated').css('display', '');
      $('#bc_gicalculated').text(record.gi);
    } else {
      $('#bc_food').html('');
      $('#bc_carbs').attr('disabled', false);
      $('#bc_gi').css('display', '');
      $('#bc_gicalculated').css('display', 'none');
      $('#bc_gicalculated').text('');
    }

    // Show Carbs
    if ($('#bc_usecarbs').is(':checked')) {
      if ($('#bc_carbs').val() === '') {
        $('#bc_carbs').css('background-color', '');
      } else if (isNaN(parseInt($('#bc_carbs').val().replace(',', '.')))) {
        $('#bc_carbs').css('background-color', 'red');
      } else {
        $('#bc_carbs').css('background-color', '');
      }
      $('#bc_inzulincarbs').text(record.insulincarbs.toFixed(2));
      $('#bc_inzulincarbs').attr('title', 'IC: ' + ic);
    } else {
      $('#bc_carbs').css('background-color', '');
      $('#bc_inzulincarbs').text('');
      $('#bc_inzulincarbs').attr('title', '');
      $('#bc_carbs').text('');
    }

    // Show Total
    $('#bc_rouding').text(record.roundingcorrection.toFixed(2));
    $('#bc_insulintotal').text(record.insulin.toFixed(2));

    // Carbs needed if too much iob or in range message when nothing entered and in range
    var outcome = record.bg - record.iob * isf;
    if (record.othercorrection === 0 && record.carbs === 0 && record.cob === 0 && record.bg > 0 && outcome > targetBGLow && outcome < targetBGHigh) {
      $('#bc_carbsneeded').text('');
      $('#bc_insulinover').text('');
      $('#bc_carbsneededtr').css('display', 'none');
      $('#bc_insulinneededtr').css('display', 'none');
      $('#bc_calculationintarget').css('display', '');
    } else if (record.insulin < 0) {
      $('#bc_carbsneeded').text(record.carbsneeded + ' g');
      $('#bc_insulinover').text(record.insulin.toFixed(2));
      $('#bc_carbsneededtr').css('display', '');
      $('#bc_insulinneededtr').css('display', 'none');
      $('#bc_calculationintarget').css('display', 'none');
    } else {
      $('#bc_carbsneeded').text('');
      $('#bc_insulinover').text('');
      $('#bc_carbsneededtr').css('display', 'none');
      $('#bc_insulinneededtr').css('display', '');
      $('#bc_calculationintarget').css('display', 'none');
    }

    // Show basal rate
    var basal = client.sbx.data.profile.getTempBasal(record.eventTime);
    var tempMark = '';
    tempMark += basal.treatment ? 'T' : '';
    tempMark += basal.combobolustreatment ? 'C' : '';
    tempMark += tempMark ? ': ' : '';
    $('#bc_basal').text(tempMark + basal.totalbasal.toFixed(3));
  };

  // @ts-expect-error TS(2339): Property 'gatherBoluscalcData' does not exist on t... Remove this comment to see the full error message
  boluscalc.gatherBoluscalcData = function gatherBoluscalcData () {
    // @ts-expect-error TS(2339): Property 'record' does not exist on type '{}'.
    boluscalc.record = {};
    // @ts-expect-error TS(2339): Property 'record' does not exist on type '{}'.
    var record = boluscalc.record;

    if (!client.sbx) {
      console.log('No sandbox data yet. Exiting gatherBoluscalcData()');
      return;
    }

    record.profile = $('#bc_profile').val();
    if (!record.profile) {
      delete record.profile;
      console.log('No profile data. Exiting gatherBoluscalcData()');
      return;
    }

    // Calculate event time from date & time
    record.eventTime = new Date();
    if ($('#bc_othertime').is(':checked')) {
      record.eventTime = mergeDateAndTime().toDate();
    }

    // Load profile
    var targetBGLow = client.sbx.data.profile.getLowBGTarget(record.eventTime, record.profile);
    targetBGLow = targetBGLow || 0;
    var targetBGHigh = client.sbx.data.profile.getHighBGTarget(record.eventTime, record.profile);
    targetBGHigh = targetBGHigh || 0;
    var isf = client.sbx.data.profile.getSensitivity(record.eventTime, record.profile);
    isf = isf || 0;
    var ic = client.sbx.data.profile.getCarbRatio(record.eventTime, record.profile);
    ic = ic || 0;
    record.targetBGLow = targetBGLow;
    record.targetBGHigh = targetBGHigh;
    record.isf = isf;
    record.ic = ic;

    if (targetBGLow === 0 || targetBGHigh === 0 || isf === 0 || ic === 0) {
      $('#bc_inzulinbgtd').css('background-color', 'red');
      // @ts-expect-error TS(2339): Property 'record' does not exist on type '{}'.
      boluscalc.record = {};
      return;
    } else {
      $('#bc_inzulinbgtd').css('background-color', '');
    }

    if (ic === 0) {
      $('#bc_inzulincarbstd').css('background-color', 'red');
      // @ts-expect-error TS(2339): Property 'record' does not exist on type '{}'.
      boluscalc.record = {};
      return;
    } else {
      $('#bc_inzulincarbstd').css('background-color', '');
    }

    // Load IOB
    record.iob = 0;
    if ($('#bc_useiob').is(':checked')) {
      record.iob = roundTo(iob.calcTotal(client.sbx.data.treatments, client.sbx.data.devicestatus, client.sbx.data.profile, record.eventTime, record.profile).iob, 0.01);
    }

    // Load COB
    record.cob = 0;
    record.insulincob = 0;
    if ($('#bc_usecob').is(':checked')) {
      record.cob = roundTo(cob.cobTotal(client.sbx.data.treatments, client.sbx.data.devicestatus, client.sbx.data.profile, record.eventTime, record.profile).cob, 0.01);
      record.insulincob = roundTo(record.cob / ic, 0.01);
    }

    // Load BG
    record.bg = 0;
    record.insulinbg = 0;
    record.bgdiff = 0;
    if ($('#bc_usebg').is(':checked')) {
      record.bg = parseFloat($('#bc_bg').val().replace(',', '.'));
      if (isNaN(record.bg)) {
        record.bg = 0;
      }
      if (record.bg <= targetBGLow) {
        record.bgdiff = record.bg - targetBGLow;
      } else if (record.bg >= targetBGHigh) {
        record.bgdiff = record.bg - targetBGHigh;
      }
      record.bgdiff = roundTo(record.bgdiff, 0.1);
      if (record.bg !== 0) {
        record.insulinbg = roundTo(record.bgdiff / isf, 0.01);
      }
    }

    // Load foods
    record.carbs = 0;
    record.foods = _.cloneDeep(foods);
    if (record.foods.length) {
      var gisum = 0;
      for (var fi = 0; fi < record.foods.length; fi++) {
        /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
        var f = record.foods[fi];
        record.carbs += f.carbs * f.portions;
        gisum += f.carbs * f.portions * f.gi;
      }
      record.gi = (gisum / record.carbs).toFixed(2);
    } else {
      record.gi = $('#bc_gi').val();
    }

    // Load Carbs
    record.insulincarbs = 0;
    if ($('#bc_usecarbs').is(':checked')) {
      if (record.carbs === 0) { // not set from foods
        record.carbs = parseInt($('#bc_carbs').val().replace(',', '.'));
      }
      if (isNaN(record.carbs)) {
        record.carbs = 0;
      }
      record.insulincarbs = roundTo(record.carbs / ic, 0.01);
    }

    // Corrections
    record.othercorrection = parseFloat($('#bc_othercorrection').val());

    // Total & rounding
    var total = 0;
    if ($('#bc_useinsulin').is(':checked')) {
      total = record.insulinbg + record.insulincarbs + record.insulincob - record.iob + record.othercorrection;
    }
    record.insulin = roundTo(total, 0.05);
    record.roundingcorrection = record.insulin - total;

    // Carbs needed if too much iob
    record.carbsneeded = 0;
    if (record.insulin < 0) {
      record.carbsneeded = Math.ceil(-total * ic);
    }

    console.log('Insulin calculation result: ', record);
    return record;
  };

  function gatherData () {
    var data = {};
    // @ts-expect-error TS(2339): Property 'boluscalc' does not exist on type '{}'.
    data.boluscalc = boluscalc.calculateInsulin();
    // @ts-expect-error TS(2339): Property 'boluscalc' does not exist on type '{}'.
    if (!data.boluscalc) {
      alert('Calculation not completed!');
      return null;
    }

    // @ts-expect-error TS(2339): Property 'enteredBy' does not exist on type '{}'.
    data.enteredBy = $('#bc_enteredBy').val();
    // @ts-expect-error TS(2339): Property 'eventType' does not exist on type '{}'.
    data.eventType = 'Bolus Wizard';
    if ($('#bc_bg').val() !== 0) {
      // @ts-expect-error TS(2339): Property 'glucose' does not exist on type '{}'.
      data.glucose = $('#bc_bg').val().replace(',', '.');
      // @ts-expect-error TS(2339): Property 'glucoseType' does not exist on type '{}'... Remove this comment to see the full error message
      data.glucoseType = $('#boluscalc-form').find('input[name=bc_bginput]:checked').val();
      // @ts-expect-error TS(2339): Property 'units' does not exist on type '{}'.
      data.units = client.settings.units;
    }
    // @ts-expect-error TS(2339): Property 'carbs' does not exist on type '{}'.
    data.carbs = $('#bc_carbs').val().replace(',', '.');
    // @ts-expect-error TS(2339): Property 'insulin' does not exist on type '{}'.
    data.insulin = $('#bc_insulintotal').text();
    // @ts-expect-error TS(2339): Property 'insulin' does not exist on type '{}'.
    if (data.insulin <= 0) {
      // @ts-expect-error TS(2339): Property 'insulin' does not exist on type '{}'.
      delete data.insulin;
    }
    // @ts-expect-error TS(2339): Property 'preBolus' does not exist on type '{}'.
    data.preBolus = parseInt($('#bc_preBolus').val());
    // @ts-expect-error TS(2339): Property 'notes' does not exist on type '{}'.
    data.notes = $('#bc_notes').val();

    if ($('#bc_othertime').is(':checked')) {
      // @ts-expect-error TS(2339): Property 'eventTime' does not exist on type '{}'.
      data.eventTime = mergeDateAndTime().toDate();
    }

    // replace boluscalc.eventTime by ISO string
    // @ts-expect-error TS(2339): Property 'boluscalc' does not exist on type '{}'.
    data.boluscalc.eventTime = data.boluscalc.eventTime.toISOString();

    return data;
  }

  // @ts-expect-error TS(2339): Property 'submit' does not exist on type '{}'.
  boluscalc.submit = function submit (event: any) {
    var data = gatherData();
    if (data) {
      confirmPost(data);
    }
    maybePrevent(event);
    return false;
  };

  function buildConfirmText (data: any) {
    var text = [
      translate('Please verify that the data entered is correct') + ': '
      
      , translate('Event Type') + ': ' + translate(data.eventType)
    ];

    function pushIf (check: any, valueText: any) {
      if (check) {
        text.push(valueText);
      }
    }

    pushIf(data.glucose, translate('Blood Glucose') + ': ' + data.glucose);
    pushIf(data.glucose, translate('Measurement Method') + ': ' + translate(data.glucoseType));

    pushIf(data.carbs, translate('Carbs Given') + ': ' + data.carbs);
    pushIf(data.insulin, translate('Insulin Given') + ': ' + data.insulin);
    pushIf(data.boluscalc.othercorrection, translate('Other correction') + ': ' + data.boluscalc.othercorrection);
    pushIf(data.preBolus, translate('Carb Time') + ': ' + data.preBolus + ' ' + translate('mins'));
    pushIf(data.notes, translate('Notes') + ': ' + data.notes);
    pushIf(data.enteredBy, translate('Entered By') + ': ' + data.enteredBy);

    text.push(translate('Event Time') + ': ' + (data.eventTime ? data.eventTime.toLocaleString() : new Date().toLocaleString()));
    return text.join('\n');
  }

  function confirmPost (data: any) {
    if (window.confirm(buildConfirmText(data))) {
      $.ajax({
        method: 'POST'
        , url: '/api/v1/treatments/'
        , headers: client.headers()
        , data: data
      }).done(function treatmentSaved (response: any) {
        console.info('treatment saved', response);
      }).fail(function treatmentSaveFail (response: any) {
        console.info('treatment saved', response);
        alert(translate('Entering record failed') + '. ' + translate('Status') + ': ' + response.status);
      });

      storage.set('enteredBy', data.enteredBy);

      quickpickHideFood();
      client.browserUtils.closeDrawer('#boluscalcDrawer');
    }
  }

  // Food manipulation
  function deleteFoodRecord(this: any, event: any) {
    var index = $(this).attr('index');
    foods.splice(index, 1);
    $('#bc_carbs').val('');
    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    boluscalc.calculateInsulin();
    maybePrevent(event);
    return false;
  }

  function quickpickChange (event: any) {
    var qpiselected = $('#bc_quickpick').val();

    if (qpiselected === null || qpiselected === '-1') { // (none)
      $('#bc_carbs').val(0);
      foods = [];
      $('#bc_addfoodarea').css('display', '');
    } else {
      var qp = quickpicks[parseInt(qpiselected)];
      foods = _.cloneDeep(qp.foods);
      $('#bc_addfoodarea').css('display', 'none');
    }

    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    boluscalc.calculateInsulin();
    maybePrevent(event);
  }

  function quickpickHideFood () {
    var qpiselected = $('#bc_quickpick').val();

    if (qpiselected >= 0) {
      var qp = quickpicks[parseInt(qpiselected)];
      if (qp.hideafteruse) {
        qp.hidden = true;

        $.ajax({
          method: 'PUT'
          , url: '/api/v1/food/'
          , headers: client.headers()
          , data: qp
        }).done(function treatmentSaved (response: any) {
          console.info('quick pick saved', response);
        }).fail(function treatmentSaveFail (response: any) {
          console.info('quick pick failed to save', response);
        });
      }
    }

    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    boluscalc.calculateInsulin();
    maybePrevent(event);
  }

  var categories: any = [];
  var foodlist: any = [];
  var databaseloaded = false;
  var filter = {
    category: ''
    , subcategory: ''
    , name: ''
  };

  // @ts-expect-error TS(2339): Property 'loadFoodDatabase' does not exist on type... Remove this comment to see the full error message
  boluscalc.loadFoodDatabase = function loadFoodDatabase (event: any, callback: any) {
    categories = [];
    foodlist = [];
    var records = client.sbx.data.food || [];
    records.forEach(function(r: any) {
      if (r.type == 'food') {
        foodlist.push(r);
        if (r.category && !categories[r.category]) {
          categories[r.category] = {};
        }
        if (r.category && r.subcategory) {
          categories[r.category][r.subcategory] = true;
        }
      }
    });
    databaseloaded = true;
    console.log('Food database loaded');
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    fillForm();
    maybePrevent(event);
    if (callback) { callback(); }
  };

  // @ts-expect-error TS(2339): Property 'loadFoodQuickpicks' does not exist on ty... Remove this comment to see the full error message
  boluscalc.loadFoodQuickpicks = function loadFoodQuickpicks () {
    // Load quickpicks
    quickpicks = [];
    var records = client.sbx.data.food || [];
    records.forEach(function(r: any) {
      if (r.type == 'quickpick') {
        quickpicks.push(r);
      }
    });
    $('#bc_quickpick').empty().append('<option value="-1">' + translate('(none)') + '</option>');
    for (var i = 0; i < records.length; i++) {
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      var r = records[i];
      $('#bc_quickpick').append('<option value="' + i + '">' + r.name + ' (' + r.carbs + ' g)</option>');
    }
    $('#bc_quickpick').val(-1);
    $('#bc_quickpick').change(quickpickChange);
  };

  function fillForm (event: any) {
    $('#bc_filter_category').empty().append('<option value="">' + translate('(none)') + '</option>');
    Object.keys(categories).forEach(function eachCategory (s) {
      $('#bc_filter_category').append('<option value="' + s + '">' + s + '</option>');
    });
    filter.category = '';
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    fillSubcategories();

    $('#bc_filter_category').change(fillSubcategories);
    $('#bc_filter_subcategory').change(doFilter);
    $('#bc_filter_name').on('input', doFilter);

    maybePrevent(event);
    return false;
  }

  function fillSubcategories (event: any) {
    maybePrevent(event);
    filter.category = $('#bc_filter_category').val();
    filter.subcategory = '';
    $('#bc_filter_subcategory').empty().append('<option value="">' + translate('(none)') + '</option>');
    if (filter.category !== '') {
      Object.keys(categories[filter.category]).forEach(function eachSubcategory (s) {
        $('#bc_filter_subcategory').append('<option value="' + s + '">' + s + '</option>');
      });
    }
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    doFilter();
  }

  function doFilter (event: any) {
    if (event) {
      filter.category = $('#bc_filter_category').val();
      filter.subcategory = $('#bc_filter_subcategory').val();
      filter.name = $('#bc_filter_name').val();
    }
    $('#bc_data').empty();
    for (var i = 0; i < foodlist.length; i++) {
      /* eslint-disable security/detect-object-injection */ // verified false positive
      if (filter.category !== '' && foodlist[i].category !== filter.category) { continue; }
      if (filter.subcategory !== '' && foodlist[i].subcategory !== filter.subcategory) { continue; }
      if (filter.name !== '' && foodlist[i].name.toLowerCase().indexOf(filter.name.toLowerCase()) < 0) { continue; }
      var o = '';
      o += foodlist[i].name + ' | ';
      o += 'Portion: ' + foodlist[i].portion + ' ';
      o += foodlist[i].unit + ' | ';
      o += 'Carbs: ' + foodlist[i].carbs + ' g';
      $('#bc_data').append('<option value="' + i + '">' + o + '</option>');
      /* eslint-enable security/detect-object-injection */ // verified false positive
    }
    $('#bc_addportions').val('1');

    maybePrevent(event);
  }

  function addFoodFromDatabase (event: any) {
    if (!databaseloaded) {
      // @ts-expect-error TS(2339): Property 'loadFoodDatabase' does not exist on type... Remove this comment to see the full error message
      boluscalc.loadFoodDatabase(event, addFoodFromDatabase);
      return;
    }

    $('#bc_addportions').val('1');
    $('#bc_addfooddialog').dialog({
      width: 640
      , height: 400
      , buttons: [
        {
          text: translate('Add')
          , click: function() {
            var index = $('#bc_data').val();
            var portions = parseFloat($('#bc_addportions').val().replace(',', '.'));
            if (index !== null && !isNaN(portions) && portions > 0) {
              index = parseInt(index);
              /* eslint-disable security/detect-object-injection */ // verified false positive
              foodlist[index].portions = portions;
              foods.push(_.cloneDeep(foodlist[index]));
              /* eslint-enable security/detect-object-injection */ // verified false positive
              $(this).dialog('close');
              // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
              boluscalc.calculateInsulin();
            }
          }
        }
        , {
          text: translate('Reload database')
          , class: 'leftButton'
          // @ts-expect-error TS(2339): Property 'loadFoodDatabase' does not exist on type... Remove this comment to see the full error message
          , click: boluscalc.loadFoodDatabase
        }
        ]
      , open: function() {
        $(this).parent().css('box-shadow', '20px 20px 20px 0px black');
        $(this).parent().find('.ui-dialog-buttonset').css({ 'width': '100%', 'text-align': 'right' });
        $(this).parent().find('button:contains("' + translate('Add') + '")').css({ 'float': 'left' });
        $('#bc_filter_name').focus();
      }

    });
    maybePrevent(event);
    return false;
  }

  function findClosestSGVToPastTime (time: any) {
    var nowData = client.entries.filter(function(d: any) {
      return d.type === 'sgv' && d.mills <= time.getTime();
    });
    var focusPoint = _.last(nowData);

    if (!focusPoint || focusPoint.mills + times.mins(10).mills < time.getTime()) {
      return null;
    }
    return focusPoint;
  }

  if (isTouch()) {
    // Make it faster on mobile devices
    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    $('.insulincalculationpart').change(boluscalc.calculateInsulin);
  } else {
    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    $('.insulincalculationpart').on('input', boluscalc.calculateInsulin);
    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    $('input:checkbox.insulincalculationpart').change(boluscalc.calculateInsulin);
  }
  // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
  $('#bc_bgfrommeter').change(boluscalc.calculateInsulin);
  $('#bc_addfromdatabase').click(addFoodFromDatabase);
  $('#bc_bgfromsensor').change(function bc_bgfromsensor_click (event: any) {
    // @ts-expect-error TS(2339): Property 'updateVisualisations' does not exist on ... Remove this comment to see the full error message
    boluscalc.updateVisualisations(client.sbx);
    // @ts-expect-error TS(2339): Property 'calculateInsulin' does not exist on type... Remove this comment to see the full error message
    boluscalc.calculateInsulin();
    maybePrevent(event);
  });

  // @ts-expect-error TS(2339): Property 'toggleDrawer' does not exist on type '{}... Remove this comment to see the full error message
  $('#boluscalcDrawerToggle').click(boluscalc.toggleDrawer);
  // @ts-expect-error TS(2339): Property 'submit' does not exist on type '{}'.
  $('#boluscalcDrawer').find('button').click(boluscalc.submit);
  // @ts-expect-error TS(2339): Property 'eventTimeTypeChange' does not exist on t... Remove this comment to see the full error message
  $('#bc_eventTime input:radio').change(boluscalc.eventTimeTypeChange);

  // @ts-expect-error TS(2339): Property 'dateTimeFocus' does not exist on type '{... Remove this comment to see the full error message
  $('.bc_eventtimeinput').focus(boluscalc.dateTimeFocus).change(boluscalc.dateTimeChange);

  // @ts-expect-error TS(2339): Property 'loadFoodQuickpicks' does not exist on ty... Remove this comment to see the full error message
  boluscalc.loadFoodQuickpicks();
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
  setDateAndTime();

  return boluscalc;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
