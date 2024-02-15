
var init = function init () {
  'use strict';
  //for the tests window isn't the global object
  var $ = window.$;
  var _ = window._;
  // @ts-expect-error TS(2339) FIXME: Property 'Nightscout' does not exist on type 'Wind... Remove this comment to see the full error message
  var Nightscout = window.Nightscout;
  var client = Nightscout.client;
  var report_plugins_preinit = Nightscout.report_plugins_preinit;
  var report_plugins: any;

  client.init(function loaded () {

    var moment = client.ctx.moment;

    report_plugins = report_plugins_preinit(client.ctx);
    Nightscout.report_plugins = report_plugins;

    // init HTML code
    report_plugins.addHtmlFromPlugins(client);
    // make show() accessible outside for treatments.js
    report_plugins.show = show;

    var translate = client.translate;

    var maxInsulinValue = 0
      , maxCarbsValue = 0
      , maxDailyCarbsValue = 0;
    var maxdays = 6 * 31;
    var datastorage = {};
    var daystoshow = {};
    var sorteddaystoshow: any = [];

    var targetBGdefault = {
      'mg/dl': {
        low: client.settings.thresholds.bgTargetBottom
        , high: client.settings.thresholds.bgTargetTop
      }
      , 'mmol': {
        low: client.utils.scaleMgdl(client.settings.thresholds.bgTargetBottom)
        , high: client.utils.scaleMgdl(client.settings.thresholds.bgTargetTop)
      }
    };

    var ONE_MIN_IN_MS = 60000;

    prepareGUI();

    // ****** FOOD CODE START ******
    var food_categories: any = [];
    var food_list: any = [];

    var filter = {
      category: ''
      , subcategory: ''
      , name: ''
    };

    function fillFoodForm (event: any) {
      $('#rp_category').empty().append('<option value="">' + translate('(none)') + '</option>');
      Object.keys(food_categories).forEach(function eachCategory (s) {
        $('#rp_category').append('<option value="' + s + '">' + s + '</option>');
      });
      filter.category = '';
      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
      fillFoodSubcategories();

      $('#rp_category').change(fillFoodSubcategories);
      $('#rp_subcategory').change(doFoodFilter);
      $('#rp_name').on('input', doFoodFilter);

      return maybePrevent(event);
    }

    function fillFoodSubcategories (event: any) {
      filter.category = $('#rp_category').val();
      filter.subcategory = '';
      $('#rp_subcategory').empty().append('<option value="">' + translate('(none)') + '</option>');
      if (filter.category !== '') {
        Object.keys(food_categories[filter.category] || {}).forEach(function eachSubCategory (s) {
          $('#rp_subcategory').append('<option value="' + s + '">' + s + '</option>');
        });
      }
      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
      doFoodFilter();
      return maybePrevent(event);
    }

    function doFoodFilter (event: any) {
      if (event) {
        filter.category = $('#rp_category').val();
        filter.subcategory = $('#rp_subcategory').val();
        filter.name = $('#rp_name').val();
      }
      $('#rp_food').empty();
      for (var i = 0; i < food_list.length; i++) {
        if (filter.category !== '' && food_list[i].category !== filter.category) { continue; }
        if (filter.subcategory !== '' && food_list[i].subcategory !== filter.subcategory) { continue; }
        if (filter.name !== '' && food_list[i].name.toLowerCase().indexOf(filter.name.toLowerCase()) < 0) { continue; }
        var o = '';
        o += food_list[i].name + ' | ';
        o += translate('Portion') + ': ' + food_list[i].portion + ' ';
        o += food_list[i].unit + ' | ';
        o += translate('Carbs') + ': ' + food_list[i].carbs + ' g';
        $('#rp_food').append('<option value="' + food_list[i]._id + '">' + o + '</option>');
      }

      return maybePrevent(event);
    }

    $('#info').html('<b>' + translate('Loading food database') + ' ...</b>');
    $.ajax('/api/v1/food/regular.json', {
      headers: client.headers()
      , success: function foodLoadSuccess (records: any) {
        records.forEach(function(r: any) {
          food_list.push(r);
          if (r.category && !food_categories[r.category]) { food_categories[r.category] = {}; }
          if (r.category && r.subcategory) { food_categories[r.category][r.subcategory] = true; }
        });
        // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
        fillFoodForm();
      }
    }).done(function() {
      if (food_list.length) {
        enableFoodGUI();
      } else {
        disableFoodGUI();
      }
    }).fail(function() {
      disableFoodGUI();
    });

    function enableFoodGUI () {
      $('#info').html('');

      $('.rp_foodgui').css('display', '');
      $('#rp_food').change(function(event: any) {
        $('#rp_enablefood').prop('checked', true);
        return maybePrevent(event);
      });
    }

    function disableFoodGUI () {
      $('#info').html('');
      $('.rp_foodgui').css('display', 'none');
    }

    // ****** FOOD CODE END ******

    function prepareGUI () {
      $('.presetdates').click(function(this: any, event: any) {
        var days = $(this).attr('days');
        $('#rp_enabledate').prop('checked', true);
        return setDataRange(event, days);
      });
      $('#rp_show').click(show);
      $('#rp_notes').bind('input', function(event: any) {
        $('#rp_enablenotes').prop('checked', true);
        return maybePrevent(event);
      });
      $('#rp_eventtype').bind('input', function(event: any) {
        $('#rp_enableeventtype').prop('checked', true);
        return maybePrevent(event);
      });

      // fill careportal events
      $('#rp_eventtype').empty();
      _.each(client.careportal.events, function eachEvent (event: any) {
        $('#rp_eventtype').append('<option value="' + event.val + '">' + translate(event.name) + '</option>');
      });
      $('#rp_eventtype').append('<option value="sensor">' + '>>> ' + translate('All sensor events') + '</option>');

      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      $('#rp_targetlow').val(targetBGdefault[client.settings.units.toLowerCase()].low);
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      $('#rp_targethigh').val(targetBGdefault[client.settings.units.toLowerCase()].high);

      if (client.settings.scaleY === 'linear') {
        $('#rp_linear').prop('checked', true);
        $('#wrp_linear').prop('checked', true);
      } else {
        $('#rp_log').prop('checked', true);
        $('#wrp_log').prop('checked', true);
      }

      $('.menutab').click(switchreport_handler);

      setDataRange(null, 7);
    }

    function sgvToColor (sgv: any, options: any) {
      var color = 'darkgreen';

      if (sgv > options.targetHigh) {
        color = 'red';
      } else if (sgv < options.targetLow) {
        color = 'red';
      }

      return color;
    }

    function show (event: any) {
      var options = {
        width: 1000
        , height: 300
        , weekwidth: 1000
        , weekheight: 300
        , targetLow: 3.5
        , targetHigh: 10
        , raw: true
        , notes: true
        , food: true
        , insulin: true
        , carbs: true
        , iob: true
        , cob: true
        , basal: true
        , scale: report_plugins.consts.scaleYFromSettings(client)
        , weekscale: report_plugins.consts.scaleYFromSettings(client)
        , units: client.settings.units
      };

      // default time range if no time range specified in GUI
      var zone = client.sbx.data.profile.getTimezone();
      var timerange = '&find[created_at][$gte]=' + moment.tz('2000-01-01', zone).toISOString();
      //console.log(timerange,zone);    
      options.targetLow = parseFloat($('#rp_targetlow').val().replace(',', '.'));
      options.targetHigh = parseFloat($('#rp_targethigh').val().replace(',', '.'));
      options.raw = $('#rp_optionsraw').is(':checked');
      options.iob = $('#rp_optionsiob').is(':checked');
      options.cob = $('#rp_optionscob').is(':checked');
      // @ts-expect-error TS(2339) FIXME: Property 'openAps' does not exist on type '{ width... Remove this comment to see the full error message
      options.openAps = $('#rp_optionsopenaps').is(':checked');
      // @ts-expect-error TS(2339) FIXME: Property 'predicted' does not exist on type '{ wid... Remove this comment to see the full error message
      options.predicted = $('#rp_optionspredicted').is(':checked');
      // @ts-expect-error TS(2339) FIXME: Property 'predictedTruncate' does not exist on typ... Remove this comment to see the full error message
      options.predictedTruncate = $('#rp_optionsPredictedTruncate').is(':checked');
      options.basal = $('#rp_optionsbasal').is(':checked');
      options.notes = $('#rp_optionsnotes').is(':checked');
      options.food = $('#rp_optionsfood').is(':checked');
      options.insulin = $('#rp_optionsinsulin').is(':checked');
      // @ts-expect-error TS(2339) FIXME: Property 'insulindistribution' does not exist on t... Remove this comment to see the full error message
      options.insulindistribution = $('#rp_optionsdistribution').is(':checked');
      options.carbs = $('#rp_optionscarbs').is(':checked');
      options.scale = ($('#rp_linear').is(':checked') ? report_plugins.consts.SCALE_LINEAR : report_plugins.consts.SCALE_LOG);
      options.weekscale = ($('#wrp_linear').is(':checked') ? report_plugins.consts.SCALE_LINEAR : report_plugins.consts.SCALE_LOG);
      // @ts-expect-error TS(2339) FIXME: Property 'order' does not exist on type '{ width: ... Remove this comment to see the full error message
      options.order = ($('#rp_oldestontop').is(':checked') ? report_plugins.consts.ORDER_OLDESTONTOP : report_plugins.consts.ORDER_NEWESTONTOP);
      options.width = parseInt($('#rp_size :selected').attr('x'));
      options.weekwidth = parseInt($('#wrp_size :selected').attr('x'));
      options.height = parseInt($('#rp_size :selected').attr('y'));
      options.weekheight = parseInt($('#wrp_size :selected').attr('y'));
      // @ts-expect-error TS(2339) FIXME: Property 'loopalyzer' does not exist on type '{ wi... Remove this comment to see the full error message
      options.loopalyzer = $("#loopalyzer").hasClass("selected"); // We only want to run through Loopalyzer if that tab is selected
      // @ts-expect-error TS(2339) FIXME: Property 'loopalyzer' does not exist on type '{ wi... Remove this comment to see the full error message
      if (options.loopalyzer) {
        options.iob = true;
        options.cob = true;
        // @ts-expect-error TS(2339) FIXME: Property 'openAps' does not exist on type '{ width... Remove this comment to see the full error message
        options.openAps = true;
      }
      // @ts-expect-error TS(2339) FIXME: Property 'bgcheck' does not exist on type '{ width... Remove this comment to see the full error message
      options.bgcheck = $('#rp_optionsbgcheck').is(':checked');
      // @ts-expect-error TS(2339) FIXME: Property 'othertreatments' does not exist on type ... Remove this comment to see the full error message
      options.othertreatments = $('#rp_optionsothertreatments').is(':checked');
      
      // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
      const reportStorage = require('./reportstorage');
      reportStorage.saveProps(options);
      var matchesneeded = 0;

      // date range
      function datefilter () {
        if ($('#rp_enabledate').is(':checked')) {
          matchesneeded++;
          var from = moment.tz(moment($('#rp_from').val()).startOf('day'), zone).startOf('day');
          var to = moment.tz(moment($('#rp_to').val()).endOf('day'), zone).endOf('day');
          timerange = '&find[created_at][$gte]=' + from.toISOString() + '&find[created_at][$lt]=' + to.toISOString();

          console.log("FROM", from.format( ), "TO", to.format( ), 'timerange', timerange);
          //console.log($('#rp_from').val(),$('#rp_to').val(),zone,timerange);
          while (from <= to) {
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (daystoshow[from.format('YYYY-MM-DD')]) {
              // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              daystoshow[from.format('YYYY-MM-DD')]++;
            } else {
              // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              daystoshow[from.format('YYYY-MM-DD')] = 1;
            }
            from.add(1, 'days');
          }
        }
        //console.log('Dayfilter: ',daystoshow);
        foodfilter();
      }

      //food filter
      function foodfilter () {
        if ($('#rp_enablefood').is(':checked')) {
          matchesneeded++;
          var _id = $('#rp_food').val();
          if (_id) {
            var treatmentData: any;
            var tquery = '?find[boluscalc.foods._id]=' + _id + timerange;
            $.ajax('/api/v1/treatments.json' + tquery, {
              headers: client.headers()
              , success: function(xhr: any) {
                treatmentData = xhr.map(function(treatment: any) {
                  return moment.tz(treatment.created_at, zone).format('YYYY-MM-DD');
                });
                // unique it
                treatmentData = $.grep(treatmentData, function(v: any, k: any) {
                  return $.inArray(v, treatmentData) === k;
                });
                treatmentData.sort(function(a: any, b: any) { return a > b; });
              }
            }).done(function() {
              //console.log('Foodfilter: ',treatmentData);
              for (var d = 0; d < treatmentData.length; d++) {
                // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (daystoshow[treatmentData[d]]) {
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  daystoshow[treatmentData[d]]++;
                } else {
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  daystoshow[treatmentData[d]] = 1;
                }
              }
              notesfilter();
            });
          }
        } else {
          notesfilter();
        }
      }

      //notes filter
      function notesfilter () {
        if ($('#rp_enablenotes').is(':checked')) {
          matchesneeded++;
          var notes = $('#rp_notes').val();
          if (notes) {
            var treatmentData: any;
            var tquery = '?find[notes]=/' + notes + '/i';
            $.ajax('/api/v1/treatments.json' + tquery + timerange, {
              headers: client.headers()
              , success: function(xhr: any) {
                treatmentData = xhr.map(function(treatment: any) {
                  return moment.tz(treatment.created_at, zone).format('YYYY-MM-DD');
                });
                // unique it
                treatmentData = $.grep(treatmentData, function(v: any, k: any) {
                  return $.inArray(v, treatmentData) === k;
                });
                treatmentData.sort(function(a: any, b: any) { return a > b; });
              }
            }).done(function() {
              //console.log('Notesfilter: ',treatmentData);
              for (var d = 0; d < treatmentData.length; d++) {
                // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (daystoshow[treatmentData[d]]) {
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  daystoshow[treatmentData[d]]++;
                } else {
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  daystoshow[treatmentData[d]] = 1;
                }
              }
              eventtypefilter();
            });
          }
        } else {
          eventtypefilter();
        }
      }

      //event type filter
      function eventtypefilter () {
        if ($('#rp_enableeventtype').is(':checked')) {
          matchesneeded++;
          var eventtype = $('#rp_eventtype').val();
          if (eventtype) {
            var treatmentData: any;
            var tquery = '?find[eventType]=/' + eventtype + '/i';
            $.ajax('/api/v1/treatments.json' + tquery + timerange, {
              headers: client.headers()
              , success: function(xhr: any) {
                treatmentData = xhr.map(function(treatment: any) {
                  return moment.tz(treatment.created_at, zone).format('YYYY-MM-DD');
                });
                // unique it
                treatmentData = $.grep(treatmentData, function(v: any, k: any) {
                  return $.inArray(v, treatmentData) === k;
                });
                treatmentData.sort(function(a: any, b: any) { return a > b; });
              }
            }).done(function() {
              //console.log('Eventtypefilter: ',treatmentData);
              for (var d = 0; d < treatmentData.length; d++) {
                // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                if (daystoshow[treatmentData[d]]) {
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  daystoshow[treatmentData[d]]++;
                } else {
                  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  daystoshow[treatmentData[d]] = 1;
                }
              }
              daysfilter();
            });
          }
        } else {
          daysfilter();
        }
      }

      function daysfilter () {
        matchesneeded++;
        Object.keys(daystoshow).forEach(function eachDay (d) {
          var day = moment.tz(d, zone).day();
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 0 && $('#rp_su').is(':checked')) { daystoshow[d]++; }
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 1 && $('#rp_mo').is(':checked')) { daystoshow[d]++; }
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 2 && $('#rp_tu').is(':checked')) { daystoshow[d]++; }
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 3 && $('#rp_we').is(':checked')) { daystoshow[d]++; }
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 4 && $('#rp_th').is(':checked')) { daystoshow[d]++; }
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 5 && $('#rp_fr').is(':checked')) { daystoshow[d]++; }
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (day === 6 && $('#rp_sa').is(':checked')) { daystoshow[d]++; }
        });
        countDays();
        addPreviousDayTreatments();
        display();
      }

      function display () {
        var count = 0;
        sorteddaystoshow = [];
        $('#info').html('<b>' + translate('Loading') + ' ...</b>');
        for (var d in daystoshow) {
          if (count < maxdays) {
            $('#info').append($('<div id="info-' + d + '"></div>'));
            count++;
            loadData(d, options, dataLoadedCallback);
          } else {
            $('#info').append($('<div>' + d + ' ' + translate('not displayed') + '.</div>'));
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            delete daystoshow[d];
          }
        }
        if (count === 0) {
          $('#info').html('<b>' + translate('Result is empty') + '</b>');
          $('#rp_show').css('display', '');
        }
      }

      var dayscount = 0;
      var loadeddays = 0;

      function countDays () {
        for (var d in daystoshow) {
          if (Object.prototype.hasOwnProperty.call(daystoshow, d)) {
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (daystoshow[d] === matchesneeded) {
              if (dayscount < maxdays) {
                dayscount++;
              }
            } else {
              // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              delete daystoshow[d];
            }
          }
        }
        //console.log('Total: ', daystoshow, 'Matches needed: ', matchesneeded, 'Will be loaded: ', dayscount);
      }

      function addPreviousDayTreatments () {
        for (var d in daystoshow) {
          if (Object.prototype.hasOwnProperty.call(daystoshow, d)) {
            var day = moment.tz(d, zone);
            var previous = day.subtract(1, 'days');
            var formated = previous.format('YYYY-MM-DD');
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            if (!daystoshow[formated]) {
              // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              daystoshow[formated] = { treatmentsonly: true };
              console.log('Adding ' + formated + ' for loading treatments');
              dayscount++;
            }
          }
        }
        //console.log('Total: ', daystoshow, 'Matches needed: ', matchesneeded, 'Will be loaded: ', dayscount);
      }

      function dataLoadedCallback (day: any) {
        loadeddays++;
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!daystoshow[day].treatmentsonly) {
          sorteddaystoshow.push(day);
        }
        if (loadeddays === dayscount) {
          sorteddaystoshow.sort();
          var dFrom = sorteddaystoshow[0];
          var dTo = sorteddaystoshow[(sorteddaystoshow.length - 1)];

          // @ts-expect-error TS(2339) FIXME: Property 'order' does not exist on type '{ width: ... Remove this comment to see the full error message
          if (options.order === report_plugins.consts.ORDER_NEWESTONTOP) {
            sorteddaystoshow.reverse();
          }
          loadProfileSwitch(dFrom, function loadProfileSwitchCallback () {
            loadProfilesRange(dFrom, dTo, sorteddaystoshow.length, function loadProfilesCallback () {
              $('#info > b').html('<b>' + translate('Rendering') + ' ...</b>');
              window.setTimeout(function() {
                showreports(options);
              }, 0);
            });
          });
        }
      }

      $('#rp_show').css('display', 'none');
      daystoshow = {};

      datefilter();
      return maybePrevent(event);
    }

    function showreports (options: any) {
      // prepare some data used in more reports
      // @ts-expect-error TS(2339) FIXME: Property 'allstatsrecords' does not exist on type ... Remove this comment to see the full error message
      datastorage.allstatsrecords = [];
      // @ts-expect-error TS(2339) FIXME: Property 'alldays' does not exist on type '{}'.
      datastorage.alldays = 0;
      sorteddaystoshow.forEach(function eachDay (day: any) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (!daystoshow[day].treatmentsonly) {
          // @ts-expect-error TS(2339) FIXME: Property 'allstatsrecords' does not exist on type ... Remove this comment to see the full error message
          datastorage.allstatsrecords = datastorage.allstatsrecords.concat(datastorage[day].statsrecords);
          // @ts-expect-error TS(2339) FIXME: Property 'alldays' does not exist on type '{}'.
          datastorage.alldays++;
        }
      });
      options.maxInsulinValue = maxInsulinValue;
      options.maxCarbsValue = maxCarbsValue;
      options.maxDailyCarbsValue = maxDailyCarbsValue;

      // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
      datastorage.treatments = [];
      // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
      datastorage.devicestatus = [];
      // @ts-expect-error TS(2339) FIXME: Property 'combobolusTreatments' does not exist on ... Remove this comment to see the full error message
      datastorage.combobolusTreatments = [];
      // @ts-expect-error TS(2339) FIXME: Property 'tempbasalTreatments' does not exist on t... Remove this comment to see the full error message
      datastorage.tempbasalTreatments = [];
      Object.keys(daystoshow).forEach(function eachDay (day) {
        // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
        datastorage.treatments = datastorage.treatments.concat(datastorage[day].treatments);
        // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
        datastorage.devicestatus = datastorage.devicestatus.concat(datastorage[day].devicestatus);
        // @ts-expect-error TS(2339) FIXME: Property 'combobolusTreatments' does not exist on ... Remove this comment to see the full error message
        datastorage.combobolusTreatments = datastorage.combobolusTreatments.concat(datastorage[day].combobolusTreatments);
        // @ts-expect-error TS(2339) FIXME: Property 'tempbasalTreatments' does not exist on t... Remove this comment to see the full error message
        datastorage.tempbasalTreatments = datastorage.tempbasalTreatments.concat(datastorage[day].tempbasalTreatments);
      });
      // @ts-expect-error TS(2339) FIXME: Property 'tempbasalTreatments' does not exist on t... Remove this comment to see the full error message
      datastorage.tempbasalTreatments = Nightscout.client.ddata.processDurations(datastorage.tempbasalTreatments);
      // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
      datastorage.treatments.sort(function sort (a: any, b: any) { return a.mills - b.mills; });

      for (var d in daystoshow) {
        if (Object.prototype.hasOwnProperty.call(daystoshow, d)) {
          // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          if (daystoshow[d].treatmentsonly) {
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            delete daystoshow[d];
            // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            delete datastorage[d];
          }
        }
      }

      report_plugins.eachPlugin(function(plugin: any) {
        // jquery plot doesn't draw to hidden div
        $('#' + plugin.name + '-placeholder').css('display', '');

        console.log('Drawing ', plugin.name);

        var skipRender = false;

        if (plugin.name == 'daytoday' && !$('#daytoday').hasClass('selected')) skipRender = true;
        if (plugin.name == 'treatments' && !$('#treatments').hasClass('selected')) skipRender = true;
        if (plugin.name == 'weektoweek' && !$('#weektoweek').hasClass('selected')) skipRender = true;
        if (plugin.name == 'loopalyzer' && !$('#loopalyzer').hasClass('selected')) skipRender = true;

        if (skipRender) {
          console.log('Skipping ', plugin.name);
        } else {
          plugin.report(datastorage, sorteddaystoshow, options);
        }

        if (!$('#' + plugin.name).hasClass('selected')) {
          $('#' + plugin.name + '-placeholder').css('display', 'none');
        }
      });

      $('#info').html('');
      $('#rp_show').css('display', '');
    }

    function setDataRange (event: any, days: any) {
      $('#rp_to').val(moment().format('YYYY-MM-DD'));
      $('#rp_from').val(moment().add(-days + 1, 'days').format('YYYY-MM-DD'));
      return maybePrevent(event);
    }

    function switchreport_handler(this: any, event: any) {
      var id = $(this).attr('id');

      $('.menutab').removeClass('selected');
      $('#' + id).addClass('selected');

      $('.tabplaceholder').css('display', 'none');
      $('#' + id + '-placeholder').css('display', '');
      return maybePrevent(event);
    }

    function loadData (day: any, options: any, callback: any) {
      // check for loaded data
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if ((options.openAps || options.predicted || options.iob || options.cob) && datastorage[day] && !datastorage[day].devicestatus.length) {
        // OpenAPS requested but data not loaded. Load anyway ...
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      } else if (datastorage[day] && day !== moment().format('YYYY-MM-DD')) {
        callback(day);
        return;
      }
      // patientData = [actual, predicted, mbg, treatment, cal, devicestatusData];
      var data = {};
      var cgmData: any = []
        , mbgData: any = []
        , treatmentData = []
        , calData: any = [];
      var from: any;
      if (client.sbx.data.profile.getTimezone()) {
        from = moment(day).tz(client.sbx.data.profile.getTimezone()).startOf('day').format('x');
      } else {
        from = moment(day).startOf('day').format('x');
      }
      from = parseInt(from);
      var to = from + 1000 * 60 * 60 * 24;

      function loadCGMData () {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (daystoshow[day].treatmentsonly) {
          // @ts-expect-error TS(2339) FIXME: Property 'sgv' does not exist on type '{}'.
          data.sgv = [];
          // @ts-expect-error TS(2339) FIXME: Property 'mbg' does not exist on type '{}'.
          data.mbg = [];
          // @ts-expect-error TS(2339) FIXME: Property 'cal' does not exist on type '{}'.
          data.cal = [];
          return $.Deferred().resolve();
        }
        $('#info-' + day).html('<b>' + translate('Loading CGM data of') + ' ' + day + ' ...</b>');
        var query = '?find[date][$gte]=' + from + '&find[date][$lt]=' + to + '&count=10000';
        return $.ajax('/api/v1/entries.json' + query, {
          headers: client.headers()
          , success: function(xhr: any) {
            xhr.forEach(function(element: any) {
              if (element) {
                if (element.mbg) {
                  mbgData.push({
                    y: element.mbg
                    , mills: element.date
                    , d: element.dateString
                    , device: element.device
                  });
                } else if (element.sgv) {
                  cgmData.push({
                    y: element.sgv
                    , mills: element.date
                    , d: element.dateString
                    , device: element.device
                    , filtered: element.filtered
                    , unfiltered: element.unfiltered
                    , noise: element.noise
                    , rssi: element.rssi
                    , sgv: element.sgv
                  });
                } else if (element.type === 'cal') {
                  calData.push({
                    mills: element.date + 1
                    , d: element.dateString
                    , scale: element.scale
                    , intercept: element.intercept
                    , slope: element.slope
                  });
                }
              }
            });
            // sometimes cgm contains duplicates.  uniq it.
            // @ts-expect-error TS(2339) FIXME: Property 'sgv' does not exist on type '{}'.
            data.sgv = cgmData.slice();
            // @ts-expect-error TS(2339) FIXME: Property 'sgv' does not exist on type '{}'.
            data.sgv.sort(function(a: any, b: any) { return a.mills - b.mills; });
            var lastDate = 0;
            // @ts-expect-error TS(2339) FIXME: Property 'sgv' does not exist on type '{}'.
            data.sgv = data.sgv.filter(function(d: any) {
              var ok = (lastDate + ONE_MIN_IN_MS) <= d.mills;
              lastDate = d.mills;
              if (!ok) { console.log("itm", JSON.stringify(d)); }
              return ok;
            });
            // @ts-expect-error TS(2339) FIXME: Property 'mbg' does not exist on type '{}'.
            data.mbg = mbgData.slice();
            // @ts-expect-error TS(2339) FIXME: Property 'mbg' does not exist on type '{}'.
            data.mbg.sort(function(a: any, b: any) { return a.mills - b.mills; });
            // @ts-expect-error TS(2339) FIXME: Property 'cal' does not exist on type '{}'.
            data.cal = calData.slice();
            // @ts-expect-error TS(2339) FIXME: Property 'cal' does not exist on type '{}'.
            data.cal.sort(function(a: any, b: any) { return a.mills - b.mills; });
          }
        });
      }

      function loadTreatmentData () {
        // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
        if (!datastorage.profileSwitchTreatments)
          // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
          datastorage.profileSwitchTreatments = [];
        $('#info-' + day).html('<b>' + translate('Loading treatments data of') + ' ' + day + ' ...</b>');
        var tquery = '?find[created_at][$gte]=' + new Date(from).toISOString() + '&find[created_at][$lt]=' + new Date(to).toISOString() + '&count=1000';
        return $.ajax('/api/v1/treatments.json' + tquery, {
          headers: client.headers()
          , cache: false
          , success: function(xhr: any) {
            treatmentData = xhr.map(function(treatment: any) {
              var timestamp = new Date(treatment.timestamp || treatment.created_at);
              treatment.mills = timestamp.getTime();
              return treatment;
            });
            // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
            data.treatments = treatmentData.slice();
            // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
            data.treatments.sort(function(a: any, b: any) { return a.mills - b.mills; });
            // filter 'Combo Bolus' events
            // @ts-expect-error TS(2339) FIXME: Property 'combobolusTreatments' does not exist on ... Remove this comment to see the full error message
            data.combobolusTreatments = data.treatments.filter(function filterComboBoluses (t: any) {
              return t.eventType === 'Combo Bolus';
            });
            // filter temp basal treatments
            // @ts-expect-error TS(2339) FIXME: Property 'tempbasalTreatments' does not exist on t... Remove this comment to see the full error message
            data.tempbasalTreatments = data.treatments.filter(function filterTempBasals (t: any) {
              return t.eventType === 'Temp Basal';
            });
            // filter profile switch treatments
            // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
            var profileSwitch = data.treatments.filter(function filterProfileSwitch (t: any) {
              return t.eventType === 'Profile Switch';
            });
            // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
            datastorage.profileSwitchTreatments = datastorage.profileSwitchTreatments.concat(profileSwitch);
          }
        });
      }

      function loadDevicestatusData () {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        if (daystoshow[day].treatmentsonly) {
          // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
          data.devicestatus = [];
          return $.Deferred().resolve();
        }
        if (options.iob || options.cob || options.openAps || options.predicted) {
          $('#info-' + day).html('<b>' + translate('Loading device status data of') + ' ' + day + ' ...</b>');
          var tquery = '?find[created_at][$gte]=' + new Date(from).toISOString() + '&find[created_at][$lt]=' + new Date(to).toISOString() + '&count=10000';
          return $.ajax('/api/v1/devicestatus.json' + tquery, {
            headers: client.headers()
            , success: function(xhr: any) {
              // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
              data.devicestatus = xhr.map(function(devicestatus: any) {
                devicestatus.mills = new Date(devicestatus.timestamp || devicestatus.created_at).getTime();
                return devicestatus;
              });
            }
          });
        } else {
          // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
          data.devicestatus = [];
          return $.Deferred().resolve();
        }
      }

      $.when(loadCGMData(), loadTreatmentData(), loadDevicestatusData()).done(function() {
        $('#info-' + day).html('<b>' + translate('Processing data of') + ' ' + day + ' ...</b>');
        processData(data, day, options, callback);
      });
    }

    function loadProfileSwitch (from: any, callback: any) {
      $('#info > b').html('<b>' + translate('Loading profile switch data') + ' ...</b>');
      var tquery = '?find[eventType]=Profile Switch' + '&find[created_at][$lte]=' + new Date(from).toISOString() + '&count=1';
      $.ajax('/api/v1/treatments.json' + tquery, {
        headers: client.headers()
        , success: function(xhr: any) {
          var treatmentData = xhr.map(function(treatment: any) {
            var timestamp = new Date(treatment.timestamp || treatment.created_at);
            treatment.mills = timestamp.getTime();
            return treatment;
          });
          // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
          if (!datastorage.profileSwitchTreatments)
            // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
            datastorage.profileSwitchTreatments = [];
          // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
          datastorage.profileSwitchTreatments = datastorage.profileSwitchTreatments.concat(treatmentData);
          // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchTreatments' does not exist ... Remove this comment to see the full error message
          datastorage.profileSwitchTreatments.sort(function(a: any, b: any) { return a.mills - b.mills; });
        }
      }).done(function() {
        callback();
      });
    }

    function loadProfilesRange (dateFrom: any, dateTo: any, dayCount: any, callback: any) {
      $('#info > b').html('<b>' + translate('Loading profile range') + ' ...</b>');

      $.when(
          // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 3.
          loadProfilesRangeCore(dateFrom, dateTo, dayCount)
          , loadProfilesRangePrevious(dateFrom)
          , loadProfilesRangeNext(dateTo)
        )
        .done(callback)
        .fail(function() {
          // @ts-expect-error TS(2339) FIXME: Property 'profiles' does not exist on type '{}'.
          datastorage.profiles = [];
        });
    }

    function loadProfilesRangeCore (dateFrom: any, dateTo: any) {
      $('#info > b').html('<b>' + translate('Loading core profiles') + ' ...</b>');

      //The results must be returned in descending order to work with key logic in routines such as getCurrentProfile
      var tquery = '?find[startDate][$gte]=' + new Date(dateFrom).toISOString() + '&find[startDate][$lte]=' + new Date(dateTo).toISOString() + '&sort[startDate]=-1&count=1000';

      return $.ajax('/api/v1/profiles' + tquery, {
        headers: client.headers()
        , async: false
        , success: function(records: any) {
          // @ts-expect-error TS(2339) FIXME: Property 'profiles' does not exist on type '{}'.
          datastorage.profiles = records;
        }
      });
    }

    function loadProfilesRangePrevious (dateFrom: any) {
      $('#info > b').html('<b>' + translate('Loading previous profile') + ' ...</b>');

      //Find first one before the start date and add to datastorage.profiles
      var tquery = '?find[startDate][$lt]=' + new Date(dateFrom).toISOString() + '&sort[startDate]=-1&count=1';

      return $.ajax('/api/v1/profiles' + tquery, {
        headers: client.headers()
        , async: false
        , success: function(records: any) {
          records.forEach(function(r: any) {
            // @ts-expect-error TS(2339) FIXME: Property 'profiles' does not exist on type '{}'.
            datastorage.profiles.push(r);
          });
        }
      });
    }

    function loadProfilesRangeNext (dateTo: any) {
      $('#info > b').html('<b>' + translate('Loading next profile') + ' ...</b>');

      //Find first one after the end date and add to datastorage.profiles
      var tquery = '?find[startDate][$gt]=' + new Date(dateTo).toISOString() + '&sort[startDate]=1&count=1';

      return $.ajax('/api/v1/profiles' + tquery, {
        headers: client.headers()
        , async: false
        , success: function(records: any) {
          records.forEach(function(r: any) {
            //must be inserted as top to maintain profiles being sorted by date in descending order
            // @ts-expect-error TS(2339) FIXME: Property 'profiles' does not exist on type '{}'.
            datastorage.profiles.unshift(r);
          });
        }
      });
    }

    function processData (data: any, day: any, options: any, callback: any) {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (daystoshow[day].treatmentsonly) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        datastorage[day] = data;
        $('#info-' + day).html('');
        callback(day);
        return;
      }
      // treatments
      data.dailyCarbs = 0;
      data.dailyProtein = 0;
      data.dailyFat = 0;

      data.treatments.forEach(function(d: any) {
        if (parseFloat(d.insulin) > maxInsulinValue) {
          maxInsulinValue = parseFloat(d.insulin);
        }
        if (parseFloat(d.carbs) > maxCarbsValue) {
          maxCarbsValue = parseFloat(d.carbs);
        }
        if (d.carbs) {
          data.dailyCarbs += Number(d.carbs);
        }
        if (d.protein) {
          data.dailyProtein += Number(d.protein);
        }
        if (d.fat) {
          data.dailyFat += Number(d.fat);
        }
      });
      if (data.dailyCarbs > maxDailyCarbsValue) {
        maxDailyCarbsValue = data.dailyCarbs;
      }

      var cal = data.cal[data.cal.length - 1];
      var temp1 = [];
      var rawbg = client.rawbg;
      if (cal) {
        temp1 = data.sgv.map(function(entry: any) {
          entry.mgdl = entry.y; // value names changed from enchilada
          var rawBg = rawbg.calc(entry, cal);
          return { mills: entry.mills, date: new Date(entry.mills - 2 * 1000), y: rawBg, sgv: client.utils.scaleMgdl(rawBg), color: 'gray', type: 'rawbg', filtered: entry.filtered, unfiltered: entry.unfiltered };
        }).filter(function(entry: any) { return entry.y > 0 });
      }
      var temp2 = data.sgv.map(function(obj: any) {
        return { mills: obj.mills, date: new Date(obj.mills), y: obj.y, sgv: client.utils.scaleMgdl(obj.y), color: sgvToColor(client.utils.scaleMgdl(obj.y), options), type: 'sgv', noise: obj.noise, filtered: obj.filtered, unfiltered: obj.unfiltered };
      });
      data.sgv = [].concat(temp1, temp2);

      //Add MBG's also, pretend they are SGV's
      data.sgv = data.sgv.concat(data.mbg.map(function(obj: any) { return { date: new Date(obj.mills), y: obj.y, sgv: client.utils.scaleMgdl(obj.y), color: 'red', type: 'mbg', device: obj.device } }));

      // make sure data range will be exactly 24h
      var from;
      if (client.sbx.data.profile.getTimezone()) {
        from = moment(day).tz(client.sbx.data.profile.getTimezone()).startOf('day').toDate();
      } else {
        from = moment(day).startOf('day').toDate();
      }
      var to = new Date(from.getTime() + 1000 * 60 * 60 * 24);
      data.sgv.push({ date: from, y: 40, sgv: 40, color: 'transparent', type: 'rawbg' });
      data.sgv.push({ date: to, y: 40, sgv: 40, color: 'transparent', type: 'rawbg' });

      // clear error data. we don't need it to display them
      data.sgv = data.sgv.filter(function(d: any) {
        if (d.y < 39) {
          return false;
        }
        return true;
      });

      data.sgv = data.sgv.map(function eachSgv (sgv: any) {
        var status = _.find(data.devicestatus, function(d: any) {
          return d.mills >= sgv.mills && d.mills < sgv.mills + 5 * 60 * 1000;
        });

        if (status && status.openaps) {
          sgv.openaps = status.openaps;
        }
        return sgv;
      });

      // for other reports
      data.statsrecords = data.sgv.filter(function(r: any) {
        if (r.type) {
          return r.type === 'sgv';
        } else {
          return true;
        }
      }).map(function(r: any) {
        var ret = {};
        // @ts-expect-error TS(2339) FIXME: Property 'sgv' does not exist on type '{}'.
        ret.sgv = parseFloat(r.sgv);
        // @ts-expect-error TS(2339) FIXME: Property 'bgValue' does not exist on type '{}'.
        ret.bgValue = parseInt(r.y);
        // @ts-expect-error TS(2339) FIXME: Property 'displayTime' does not exist on type '{}'... Remove this comment to see the full error message
        ret.displayTime = r.date;
        return ret;
      });

      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      datastorage[day] = data;
      $('#info-' + day).html('');
      callback(day);
    }

    function maybePrevent (event: any) {
      if (event) {
        event.preventDefault();
      }
      return false;
    }
  });
};

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
