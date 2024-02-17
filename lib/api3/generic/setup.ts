'use strict';

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'dateTools'... Remove this comment to see the full error message
  , dateTools = require('../shared/dateTools')
  // @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Collection... Remove this comment to see the full error message
  , Collection = require('./collection')
  ;


function fallbackDate (doc: any) {
  const m = dateTools.parseToMoment(doc.date);
  return m == null || !m.isValid()
    ? null
    : m.toDate();
}


function fallbackCreatedAt (doc: any) {
  const m = dateTools.parseToMoment(doc.created_at);
  return m == null || !m.isValid()
    ? null
    : m.toDate();
}


function setupGenericCollections (ctx: any, env: any, app: any) {
  const cols = { }
    , enabledCols = app.get('enabledCollections');

  if (_.includes(enabledCols, 'devicestatus')) {
    // @ts-expect-error TS(2339) FIXME: Property 'devicestatus' does not exist on type '{}... Remove this comment to see the full error message
    cols.devicestatus = new Collection({
      ctx, env, app,
      colName: 'devicestatus',
      storageColName: env.devicestatus_collection || 'devicestatus',
      fallbackGetDate: fallbackCreatedAt,
      dedupFallbackFields: ['created_at', 'device'],
      fallbackDateField: 'created_at'
    });
  }

  // @ts-expect-error TS(7009) 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
  const entriesCollection = new Collection({
    ctx, env, app,
    colName: 'entries',
    storageColName: env.entries_collection || 'entries',
    fallbackGetDate: fallbackDate,
    dedupFallbackFields: ['date', 'type'],
    fallbackDateField: 'date'
  });
  app.set('entriesCollection', entriesCollection);

  if (_.includes(enabledCols, 'entries')) {
    // @ts-expect-error TS(2339) FIXME: Property 'entries' does not exist on type '{}'.
    cols.entries = entriesCollection;
  }

  if (_.includes(enabledCols, 'food')) {
    // @ts-expect-error TS(2339) FIXME: Property 'food' does not exist on type '{}'.
    cols.food = new Collection({
      ctx, env, app,
      colName: 'food',
      storageColName: env.food_collection || 'food',
      fallbackGetDate: fallbackCreatedAt,
      dedupFallbackFields: ['created_at'],
      fallbackDateField: 'created_at'
    });
  }

  if (_.includes(enabledCols, 'profile')) {
    // @ts-expect-error TS(2339) FIXME: Property 'profile' does not exist on type '{}'.
    cols.profile = new Collection({
      ctx, env, app,
      colName: 'profile',
      storageColName: env.profile_collection || 'profile',
      fallbackGetDate: fallbackCreatedAt,
      dedupFallbackFields: ['created_at'],
      fallbackDateField: 'created_at'
    });
  }

  if (_.includes(enabledCols, 'settings')) {
    // @ts-expect-error TS(2339) FIXME: Property 'settings' does not exist on type '{}'.
    cols.settings = new Collection({
      ctx, env, app,
      colName: 'settings',
      storageColName: env.settings_collection || 'settings'
    });
  }

  if (_.includes(enabledCols, 'treatments')) {
    // @ts-expect-error TS(2339) FIXME: Property 'treatments' does not exist on type '{}'.
    cols.treatments = new Collection({
      ctx, env, app,
      colName: 'treatments',
      storageColName: env.treatments_collection || 'treatments',
      fallbackGetDate: fallbackCreatedAt,
      dedupFallbackFields: ['created_at', 'eventType'],
      fallbackDateField: 'created_at'
    });
  }

  _.forOwn(cols, function forMember (col: any) {
    col.mapRoutes();
  });

  app.set('collections', cols);
}


// @ts-expect-error TS(2591) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = setupGenericCollections;
