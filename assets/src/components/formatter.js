'use strict';

import {decimalTypes, dateTypes, timeTypes, boolTypes, allNumberTypes} from './data-types';
import numeral from './numeral';
import moment from './moment';

export default class Formatter {
    formatByDefault(dataType, input, withoutDigitGroupSeparator = false) {
        if (!dataType) {
            return input;
        }

        const defaultFormat = this.getDataTypeDefaultFormat(dataType, withoutDigitGroupSeparator);
        if (!defaultFormat) {
            return input;
        }

        dataType = dataType.trim().toLowerCase();
        if (allNumberTypes.includes(dataType)) {
            return this.formatNumber(defaultFormat, input);
        }
        if (dateTypes.includes(dataType) || timeTypes.includes(dataType)) {
            return this.formatDate(defaultFormat, input);
        }
        if (boolTypes.includes(dataType)) {
            return this.formatBool(input);
        }
        return input;
    }

    getDataTypeDefaultFormat(dataType, withoutDigitGroupSeparator = false) {
        if (!dataType) {
            return null;
        }

        dataType = dataType.trim().toLowerCase();
        if (allNumberTypes.includes(dataType)) {
            return this.getNumberDefaultFormat(dataType, withoutDigitGroupSeparator);
        }
        if (dateTypes.includes(dataType)) {
            return this.getDateDefaultFormat();
        }
        if (timeTypes.includes(dataType)) {
            return this.getTimeDefaultFormat();
        }
        if (boolTypes.includes(dataType)) {
            return this.getBoolDefaultFormat();
        }
        return null;
    }

    getNumberDefaultFormat(dataType, withoutDigitGroupSeparator = false) {
        dataType = dataType.trim().toLowerCase();
        if (decimalTypes.includes(dataType)) {
            return withoutDigitGroupSeparator ? '0.00' : '0,0.00';
        }
        if (allNumberTypes.includes(dataType)) {
            return '0.[000000000]';
        }
        return null;
    }

    getDateDefaultFormat() {
        return 'L';
    }

    getTimeDefaultFormat() {
        return 'LT';
    }

    getBoolDefaultFormat() {
        return 'YN';
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
