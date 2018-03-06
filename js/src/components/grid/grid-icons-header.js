'use strict';

import React from 'react';

const hideFilterString = 'Hide filter'
const showFilterString = 'Show filter'

export default class IconsHeader extends React.Component {
    constructor(props) {
        super(props);

        this._filterVisibilityChanged = this._filterVisibilityChanged.bind(this);
    }

    _filterVisibilityChanged() {
        this.props.columnsFilterVisibilityChanged();
        this._toggleColumnsFilter(this.props.isColumnsFilterDisplayed());
    }

    _toggleColumnsFilter(isDisplay) {
        let columnFilters = $('[id^=column-filter]');
        let title;
        if (isDisplay) {
            columnFilters.removeClass('hidden');
            title = hideFilterString;
        } else {
            columnFilters.addClass('hidden');
            title = showFilterString;
        }
        $('#columns-filter-icon').attr('title', title);
    }

    _getExportIcon() {
		if (this.props.isExportEnabled()) {
            return <span title="Export to Excel" className="glyphicon glyphicon-export" onClick={this.props.exportFunc}></span>;
        }
    }

    _getRefreshIcon() {
        if (typeof this.props.refreshFunc === 'function') {
            return <span title="Refresh" className="glyphicon glyphicon-refresh" onClick={this.props.refreshFunc}></span>;
        }
    }

    _getFilterIcon() {
        if (this.props.isShowColumnsFilter()) {
            return (
                <span id="columns-filter-icon" title={this.props.isColumnsFilterDisplayed() ? hideFilterString : showFilterString}
                    className="glyphicon glyphicon-filter" onClick={this._filterVisibilityChanged}>
                </span>
            );
        }
    }

    render() {
        return (
            <div>
                {this._getExportIcon()}
                {this._getFilterIcon()}
                {this._getRefreshIcon()}
            </div>
        );
    }
}
