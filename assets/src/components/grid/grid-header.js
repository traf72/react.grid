'use strict';

import React from 'react';
import { getFilterTextDependOnKeyPressed, handleFilterPastedText } from './grid-common';
import utils from '../utils';

export default class CustomHeaderComponent extends React.Component {
    constructor(props) {
        super(props);

        this._columnFilterChanged = this._columnFilterChanged.bind(this);
        this._handleColumnFilterKeyPress = this._handleColumnFilterKeyPress.bind(this);
        this._handleColumnFilterPaste = this._handleColumnFilterPaste.bind(this);
        this._updateColumnFilterState = this._updateColumnFilterState.bind(this);
        this._searchInputMouseUp = this._searchInputMouseUp.bind(this);

        this.state = { columnFilter: this.props.getColumnFilter(this.props.columnName) };
    }

    componentWillReceiveProps(props) {
        let columnFilter = props.getColumnFilter(props.columnName);
        if (this.refs.columnFilterInput &&
            props.isShowColumnFilter(props.columnName) &&
            this.refs.columnFilterInput.value !== columnFilter) {
            this._updateColumnFilterState(columnFilter);
        }
    }

    _columnFilterClick(e) {
        e.stopPropagation();
    }

    _columnFilterChanged(e) {
        this._applyColumnFilterChanges(this.props.columnName, e.target.value);
    }

    _applyColumnFilterChanges(colName, filterValue) {
        this._updateColumnFilterState(filterValue);
        this.props.setFilterByColumn(colName, filterValue);
    }

    _handleColumnFilterKeyPress(e) {
        let filterText = getFilterTextDependOnKeyPressed(e.key, e.target.value);
        if (e.target.value !== filterText) {
            this._applyColumnFilterChanges(this.props.columnName, filterText);
        }
    }

    _handleColumnFilterPaste(e) {
        e.preventDefault();
        const value = handleFilterPastedText(e.clipboardData.getData('Text'));
        this._applyColumnFilterChanges(this.props.columnName, value);
    }

    _updateColumnFilterState(value) {
        this.setState({ columnFilter: value });
    }

    _renderSortBlock() {
        if (this.props.isColumnSortable(this.props.columnName)) {
            return (
                <div style={{ float: 'right', fontSize: '.8em' }}>
                    {this._renderSortArrow()}
                </div>
            );
        }
    }

    _searchInputMouseUp(e) {
        if (utils.detectIE()) {
            utils.handleClearSearchInputInIE(e.target, this._applyColumnFilterChanges.bind(this, this.props.columnName));
        }
    }

    _renderSortArrow() {
        if (this.props.columnName === this.props.getCurrentSortColumn()) {
            return this.props.isCurrentSortAscending()
                ? <span className="glyphicon glyphicon-chevron-up"></span>
                : <span className="glyphicon glyphicon-chevron-down"></span>;
        }
    }

    _renderFilterBlock() {
        if (this.props.isShowColumnFilter(this.props.columnName)) {
            return (
                <div id={this.props.gridId + '-column-filter-' + this.props.columnName} className={this.props.isColumnsFilterDisplayed() ? '' : 'hidden'} style={{ fontWeight: 'normal' }}>
                    <input ref="columnFilterInput"
                        className="form-control"
                        type="search"
                        onClick={this._columnFilterClick}
                        value={this.state.columnFilter}
                        onChange={this._columnFilterChanged} onKeyPress={this._handleColumnFilterKeyPress}
                        onPaste={this._handleColumnFilterPaste} onMouseUp={this._searchInputMouseUp}
                    />
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                <div style={{ float: 'left' }} title={this.props.getColumnTitle(this.props.columnName)}>
                    {this.props.displayName}
                </div>
                {this._renderSortBlock()}
                {this._renderFilterBlock()}
            </div>
        );
    }
}
