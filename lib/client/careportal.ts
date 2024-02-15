'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var parse_duration = require('parse-duration'); // https://www.npmjs.com/package/parse-duration
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('../times');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'consts'.
var consts = require('../constants');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var Storages = require('js-storage');

function init (client: any, $: any) {
  var careportal = {};

  var translate = client.translate;
  var storage = Storages.localStorage;
  var units = client.settings.units;

  var eventTime = $('#eventTimeValue');
  var eventDate = $('#eventDateValue');

  function setDateAndTime (time: any) {
    time = time || client.ctx.moment();
    eventTime.val(time.hours() + ":" + time.minutes());
    eventDate.val(time.toISOString().split('T')[0]);
  }

  function mergeDateAndTime () {
    return client.utils.mergeInputTime(eventTime.val(), eventDate.val());
  }

  function updateTime (ele: any, time: any) {
    ele.attr('oldminutes', time.minutes());
    ele.attr('oldhours', time.hours());
  }

  function maybePrevent (event: any) {
    if (event) {
      event.preventDefault();
    }
  }

  var inputMatrix = {};
  var submitHooks = {};

  function refreshEventTypes() {
    // @ts-expect-error TS(2339) FIXME: Property 'allEventTypes' does not exist on type '{... Remove this comment to see the full error message
    careportal.allEventTypes = client.plugins.getAllEventTypes(client.sbx);

    // @ts-expect-error TS(2339) FIXME: Property 'events' does not exist on type '{}'.
    careportal.events = _.map(careportal.allEventTypes, function each (event: any) {
      return _.pick(event, ['val', 'name']);
    });

    inputMatrix = {};
    submitHooks = {};

    // @ts-expect-error TS(2339) FIXME: Property 'allEventTypes' does not exist on type '{... Remove this comment to see the full error message
    _.forEach(careportal.allEventTypes, function each (event: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      inputMatrix[event.val] = _.pick(event, ['otp','remoteCarbs', 'remoteAbsorption', 'remoteBolus', 'bg', 'insulin', 'carbs', 'protein', 'fat', 'prebolus', 'duration', 'percent', 'absolute', 'profile', 'split', 'sensor', 'reasons', 'targets']);
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      submitHooks[event.val] = event.submitHook;
    });
  }

  refreshEventTypes();

  // @ts-expect-error TS(2339) FIXME: Property 'filterInputs' does not exist on type '{}... Remove this comment to see the full error message
  careportal.filterInputs = function filterInputs (event: any) {
    var eventType = $('#eventType').val();

    function displayType (enabled: any) {
      if (enabled) {
        return '';
      } else {
        return 'none';
      }
    }

    function resetIfHidden (visible: any, id: any) {
      if (!visible) {
        $(id).val('');
      }
    }

    // validate the eventType input - should never hit this but bail if we do
    if (!Object.prototype.hasOwnProperty.call(inputMatrix, eventType)) {
      maybePrevent(event);
      return;
    }

    /* eslint-disable security/detect-object-injection */ // verified false positive by check above
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var reasons = inputMatrix[eventType]['reasons'];
    $('#reasonLabel').css('display', displayType(reasons && reasons.length > 0));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#targets').css('display', displayType(inputMatrix[eventType]['targets']));

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#otpLabel').css('display', displayType(inputMatrix[eventType]['otp']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#remoteCarbsLabel').css('display', displayType(inputMatrix[eventType]['remoteCarbs']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#remoteAbsorptionLabel').css('display', displayType(inputMatrix[eventType]['remoteAbsorption']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#remoteBolusLabel').css('display', displayType(inputMatrix[eventType]['remoteBolus']));

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#bg').css('display', displayType(inputMatrix[eventType]['bg']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#insulinGivenLabel').css('display', displayType(inputMatrix[eventType]['insulin']));

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#carbsGivenLabel').css('display', displayType(inputMatrix[eventType]['carbs']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#proteinGivenLabel').css('display', displayType(inputMatrix[eventType]['protein']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#fatGivenLabel').css('display', displayType(inputMatrix[eventType]['fat']));

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#sensorInfo').css('display', displayType(inputMatrix[eventType]['sensor']));

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#durationLabel').css('display', displayType(inputMatrix[eventType]['duration']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#percentLabel').css('display', displayType(inputMatrix[eventType]['percent'] && $('#absolute').val() === ''));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#absoluteLabel').css('display', displayType(inputMatrix[eventType]['absolute'] && $('#percent').val() === ''));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#profileLabel').css('display', displayType(inputMatrix[eventType]['profile']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#preBolusLabel').css('display', displayType(inputMatrix[eventType]['prebolus']));
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    $('#insulinSplitLabel').css('display', displayType(inputMatrix[eventType]['split']));

    $('#reason').empty();
    _.each(reasons, function eachReason (reason: any) {
      $('#reason').append('<option value="' + reason.name + '">' + translate(reason.displayName || reason.name) + '</option>');
    });

    // @ts-expect-error TS(2339) FIXME: Property 'reasonable' does not exist on type '{}'.
    careportal.reasonable();

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['otp'], '#otp');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['remoteCarbs'], '#remoteCarbs');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['remoteAbsorption'], '#remoteAbsorption');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['remoteBolus'], '#remoteBolus');

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['insulin'], '#insulinGiven');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['carbs'], '#carbsGiven');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['protein'], '#proteinGiven');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['fat'], '#fatGiven');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['sensor'], '#sensorCode');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['sensor'], '#transmitterId');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['duration'], '#duration');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['absolute'], '#absolute');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['percent'], '#percent');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['prebolus'], '#preBolus');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['split'], '#insulinSplitNow');
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    resetIfHidden(inputMatrix[eventType]['split'], '#insulinSplitExt');
    /* eslint-enable security/detect-object-injection */ // verified false positive

    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'reasonable' does not exist on type '{}'.
  careportal.reasonable = function reasonable () {
    var eventType = $('#eventType').val();
    var reasons = [];

    // validate the eventType input before getting the reasons list
    if (Object.prototype.hasOwnProperty.call(inputMatrix, eventType)) {
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      reasons = inputMatrix[eventType]['reasons'];
    }
    var selected = $('#reason').val();

    var reason = _.find(reasons, function matches (r: any) {
      return r.name === selected;
    });

    if (reason && reason.targetTop) {
      $('#targetTop').val(reason.targetTop);
    } else {
      $('#targetTop').val('');
    }

    if (reason && reason.targetBottom) {
      $('#targetBottom').val(reason.targetBottom);
    } else {
      $('#targetBottom').val('');
    }

    if (reason) {
      if (reason.duration) {
        $('#duration').val(reason.duration);
      } else {
        $('#duration').val('');
      }
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'prepareEvents' does not exist on type '{... Remove this comment to see the full error message
  careportal.prepareEvents = function prepareEvents () {
    $('#eventType').empty();
    // @ts-expect-error TS(2339) FIXME: Property 'events' does not exist on type '{}'.
    _.each(careportal.events, function eachEvent (event: any) {
      $('#eventType').append('<option value="' + event.val + '">' + translate(event.name) + '</option>');
    });
    // @ts-expect-error TS(2339) FIXME: Property 'filterInputs' does not exist on type '{}... Remove this comment to see the full error message
    $('#eventType').change(careportal.filterInputs);
    // @ts-expect-error TS(2339) FIXME: Property 'reasonable' does not exist on type '{}'.
    $('#reason').change(careportal.reasonable);
    // @ts-expect-error TS(2339) FIXME: Property 'filterInputs' does not exist on type '{}... Remove this comment to see the full error message
    $('#percent').on('input', careportal.filterInputs);
    // @ts-expect-error TS(2339) FIXME: Property 'filterInputs' does not exist on type '{}... Remove this comment to see the full error message
    $('#absolute').on('input', careportal.filterInputs);
    // @ts-expect-error TS(2339) FIXME: Property 'adjustSplit' does not exist on type '{}'... Remove this comment to see the full error message
    $('#insulinSplitNow').on('input', careportal.adjustSplit);
    // @ts-expect-error TS(2339) FIXME: Property 'adjustSplit' does not exist on type '{}'... Remove this comment to see the full error message
    $('#insulinSplitExt').on('input', careportal.adjustSplit);
    // @ts-expect-error TS(2339) FIXME: Property 'filterInputs' does not exist on type '{}... Remove this comment to see the full error message
    careportal.filterInputs();
    // @ts-expect-error TS(2339) FIXME: Property 'adjustSplit' does not exist on type '{}'... Remove this comment to see the full error message
    careportal.adjustSplit();
  };

  // @ts-expect-error TS(2339) FIXME: Property 'adjustSplit' does not exist on type '{}'... Remove this comment to see the full error message
  careportal.adjustSplit = function adjustSplit (event: any) {
    if ($(this).attr('id') === 'insulinSplitNow') {
      var nowval = parseInt($('#insulinSplitNow').val()) || 0;
      $('#insulinSplitExt').val(100 - nowval);
      $('#insulinSplitNow').val(nowval);
    } else {
      var extval = parseInt($('#insulinSplitExt').val()) || 0;
      $('#insulinSplitNow').val(100 - extval);
      $('#insulinSplitExt').val(extval);
    }

    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'resolveEventName' does not exist on type... Remove this comment to see the full error message
  careportal.resolveEventName = function resolveEventName (value: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'events' does not exist on type '{}'.
    _.each(careportal.events, function eachEvent (e: any) {
      if (e.val === value) {
        value = e.name;
      }
    });
    return value;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'prepare' does not exist on type '{}'.
  careportal.prepare = function prepare () {
    refreshEventTypes();

    $('#profile').empty();
    client.profilefunctions.listBasalProfiles().forEach(function(p: any) {
      $('#profile').append('<option val="' + p + '">' + p + '</option>');
    });
    // @ts-expect-error TS(2339) FIXME: Property 'prepareEvents' does not exist on type '{... Remove this comment to see the full error message
    careportal.prepareEvents();
    $('#eventType').val('<none>');
    $('#glucoseValue').val('').attr('placeholder', translate('Value in') + ' ' + client.settings.units);
    $('#meter').prop('checked', true);

    $('#otp').val('');
    $('#remoteCarbs').val('');
    $('#remoteAbsorption').val('');
    $('#remoteBolus').val('');

    $('#carbsGiven').val('');
    $('#proteinGiven').val('');
    $('#fatGiven').val('');
    $('#sensorCode').val('');
    $('#transmitterId').val('');
    $('#insulinGiven').val('');
    $('#duration').val('');
    $('#percent').val('');
    $('#absolute').val('');
    $('#profile').val(client.profilefunctions.activeProfileToTime());
    $('#preBolus').val(0);
    $('#notes').val('');
    $('#enteredBy').val(client.authorized ? client.authorized.sub : storage.get('enteredBy') || '');
    $('#nowtime').prop('checked', true);
    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    setDateAndTime();
  };

  function gatherData () {
    var eventType = $('#eventType').val();
    var selectedReason = $('#reason').val();

    var data = {
      enteredBy: $('#enteredBy').val()
      , eventType: eventType
      , otp: $('#otp').val()
      , remoteCarbs: $('#remoteCarbs').val()
      , remoteAbsorption: $('#remoteAbsorption').val()
      , remoteBolus: $('#remoteBolus').val()
      , glucose: $('#glucoseValue').val().replace(',', '.')
      , reason: selectedReason
      , targetTop: $('#targetTop').val().replace(',', '.')
      , targetBottom: $('#targetBottom').val().replace(',', '.')
      , glucoseType: $('#treatment-form').find('input[name=glucoseType]:checked').val()
      , carbs: $('#carbsGiven').val()
      , protein: $('#proteinGiven').val()
      , fat: $('#fatGiven').val()
      , sensorCode: $('#sensorCode').val()
      , transmitterId: $('#transmitterId').val()
      , insulin: $('#insulinGiven').val()
      , duration: times.msecs(parse_duration($('#duration').val())).mins < 1 ? $('#duration').val() : times.msecs(parse_duration($('#duration').val())).mins
      , percent: $('#percent').val()
      , profile: $('#profile').val()
      , preBolus: $('#preBolus').val()
      , notes: $('#notes').val()
      , units: client.settings.units
    };

    data.preBolus = parseInt(data.preBolus);

    if (isNaN(data.preBolus)) {
      delete data.preBolus;
    }

    var reasons = [];

    // validate the eventType input before getting the reasons list
    if (Object.prototype.hasOwnProperty.call(inputMatrix, eventType)) {
      /* eslint-disable-next-line security/detect-object-injection */ // verified false positive
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      reasons = inputMatrix[eventType]['reasons'];
    }
    var reason = _.find(reasons, function matches (r: any) {
      return r.name === selectedReason;
    });

    if (reason) {
      // @ts-expect-error TS(2339) FIXME: Property 'reasonDisplay' does not exist on type '{... Remove this comment to see the full error message
      data.reasonDisplay = reason.displayName;
    }

    if (units == "mmol") {
      data.targetTop = data.targetTop * consts.MMOL_TO_MGDL;
      data.targetBottom = data.targetBottom * consts.MMOL_TO_MGDL;
    }

    //special handling for absolute to support temp to 0
    var absolute = $('#absolute').val();
    if ('' !== absolute && !isNaN(absolute)) {
      // @ts-expect-error TS(2339) FIXME: Property 'absolute' does not exist on type '{ ente... Remove this comment to see the full error message
      data.absolute = Number(absolute);
    }

    if ($('#othertime').is(':checked')) {
      // @ts-expect-error TS(2339) FIXME: Property 'eventTime' does not exist on type '{ ent... Remove this comment to see the full error message
      data.eventTime = mergeDateAndTime().toDate();
    }

    // @ts-expect-error TS(2339) FIXME: Property 'created_at' does not exist on type '{ en... Remove this comment to see the full error message
    data.created_at = data.eventTime ? data.eventTime.toISOString() : new Date().toISOString();

    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (!inputMatrix[data.eventType].profile) {
      delete data.profile;
    }

    if (data.eventType.indexOf('Temp Basal') > -1) {
      data.eventType = 'Temp Basal';
    }

    if (data.eventType.indexOf('Temporary Target Cancel') > -1) {
      data.duration = 0;
      data.eventType = 'Temporary Target';
      data.targetBottom = "";
      data.targetTop = "";
    }

    if (data.eventType.indexOf('Combo Bolus') > -1) {
      // @ts-expect-error TS(2339) FIXME: Property 'splitNow' does not exist on type '{ ente... Remove this comment to see the full error message
      data.splitNow = parseInt($('#insulinSplitNow').val()) || 0;
      // @ts-expect-error TS(2339) FIXME: Property 'splitExt' does not exist on type '{ ente... Remove this comment to see the full error message
      data.splitExt = parseInt($('#insulinSplitExt').val()) || 0;
    }

    let d = {};
    Object.keys(data).forEach(function(key) {
      /* eslint-disable security/detect-object-injection */ // verified false positive
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (data[key] !== "" && data[key] !== null) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        d[key] = data[key]
      }
      /* eslint-enable security/detect-object-injection */ // verified false positive
    });

    return d;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'save' does not exist on type '{}'.
  careportal.save = function save (event: any) {
    var data = gatherData();
    confirmPost(data);
    maybePrevent(event);
  };

  function validateData (data: any) {

    let allOk = true;
    let messages = [];

    console.log('Validating careportal entry: ', data.eventType);

    if (data.duration !== 0 && data.eventType == 'Temporary Target') {
      if (isNaN(data.targetTop) || isNaN(data.targetBottom) || !data.targetBottom || !data.targetTop) {
        console.log('Bottom or Top target missing');
        allOk = false;
        messages.push("Please enter a valid value for both top and bottom target to save a Temporary Target");
      } else {

        let targetTop = parseInt(data.targetTop);
        let targetBottom = parseInt(data.targetBottom);

        let minTarget = 4 * consts.MMOL_TO_MGDL;
        let maxTarget = 18 * consts.MMOL_TO_MGDL;

        if (units == "mmol") {
          targetTop = Math.round(targetTop / consts.MMOL_TO_MGDL * 10) / 10;
          targetBottom = Math.round(targetBottom / consts.MMOL_TO_MGDL * 10) / 10;
          minTarget = Math.round(minTarget / consts.MMOL_TO_MGDL * 10) / 10;
          maxTarget = Math.round(maxTarget / consts.MMOL_TO_MGDL * 10) / 10;
        }

        if (targetTop > maxTarget) {
          allOk = false;
          messages.push("Temporary target high is too high");
        }

        if (targetBottom < minTarget) {
          allOk = false;
          messages.push("Temporary target low is too low");
        }

        if (targetTop < targetBottom || targetBottom > targetTop) {
          allOk = false;
          messages.push("The low target must be lower than the high target and high target must be higher than the low target.");
        }

      }
    }

    // TODO: add check for remote (Bolus, Carbs, Absorption)

    return {
      allOk
      , messages
    };

  }

  function buildConfirmText (data: any) {
    var text = [
      translate('Please verify that the data entered is correct') + ': '
      // @ts-expect-error TS(2339) FIXME: Property 'resolveEventName' does not exist on type... Remove this comment to see the full error message
      , translate('Event Type') + ': ' + translate(careportal.resolveEventName(data.eventType))
    ];

    function pushIf (check: any, valueText: any) {
      if (check) {
        text.push(valueText);
      }
    }

    if (data.duration === 0 && data.eventType === 'Temporary Target') {
      text[text.length - 1] += ' ' + translate('Cancel');
    }

    pushIf(data.remoteCarbs, translate('Remote Carbs') + ': ' + data.remoteCarbs);
    pushIf(data.remoteAbsorption, translate('Remote Absorption') + ': ' + data.remoteAbsorption);
    pushIf(data.remoteBolus, translate('Remote Bolus') + ': ' + data.remoteBolus);
    pushIf(data.otp, translate('One Time Pascode') + ': ' + data.otp);

    pushIf(data.glucose, translate('Blood Glucose') + ': ' + data.glucose);
    pushIf(data.glucose, translate('Measurement Method') + ': ' + translate(data.glucoseType));

    pushIf(data.reason, translate('Reason') + ': ' + data.reason);

    var targetTop = data.targetTop;
    var targetBottom = data.targetBottom;

    if (units == "mmol") {
      targetTop = Math.round(data.targetTop / consts.MMOL_TO_MGDL * 10) / 10;
      targetBottom = Math.round(data.targetBottom / consts.MMOL_TO_MGDL * 10) / 10;
    }

    pushIf(data.targetTop, translate('Target Top') + ': ' + targetTop);
    pushIf(data.targetBottom, translate('Target Bottom') + ': ' + targetBottom);

    pushIf(data.carbs, translate('Carbs Given') + ': ' + data.carbs);
    pushIf(data.protein, translate('Protein Given') + ': ' + data.protein);
    pushIf(data.fat, translate('Fat Given') + ': ' + data.fat);
    pushIf(data.sensorCode, translate('Sensor Code') + ': ' + data.sensorCode);
    pushIf(data.transmitterId, translate('Transmitter ID') + ': ' + data.transmitterId);
    pushIf(data.insulin, translate('Insulin Given') + ': ' + data.insulin);
    pushIf(data.eventType === 'Combo Bolus', translate('Combo Bolus') + ': ' + data.splitNow + '% : ' + data.splitExt + '%');
    pushIf(data.duration, translate('Duration') + ': ' + data.duration + ' ' + translate('mins'));
    pushIf(data.percent, translate('Percent') + ': ' + data.percent);
    pushIf('absolute' in data, translate('Basal value') + ': ' + data.absolute);
    pushIf(data.profile, translate('Profile') + ': ' + data.profile);
    pushIf(data.preBolus, translate('Carb Time') + ': ' + data.preBolus + ' ' + translate('mins'));
    pushIf(data.notes, translate('Notes') + ': ' + data.notes);
    pushIf(data.enteredBy, translate('Entered By') + ': ' + data.enteredBy);

    text.push(translate('Event Time') + ': ' + (data.eventTime ? data.eventTime.toLocaleString() : new Date().toLocaleString()));
    return text.join('\n');
  }

  function confirmPost (data: any) {

    const validation = validateData(data);

    if (!validation.allOk) {

      let messages = "";

      validation.messages.forEach(function(m) {
        messages += translate(m) + "\n";
      });

      window.alert(messages);
    } else {
      if (window.confirm(buildConfirmText(data))) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var submitHook = submitHooks[data.eventType];
        if (submitHook) {
          submitHook(client, data, function (error: any) {
            if (error) {
              console.log("submit error = ", error);
              alert(translate('Error') + ': ' + error);
            } else {
              client.browserUtils.closeDrawer('#treatmentDrawer');
            }
          });
        } else {
          postTreatment(data);
        }
      }
    }
  }

  function postTreatment (data: any) {
    if (data.eventType === 'Combo Bolus') {
      data.enteredinsulin = data.insulin;
      data.insulin = data.enteredinsulin * data.splitNow / 100;
      data.relative = data.enteredinsulin * data.splitExt / 100 / data.duration * 60;
    }

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

    client.browserUtils.closeDrawer('#treatmentDrawer');
  }

  // @ts-expect-error TS(2339) FIXME: Property 'dateTimeFocus' does not exist on type '{... Remove this comment to see the full error message
  careportal.dateTimeFocus = function dateTimeFocus (event: any) {
    $('#othertime').prop('checked', true);
    updateTime($(this), mergeDateAndTime());
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'dateTimeChange' does not exist on type '... Remove this comment to see the full error message
  careportal.dateTimeChange = function dateTimeChange (event: any) {
    $('#othertime').prop('checked', true);
    
    // Can't decipher why the following logic was in place
    // and it's now bugging out and resetting any date set manually
    // so I'm disabling this
    /*
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
    */

    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'eventTimeTypeChange' does not exist on t... Remove this comment to see the full error message
  careportal.eventTimeTypeChange = function eventTimeTypeChange (event: any) {
    if ($('#othertime').is(':checked')) {
      eventTime.focus();
    } else {
      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
      setDateAndTime();
    }
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'toggleDrawer' does not exist on type '{}... Remove this comment to see the full error message
  careportal.toggleDrawer = function toggleDrawer (event: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'prepare' does not exist on type '{}'.
    client.browserUtils.toggleDrawer('#treatmentDrawer', careportal.prepare);
    maybePrevent(event);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'toggleDrawer' does not exist on type '{}... Remove this comment to see the full error message
  $('#treatmentDrawerToggle').click(careportal.toggleDrawer);
  // @ts-expect-error TS(2339) FIXME: Property 'save' does not exist on type '{}'.
  $('#treatmentDrawer').find('button').click(careportal.save);
  // @ts-expect-error TS(2339) FIXME: Property 'eventTimeTypeChange' does not exist on t... Remove this comment to see the full error message
  $('#eventTime').find('input:radio').change(careportal.eventTimeTypeChange);

  // @ts-expect-error TS(2339) FIXME: Property 'dateTimeFocus' does not exist on type '{... Remove this comment to see the full error message
  $('.eventinput').focus(careportal.dateTimeFocus).change(careportal.dateTimeChange);

  return careportal;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
