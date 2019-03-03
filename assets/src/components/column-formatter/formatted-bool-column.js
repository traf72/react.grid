import React from 'react';
import Formatter from '../formatter';

export const FormattedBoolColumn = ({ value }) => {
    return (
        <span>
            {new Formatter().formatBool(value)}
        </span>
    );
}

export default FormattedBoolColumn;