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

    it("Test isNumber", () => {
        expect(utils.isNumber(0)).to.be.true;
        expect(utils.isNumber(-0)).to.be.true;
        expect(utils.isNumber(+0)).to.be.true;
        expect(utils.isNumber(1)).to.be.true;
        expect(utils.isNumber(-1)).to.be.true;
        expect(utils.isNumber(1.1543)).to.be.true;
        expect(utils.isNumber(-1.1543)).to.be.true;
        expect(utils.isNumber('0')).to.be.true;
        expect(utils.isNumber('+0')).to.be.true;
        expect(utils.isNumber('-0')).to.be.true;
        expect(utils.isNumber('1')).to.be.true;
        expect(utils.isNumber('-1')).to.be.true;
        expect(utils.isNumber('1.1543')).to.be.true;
        expect(utils.isNumber('-1.1543')).to.be.true;
        expect(utils.isNumber('-1,1543')).to.be.false;
        expect(utils.isNumber('1w')).to.be.false;
        expect(utils.isNumber('-1w')).to.be.false;
        expect(utils.isNumber('-1.1543w')).to.be.false;
        expect(utils.isNumber('-1.1543w')).to.be.false;
        expect(utils.isNumber(Number.NEGATIVE_INFINITY)).to.be.false;
        expect(utils.isNumber(Number.POSITIVE_INFINITY)).to.be.false;
        expect(utils.isNumber(Number.NaN)).to.be.false;
        expect(utils.isNumber(null)).to.be.false;
        expect(utils.isNumber(undefined)).to.be.false;
        expect(utils.isNumber({})).to.be.false;
        expect(utils.isNumber([])).to.be.false;
    });

    it("Test normalizeNumber", () => {
        expect(utils.normalizeNumber(0)).to.be.equal(0);
        expect(utils.normalizeNumber(+0)).to.be.equal(0);
        expect(utils.normalizeNumber(-0)).to.be.equal(0);
        expect(utils.normalizeNumber(1)).to.be.equal(1);
        expect(utils.normalizeNumber(-1)).to.be.equal(-1);
        expect(utils.normalizeNumber(1.1543)).to.be.equal(1.1543);
        expect(utils.normalizeNumber(-1.1543)).to.be.equal(-1.1543);
        expect(utils.normalizeNumber(Number.NEGATIVE_INFINITY)).to.be.equal(Number.NEGATIVE_INFINITY);
        expect(utils.normalizeNumber(Number.POSITIVE_INFINITY)).to.be.equal(Number.POSITIVE_INFINITY);
        expect(utils.normalizeNumber(Number.NaN)).to.be.NaN;
        expect(utils.normalizeNumber(null)).to.be.null;
        expect(utils.normalizeNumber(undefined)).to.be.undefined;

        const obj = {};
        expect(utils.normalizeNumber(obj)).to.be.equal(obj);

        const array = [];
        expect(utils.normalizeNumber(array)).to.be.equal(array);

        expect(utils.normalizeNumber('0')).to.be.equal('0');
        expect(utils.normalizeNumber('+0')).to.be.equal('+0');
        expect(utils.normalizeNumber('-0')).to.be.equal('-0');
        expect(utils.normalizeNumber('1')).to.be.equal('1');
        expect(utils.normalizeNumber('-1')).to.be.equal('-1');
        expect(utils.normalizeNumber('1.1543')).to.be.equal('1.1543');
        expect(utils.normalizeNumber('-1.1543')).to.be.equal('-1.1543');
        expect(utils.normalizeNumber('-1,1543')).to.be.equal('-1.1543');
        expect(utils.normalizeNumber('-1 000 000,10')).to.be.equal('-1000000.10');
        expect(utils.normalizeNumber('1 000 0,00,10')).to.be.equal('10000.00.10');
        expect(utils.normalizeNumber('100 0,00.10')).to.be.equal('1000.00.10');
    });

    it("Test splitStringWithEscaping", () => {
        expect(utils.splitStringWithEscaping('one|two|three', '|')).to.deep.equal(['one', 'two', 'three']);
        expect(utils.splitStringWithEscaping('one', '|')).to.deep.equal(['one']);
        expect(utils.splitStringWithEscaping('one|two|three', '|', '\\')).to.deep.equal(['one', 'two', 'three']);
        expect(utils.splitStringWithEscaping('one|two\\|three', '|', '\\')).to.deep.equal(['one', 'two|three']);
        expect(utils.splitStringWithEscaping('one\\|two\\|three', '|', '\\')).to.deep.equal(['one|two|three']);
        expect(utils.splitStringWithEscaping('\\one\\|two\\2|three', '|', '\\')).to.deep.equal(['\\one|two\\2', 'three']);
        expect(utils.splitStringWithEscaping('|one|two\\|three\\\\|four|five|', '|', '\\')).to.deep.equal(['', 'one', 'two|three\\|four', 'five', '']);
        expect(utils.splitStringWithEscaping('\\|\\|', '|', '\\')).to.deep.equal(['||']);
        expect(utils.splitStringWithEscaping('\\||', '|', '\\')).to.deep.equal(['|', '']);
        expect(utils.splitStringWithEscaping('one\\', '|', '\\')).to.deep.equal(['one\\']);
        expect(utils.splitStringWithEscaping('', '|', '\\')).to.deep.equal(['']);

        expect(utils.splitStringWithEscaping(10, '|')).to.equal(10);
        expect(utils.splitStringWithEscaping(null, '|')).to.be.null;
        expect(utils.splitStringWithEscaping(undefined, '|')).to.be.undefined;
        expect(utils.splitStringWithEscaping('one', '')).to.deep.equal(['o', 'n', 'e']);
        expect(utils.splitStringWithEscaping('one')).to.deep.equal(['o', 'n', 'e']);
        expect(utils.splitStringWithEscaping('one', 5)).to.deep.equal('one');
    });
});