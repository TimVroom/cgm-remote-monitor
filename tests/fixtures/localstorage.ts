'use strict';

var browserStorage: any = [];

var localstorage = {
      get: function Get(item: any) {
        return browserStorage[item] || null;
    }
    , getItem: function Get(item: any) {
        return browserStorage[item] || null;
    }
    , set: function Set(item: any, value: any) {
        browserStorage[item] = value;
    }
    , setItem: function Set(item: any, value: any) {
        browserStorage[item] = value;
    }
    , remove: function Remove(item: any) {
        delete browserStorage[item];
    }
    , removeItem: function Remove(item: any) {
        delete browserStorage[item];
    }
    , removeAll: function RemoveAll() {
        browserStorage = [];
    }
};

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = localstorage;