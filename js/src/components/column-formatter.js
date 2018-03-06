'use strict';

import {allNumberTypes, dateTypes, boolTypes} from './dataTypes.js';
import React from 'react';
import Formatter from './formatter.js';
import moment from './moment.js';

export class FormattedNumberColumn extends React.Component {
    render() {
        return (
            <span>
                {new Formatter().formatNumber(this.props.metadata.columnFormat, this.props.data)}
            </span>
        );
    }
}

export class FormattedDateColumn extends React.Component {
    render() {
        return (
            <span>
                {new Formatter().formatDate(this.props.metadata.columnFormat, this.props.data)}
            </span>
        );
    }
}

export class DefaultFormattedDateTimeColumn extends React.Component {
    _getFormattedValue() {
		let dateStr;
		if (moment.isToday(this.props.data)) {
			dateStr = 'Today';
		} else if (moment.isYesterday(this.props.data)) {
			dateStr = 'Yesterday';
		} else {
		    let format = 'D MMM';
		    format = moment().isSame(moment(this.props.data), 'year') ? format : `${format} YYYY`;
		    dateStr = moment(this.props.data).format(format);
		}
        return dateStr + ' ' + new Formatter().formatByDefault('time', this.props.data);
    }
    
    render() {
        return (
            <span>
                {this._getFormattedValue()}
            </span>
        );
    }
}

export class FormattedBoolColumn extends React.Component {
    render() {
        return (
            <span>
                {new Formatter().formatBool(this.props.data)}
            </span>
        );
    }
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
