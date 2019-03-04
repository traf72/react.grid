import React from 'react';

const LinkColumn = ({ metadata, rowData, data }) => {
    function onClick(e) {
        if (typeof metadata.onClick === 'function') {
            metadata.onClick(e, rowData);
        }
    }

    function onMouseDown(e) {
        if (typeof metadata.onMouseDown === 'function') {
            metadata.onMouseDown(e, rowData);
        }
    }

    const href = metadata.url ? metadata.url : rowData[metadata.urlField];
    return <a href={href} onMouseDown={onMouseDown} onClick={onClick}>{data}</a>;
}

export default LinkColumn;