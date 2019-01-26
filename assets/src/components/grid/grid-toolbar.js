'use strict';

import React from 'react';
import { getFilterTextDependOnKeyPressed, handleFilterPastedText } from './grid-common';
import utils from '../utils';

export default class GridToolbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = { searchText: this.props.extraProps.getCommonFilterText() };
    }

    componentDidMount() {
        this.props.extraProps.saveCheckedRecordsInfoElem(this.refs.checkedRecordsInfo);
    }

    componentWillUnmount() {
        this.props.extraProps.removeCheckedRecordsInfoElem();
    }

    componentDidUpdate() {
        this._updateCheckedRecordsInfo();
    }

    componentWillReceiveProps(props) {
        if (this.refs.commonSearch && this.refs.commonSearch.value !== this.props.extraProps.getCommonFilterText()) {
            this.setState({ searchText: this.props.extraProps.getCommonFilterText() });
        }
    }

    _updateCheckedRecordsInfo = () => {
        if (typeof this.props.extraProps.updateCheckedRecordsInfo === 'function') {
            this.props.extraProps.updateCheckedRecordsInfo();
        }
    }

    _searchChanged = e => {
        this._applyFilterChanges(e.target.value);
    }

    _applyFilterChanges(newValue) {
        this.setState({ searchText: newValue });
        this.props.changeFilter(newValue);
    }

    _handleFilterKeyPress = e => {
        let filterText = getFilterTextDependOnKeyPressed(e.key, e.target.value);
        if (e.target.value !== filterText) {
            this._applyFilterChanges(filterText);
        }
    }

    _handleFilterPaste = e => {
        e.preventDefault();
        const value = handleFilterPastedText(e.clipboardData.getData('Text'));
        this.setState({ searchText: value });
        this.props.changeFilter(value);
    }

    _pageSizeChanged = e => {
        if (typeof this.props.extraProps.pageSizeChanged === 'function') {
            this.props.extraProps.pageSizeChanged(e.target.value);
        }
    }

    _onlyCheckedChanged = e => {
        if (typeof this.props.extraProps.showOnlyCheckedRecordsChanged === 'function') {
            this.props.extraProps.showOnlyCheckedRecordsChanged(e.target.checked);
        }
    }

    _searchMouseUp = e => {
        if (utils.detectIE()) {
            utils.handleClearSearchInputInIE(e.target, this._applyFilterChanges.bind(this));
        }
    }

    _showFilter() {
        if (this.props.extraProps.isShowFilter()) {
            return (
                <div className="search-block">
                    <input ref="commonSearch" type="search" className="form-control" name="search" placeholder="Search..."
                        onChange={this._searchChanged} onKeyPress={this._handleFilterKeyPress} onPaste={this._handleFilterPaste}
                        value={this.state.searchText} onMouseUp={this._searchMouseUp}
                    />
                </div>
            );
        }
    }

    _showOnlyCheckedFilter() {
        if (this.props.extraProps.isWithCheckboxColumn()) {
            return (
                <label className="only-checked">
                    <input type="checkbox" onChange={this._onlyCheckedChanged}/> Only checked (<span ref="checkedRecordsInfo">{this.props.extraProps.getCheckedRecordsKeys().length}</span>)
                </label>
            );
        }
    }

    _showPageSizeSelector() {
        if (this.props.extraProps.isShowPageSizeSelector()) {
            return (
                <div className="page-size-selector form-inline">
                    <div className="form-group">
                        <label htmlFor="pageSize">Page size:</label>
                        <select className="form-control" id="pageSize" style={{ marginLeft: '10px', width: '70px' }}
                            value={this.props.extraProps.getCurrentPageSize()} onChange={this._pageSizeChanged}
                        >
                            {this.props.extraProps.getPageSizes().map(item => <option key={item}>{item}</option>)}
                        </select>
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                {this._showFilter()}
                {this._showOnlyCheckedFilter()}
                {this._showPageSizeSelector()}
            </div>
        );
    }
}
