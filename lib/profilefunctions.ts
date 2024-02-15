'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
var _ = require('lodash');
// @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
var c = require('memory-cache');
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'times'.
var times = require('./times');

var cacheTTL = 5000;
var prevBasalTreatment: any = null;

function init (profileData: any, ctx: any) {

var moment = ctx.moment;

  var cache = new c.Cache();
  var profile = {};

  // @ts-expect-error TS(2339) FIXME: Property 'clear' does not exist on type '{}'.
  profile.clear = function clear() {
    cache.clear();
    // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
    profile.data = null;
    prevBasalTreatment = null;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'clear' does not exist on type '{}'.
  profile.clear();

  // @ts-expect-error TS(2339) FIXME: Property 'loadData' does not exist on type '{}'.
  profile.loadData = function loadData (profileData: any) {
    if (profileData && profileData.length) {
      // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
      profile.data = profile.convertToProfileStore(profileData);
      // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
      _.each(profile.data, function eachProfileRecord (record: any) {
        // @ts-expect-error TS(2339) FIXME: Property 'preprocessProfileOnLoad' does not exist ... Remove this comment to see the full error message
        _.each(record.store, profile.preprocessProfileOnLoad);
        record.mills = new Date(record.startDate).getTime();
      });
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'convertToProfileStore' does not exist on... Remove this comment to see the full error message
  profile.convertToProfileStore = function convertToProfileStore (dataArray: any) {
    var convertedProfiles: any = [];
    _.each(dataArray, function(profile: any) {
      if (!profile.defaultProfile) {
        var newObject = {};
        // @ts-expect-error TS(2339) FIXME: Property 'defaultProfile' does not exist on type '... Remove this comment to see the full error message
        newObject.defaultProfile = 'Default';
        // @ts-expect-error TS(2339) FIXME: Property 'store' does not exist on type '{}'.
        newObject.store = {};
        // @ts-expect-error TS(2339) FIXME: Property 'startDate' does not exist on type '{}'.
        newObject.startDate = profile.startDate ? profile.startDate : '1980-01-01';
        // @ts-expect-error TS(2339) FIXME: Property '_id' does not exist on type '{}'.
        newObject._id = profile._id;
        // @ts-expect-error TS(2339) FIXME: Property 'convertedOnTheFly' does not exist on typ... Remove this comment to see the full error message
        newObject.convertedOnTheFly = true;
        delete profile.startDate;
        delete profile._id;
        delete profile.created_at;
        // @ts-expect-error TS(2339) FIXME: Property 'store' does not exist on type '{}'.
        newObject.store['Default'] = profile;
        convertedProfiles.push(newObject);
        console.log('Profile not updated yet. Converted profile:', newObject);
      } else {
        delete profile.convertedOnTheFly;
        convertedProfiles.push(profile);
      }
    });
    return convertedProfiles;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'timeStringToSeconds' does not exist on t... Remove this comment to see the full error message
  profile.timeStringToSeconds = function timeStringToSeconds (time: any) {
    var split = time.split(':');
    return parseInt(split[0]) * 3600 + parseInt(split[1]) * 60;
  };

  // preprocess the timestamps to seconds for a couple orders of magnitude faster operation
  // @ts-expect-error TS(2339) FIXME: Property 'preprocessProfileOnLoad' does not exist ... Remove this comment to see the full error message
  profile.preprocessProfileOnLoad = function preprocessProfileOnLoad (container: any) {
    _.each(container, function eachValue (value: any) {

      if (value === null) return;

      if (Object.prototype.toString.call(value) === '[object Array]') {
        // @ts-expect-error TS(2339) FIXME: Property 'preprocessProfileOnLoad' does not exist ... Remove this comment to see the full error message
        profile.preprocessProfileOnLoad(value);
      }

      if (value.time) {
        // @ts-expect-error TS(2339) FIXME: Property 'timeStringToSeconds' does not exist on t... Remove this comment to see the full error message
        var sec = profile.timeStringToSeconds(value.time);
        if (!isNaN(sec)) { value.timeAsSeconds = sec; }
      }
    });
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
  profile.getValueByTime = function getValueByTime (time: any, valueType: any, spec_profile: any) {
    if (!time) { time = Date.now(); }

    //round to the minute for better caching
    var minuteTime = Math.round(time / 60000) * 60000;
    var cacheKey = (minuteTime + valueType + spec_profile);
    var returnValue = cache.get(cacheKey);

    if (returnValue) {
      return returnValue;
    }

    // CircadianPercentageProfile support
    var timeshift = 0;
    var percentage = 100;
    // @ts-expect-error TS(2339) FIXME: Property 'activeProfileTreatmentToTime' does not e... Remove this comment to see the full error message
    var activeTreatment = profile.activeProfileTreatmentToTime(time);
    var isCcpProfile = !spec_profile && activeTreatment && activeTreatment.CircadianPercentageProfile;
    if (isCcpProfile) {
      percentage = activeTreatment.percentage;
      timeshift = activeTreatment.timeshift; // in hours
    }
    var offset = timeshift % 24;
    time = time + offset * times.hours(offset).msecs;

    // @ts-expect-error TS(2339) FIXME: Property 'getCurrentProfile' does not exist on typ... Remove this comment to see the full error message
    var valueContainer = profile.getCurrentProfile(time, spec_profile)[valueType];

    // Assumes the timestamps are in UTC
    // Use local time zone if profile doesn't contain a time zone
    // This WILL break on the server; added warnings elsewhere that this is missing
    // TODO: Better warnings to user for missing configuration

    // @ts-expect-error TS(2339) FIXME: Property 'getTimezone' does not exist on type '{}'... Remove this comment to see the full error message
    var t = profile.getTimezone(spec_profile) ? moment(minuteTime).tz(profile.getTimezone(spec_profile)) : moment(minuteTime);

    // Convert to seconds from midnight
    var mmtMidnight = t.clone().startOf('day');
    var timeAsSecondsFromMidnight = t.clone().diff(mmtMidnight, 'seconds');

    // If the container is an Array, assume it's a valid timestamped value container

    returnValue = valueContainer;

    if (Object.prototype.toString.call(valueContainer) === '[object Array]') {
      _.each(valueContainer, function eachValue (value: any) {
        if (timeAsSecondsFromMidnight >= value.timeAsSeconds) {
          returnValue = value.value;
        }
      });
    }

    if (returnValue) {
      returnValue = parseFloat(returnValue);
      if (isCcpProfile) {
        switch (valueType) {
          case "sens":
          case "carbratio":
            returnValue = returnValue * 100 / percentage;
            break;
          case "basal":
            returnValue = returnValue * percentage / 100;
            break;
        }
      }
    }

    cache.put(cacheKey, returnValue, cacheTTL);

    return returnValue;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getCurrentProfile' does not exist on typ... Remove this comment to see the full error message
  profile.getCurrentProfile = function getCurrentProfile (time: any, spec_profile: any) {

    time = time || Date.now();
    var minuteTime = Math.round(time / 60000) * 60000;
    var cacheKey = ("profile" + minuteTime + spec_profile);
    var returnValue = cache.get(cacheKey);

    if (returnValue) {
      return returnValue;
    }

    // @ts-expect-error TS(2339) FIXME: Property 'profileFromTime' does not exist on type ... Remove this comment to see the full error message
    var pdataActive = profile.profileFromTime(time);
    // @ts-expect-error TS(2339) FIXME: Property 'hasData' does not exist on type '{}'.
    var data = profile.hasData() ? pdataActive : null;
    // @ts-expect-error TS(2339) FIXME: Property 'activeProfileToTime' does not exist on t... Remove this comment to see the full error message
    var timeprofile = profile.activeProfileToTime(time);
    returnValue = data && data.store[timeprofile] ? data.store[timeprofile] : {};

    cache.put(cacheKey, returnValue, cacheTTL);
    return returnValue;

  };

  // @ts-expect-error TS(2339) FIXME: Property 'getUnits' does not exist on type '{}'.
  profile.getUnits = function getUnits (spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getCurrentProfile' does not exist on typ... Remove this comment to see the full error message
    var pu = profile.getCurrentProfile(null, spec_profile)['units'] + ' ';
    if (pu.toLowerCase().includes('mmol')) return 'mmol';
    return 'mg/dl';
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getTimezone' does not exist on type '{}'... Remove this comment to see the full error message
  profile.getTimezone = function getTimezone (spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getCurrentProfile' does not exist on typ... Remove this comment to see the full error message
    let rVal =  profile.getCurrentProfile(null, spec_profile)['timezone'];
    // Work around Loop uploading non-ISO compliant time zone string
    if (rVal) rVal.replace('ETC','Etc');
    return rVal;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'hasData' does not exist on type '{}'.
  profile.hasData = function hasData () {
    // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
    return profile.data ? true : false;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getDIA' does not exist on type '{}'.
  profile.getDIA = function getDIA (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'dia', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getSensitivity' does not exist on type '... Remove this comment to see the full error message
  profile.getSensitivity = function getSensitivity (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'sens', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getCarbRatio' does not exist on type '{}... Remove this comment to see the full error message
  profile.getCarbRatio = function getCarbRatio (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'carbratio', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getCarbAbsorptionRate' does not exist on... Remove this comment to see the full error message
  profile.getCarbAbsorptionRate = function getCarbAbsorptionRate (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'carbs_hr', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getLowBGTarget' does not exist on type '... Remove this comment to see the full error message
  profile.getLowBGTarget = function getLowBGTarget (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'target_low', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getHighBGTarget' does not exist on type ... Remove this comment to see the full error message
  profile.getHighBGTarget = function getHighBGTarget (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'target_high', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getBasal' does not exist on type '{}'.
  profile.getBasal = function getBasal (time: any, spec_profile: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'getValueByTime' does not exist on type '... Remove this comment to see the full error message
    return profile.getValueByTime(Number(time), 'basal', spec_profile);
  };

  // @ts-expect-error TS(2339) FIXME: Property 'updateTreatments' does not exist on type... Remove this comment to see the full error message
  profile.updateTreatments = function updateTreatments (profiletreatments: any, tempbasaltreatments: any, combobolustreatments: any) {

    // @ts-expect-error TS(2339) FIXME: Property 'profiletreatments' does not exist on typ... Remove this comment to see the full error message
    profile.profiletreatments = profiletreatments || [];
    // @ts-expect-error TS(2339) FIXME: Property 'tempbasaltreatments' does not exist on t... Remove this comment to see the full error message
    profile.tempbasaltreatments = tempbasaltreatments || [];

    // dedupe temp basal events    
    // @ts-expect-error TS(2339) FIXME: Property 'tempbasaltreatments' does not exist on t... Remove this comment to see the full error message
    profile.tempbasaltreatments = _.uniqBy(profile.tempbasaltreatments, 'mills');

    // @ts-expect-error TS(2339) FIXME: Property 'tempbasaltreatments' does not exist on t... Remove this comment to see the full error message
    _.each(profile.tempbasaltreatments, function addDuration (t: any) {
      t.endmills = t.mills + times.mins(t.duration || 0).msecs;
    });

    // @ts-expect-error TS(2339) FIXME: Property 'tempbasaltreatments' does not exist on t... Remove this comment to see the full error message
    profile.tempbasaltreatments.sort(function compareTreatmentMills (a: any, b: any) {
      return a.mills - b.mills;
    });

    // @ts-expect-error TS(2339) FIXME: Property 'combobolustreatments' does not exist on ... Remove this comment to see the full error message
    profile.combobolustreatments = combobolustreatments || [];

    cache.clear();
  };

  // @ts-expect-error TS(2339) FIXME: Property 'activeProfileToTime' does not exist on t... Remove this comment to see the full error message
  profile.activeProfileToTime = function activeProfileToTime (time: any) {
    // @ts-expect-error TS(2339) FIXME: Property 'hasData' does not exist on type '{}'.
    if (profile.hasData()) {
      time = Number(time) || new Date().getTime();
      
      // @ts-expect-error TS(2339) FIXME: Property 'profileFromTime' does not exist on type ... Remove this comment to see the full error message
      var pdataActive = profile.profileFromTime(time);
      var timeprofile = pdataActive.defaultProfile;
      // @ts-expect-error TS(2339) FIXME: Property 'activeProfileTreatmentToTime' does not e... Remove this comment to see the full error message
      var treatment = profile.activeProfileTreatmentToTime(time);

      if (treatment && pdataActive.store && pdataActive.store[treatment.profile]) {
        timeprofile = treatment.profile;
      }
      return timeprofile;
    }
    return null;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'activeProfileTreatmentToTime' does not e... Remove this comment to see the full error message
  profile.activeProfileTreatmentToTime = function activeProfileTreatmentToTime (time: any) {
    
    var minuteTime = Math.round(time / 60000) * 60000;
    var cacheKey = 'profileCache' + minuteTime;
    var returnValue = cache.get(cacheKey);

    if (returnValue) {
      return returnValue;
    }

    var treatment = null;
    // @ts-expect-error TS(2339) FIXME: Property 'hasData' does not exist on type '{}'.
    if (profile.hasData()) {
      // @ts-expect-error TS(2339) FIXME: Property 'profileFromTime' does not exist on type ... Remove this comment to see the full error message
      var pdataActive = profile.profileFromTime(time);
        // @ts-expect-error TS(2339) FIXME: Property 'profiletreatments' does not exist on typ... Remove this comment to see the full error message
        profile.profiletreatments.forEach(function eachTreatment(t: any) {
          if (time >= t.mills && t.mills >= pdataActive.mills) {
              var duration = times.mins(t.duration || 0).msecs;
              if (duration != 0 && time < t.mills + duration) {
                  treatment = t;
                  // if profile switch contains json of profile inject it in to store to be findable by profile name
                  if (treatment.profileJson && !pdataActive.store[treatment.profile]) {
                    if (treatment.profile.indexOf("@@@@@") < 0)
                      treatment.profile += "@@@@@" + treatment.mills;
                    let json = JSON.parse(treatment.profileJson);
                    pdataActive.store[treatment.profile] = json;
                  }
              }
              if (duration == 0) {
                treatment = t;
                // if profile switch contains json of profile inject it in to store to be findable by profile name
                if (treatment.profileJson && !pdataActive.store[treatment.profile]) {
                    if (treatment.profile.indexOf("@@@@@") < 0)
                      treatment.profile += "@@@@@" + treatment.mills;
                  let json = JSON.parse(treatment.profileJson);
                  pdataActive.store[treatment.profile] = json;
                }
              }
          }
      });
    }

    returnValue = treatment;
    cache.put(cacheKey, returnValue, cacheTTL);
    return returnValue;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'profileSwitchName' does not exist on typ... Remove this comment to see the full error message
  profile.profileSwitchName = function profileSwitchName (name: any) {
    var index = name.indexOf("@@@@@");
    if (index < 0) return name;
    else return name.substring(0, index);
  }

  // @ts-expect-error TS(2339) FIXME: Property 'profileFromTime' does not exist on type ... Remove this comment to see the full error message
  profile.profileFromTime = function profileFromTime (time: any) {
      var profileData = null;

      // @ts-expect-error TS(2339) FIXME: Property 'hasData' does not exist on type '{}'.
      if (profile.hasData()) {
          // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
          profileData = profile.data[0];
          // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
          for (var i = 0; i < profile.data.length; i++)
          {
              // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
              if (Number(time) >= Number(profile.data[i].mills)) {
                  // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
                  profileData = profile.data[i];
                  break;
              }
          }
      }

      return profileData;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'tempBasalTreatment' does not exist on ty... Remove this comment to see the full error message
  profile.tempBasalTreatment = function tempBasalTreatment (time: any) {

    // Most queries for the data in reporting will match the latest found value, caching that hugely improves performance
    if (prevBasalTreatment && time >= prevBasalTreatment.mills && time <= prevBasalTreatment.endmills) {
      return prevBasalTreatment;
    }

    // Binary search for events for O(log n) performance
    var first = 0
      // @ts-expect-error TS(2339) FIXME: Property 'tempbasaltreatments' does not exist on t... Remove this comment to see the full error message
      , last = profile.tempbasaltreatments.length - 1;

    while (first <= last) {
      var i = first + Math.floor((last - first) / 2);
      // @ts-expect-error TS(2339) FIXME: Property 'tempbasaltreatments' does not exist on t... Remove this comment to see the full error message
      var t = profile.tempbasaltreatments[i];
      if (time >= t.mills && time <= t.endmills) {
        prevBasalTreatment = t;
        return t;
      }
      if (time < t.mills) {
        last = i - 1;
      } else {
        first = i + 1;
      }
    }

    return null;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'comboBolusTreatment' does not exist on t... Remove this comment to see the full error message
  profile.comboBolusTreatment = function comboBolusTreatment (time: any) {
    var treatment = null;
    // @ts-expect-error TS(2339) FIXME: Property 'combobolustreatments' does not exist on ... Remove this comment to see the full error message
    profile.combobolustreatments.forEach(function eachTreatment (t: any) {
      var duration = times.mins(t.duration || 0).msecs;
      if (time < t.mills + duration && time > t.mills) {
        treatment = t;
      }
    });
    return treatment;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'getTempBasal' does not exist on type '{}... Remove this comment to see the full error message
  profile.getTempBasal = function getTempBasal (time: any, spec_profile: any) {

    var minuteTime = Math.round(time / 60000) * 60000;
    var cacheKey = 'basalCache' + minuteTime + spec_profile;
    var returnValue = cache.get(cacheKey);

    if (returnValue) {
      return returnValue;
    }

    // @ts-expect-error TS(2339) FIXME: Property 'getBasal' does not exist on type '{}'.
    var basal = profile.getBasal(time, spec_profile);
    var tempbasal = basal;
    var combobolusbasal = 0;
    // @ts-expect-error TS(2339) FIXME: Property 'tempBasalTreatment' does not exist on ty... Remove this comment to see the full error message
    var treatment = profile.tempBasalTreatment(time);
    // @ts-expect-error TS(2339) FIXME: Property 'comboBolusTreatment' does not exist on t... Remove this comment to see the full error message
    var combobolustreatment = profile.comboBolusTreatment(time);

    //special handling for absolute to support temp to 0
    if (treatment && !isNaN(treatment.absolute) && treatment.duration > 0) {
      tempbasal = Number(treatment.absolute);
    } else if (treatment && treatment.percent) {
      tempbasal = basal * (100 + treatment.percent) / 100;
    }
    if (combobolustreatment && combobolustreatment.relative) {
      combobolusbasal = combobolustreatment.relative;
    }
    returnValue = {
      basal: basal
      , treatment: treatment
      , combobolustreatment: combobolustreatment
      , tempbasal: tempbasal
      , combobolusbasal: combobolusbasal
      , totalbasal: tempbasal + combobolusbasal
    };
    cache.put(cacheKey, returnValue, cacheTTL);
    return returnValue;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'listBasalProfiles' does not exist on typ... Remove this comment to see the full error message
  profile.listBasalProfiles = function listBasalProfiles () {
    var profiles = [];
    // @ts-expect-error TS(2339) FIXME: Property 'hasData' does not exist on type '{}'.
    if (profile.hasData()) {
      // @ts-expect-error TS(2339) FIXME: Property 'activeProfileToTime' does not exist on t... Remove this comment to see the full error message
      var current = profile.activeProfileToTime();
      profiles.push(current);

      // @ts-expect-error TS(2339) FIXME: Property 'data' does not exist on type '{}'.
      Object.keys(profile.data[0].store).forEach(key => {
        if (key !== current && key.indexOf('@@@@@') < 0) profiles.push(key);
      })
    }
    return profiles;
  };

  // @ts-expect-error TS(2339) FIXME: Property 'loadData' does not exist on type '{}'.
  if (profileData) { profile.loadData(profileData); }
  // init treatments array
  // @ts-expect-error TS(2339) FIXME: Property 'updateTreatments' does not exist on type... Remove this comment to see the full error message
  profile.updateTreatments([], []);

  return profile;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
