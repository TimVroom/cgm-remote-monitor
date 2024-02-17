'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash');

// @ts-expect-error TS(2300) FIXME: Duplicate identifier 'init'.
function init (ctx: any) {

  const adminnotifies = {};

  // @ts-expect-error TS(2339) FIXME: Property 'addNotify' does not exist on type '{}'.
  adminnotifies.addNotify = function addnotify (notify: any) {
    if (!ctx.settings.adminNotifiesEnabled) {
      console.log('Admin notifies disabled, skipping notify', notify);
      return;
    }

    if (!notify) return;

    notify.title = notify.title || 'No title';
    notify.message = notify.message || 'No message';

    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    const existingMessage = _.find(adminnotifies.notifies, function findExisting (obj: any) {
      return obj.message == notify.message;
    });

    if (existingMessage) {
      existingMessage.count += 1;
      existingMessage.lastRecorded = Date.now();
    } else {
      notify.count = 1;
      notify.lastRecorded = Date.now();
      // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
      adminnotifies.notifies.push(notify);
    }
  }

  // @ts-expect-error TS(2339) FIXME: Property 'getNotifies' does not exist on type '{}'... Remove this comment to see the full error message
  adminnotifies.getNotifies = function getNotifies () {
    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    return adminnotifies.notifies;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'addNotify' does not exist on type '{}'.
  ctx.bus.on('admin-notify', adminnotifies.addNotify);

  // @ts-expect-error TS(2339) FIXME: Property 'clean' does not exist on type '{}'.
  adminnotifies.clean = function cleanNotifies () {
    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    adminnotifies.notifies = _.filter(adminnotifies.notifies, function findExisting (obj: any) {
      return obj.persistent || ((Date.now() - obj.lastRecorded) < 1000 * 60 * 60 * 12);
    });
  }

  // @ts-expect-error TS(2339) FIXME: Property 'cleanAll' does not exist on type '{}'.
  adminnotifies.cleanAll = function cleanAll() {
    // @ts-expect-error TS(2339) FIXME: Property 'notifies' does not exist on type '{}'.
    adminnotifies.notifies = [];
  }

  // @ts-expect-error TS(2339) FIXME: Property 'cleanAll' does not exist on type '{}'.
  adminnotifies.cleanAll();

  // @ts-expect-error TS(2339) FIXME: Property 'clean' does not exist on type '{}'.
  ctx.bus.on('tick', adminnotifies.clean);

  return adminnotifies;
}

// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = init;
