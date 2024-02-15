'use strict';

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'request'.
  , request = require('supertest')
  ;
// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
require('should');

function createRole (authStorage: any, name: any, permissions: any) {

  return new Promise((resolve, reject) => {

    let role = _.find(authStorage.roles, { name });

    if (role) {
      resolve(role);
    }
    else {
      authStorage.createRole({
        "name": name,
        "permissions": permissions,
        "notes": ""
      }, function afterCreate (err: any) {

        if (err)
          reject(err);

        role = _.find(authStorage.roles, { name });
        resolve(role);
      });
    }
  });
}


function createTestSubject (authStorage: any, subjectName: any, roles: any) {

  return new Promise((resolve, reject) => {

    const subjectDbName = 'test-' + subjectName;
    let subject = _.find(authStorage.subjects, { name: subjectDbName });

    if (subject) {
      resolve(subject);
    }
    else {
      authStorage.createSubject({
        "name": subjectDbName,
        "roles": roles,
        "notes": ""
      }, function afterCreate (err: any) {

        if (err)
          reject(err);

        subject = _.find(authStorage.subjects, { name: subjectDbName });
        resolve(subject);
      });
    }
  });
}


async function initJwts (accessToken: any, tokensNeeded: any, app: any) {
  const jwt = {}
  if (!_.isArray(tokensNeeded) || !app)
    return jwt;

  for (const tokenNeeded of tokensNeeded) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    jwt[tokenNeeded] = await new Promise((resolve, reject) => {
      try {
        const authToken = accessToken[tokenNeeded];

        request(app)
          .get(`/api/v2/authorization/request/${authToken}`)
          .expect(200)
          .end(function(err: any, res: any) {
            if (err)
              reject(err);

            resolve(res.body.token);
          });
      }
      catch (e) {
        reject(e)
      }
    })
  }

  return jwt;
}


async function authSubject (authStorage: any, tokensNeeded: any, app: any) {

  await createRole(authStorage, 'admin', '*');
  await createRole(authStorage, 'readable', '*:*:read');
  await createRole(authStorage, 'apiAll', 'api:*:*');
  await createRole(authStorage, 'apiAdmin', 'api:*:admin');
  await createRole(authStorage, 'apiCreate', 'api:*:create');
  await createRole(authStorage, 'apiRead', 'api:*:read');
  await createRole(authStorage, 'apiUpdate', 'api:*:update');
  await createRole(authStorage, 'apiDelete', 'api:*:delete');
  await createRole(authStorage, 'noneRole', '');

  const subject = {
    apiAll: await createTestSubject(authStorage, 'apiAll', ['apiAll']),
    apiAdmin: await createTestSubject(authStorage, 'apiAdmin', ['apiAdmin']),
    apiCreate: await createTestSubject(authStorage, 'apiCreate', ['apiCreate']),
    apiRead: await createTestSubject(authStorage, 'apiRead', ['apiRead']),
    apiUpdate: await createTestSubject(authStorage, 'apiUpdate', ['apiUpdate']),
    apiDelete: await createTestSubject(authStorage, 'apiDelete', ['apiDelete']),
    admin: await createTestSubject(authStorage, 'admin', ['admin']),
    readable: await createTestSubject(authStorage, 'readable', ['readable']),
    denied: await createTestSubject(authStorage, 'denied', ['denied']),
    noneSubject: await createTestSubject(authStorage, 'noneSubject', null),
    noneRole: await createTestSubject(authStorage, 'noneRole', ['noneRole'])
  };

  const accessToken = {
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    all: subject.apiAll.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    admin: subject.apiAdmin.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    create: subject.apiCreate.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    read: subject.apiRead.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    update: subject.apiUpdate.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    delete: subject.apiDelete.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    denied: subject.denied.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    adminAll: subject.admin.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    readable: subject.readable.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    noneSubject: subject.noneSubject.accessToken,
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    noneRole: subject.noneRole.accessToken
  };

  const jwt = await initJwts(accessToken, tokensNeeded, app);

  return {subject, accessToken, jwt};
}

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = authSubject;
