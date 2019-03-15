import React from 'react';
import PropTypes from 'prop-types';
import { getFilterTextDependOnKeyPressed, handleFilterPastedText } from './grid-common';

export default class GridToolbar extends React.Component {
    static propTypes = {
        extraProps: PropTypes.shape({
            getCommonFilterText: PropTypes.func.isRequired,
            saveCheckedRecordsInfoElem: PropTypes.func.isRequired,
            removeCheckedRecordsInfoElem: PropTypes.func.isRequired,
            changeFilter: PropTypes.func,
            isShowFilter: PropTypes.func.isRequired,
            isWithCheckboxColumn: PropTypes.func.isRequired,
            isShowPageSizeSelector: PropTypes.func.isRequired,
            updateCheckedRecordsInfo: PropTypes.func,
            pageSizeChanged: PropTypes.func,
            showOnlyCheckedRecordsChanged: PropTypes.func,
            getCheckedRecordsKeys: PropTypes.func,
            getCurrentPageSize: PropTypes.func,
            getPageSizes: PropTypes.func,
        }).isRequired,
    }
    
    constructor(props) {
        super(props);

        this.checkedRecordsInfo = React.createRef();
        this.commonSearch = React.createRef();
        this.state = { searchText: props.extraProps.getCommonFilterText() };
    }

    componentDidMount() {
        this.props.extraProps.saveCheckedRecordsInfoElem(this.checkedRecordsInfo.current);
    }

    componentWillUnmount() {
        this.props.extraProps.removeCheckedRecordsInfoElem();
    }

    componentDidUpdate() {
        this._updateCheckedRecordsInfo();
    }

    componentWillReceiveProps(props) {
        const commonSearch = this.commonSearch.current;
        if (commonSearch && commonSearch.value !== props.extraProps.getCommonFilterText()) {
            this.setState({ searchText: props.extraProps.getCommonFilterText() });
        }
    }

    _updateCheckedRecordsInfo = () => {
        this._callFunctionIfExist('updateCheckedRecordsInfo');
    }

    _searchChanged = e => {
        this._applyFilterChanges(e.target.value);
    }

    _applyFilterChanges(newValue) {
        this.setState({ searchText: newValue });
        this.props.changeFilter(newValue);
    }

    _handleFilterKeyPress = e => {
        const filterText = getFilterTextDependOnKeyPressed(e.key, e.target.value);
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
        this._callFunctionIfExist('pageSizeChanged', e.target.value);
    }

    _onlyCheckedChanged = e => {
        this._callFunctionIfExist('showOnlyCheckedRecordsChanged', e.target.checked);
    }

    _callFunctionIfExist(funcName, ...params) {
        if (typeof this.props.extraProps[funcName] === 'function') {
            this.props.extraProps[funcName](...params);
        }
    }

    _showFilter() {
        if (this.props.extraProps.isShowFilter()) {
            return (
                <div className="search-block">
                    <input ref={this.commonSearch} type="search" className="form-control form-control-sm" name="search" placeholder="Search..."
                        onChange={this._searchChanged} onKeyPress={this._handleFilterKeyPress} onPaste={this._handleFilterPaste}
                        value={this.state.searchText}
                    />
                </div>
            );
        }
    }

    _showOnlyCheckedFilter() {
        if (this.props.extraProps.isWithCheckboxColumn()) {
            return (
                <label className="only-checked mt-2">
                    <input type="checkbox" onChange={this._onlyCheckedChanged} /> Only checked (<span ref={this.checkedRecordsInfo}>{this.props.extraProps.getCheckedRecordsKeys().length}</span>)
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
                        <select className="form-control form-control-sm" id="pageSize" style={{ marginLeft: '10px', width: '70px' }}
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
