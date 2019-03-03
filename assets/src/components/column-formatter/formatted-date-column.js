import React from 'react';
import Formatter from '../formatter';

export const FormattedDateColumn = ({ metadata, data }) => {
    return (
        <span>
            {new Formatter().formatDate(metadata.columnFormat, data)}
        </span>
    );
}

export default FormattedDateColumn;