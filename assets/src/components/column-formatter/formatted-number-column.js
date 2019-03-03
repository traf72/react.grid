import React from 'react';
import Formatter from '../formatter';

export const FormattedNumberColumn = ({ metadata, value }) => {
    return (
        <span>
            {new Formatter().formatNumber(metadata.columnFormat, value)}
        </span>
    );
}

export default FormattedNumberColumn;
