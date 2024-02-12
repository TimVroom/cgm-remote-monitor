'use strict';

import createDOMPurify from 'dompurify';
import {JSDOM} from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function init() {
    function iterate(obj: object) {
        for (const property in obj) {
            if (property in obj) {
                if (typeof obj[property] == 'object')
                    iterate(obj[property]);
                else if (isNaN(obj[property])) {
                    const clean = DOMPurify.sanitize(obj[property]);
                    if (obj[property] !== clean) {
                        obj[property] = clean;
                    }
                }
            }
        }
    }

    return {
        purifyObject: iterate
    };
}

module.exports = init();
