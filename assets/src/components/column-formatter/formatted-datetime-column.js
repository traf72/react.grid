import React from 'react';
import Formatter from '../formatter';

export const FormattedDateTimeColumn = ({ data }) => {
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

export default FormattedDateTimeColumn;