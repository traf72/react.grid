import React from 'react';
import Formatter from '../formatter';

export const FormattedNumberColumn = ({ metadata, data }) => {
    return (
        <span>
            {new Formatter().formatNumber(metadata.columnFormat, data)}
        </span>
    );
}

export default FormattedNumberColumn;
