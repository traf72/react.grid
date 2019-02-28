import React from 'react';
import PropTypes from 'prop-types';

const hideFilterString = 'Hide filter'
const showFilterString = 'Show filter'

const IconsHeader = props => {
    function filterVisibilityChanged() {
        props.columnsFilterVisibilityChanged();
        toggleColumnsFilter(props.isColumnsFilterDisplayed());
    }

    function toggleColumnsFilter(isDisplay) {
        let columnFilters = $(`[id^=${props.gridId}-column-filter]`);
        let title;
        if (isDisplay) {
            columnFilters.removeClass('hidden');
            title = hideFilterString;
        } else {
            columnFilters.addClass('hidden');
            title = showFilterString;
        }
        $(`#${props.gridId}-columns-filter-icon`).attr('title', title);
    }

    function getExportIcon() {
        if (props.isExportEnabled()) {
            return <span title="Export to Excel" className="glyphicon glyphicon-export" onClick={props.exportFunc}></span>;
        }
    }

    function getRefreshIcon() {
        if (typeof props.refreshFunc === 'function') {
            return <span title="Refresh" className="glyphicon glyphicon-refresh" onClick={props.refreshFunc}></span>;
        }
    }

    function getFilterIcon() {
        if (props.isShowColumnsFilter()) {
            return (
                <span id={props.gridId + '-columns-filter-icon'} title={props.isColumnsFilterDisplayed() ? hideFilterString : showFilterString}
                    className="glyphicon glyphicon-filter" onClick={filterVisibilityChanged}>
                </span>
            );
        }
    }

    return (
        <div>
            {getExportIcon()}
            {getFilterIcon()}
            {getRefreshIcon()}
        </div>
    );
}

IconsHeader.propTypes = {
    gridId: PropTypes.string.isRequired,
    columnsFilterVisibilityChanged: PropTypes.func.isRequired,
    isColumnsFilterDisplayed: PropTypes.func.isRequired,
    isShowColumnsFilter: PropTypes.func.isRequired,
    isExportEnabled: PropTypes.func.isRequired,
    exportFunc: PropTypes.func,
    refreshFunc: PropTypes.func,
}

export default IconsHeader;