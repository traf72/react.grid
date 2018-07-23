'use strict';

import React from 'react';
import ReactDom from 'react-dom';

const GridCollapse = ({extraProps, rowData}) => {
     function collapseRow(e) {
        if (typeof extraProps.onRowCollapse === 'function') {
            extraProps.onRowCollapse(rowData);
        }
    }

    function expandRow(e) {
        if (typeof extraProps.onRowExpand === 'function') {
            extraProps.onRowExpand(rowData);
        }
    }

    if (rowData.isExpanded == null) {
        return null;
    }

    if (rowData.isExpanded) {
        return <span className="glyphicon glyphicon-triangle-bottom" onClick={collapseRow}></span>
    } else {
        return <span className="glyphicon glyphicon-triangle-right" onClick={expandRow}></span>
    }
}

export default GridCollapse;