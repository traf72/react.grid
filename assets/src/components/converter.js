import { allNumberTypes, dateTypes, boolTypes } from './data-types';
import { isTime } from './utils';
import isString from 'lodash/isString';

export default class Converter {
    convert(input, dataType) {
        return this.getConvertFunction(dataType)(input);
    }

    getConvertFunction(dataType) {
        if (!dataType) {
            return this._noConverter;
        }

        dataType = dataType.trim().toLowerCase();
        if (allNumberTypes.includes(dataType)) {
            return this.convertStringToNumber;
        }
        if (dateTypes.includes(dataType)) {
            return this.convertStringToDate;
        }
        if (boolTypes.includes(dataType)) {
            return this.convertStringToBool;
        }
        return this._noConverter;
    }

    _noConverter(item) {
        return item;
    }

    convertStringToNumber(item) {
        return item && isString(item) && item.trim() ? +item : item;
    }

    convertStringToDate(item) {
        return item && isString(item) && item.trim() ? new Date(item) : item;
    }

    convertStringToBool(item) {
        return item && isString(item) ? item.trim().toLowerCase() === 'true' : item;
    }

    convertTimeToNumber(item) {
        if (item && isTime(item)) {
            const splitArray = item.split(':');
            return +splitArray[0] + +splitArray[1] / 60;
        }
        return item;
    }
}
