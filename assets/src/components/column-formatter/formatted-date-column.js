import React from 'react';
import Formatter from '../formatter';

export const FormattedDateColumn = ({ metadata, value }) => {
    return (
        <span>
            {new Formatter().formatDate(metadata.columnFormat, value)}
        </span>
    );
}

export default FormattedDateColumn;