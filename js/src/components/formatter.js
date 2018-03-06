'use strict';

import {decimalTypes, dateTypes, timeTypes, boolTypes, allNumberTypes} from './dataTypes.js';
import numeral from './numeral.js';
import moment from './moment.js';

export default class Formatter {
    formatByDefault(dataType, input) {
        if (!dataType) {
            return input;
        }

        const defaultFormat = this.getDataTypeDefaultFormat(dataType);
        if (!defaultFormat) {
            return input;
        }

        dataType = dataType.trim().toLowerCase();
        if (~allNumberTypes.indexOf(dataType)) {
            return this.formatNumber(defaultFormat, input);
        }
        if (~dateTypes.indexOf(dataType) || ~timeTypes.indexOf(dataType)) {
            return this.formatDate(defaultFormat, input);
        }
        if (~boolTypes.indexOf(dataType)) {
            return this.formatBool(input);
        }
        return input;
    }

    getDataTypeDefaultFormat(dataType) {
        if (!dataType) {
            return null;
        }

        dataType = dataType.trim().toLowerCase();
        if (~decimalTypes.indexOf(dataType)) {
            return '0,0.00';
        }
        if (~allNumberTypes.indexOf(dataType)) {
            return '0.[000000000]';
        }
        if (~dateTypes.indexOf(dataType)) {
            return 'L';
        }
        if (~timeTypes.indexOf(dataType)) {
            return 'LT';
        }
        if (~boolTypes.indexOf(dataType)) {
            return 'YN';
        }
        return null;
    }

    formatNumber(format, input) {
        if (this._needFormat(format, input)) {
            return numeral(input).format(format);
        }
        return input;
    }

    formatDate(format, input) {
        if (this._needFormat(format, input)) {
            return moment(input).format(format);
        }
        return input;
    } 
    
    formatCustomTime(input) {
            const hours = Math.trunc(input);
            const minutes = Math.round(Math.abs(input - hours)*60);
            return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    }

    formatBool(input) {
        return input === true || input === 'True' ? 'Yes' : (input === false || input === 'False' ? 'No' : null);
    }

    _needFormat(format, input) {
        return input != null && format && format.trim();
    }
}
