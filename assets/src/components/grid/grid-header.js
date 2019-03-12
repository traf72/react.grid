import React from 'react';
import PropTypes from 'prop-types';
import { getFilterTextDependOnKeyPressed, handleFilterPastedText } from './grid-common';

export default class CustomHeaderComponent extends React.Component {
    static propTypes = {
        gridId: PropTypes.string.isRequired,
        columnName: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        getColumnFilter: PropTypes.func.isRequired,
        isShowColumnFilter: PropTypes.func.isRequired,
        setFilterByColumn: PropTypes.func.isRequired,
        isColumnSortable: PropTypes.func.isRequired,
        getCurrentSortColumn: PropTypes.func.isRequired,
        isCurrentSortAscending: PropTypes.func.isRequired,
        isColumnsFilterDisplayed: PropTypes.func.isRequired,
        getColumnTitle: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.columnFilterInput = React.createRef();
        this.state = {
            columnFilter: props.getColumnFilter(props.columnName)
        };
    }

    componentWillReceiveProps(props) {
        const columnFilter = props.getColumnFilter(props.columnName);
        const filterInput = this.columnFilterInput.current;
        if (filterInput && props.isShowColumnFilter(props.columnName) && filterInput.value !== columnFilter) {
            this._updateColumnFilterState(columnFilter);
        }
    }

    _columnFilterClick(e) {
        e.stopPropagation();
    }

    _columnFilterChanged = e => {
        this._applyColumnFilterChanges(this.props.columnName, e.target.value);
    }

    _applyColumnFilterChanges = (colName, filterValue) => {
        this._updateColumnFilterState(filterValue);
        this.props.setFilterByColumn(colName, filterValue);
    }

    _handleColumnFilterKeyPress = e => {
        const filterText = getFilterTextDependOnKeyPressed(e.key, e.target.value);
        if (e.target.value !== filterText) {
            this._applyColumnFilterChanges(this.props.columnName, filterText);
        }
    }

    _handleColumnFilterPaste = e => {
        e.preventDefault();
        const value = handleFilterPastedText(e.clipboardData.getData('Text'));
        this._applyColumnFilterChanges(this.props.columnName, value);
    }

    _updateColumnFilterState = value => {
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

    _renderSortArrow() {
        const { columnName, getCurrentSortColumn, isCurrentSortAscending } = this.props;

        if (columnName === getCurrentSortColumn()) {
            return isCurrentSortAscending()
                ? <span className="glyphicon glyphicon-chevron-up"></span>
                : <span className="glyphicon glyphicon-chevron-down"></span>;
        }
    }

    _renderFilterBlock() {
        const {
            isShowColumnFilter,
            columnName,
            gridId,
            isColumnsFilterDisplayed,
        } = this.props;

        if (isShowColumnFilter(columnName)) {
            return (
                <div id={gridId + '-column-filter-' + columnName} className={isColumnsFilterDisplayed() ? '' : 'hidden'} style={{ fontWeight: 'normal' }}>
                    <input
                        ref={this.columnFilterInput}
                        className="form-control"
                        type="search"
                        onClick={this._columnFilterClick}
                        value={this.state.columnFilter}
                        onChange={this._columnFilterChanged} onKeyPress={this._handleColumnFilterKeyPress}
                        onPaste={this._handleColumnFilterPaste}
                    />
                </div>
            );
        }
    }

    render() {
        const { getColumnTitle, columnName, displayName } = this.props;

        return (
            <div>
                <div style={{ float: 'left' }} title={getColumnTitle(columnName)}>
                    {displayName}
                </div>
                {this._renderSortBlock()}
                {this._renderFilterBlock()}
            </div>
        );
    }
}
