'use strict';

var lastEntryValue: any;
var lastMinutes: any;
var lastEntryTime: any;

function init(ctx: any) {
    var translate = ctx.language.translate;
    var speechLangCode = ctx.language.speechCode;

    var speech = {
        name: 'speech',
        label: 'Speech',
        pluginType: 'pill-status',
        pillFlip: true
    };


    // @ts-expect-error TS(2339): Property 'say' does not exist on type '{ name: str... Remove this comment to see the full error message
    speech.say = function say(sayIt: any) {
        console.log('saying', sayIt, 'using lang code',  speechLangCode);
        
        var msg = new SpeechSynthesisUtterance(sayIt.toLowerCase());
        if (speechLangCode) msg.lang = speechLangCode;
        window.speechSynthesis.speak(msg);
    }

    // @ts-expect-error TS(2339): Property 'visualizeAlarm' does not exist on type '... Remove this comment to see the full error message
    speech.visualizeAlarm = function visualizeAlarm(sbx: any, alarm: any, alarmMessage: any) {
      console.log('Speech got an Alarm Message:',alarmMessage);
      // @ts-expect-error TS(2339): Property 'say' does not exist on type '{ name: str... Remove this comment to see the full error message
      speech.say(alarmMessage);
    }

    // @ts-expect-error TS(2339): Property 'updateVisualisation' does not exist on t... Remove this comment to see the full error message
    speech.updateVisualisation = function updateVisualisation(sbx: any) {

        if (sbx.data.inRetroMode) return;

        var timeNow = sbx.time;
        var entry = sbx.lastSGVEntry();
        
        if (timeNow && entry && entry.mills) {

            var timeSince = timeNow - entry.mills;
            var timeMinutes = Math.round(timeSince / 60000);

            if (lastEntryTime != entry.mills) {

                var lE = sbx.scaleMgdl(lastEntryValue);
                var cE = sbx.scaleMgdl(entry.mgdl);      
                
                var delta = ((cE - lE) %1 === 0) ? cE - lE : Math.round( (cE - lE) * 10) / 10;

                lastEntryValue = entry.mgdl;
                lastEntryTime = entry.mills;

                var sayIt = sbx.roundBGToDisplayFormat(sbx.scaleMgdl(entry.mgdl));
                
                if (!isNaN(delta)) {

                    sayIt += ', ' + translate('change') + ' ' + delta
                }

                var iob = sbx.properties.iob;
                if (iob) {
                    var iobString = sbx.roundInsulinForDisplayFormat(iob.display);

                    if (iobString) {
                        sayIt += ", IOB " + iobString;
                    }
                }
                // @ts-expect-error TS(2339): Property 'say' does not exist on type '{ name: str... Remove this comment to see the full error message
                speech.say(sayIt);

            } else {

                if (timeMinutes > 5 && timeMinutes != lastMinutes && timeMinutes % 5 == 0) {
                    lastMinutes = timeMinutes;

                    var lastEntryString = translate('Last entry {0} minutes ago');
                    sayIt = lastEntryString.replace('{0}', timeMinutes);
                    // @ts-expect-error TS(2339): Property 'say' does not exist on type '{ name: str... Remove this comment to see the full error message
                    speech.say(sayIt);
                }
            }
        }
    };

    return speech;

}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;