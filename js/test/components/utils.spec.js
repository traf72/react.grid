'use strict';

import utils from '../../src/components/utils.js';
import {expect} from 'chai';

describe("Utils test", () => {
    it("Test isObjectsEquals", () => {
        expect(utils.isObjectsEquals(null, null)).to.be.true;
        expect(utils.isObjectsEquals(undefined, undefined)).to.be.true;
        expect(utils.isObjectsEquals(undefined, null)).to.be.false;
        expect(utils.isObjectsEquals(null, undefined)).to.be.false;
        expect(utils.isObjectsEquals(null, {})).to.be.false;
        expect(utils.isObjectsEquals({}, null)).to.be.false;
        expect(utils.isObjectsEquals(undefined, {})).to.be.false;
        expect(utils.isObjectsEquals({}, undefined)).to.be.false;
        expect(utils.isObjectsEquals('1', '1')).to.be.true;
        expect(utils.isObjectsEquals(1, 1)).to.be.true;
        expect(utils.isObjectsEquals('1', '2')).to.be.false;
        expect(utils.isObjectsEquals(1, 2)).to.be.false;
        expect(utils.isObjectsEquals([], [])).to.be.false;
        expect(utils.isObjectsEquals({}, [])).to.be.false;
        expect(utils.isObjectsEquals([], {})).to.be.false;
        expect(utils.isObjectsEquals({}, {})).to.be.true;
        expect(utils.isObjectsEquals(NaN, NaN)).to.be.false;
        expect(utils.isObjectsEquals(NaN, {})).to.be.false;
        expect(utils.isObjectsEquals({}, NaN)).to.be.false;
        expect(utils.isObjectsEquals({a: '1'}, {a: '1'})).to.be.true;
        expect(utils.isObjectsEquals({a: '1', b: 2}, {a: '1', b: 2})).to.be.true;
        expect(utils.isObjectsEquals({a: '1', b: 2}, {a: '1', b: 3})).to.be.false;
    });
});