'use strict';

import {allNumberTypes, dateTypes, boolTypes} from './data-types.js';
import React from 'react';
import Formatter from './formatter.js';
import moment from './moment.js';

export const FormattedNumberColumn = ({metadata, data}) => {
    return (
        <span>
            {new Formatter().formatNumber(metadata.columnFormat, data)}
        </span>
    );
}

export const FormattedDateColumn = ({metadata, data}) => {
    return (
        <span>
            {new Formatter().formatDate(metadata.columnFormat, data)}
        </span>
    );
}

export const DefaultFormattedDateTimeColumn = ({data}) => {
    function getFormattedValue() {
        let dateStr;
        if (moment.isToday(data)) {
            dateStr = 'Today';
        } else if (moment.isYesterday(data)) {
            dateStr = 'Yesterday';
        } else {
            let format = 'D MMM';
            format = moment().isSame(moment(data), 'year') ? format : `${format} YYYY`;
            dateStr = moment(data).format(format);
        }
        return `${dateStr} ${new Formatter().formatByDefault('time', data)}`;
    }

    return (
        <span>
            {getFormattedValue()}
        </span>
    );
}

export const FormattedBoolColumn = ({data}) => {
    return (
        <span>
            {new Formatter().formatBool(data)}
        </span>
    );
}

export default class ColumnDefaultFormatter {
    getDefaultColumnClass(dataType) {
        if (!dataType || !dataType.trim()) {
            return null;
        }

        dataType = dataType.trim().toLowerCase();
        if (~allNumberTypes.indexOf(dataType)) {
            return FormattedNumberColumn;
        }
        if (~dateTypes.indexOf(dataType)) {
            return FormattedDateColumn;
        }
        if (~boolTypes.indexOf(dataType)) {
            return FormattedBoolColumn;
        }
        return null;
    }

    getDefaultColumnFormat(dataType) {
        return new Formatter().getDataTypeDefaultFormat(dataType);
    }

    getDefaultColumnToStringConverter(dataType, format) {
        if (!dataType || !dataType.trim()) {
            return null;
        }

        dataType = dataType.trim().toLowerCase();
        const formatter = new Formatter();
        if (~dateTypes.indexOf(dataType)) {
            return formatter.formatDate.bind(formatter, this.getDefaultColumnFormat(dataType));
        }
        if (~boolTypes.indexOf(dataType)) {
            return formatter.formatBool;
        }
        return null;
    }
}
