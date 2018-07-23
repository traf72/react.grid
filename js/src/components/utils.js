'use strict';

import sortedIndexBy from 'lodash/sortedIndexBy';

let utils = {
    // http://stackoverflow.com/questions/4994201/is-object-empty#answer-4994244
    isObjectEmpty(obj) {
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
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    },

    // Функция склонения слова в зависимости от стоящего рядом числа
    // https://truemisha.ru/blog/javascript/numbers-and-words.html
    wordForm(num, word) {
        let cases = [2, 0, 1, 1, 1, 2];
        return word[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];
    },

    restoreDataOrder(originalData, filteredData, keyColumn) {
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
    },

    // Shallow comparison
    isObjectsEquals(obj1, obj2) {
        if (obj1 === obj2) {
            return true;
        }

        // Если типы параметров неравны или хотя бы один из параметров не объект или хотя бы один из параметров равен null, то false
        if (typeof obj1 !== typeof obj2 || typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
            return false;
        }

        // Массивы тоже считаются объектами, поэтому их проверяем отдельно
        // Если оба объекта массивы или хотя бы один из объектов массив, то считаем, что они не равны,
        // так как метод предназначен для проверки именно объектов
        if ((Array.isArray(obj1) && Array.isArray(obj2))
            || (Array.isArray(obj1) && !Array.isArray(obj2))
            || (!Array.isArray(obj1) && Array.isArray(obj2))) {
            return false;
        }

        //Если кол-во ключей объектов не совпадает, значит они не равны
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
        }

        // Сравниваем все поля объектов в цикле
        for (let key in obj1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
        return true;
    },

    detectIE() {
        let ua = window.navigator.userAgent;
        let msie = ua.indexOf('MSIE ');

        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        let trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            let rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        return false;
    },

    handleClearSearchInputInIE(elem, callback) {
        // http://stackoverflow.com/questions/14498396/event-fired-when-clearing-text-input-on-ie10-with-clear-icon#answer-14498921
        let oldValue = elem.value;
        if (oldValue === '') {
            return;
        }

        let jqElem = $(elem);
        // When this event is fired after clicking on the clear button
        // the value is not cleared yet. We have to wait for it.
        setTimeout(() => {
            let newValue = jqElem.val();
            if (newValue === '') {
                callback('');
            }
        }, 1);
    },

    // Суммирует деньги
    sumMoney(sum1, sum2) {
        // Суммируем в копейках, чтобы не потерять точность
        return (this.convertToPennies(sum1) + this.convertToPennies(sum2)) / 100;
    },

    // Переводит сумму в копейки
    convertToPennies(sum) {
        return Math.round(sum * 100);
    },

    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    isTime(value) {
        const reg = /\d+:[0-5]\d/;
        if (reg.exec(value)) {
            return true;
        }
        return false;
    },

    splitStringWithEscaping(input, splitSymbol, escapeSymbol) {
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
    },

    capitalizeFirstLetter(string) {
        return string ? string.charAt(0).toUpperCase() + string.slice(1) : string;
    },

    lowerFirstLetter(string) {
        return string ? string.charAt(0).toLowerCase() + string.slice(1) : string;
    },
};

export default utils;