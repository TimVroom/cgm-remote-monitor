'use strict;'

import path from 'path';
// const path = require('path');
import crypto from 'crypto';
import jwt, {JwtPayload} from 'jsonwebtoken';
import fs from 'fs';

// this is a class for holding potentially sensitive data in the app
// the class also implement functions to use the data, so the data is not shared outside the class

const init = function init() {

    const secrets = {};
    const apiKey = Symbol('api-secret');
    const apiKeySHA1 = Symbol('api-secretSHA1');
    const apiKeySHA512 = Symbol('api-secretSHA512');
    const jwtKey = Symbol('jwtkey');

    function readKey(filename: string) {
        const filePath = path.resolve(__dirname + '/../../node_modules/.cache/_ns_cache/' + filename);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        if (fs.existsSync(filePath)) {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            return fs.readFileSync(filePath).toString().trim();
        }
        console.error('Key file ', filePath, 'not found');
        return null;
    }

    secrets[jwtKey] = readKey('randomString');

    function genHash(data: string, algorihtm: string) {
        const hash = crypto.createHash(algorihtm);
        hash.update(data, 'utf-8');
        return hash.digest('hex').toLowerCase();
    }

    return {
        setApiKey: function (keyValue: string) {
            if (keyValue.length < 12) return;
            secrets[apiKey] = keyValue;
            secrets[apiKeySHA1] = genHash(keyValue, 'sha1');
            secrets[apiKeySHA512] = genHash(keyValue, 'sha512');
        },
        isApiKeySet: function isApiKeySet() {
            return isApiKeySet;
        },
        isApiKey: function (keyValue: string) {
            return keyValue.toLowerCase() == secrets[apiKeySHA1] || keyValue == secrets[apiKeySHA512];
        },
        setJWTKey: function (keyValue: string) {
            secrets[jwtKey] = keyValue;
        },
        signJWT: function (token: string, lifetime: string | number) {
            const lt = lifetime ? lifetime : '8h';
            return jwt.sign(token, secrets[jwtKey], {expiresIn: lt});
        },
        verifyJWT: function (tokenString: string): JwtPayload | string | null {
            try {
                return jwt.verify(tokenString, secrets[jwtKey]);
            } catch (err) {
                return null;
            }
        },
        getSubjectHash: function (id: crypto.BinaryLike): string {
            const shasum = crypto.createHash('sha1');
            shasum.update(secrets[apiKeySHA1]);
            shasum.update(id);
            return shasum.digest('hex').toLowerCase();
        }
    };
}

module.exports = init();
