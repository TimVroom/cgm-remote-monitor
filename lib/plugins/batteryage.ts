'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');

function init(ctx: any) {
    var moment = ctx.moment;
    var translate = ctx.language.translate;
    var levels = ctx.levels;
    
    var bage = {
    name: 'bage'
        , label: 'Pump Battery Age'
        , pluginType: 'pill-minor'
    };
    
    // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
    bage.getPrefs = function getPrefs(sbx: any) {
        return {
        info: sbx.extendedSettings.info || 312
            , warn: sbx.extendedSettings.warn || 336
            , urgent: sbx.extendedSettings.urgent || 360
            , display: sbx.extendedSettings.display ? sbx.extendedSettings.display : 'days'
            , enableAlerts: sbx.extendedSettings.enableAlerts || false
        };
    };
    
    // @ts-expect-error TS(2339): Property 'setProperties' does not exist on type '{... Remove this comment to see the full error message
    bage.setProperties = function setProperties (sbx: any) {
        sbx.offerProperty('bage', function setProp ( ) {
                          // @ts-expect-error TS(2339): Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
                          return bage.findLatestTimeChange(sbx);
                          });
    };
    
    // @ts-expect-error TS(2339): Property 'checkNotifications' does not exist on ty... Remove this comment to see the full error message
    bage.checkNotifications = function checkNotifications(sbx: any) {
        var batteryInfo = sbx.properties.bage;
        
        if (batteryInfo.notification) {
            var notification = _.extend({}, batteryInfo.notification, {
                                        plugin: bage
                                        , debug: {
                                        age: batteryInfo.age
                                        }
                                        });
            sbx.notifications.requestNotify(notification);
        }
    };
    
    // @ts-expect-error TS(2339): Property 'findLatestTimeChange' does not exist on ... Remove this comment to see the full error message
    bage.findLatestTimeChange = function findLatestTimeChange(sbx: any) {
        
        // @ts-expect-error TS(2339): Property 'getPrefs' does not exist on type '{ name... Remove this comment to see the full error message
        var prefs = bage.getPrefs(sbx);
        
        var batteryInfo = {
        found: false
            , age: 0
            , treatmentDate: null
            , checkForAlert: false
        };
        
        var prevDate = 0;
        
        _.each(sbx.data.batteryTreatments, function eachTreatment (treatment: any) {
               var treatmentDate = treatment.mills;
               if (treatmentDate > prevDate && treatmentDate <= sbx.time) {
               
               prevDate = treatmentDate;
               batteryInfo.treatmentDate = treatmentDate;
               
               var a = moment(sbx.time);
               var b = moment(batteryInfo.treatmentDate);
               var days = a.diff(b,'days');
               var hours = a.diff(b,'hours') - days * 24;
               var age = a.diff(b,'hours');
               
               if (!batteryInfo.found || (age >= 0 && age < batteryInfo.age)) {
               batteryInfo.found = true;
               batteryInfo.age = age;
               // @ts-expect-error TS(2339): Property 'days' does not exist on type '{ found: b... Remove this comment to see the full error message
               batteryInfo.days = days;
               // @ts-expect-error TS(2339): Property 'hours' does not exist on type '{ found: ... Remove this comment to see the full error message
               batteryInfo.hours = hours;
               // @ts-expect-error TS(2339): Property 'notes' does not exist on type '{ found: ... Remove this comment to see the full error message
               batteryInfo.notes = treatment.notes;
               // @ts-expect-error TS(2339): Property 'minFractions' does not exist on type '{ ... Remove this comment to see the full error message
               batteryInfo.minFractions = a.diff(b,'minutes') - age * 60;
               }
               }
               });
        
        
        // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
        batteryInfo.level = levels.NONE;
        
        var sound = 'incoming';
        var message;
        var sendNotification = false;
        
        if (batteryInfo.age >= prefs.urgent) {
            sendNotification = batteryInfo.age === prefs.urgent;
            message = translate('Pump Battery change overdue!');
            sound = 'persistent';
            // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
            batteryInfo.level = levels.URGENT;
        } else if (batteryInfo.age >= prefs.warn) {
            sendNotification = batteryInfo.age === prefs.warn;
            message = translate('Time to change pump battery');
            // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
            batteryInfo.level = levels.WARN;
        } else  if (batteryInfo.age >= prefs.info) {
            sendNotification = batteryInfo.age === prefs.info;
            message = 'Change pump battery soon';
            // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
            batteryInfo.level = levels.INFO;
        }
        
        if (prefs.display === 'days' && batteryInfo.found) {
            // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
            batteryInfo.display = '';
            if (batteryInfo.age >= 24) {
                // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
                batteryInfo.display += batteryInfo.days + 'd';
            }
            // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
            batteryInfo.display += batteryInfo.hours + 'h';
        } else {
            // @ts-expect-error TS(2339): Property 'display' does not exist on type '{ found... Remove this comment to see the full error message
            batteryInfo.display = batteryInfo.found ? batteryInfo.age + 'h' : 'n/a ';
        }
        
        //allow for 20 minute period after a full hour during which we'll alert the user
        // @ts-expect-error TS(2339): Property 'minFractions' does not exist on type '{ ... Remove this comment to see the full error message
        if (prefs.enableAlerts && sendNotification && batteryInfo.minFractions <= 20) {
            // @ts-expect-error TS(2339): Property 'notification' does not exist on type '{ ... Remove this comment to see the full error message
            batteryInfo.notification = {
            title: translate('Pump battery age %1 hours', { params: [batteryInfo.age] })
                , message: message
                , pushoverSound: sound
                // @ts-expect-error TS(2339): Property 'level' does not exist on type '{ found: ... Remove this comment to see the full error message
                , level: batteryInfo.level
                , group: 'BAGE'
            };
        }
        
        return batteryInfo;
    };
    
    // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
    bage.updateVisualisation = function updateVisualisation (sbx: any) {
        
        var batteryInfo = sbx.properties.bage;
        
        var info = [{ label: translate('Inserted'), value: new Date(batteryInfo.treatmentDate).toLocaleString() }];
        
        if (!_.isEmpty(batteryInfo.notes)) {
            info.push({label: translate('Notes') + ':', value: batteryInfo.notes});
        }
        
        var statusClass = null;
        if (batteryInfo.level === levels.URGENT) {
            statusClass = 'urgent';
        } else if (batteryInfo.level === levels.WARN) {
            statusClass = 'warn';
        }
        
        sbx.pluginBase.updatePillText(bage, {
                                      value: batteryInfo.display
                                      , label: translate('BAGE')
                                      , info: info
                                      , pillClass: statusClass
                                      });
    };
    return bage;
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
