import React from 'react';
import Formatter from '../formatter';

export const FormattedBoolColumn = ({ data }) => {
    return (
        <span>
            {new Formatter().formatBool(data)}
        </span>
    );
}

export default FormattedBoolColumn;