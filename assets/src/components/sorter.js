import { allNumberTypes, dateTypes, boolTypes } from './data-types';
import orderBy from 'lodash/orderBy';

export default class Sorter {
    getDefaultSortFunction(dataType) {
        if (!dataType) {
            return this.sortStrings;
        }

        dataType = dataType.trim().toLowerCase();
        if (allNumberTypes.includes(dataType) || boolTypes.includes(dataType)) {
            return this.sortNumbers;
        }
        if (dateTypes.includes(dataType)) {
            return this.sortDates;
        }
        return this.sortStrings;
    }

    sortNumbers(item) {
        return item == null ? -Infinity : item;
    }

    sortStrings(item) {
        return item == null ? '' : item.toLowerCase();
    }

    sortDates(item) {
        return item == null ? new Date(-8640000000000000) : item;
    }

    sortStringCollectionAsNumbers(collection, sortColumn, direction) {
        let notNumericItems = [];
        let numericItems = [];
        for (let item of collection) {
            const isNotNumeric = isNaN(parseFloat(item[sortColumn]));
            if (isNotNumeric) {
                notNumericItems.push(item);
            } else {
                numericItems.push(item);
            }
        }

        notNumericItems = orderBy(notNumericItems, item => item[sortColumn], direction);
        numericItems = orderBy(numericItems, item => parseFloat(item[sortColumn]), direction);
        return direction.toLowerCase() === 'desc' ? [...notNumericItems, ...numericItems] : [...numericItems, ...notNumericItems];
    }
}