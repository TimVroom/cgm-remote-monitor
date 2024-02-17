'use strict';

// @ts-expect-error TS(2300): Duplicate identifier 'configure'.
function configure (env: any, ctx: any) {
  // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
  const _ = require('lodash')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , basalProcessor = require('./basaldataprocessor')
    // @ts-expect-error TS(2591) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
    , express = require('express')
    , api = express.Router();

  const defaultHours = 6;

  api.use(ctx.wares.compression());

  function removeProps(obj: any,keys: any){
    if(Array.isArray(obj)){
      obj.forEach(function(item){
        removeProps(item,keys)
      });
    }
    else if(typeof obj === 'object' && obj != null){
      Object.getOwnPropertyNames(obj).forEach(function(key){
        if(keys.indexOf(key) !== -1)delete obj[key];
        else removeProps(obj[key],keys);
      });
    }
  }

  function processSGVs(sgvs: any, hours: any) {

    const bgData = [];
    const dataCap = Date.now() - (hours * 60 * 60 * 1000);

    for (let i = 0; i < sgvs.length; i++) {
        const bg = sgvs[i];
        if (bg.mills >= dataCap) {

          let item = {
            sgv: bg.mgdl
            , mills: bg.mills
          };

          // only push noise data if there is noise
          // @ts-expect-error TS(2339) FIXME: Property 'noise' does not exist on type '{ sgv: an... Remove this comment to see the full error message
          if (bg.noise != 1) { item.noise = bg.noise; }
          bgData.push(item);

        }
    }
     return bgData;
    }

  // Collect treatments that contain insulin or carbs, temp basals
  function processTreatments(treatments: any, profile: any, hours: any) {

    const rVal = {
        tempBasals: [],
        treatments: [],
        targets: []
    };

    let _temps = [];
    const dataCap = Date.now() - (hours * 60 * 60 * 1000);

    for (let i = 0; i < treatments.length; i++) {
        const t = treatments[i];

        if (t.eventType == 'Temp Basal') {
            _temps.push(t);
            continue;
        }
        if (t.eventType == 'Temporary Target') {
          // @ts-expect-error TS(2345)
          rVal.targets.push({
            targetTop: Math.round(t.targetTop),
            targetBottom: Math.round(t.targetBottom),
            duration: t.duration*60,
            mills: t.mills
          });
          continue;
      }

        if (t.insulin || t.carbs) {
            if (t.mills >= dataCap) {
              const _t = {
                  mills: t.mills
              };
              // @ts-expect-error TS(2339) FIXME: Property 'carbs' does not exist on type '{ mills: ... Remove this comment to see the full error message
              if (!isNaN(t.carbs)) _t.carbs = t.carbs;
              // @ts-expect-error TS(2339) FIXME: Property 'insulin' does not exist on type '{ mills... Remove this comment to see the full error message
              if (!isNaN(t.insulin)) _t.insulin = t.insulin;
              // @ts-expect-error TS(2345) FIXME: Argument of type '{ mills: any; }' is not assignab... Remove this comment to see the full error message
              rVal.treatments.push(_t);
            }
            continue;
        }
    }

    rVal.tempBasals = basalProcessor.processTempBasals(profile,_temps, dataCap);

    return rVal;
  }

  function constructState() {

    const p = _.get(ctx, 'sbx.properties');

    const state = {
        iob: Math.round(_.get(p,'iob.iob')*100)/100,
        cob: Math.round(_.get(p,'cob.cob')),
        bwp: Math.round(_.get(p,'bwp.bolusEstimate')*100)/100,
        cage: _.get(p,'cage.age'),
        sage: _.get(p,'sage.age'),
        iage: _.get(p,'iage.age'),
        bage: _.get(p,'bage.age'),        
        battery: _.get(p,'upbat.level')
    }
     return state; 
    }

  api.get('/', ctx.authorization.isPermitted('api:*:read'), function (req: any, res: any) {

    const hours = req.query.hours || defaultHours;
    const sgvs = processSGVs(ctx.ddata.sgvs, hours);
    const profile = _.clone(ctx.sbx.data.profile.getCurrentProfile());
    removeProps(profile,['timeAsSeconds']);
    const treatments = processTreatments(ctx.ddata.treatments, profile, hours);
    const state = constructState();

    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify({
      sgvs,
      treatments,
      profile,
      state
  }));
    res.end( );
  });

  return api;
}
// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = configure;
