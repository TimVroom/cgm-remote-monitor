// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'should'.
const should = require('should');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'defaultVal... Remove this comment to see the full error message
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
    predictedTruncate: true
};

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('reportstorage unit tests', () => {
    let reportstorage: any, storage, mockStorage: any;

    // @ts-expect-error TS(2552): Cannot find name 'beforeEach'. Did you mean '_forE... Remove this comment to see the full error message
    beforeEach(() => {
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        reportstorage = require('../lib/report/reportstorage');
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        storage = require('js-storage').localStorage;
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        mockStorage = require('./fixtures/localstorage');
        storage.get = mockStorage.get;
        storage.set = mockStorage.set;
    });

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        delete require.cache[require.resolve('js-storage')];
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        delete require.cache[require.resolve('./fixtures/localstorage')];
        // @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
        delete require.cache[require.resolve('../lib/report/reportstorage')];
    });

    // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reportstorage definition - returns saveProps and getValue function', () => {
        reportstorage.should.not.be.undefined();
        // @ts-expect-error TS(2339): Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
        (reportstorage.getValue instanceof Function).should.be.true();
        // @ts-expect-error TS(2339): Property 'should' does not exist on type 'boolean'... Remove this comment to see the full error message
        (reportstorage.saveProps instanceof Function).should.be.true();
    });

    // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reportstorage.getValue returns default properties', () => {
        let keyCount = 0;
        for (const v in defaultValues) {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            reportstorage.getValue(v).should.equal(defaultValues[v]);
            keyCount++;
        }
        // @ts-expect-error TS(2339): Property 'should' does not exist on type 'number'.
        keyCount.should.equal(Object.keys(defaultValues).length);
    });

    // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reportstorage.saveProps sets property in localstorage', () => {
        reportstorage.saveProps({insulin: false});
        should.exist(mockStorage.get('reportProperties'));
        mockStorage.get('reportProperties').insulin.should.be.false();
    });

    // @ts-expect-error TS(2593): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('reportstorage.saveProps ignores property not tracked', () => {
        reportstorage.saveProps({foo: 'bar'});
        should.exist(mockStorage.get('reportProperties'));
        should.not.exist(mockStorage.get('reportProperties').foo);
    });
});
