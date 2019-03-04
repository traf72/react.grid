﻿import sortedIndexBy from 'lodash/sortedIndexBy';

// http://stackoverflow.com/questions/4994201/is-object-empty#answer-4994244
export function isObjectEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== 'object') return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

// Функция склонения слова в зависимости от стоящего рядом числа
// https://truemisha.ru/blog/javascript/numbers-and-words.html
export function wordForm(num, word) {
    const cases = [2, 0, 1, 1, 1, 2];
    return word[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];
}

export function restoreDataOrder(originalData, filteredData, keyColumn) {
    filteredData.sort((x, y) => {
        if (x[keyColumn] > y[keyColumn]) return 1;
        if (x[keyColumn] < y[keyColumn]) return -1;
        return 0;
    });

    return originalData.filter(i => {
        const index = sortedIndexBy(filteredData, { [keyColumn]: i[keyColumn] }, keyColumn);
        const item = filteredData[index];
        return item && item[keyColumn] === i[keyColumn];
    });
}

export function detectIE() {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE ');

    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        const rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    return false;
}

export function handleClearSearchInputInIE(elem, callback) {
    // http://stackoverflow.com/questions/14498396/event-fired-when-clearing-text-input-on-ie10-with-clear-icon#answer-14498921
    const oldValue = elem.value;
    if (oldValue === '') {
        return;
    }

    const jqElem = $(elem);
    // When this event is fired after clicking on the clear button
    // the value is not cleared yet. We have to wait for it.
    setTimeout(() => {
        const newValue = jqElem.val();
        if (newValue === '') {
            callback('');
        }
    }, 1);
}

// Суммирует деньги
export function sumMoney(sum1, sum2) {
    // Суммируем в копейках, чтобы не потерять точность
    return (this.convertToPennies(sum1) + this.convertToPennies(sum2)) / 100;
}

// Переводит сумму в копейки
export function convertToPennies(sum) {
    return Math.round(sum * 100);
}

export function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

export function isTime(value) {
    const reg = /\d+:[0-5]\d/;
    if (reg.exec(value)) {
        return true;
    }
    return false;
}

export function splitStringWithEscaping(input, splitSymbol, escapeSymbol) {
    if (typeof input !== 'string' || (splitSymbol && typeof splitSymbol !== 'string')) {
        return input;
    }

    splitSymbol = splitSymbol ? splitSymbol : '';

    const result = [];
    const stringParts = input.split(splitSymbol);
    if (typeof escapeSymbol !== 'string') {
        return stringParts;
    }

    let currentStr = '';
    for (let i = 0; i < stringParts.length; i++) {
        const str = stringParts[i];
        if (str.endsWith(escapeSymbol) && stringParts[i + 1] !== undefined) {
            currentStr += `${str.substr(0, str.length - 1)}${splitSymbol}`;
        } else {
            currentStr += str;
            result.push(currentStr);
            currentStr = '';
        }
    }

    return result;
}

export function capitalizeFirstLetter(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : string;
}

export function lowerFirstLetter(string) {
    return string ? string.charAt(0).toLowerCase() + string.slice(1) : string;
}

export function normalizeNumber(number) {
    return typeof number === 'string' ? number.replace(/,/g, '.').replace(/\s/g, '') : number;
}

export function delay(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}