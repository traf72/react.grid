import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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

    return rowData.isExpanded
        ? <FontAwesomeIcon icon="caret-down" fixedWidth onClick={collapseRow} />
        : <FontAwesomeIcon icon="caret-right" fixedWidth onClick={expandRow} />;
}

GridCollapse.propTypes = {
    extraProps: PropTypes.shape({
        onRowCollapse: PropTypes.func,
        onRowExpand: PropTypes.func,
    }),
    rowData: PropTypes.object.isRequired,
}

export default GridCollapse;