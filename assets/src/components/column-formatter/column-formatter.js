import { allNumberTypes, dateTypes, boolTypes } from '../data-types';
import FormattedNumberColumn from './formatted-number-column';
import FormattedDateColumn from './formatted-date-column';
import FormattedBoolColumn from './formatted-bool-column';
import Formatter from '../formatter';

export default class ColumnDefaultFormatter {
    getDefaultColumnClass(dataType) {
        if (!dataType || !dataType.trim()) {
            return null;
        }

        dataType = dataType.trim().toLowerCase();
        if (allNumberTypes.includes(dataType)) {
            return FormattedNumberColumn;
        }
        if (dateTypes.includes(dataType)) {
            return FormattedDateColumn;
        }
        if (boolTypes.includes(dataType)) {
            return FormattedBoolColumn;
        }
        return null;
    }

    getDefaultColumnFormat(dataType) {
        return new Formatter().getDataTypeDefaultFormat(dataType);
    }

    getDefaultColumnToStringConverter(dataType) {
        if (!dataType || !dataType.trim()) {
            return null;
        }

        dataType = dataType.trim().toLowerCase();
        const formatter = new Formatter();
        if (dateTypes.includes(dataType)) {
            return formatter.formatDate.bind(formatter, this.getDefaultColumnFormat(dataType));
        }
        if (boolTypes.includes(dataType)) {
            return formatter.formatBool;
        }
        return null;
    }
}
