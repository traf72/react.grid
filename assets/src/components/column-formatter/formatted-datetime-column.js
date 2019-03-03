import React from 'react';
import Formatter from '../formatter';

export const FormattedDateTimeColumn = ({ value }) => {
    function getFormattedValue() {
        let dateStr;
        if (moment.isToday(value)) {
            dateStr = 'Today';
        } else if (moment.isYesterday(value)) {
            dateStr = 'Yesterday';
        } else {
            let format = 'D MMM';
            format = moment().isSame(moment(value), 'year') ? format : `${format} YYYY`;
            dateStr = moment(value).format(format);
        }
        return `${dateStr} ${new Formatter().formatByDefault('time', value)}`;
    }

    return (
        <span>
            {getFormattedValue()}
        </span>
    );
}

export default FormattedDateTimeColumn;