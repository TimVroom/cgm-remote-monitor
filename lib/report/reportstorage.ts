// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const storage = require('js-storage').localStorage;
const COOKIE_KEY = 'reportProperties';
const defaultValues = {
    insulin: true,
    carbs: true,
    basal: true,
    notes: false,
    food: true,
    raw: false,
    iob: false,
    cob: false,
    predicted: false,
    openAps: false,
    insulindistribution: true,
    predictedTruncate: true,
    bgcheck: true,
    othertreatments: false
};
let cachedProps: any;

const saveProps = function (props: any) {
    let propsToSave = {};
    for (const prop in props) {
        if (!Object.prototype.hasOwnProperty.call(defaultValues, prop))
            continue;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        propsToSave[prop] = props[prop];
    }
    storage.set(COOKIE_KEY, propsToSave);
};

const getValue = function (p: any) {
    if (!cachedProps)
        cachedProps = storage.get(COOKIE_KEY) || defaultValues;
    return cachedProps[p];
};

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {saveProps: saveProps, getValue: getValue};
