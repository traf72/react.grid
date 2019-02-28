import React from 'react';
import PropTypes from 'prop-types';

const GridCollapse = ({ extraProps, rowData }) => {
    function collapseRow() {
        if (typeof extraProps.onRowCollapse === 'function') {
            extraProps.onRowCollapse(rowData);
        }
    }

    function expandRow() {
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

GridCollapse.propTypes = {
    extraProps: PropTypes.shape({
        onRowCollapse: PropTypes.func,
        onRowExpand: PropTypes.func,
    }),
    rowData: PropTypes.object.isRequired,
}

export default GridCollapse;