'use strict';

import '../../../../less/components/grid.less';
import Loader from '../loader.js';
import drop from 'lodash/drop';
import take from 'lodash/take';
import orderBy from 'lodash/orderBy';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import Griddle from '../../libs/griddle-react';
import setOps from '../../libs/setOps.js';
import Filter, { orCharacter as orFilterCharacter, negateCharacter as negateFilterCharacter, equalCharacter as equalFilterCharacter } from '../filter.js';
import Sorter from '../sorter.js';
import Converter from '../converter.js';
import ColumnDefaultFormatter from '../column-formatter.js';
import runAsync from '../async.js';
import utils from '../utils';
import exportToXlsx from './grid-export.js';
import GridToolbar from './grid-toolbar.js';
import IconsHeader from './grid-icons-header.js';
import GridHeaderCheckbox from './grid-header-checkbox.js';
import GridCheckbox from './grid-checkbox.js';
import GridCollapse from './grid-collapse.js';
import LinkColumn from './grid-link-column.js';
import CustomHeaderComponent from './grid-header.js';
import uuid from 'uuid';

const million = 1000000;
const filterDelayInMilliseconds = 600;
const defaultAsyncDelay = 20;
const defaultPageSizes = [10, 15, 20, 25, 50, 100];
const defaultNoDataMessage = 'No results found';
const expandColumnName = 'isExpanded';

// TODO Вариант с данными с сервера нужно ещё допиливать, как минимум фильтрацию и сортировку
export default class Grid extends React.PureComponent {
    constructor(props) {
        super(props);

        this._gridId = uuid.v4();

        this._isRowSelected = this._isRowSelected.bind(this);
        this._onRowSelected = this._onRowSelected.bind(this);
        this._setPage = this._setPage.bind(this);
        this._setPageSize = this._setPageSize.bind(this);
        this._changeSort = this._changeSort.bind(this);
        this._setCommonFilter = this._setCommonFilter.bind(this);
        this._setFilterByColumn = this._setFilterByColumn.bind(this);
        this._saveCheckboxToColletion = this._saveCheckboxToColletion.bind(this);
        this._removeCheckboxFromColletion = this._removeCheckboxFromColletion.bind(this);
        this._setHeaderCheckbox = this._setHeaderCheckbox.bind(this);
        this._removeHeaderCheckbox = this._removeHeaderCheckbox.bind(this);
        this._updateHeaderCheckbox = this._updateHeaderCheckbox.bind(this);
        this._saveCheckedRecordsInfoElem = this._saveCheckedRecordsInfoElem.bind(this);
        this._removeCheckedRecordsInfoElem = this._removeCheckedRecordsInfoElem.bind(this);
        this._updateCheckedRecordsInfo = this._updateCheckedRecordsInfo.bind(this);
        this._headerCheckedChanged = this._headerCheckedChanged.bind(this);
        this._recordCheckedChanged = this._recordCheckedChanged.bind(this);
        this._showOnlyCheckedRecordsChanged = this._showOnlyCheckedRecordsChanged.bind(this);
        this._columnsFilterVisibilityChanged = this._columnsFilterVisibilityChanged.bind(this);
        this._exportFunc = this._exportFunc.bind(this);
        this._onRowCollapse = this._onRowCollapse.bind(this);
        this._onRowExpand = this._onRowExpand.bind(this);

        this.isShowFilter = this.isShowFilter.bind(this);
        this.isShowPageSizeSelector = this.isShowPageSizeSelector.bind(this);
        this.isShowColumnsFilter = this.isShowColumnsFilter.bind(this);
        this.isShowColumnFilter = this.isShowColumnFilter.bind(this);
        this.isColumnsFilterDisplayed = this.isColumnsFilterDisplayed.bind(this);
        this.getColumnTitle = this.getColumnTitle.bind(this);
        this.getColumnFilter = this.getColumnFilter.bind(this);
        this.isColumnSortable = this.isColumnSortable.bind(this);
        this.getCurrentSortColumn = this.getCurrentSortColumn.bind(this);
        this.isCurrentSortAscending = this.isCurrentSortAscending.bind(this);
        this.isWithCheckboxColumn = this.isWithCheckboxColumn.bind(this);
        this.isWithGrouping = this.isWithGrouping.bind(this);
        this.getKeyColumn = this.getKeyColumn.bind(this);
        this.getCommonFilterText = this.getCommonFilterText.bind(this);
        this.getPageSizes = this.getPageSizes.bind(this);
        this.getCurrentPageSize = this.getCurrentPageSize.bind(this);
        this.getCurrentPage = this.getCurrentPage.bind(this);
        this.getPagesCount = this.getPagesCount.bind(this);
        this.getCheckedRecordsKeys = this.getCheckedRecordsKeys.bind(this);
        this.getExpandedRecordsKeys = this.getExpandedRecordsKeys.bind(this);
        this.isExportEnabled = this.isExportEnabled.bind(this);
        this.onChangePageSize = this.onChangePageSize.bind(this);

        this._initProperties();
        this._setInitialPageSize(this.props.resultsPerPage);
        this._handleProps();
    }

    componentWillMount() {
        this._setSelectedRow();
    }

    componentDidMount() {
        if (this.props.serverData) {
            this.showLoader();
            this._getData();
        }
        this._raiseSelectedRowChangedEvent();
    }

    componentWillReceiveProps(props) {
        if (!utils.isObjectsEquals(this.props, props)) {
            this.props = props;
            this._handleProps();
        }
    }

    componentWillUpdate() {
        this._setSelectedRow();
    }

    componentDidUpdate() {
        this.hideLoader();
        this._raiseSelectedRowChangedEvent();
    }

    _initProperties() {
        this._commonFilterText = '';
        this._overlayCounter = 0;
        this._keyColumn = null;
        this._isHeaderChecked = false;
        this._isColumnsFilterDisplayed = this.props.displayColumnsFilter;
        this._currentSortColumn = null;
        this._isCurrentSortAscending = true;
        this._filterByColumns = {};
        this._columnsToStringConverters = {};
        this._checkboxes = [];
        this._currentPage = 0;
        this._previousToggledRecord = {};
        this._allGridData = [];
        this._allData = [];
        this._allGridRecordsKeys = [];
        this._filterableColumns = [];
        this._sortableColumns = [];
        this._sorter = new Sorter();
        this._converter = new Converter();
        this._columnDefaultFormatter = new ColumnDefaultFormatter();
    }

    _setInitialPageSize(initialPageSize) {
        if (!initialPageSize) {
            this._pageSizes = defaultPageSizes.slice(0);
            if (this.isShowPageSizeSelector()) {
                this._currentPageSize = this.getPageSizes()[0];
            } else {
                this._currentPageSize = million;
            }
        } else {
            this._pageSizes = setOps.union(defaultPageSizes, [initialPageSize]).sort((a, b) => a - b);
            this._currentPageSize = initialPageSize;
        }
    }

    _handleProps() {
        this._columnMetadata = cloneDeep(this.props.columnMetadata);
        this._clearPreviousToggledRecord();

        this._allGridData = this._allData = this.props.serverData ? [] : cloneDeep(this.props.results);

        this._setKeyColumn();
        this._filter = new Filter(this.getKeyColumn().columnName);
        this._handleColumnMetadata();
        this._handleRowMetadata();

        this._removeNotActualColumnsFromColumnsFilter();

        this._applyExternalFiltersIfNeed();
        this._applySortOptions(this.props.sortOptions);
        this._filterGridData(this._allGridData);
        this._sortGridData();
        this._groupGridDataIfNeed();

        if (this.isWithCheckboxColumn() || this.isWithGrouping()) {
            this._fillAllGridRecordsKeysOnClient();
        }

        if (this.isWithCheckboxColumn()) {
            this._addCheckboxColumn();
            this._changeCheckedRecordsKeys(setOps.intersection(this.props.defaultCheckedRecordsKeys.slice(0), this._allGridRecordsKeys), false);
            this._checkRecords(this._allGridData);
            this._handleHeaderChecked();
        }
        if (this.isWithGrouping()) {
            this._changeExpandedRecordsKeys(setOps.intersection(this.props.defaultExpandedRecordsKeys.slice(0), this._allGridRecordsKeys));
            this._addExpandColumn();
            this._filterCollapsedRows(this._allGridData);
        }

        const pagesCount = this.getPagesCount(this._allGridData.length);
        this._setCurrentPage(pagesCount);

        this.state = {
            results: this._getPageRecords(this._allGridData),
            currentPage: this.getCurrentPage(),
            pagesCount: pagesCount,
            showPager: this._isNeedShowPager(pagesCount),
            externalResultsPerPage: this.getCurrentPageSize(),
            externalSortColumn: this.getCurrentSortColumn(),
            externalSortAscending: this.isCurrentSortAscending(),
        };
    }

    _removeNotActualColumnsFromColumnsFilter() {
        for (let columnName in this._filterByColumns) {
            if (this._filterableColumns.indexOf(columnName) === -1) {
                delete this._filterByColumns[columnName]; 
            }
        }
    }

    _clearPreviousToggledRecord() {
        this._previousToggledRecord = {};
    }

    _setKeyColumn() {
        this._keyColumn = this._columnMetadata.find(item => item.keyColumn);
        // TODO В варианте с серверными данными так по идее делать нельзя
        if (!this.getKeyColumn()) {
            this._keyColumn = {
                columnName: Grid.defaultKeyColumn,
                keyColumn: true,
                visible: false,
            };
            this._columnMetadata.push(this.getKeyColumn());
        }
        if (this.getKeyColumn().columnName === Grid.defaultKeyColumn) {
            this._allGridData.forEach((item, index) => item[Grid.defaultKeyColumn] = index);
        }
    }

    _handleColumnMetadata() {
        this._addIconsColumn();
        this._applyColumnsDataType();
        this._hideInvisibleColumns();
        this._makeLinkColumns();
        this._fillFilterableColumns();
        this._fillSortableColumns();
        this._fillColumnsToStringConverters();
        this._makeHeaders();
    }

    _addIconsColumn() {
        let iconsColumn = this._columnMetadata.find(column => column.columnName === 'icons');

        if (!iconsColumn && (this._filterableColumns.length !== 0 || this.props.refreshFunc)) {
            iconsColumn = {
                columnName: 'icons',
                order: million,
                cssClassName: 'icons-column',
            };
            this._columnMetadata.push(iconsColumn);
        }

        if (iconsColumn) {
            iconsColumn.customHeaderComponent = IconsHeader;
            iconsColumn.customHeaderComponentProps = {
                isShowColumnsFilter: this.isShowColumnsFilter,
                columnsFilterVisibilityChanged: this._columnsFilterVisibilityChanged,
                isColumnsFilterDisplayed: this.isColumnsFilterDisplayed,
                refreshFunc: this.props.refreshFunc,
                exportFunc: this._exportFunc,
                isExportEnabled: this.isExportEnabled,
                gridId: this._gridId,
            };
            iconsColumn.sortable = false;
            iconsColumn.filterable = false;
            iconsColumn.exportable = false;

            this._allGridData.forEach(item => item.icons = null);
        } else {
            this._allGridData.forEach(item => delete item.icons);
        }
    }

    _applyColumnsDataType() {
        const columnsWithDataType = this._columnMetadata.filter(column => column.columnType);
        for (let column of columnsWithDataType) {
            if (column.customComponent === undefined) {
                column.customComponent = this._columnDefaultFormatter.getDefaultColumnClass(column.columnType);
            }
            if (column.columnFormat === undefined) {
                column.columnFormat = this._columnDefaultFormatter.getDefaultColumnFormat(column.columnType);
            }
            if (column.toStringConverter === undefined) {
                column.toStringConverter = this._columnDefaultFormatter.getDefaultColumnToStringConverter(column.columnType);
            }
            const convertFunction = this._converter.getConvertFunction(column.columnType);
            this._allData.forEach(item => item[column.columnName] = convertFunction(item[column.columnName]));
        }
    }

    _hideInvisibleColumns() {
        this._columnMetadata.forEach(column => {
            const hiddenClass = 'hidden';
            column.cssClassName = column.cssClassName ? column.cssClassName : '';
            if (column.visible !== false) {
                column.cssClassName = column.cssClassName.replace(hiddenClass, '');
            } else {
                column.cssClassName += ` ${hiddenClass}`;
            }
        });
    }

    _makeLinkColumns() {
        this._columnMetadata.filter(column => column.urlField || column.url)
            .forEach(column => column.customComponent = LinkColumn);
    }

    _fillFilterableColumns() {
        this._filterableColumns = this._columnMetadata.filter(item => item.filterable !== false && item.visible !== false).map(item => item.columnName);
    }

    _fillSortableColumns() {
        this._sortableColumns = this._columnMetadata
            .filter(item => item.sortable !== false && item.visible !== false)
            .map(item => item.columnName);
    }

    _fillColumnsToStringConverters() {
        this._columnsToStringConverters = {};
        const columnsWithConvertFunctions = this._columnMetadata.filter(column => column.toStringConverter);
        for (let column of columnsWithConvertFunctions) {
            this._columnsToStringConverters[column.columnName] = column.toStringConverter;
        }
    }

    _makeHeaders() {
        this._columnMetadata.filter(col => col.visible !== false && !col.customHeaderComponent)
            .forEach(col => {
                col.customHeaderComponent = CustomHeaderComponent;
                col.customHeaderComponentProps = this._getCustomHeaderComponentProps(col);
            });
    }

    _setCurrentPage(pagesCount) {
        if (this.props.isRefresh) {
            this._currentPage = this._calculateCurrentPage(this.getCurrentPage(), pagesCount);
            return;
        } else if (this.props.currentPage != null) {
            switch (this.props.currentPage) {
                case 'first':
                    this._currentPage = 0;
                    return;
                case 'last':
                    this._currentPage = this._calculateCurrentPage(pagesCount - 1, pagesCount);
                    return;
                default:
                    this._currentPage = this._calculateCurrentPage(this.props.currentPage - 1, pagesCount);
                    return;
            }
        } else if (this.props.selectable && this._isSelectedRowKeyPresent()) {
            let rowIndex = this._allGridData.findIndex(x => x[this.getKeyColumn().columnName] === this.props.defaultSelectedRow);
            if (~rowIndex) {
                this._currentPage = Math.floor(rowIndex / this.getCurrentPageSize());
                return;
            }
        }

        this._currentPage = 0;
    }

    _isSelectedRowKeyPresent() {
        return this.props.defaultSelectedRow != null && this.props.defaultSelectedRow !== 'firstOnPage' && this.props.defaultSelectedRow !== 'lastOnPage';
    }

    _calculateCurrentPage(desiredPage, pagesCount) {
        pagesCount = pagesCount - 1;
        return desiredPage > pagesCount ? pagesCount : desiredPage;
    }

    _getPageRecords(allRecords) {
        return take(drop(allRecords, this.getCurrentPageSize() * this.getCurrentPage()), this.getCurrentPageSize());
    }

    _isNeedShowPager(pagesCount) {
        return pagesCount !== 1;
    }

    _setSelectedRow() {
        if (!this.props.selectable) {
            this._previousSelectedRow = null;
            this._selectedRow = null;
            return;
        }

        this._previousSelectedRow = this._selectedRow;
        const pageRecords = this._getPageRecords(this._allGridData);
        if (!pageRecords.length) {
            this._selectedRow = null;
            return;
        }
        if (this._selectedRow != null && !this._isSelectedRowKeyPresent() && pageRecords.find(x => x[this.getKeyColumn().columnName] ==
                this._selectedRow[this.getKeyColumn().columnName])) {
            return;
        } else if (this.props.defaultSelectedRow != null) {
            switch (this.props.defaultSelectedRow) {
                case 'firstOnPage':
                    this._selectedRow = pageRecords[0];
                    break;
                case 'lastOnPage':
                    this._selectedRow = pageRecords[pageRecords.length - 1];
                    break;
                default:
                    this._selectedRow = pageRecords.find(x => x[this.getKeyColumn().columnName] == this.props.defaultSelectedRow);
            }
        } else {
            this._selectedRow = null;
        }
    }

    _applyExternalFiltersIfNeed() {
        let self = this;

        if (this.props.commonFilter && this.props.commonFilter.values && this.props.commonFilter.values.length) {
            this._setCommonFilter(getFullFilterText(this.props.commonFilter.values, this.getCommonFilterText(), this.props.commonFilter.append), false);
        }

        if (this.props.columnsFilter && this.props.columnsFilter.length) {
            this._isColumnsFilterDisplayed = true;
            for (let columnFilter of this.props.columnsFilter) {
                let fullFilter = getFullFilterText(columnFilter.values, this._filterByColumns[columnFilter.colName], columnFilter.append);
                this._setFilterByColumn(columnFilter.colName, fullFilter, false);
            }
        }

        function getFullFilterText(values, currentFilterText, isAppend) {
            let externalFilterText = self._makeFilterString(values);
            let currentFilter = currentFilterText ? currentFilterText : '';
            return isAppend && currentFilter !== '' ? `${currentFilter}${orFilterCharacter}${externalFilterText}` : externalFilterText;
        }
    }

    _applySortOptions(sortOptions) {
        if (sortOptions) {
            this._currentSortColumn = sortOptions.columnName;
            this._isCurrentSortAscending = !this.props.sortOptions.direction || this.props.sortOptions.direction.toLowerCase() !== 'desc';
        }
    }

    _makeFilterString(filterValues) {
        if (!filterValues || !filterValues.length) {
            return '';
        }

        let filterStrings = [];
        for (let val of filterValues) {
            if (typeof val === 'string') {
                filterStrings.push(val);
            } else if (val.text && typeof val.text === 'string') {
                switch (val.filterType) {
                case 'equal':
                    filterStrings.push(`${equalFilterCharacter}${val.text}`);
                    break;
                case 'not-equal':
                    filterStrings.push(`${negateFilterCharacter}${equalFilterCharacter}${val.text}`);
                    break;
                case 'not':
                    filterStrings.push(`${negateFilterCharacter}${val.text}`);
                    break;
                default:
                    filterStrings.push(val.text);
                }
            }
        }

        return filterStrings.join(orFilterCharacter);
    }

    _columnsFilterVisibilityChanged() {
        this._isColumnsFilterDisplayed = !this.isColumnsFilterDisplayed();
    }

    _getCustomHeaderComponentProps(column) {
        return {
            getColumnTitle: this.getColumnTitle,
            getColumnFilter: this.getColumnFilter,
            isColumnSortable: this.isColumnSortable,
            isShowColumnFilter: this.isShowColumnFilter,
            isColumnsFilterDisplayed: this.isColumnsFilterDisplayed,
            getCurrentSortColumn: this.getCurrentSortColumn,
            isCurrentSortAscending: this.isCurrentSortAscending,
            setFilterByColumn: this._setFilterByColumn,
            gridId: this._gridId,
        }
    }

    _saveCheckboxToColletion(checkbox) {
        this._checkboxes.push(checkbox);
    }

    _removeCheckboxFromColletion(checkbox) {
        const index = this._checkboxes.indexOf(checkbox);
        if (~index) {
            this._checkboxes.splice(index, 1);
        }
    }

    _addExpandColumn() {
        const expandColumn = this._columnMetadata.find(column => column.columnName == expandColumnName);
        if (!expandColumn) {
            this._columnMetadata.push({
                columnName: expandColumnName,
                displayName: '',
                order: -1,
                sortable: false,
                filterable: false,
                exportable: false,
                customComponent: GridCollapse,
                customComponentProps: {
                    onRowCollapse: this._onRowCollapse,
                    onRowExpand: this._onRowExpand,
                },
                cssClassName: 'collapse-column'
            });
        }

        this._markExpandableRows();
    }

    _markExpandableRows() {
        let parentsWithChildren = this._allGridData.filter(r => r.parentKey != null).map(r => r.parentKey);
        let keyColumn = this.getKeyColumn().columnName;
        for (let record of this._allGridData) {
            let recordKey = record[keyColumn];
            if (~parentsWithChildren.indexOf(recordKey)) {
                record[expandColumnName] = ~this.getExpandedRecordsKeys().indexOf(recordKey);
            } else {
                record[expandColumnName] = null;
            }
        }
    }

    _onRowCollapse(rowData) {
        const keyColumn = this.getKeyColumn().columnName;
        this._expandedRecordsKeys = this._expandedRecordsKeys.filter(k => k !== rowData[keyColumn]);
        this._allGridData = this._allGridData.filter(r => r.parentKey !== rowData[keyColumn]);

        const results = this._getPageRecords(this._allGridData);
        const parentRow = results.find(r => r[keyColumn] === rowData[keyColumn]);
        if (parentRow != null) {
            parentRow[expandColumnName] = false;
        }

        const pagesCount = this.getPagesCount(this._allGridData.length);
        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
            pagesCount: pagesCount,
            showPager: this._isNeedShowPager(pagesCount),
        });
    }

    _onRowExpand(rowData) {
        const keyColumn = this.getKeyColumn().columnName;
        this._expandedRecordsKeys.push(rowData[keyColumn]);
        this._filterGridData(this._allData);
        this._filterCollapsedRows(this._allGridData);
        this._sortGridData();
        this._groupGridDataIfNeed();

        const results = this._getPageRecords(this._allGridData);
        const parentRow = results.find(r => r[keyColumn] === rowData[keyColumn]);
        if (parentRow != null) {
            parentRow[expandColumnName] = true;
        }

        if (this.isWithCheckboxColumn()) {
            this._checkRecords(results, true);
        }

        const pagesCount = this.getPagesCount(this._allGridData.length);
        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
            pagesCount: pagesCount,
            showPager: this._isNeedShowPager(pagesCount),
        });
    }

    _addCheckboxColumn() {
        const checkboxColumnName = 'isChecked';
        const checkboxColumn = this._columnMetadata.find(column => column.columnName == checkboxColumnName);
        if (!checkboxColumn) {
            this._columnMetadata.push({
                columnName: checkboxColumnName,
                order: 0,
                sortable: false,
                filterable: false,
                exportable: false,
                customComponent: GridCheckbox,
                customComponentProps: {
                    getKeyColumn: this.getKeyColumn,
                    saveCheckboxToColletion: this._saveCheckboxToColletion,
                    removeCheckboxFromColletion: this._removeCheckboxFromColletion,
                    recordCheckedChanged: this._recordCheckedChanged,
                },
                customHeaderComponent: GridHeaderCheckbox,
                customHeaderComponentProps: {
                    isHeaderChecked: this._isHeaderChecked,
                    setHeaderCheckbox: this._setHeaderCheckbox,
                    removeHeaderCheckbox: this._removeHeaderCheckbox,
                    updateHeaderCheckbox: this._updateHeaderCheckbox,
                    headerCheckedChanged: this._headerCheckedChanged,
                },
                cssClassName: 'checkbox-column'
            });
        }
    }

    _fillAllGridRecordsKeysOnClient() {
        this._allGridRecordsKeys = this._allGridData.map(item => item[this.getKeyColumn().columnName]);
    }

    _changeExpandedRecordsKeys(newExpandedRecords) {
        this._expandedRecordsKeys = newExpandedRecords;
    }

    _changeCheckedRecordsKeys(newCheckedRecords, notify = true) {
        let previousCheckedRecords;
        const isNotificationNeed = notify && typeof this.props.checkedRecordsChanged === 'function';
        if (isNotificationNeed) {
            previousCheckedRecords = this.getCheckedRecordsKeys().slice(0);
        }

        this._checkedRecordsKeys = newCheckedRecords;
        if (isNotificationNeed) {
            this.props.checkedRecordsChanged(this.getCheckedRecordsKeys(), previousCheckedRecords);
        }
    }

    _headerCheckedChanged(isChecked) {
        if (isChecked) {
            this._changeCheckedRecordsKeys(setOps.union(this.getCheckedRecordsKeys(), this._allGridRecordsKeys));
        } else {
            this._changeCheckedRecordsKeys(setOps.complement(this.getCheckedRecordsKeys(), this._allGridRecordsKeys));
        }

        this._isHeaderChecked = isChecked;
        this.state.results.map(item => item.isChecked = isChecked);
        this._checkboxes.forEach(c => c.checked = isChecked);
        this._updateCheckedRecordsInfo();
        this._clearPreviousToggledRecord();
    }

    _recordCheckedChanged(rowData, isChecked, multi) {
        const key = rowData[this.getKeyColumn().columnName];
        let recordsToCheck;
        if (multi) {
            const previousKey = this._previousToggledRecord.key
                ? this._previousToggledRecord.key
                : this._allGridData[0][this.getKeyColumn().columnName];
            let previousIndex = this._allGridData.findIndex(item => item[this.getKeyColumn().columnName] === previousKey);
            let currentIndex = this._allGridData.findIndex(item => item[this.getKeyColumn().columnName] === key);
            if (previousIndex > currentIndex) {
                const temp = previousIndex;
                previousIndex = currentIndex;
                currentIndex = temp;
            }
            recordsToCheck = this._allGridData.slice(previousIndex, currentIndex + 1).map(item => item[this.getKeyColumn().columnName]);
        } else {
            recordsToCheck = [key];
        }

        if (isChecked) {
            this._changeCheckedRecordsKeys(setOps.union(this.getCheckedRecordsKeys(), recordsToCheck));
        } else {
            this._changeCheckedRecordsKeys(setOps.complement(this.getCheckedRecordsKeys(), recordsToCheck));
        }

        this._checkRecords(this.state.results, true);
        this._handleHeaderChecked();
        this._updateHeaderCheckbox();
        this._updateCheckedRecordsInfo();
        this._previousToggledRecord = { key, isChecked };
    }

    _setHeaderCheckbox(headerCheckbox) {
        this.headerCheckbox = headerCheckbox;
    }

    _removeHeaderCheckbox() {
        delete this.headerCheckbox;
    }

    _updateHeaderCheckbox() {
        if (!this.headerCheckbox) {
            return;
        }

        this.headerCheckbox.indeterminate = this._isHeaderChecked === null;
        if (this._isHeaderChecked !== null) {
            this.headerCheckbox.checked = this._isHeaderChecked;
        }
    }

    _handleHeaderChecked() {
        this._isHeaderChecked = null;
        const intersection = setOps.intersection(this.getCheckedRecordsKeys(), this._allGridRecordsKeys);
        if (intersection.length === this._allGridRecordsKeys.length) {
            this._isHeaderChecked = true;
        } else if (intersection.length === 0) {
            this._isHeaderChecked = false;
        }
    }

    _checkRecords(records, withCheckboxes) {
        records.forEach(item => item.isChecked = ~this.getCheckedRecordsKeys()
            .indexOf(item[this.getKeyColumn().columnName]));
        if (withCheckboxes) {
            this._checkboxes.forEach(c => c.checked = this.getCheckedRecordsKeys().find(k => k.toString() === c.dataset.key) != null);
        }
    }

    _setPage(page) {
        this.showLoader();
        this._currentPage = page;
        if (this.props.serverData) {
            this._getData();
        } else {
            runAsync(() => this._setPageOnClient(), defaultAsyncDelay);
        }
    }

    _setPageOnClient() {
        const results = this._getPageRecords(this._allGridData);
        if (this.isWithCheckboxColumn()) {
            this._checkRecords(results);
        }

        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
        });
    }

    _changeSort(sortColumn, isAsc) {
        this.showLoader();
        this._clearPreviousToggledRecord();
        this._currentPage = 0;
        this._currentSortColumn = sortColumn;
        this._isCurrentSortAscending = isAsc;
        if (this.props.serverData) {
            this._getData();
        } else {
            runAsync(() => this._sortOnClient(), defaultAsyncDelay);
        }
    }

    _sortOnClient() {
        this._sortGridData();
        this._groupGridDataIfNeed();
        const results = this._getPageRecords(this._allGridData);
        if (this.isWithCheckboxColumn()) {
            this._checkRecords(results);
        }

        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
            externalSortColumn: this.getCurrentSortColumn(),
            externalSortAscending: this.isCurrentSortAscending(),
        });
    }

    _sortGridData() {
        const sortColumn = this.getCurrentSortColumn();
        if (!sortColumn) {
            return;
        }

        const column = this._columnMetadata.find(column => column.columnName === sortColumn);
        if (!column) {
            return;
        }

        const sortDirection = this._getSortDirection();
        if (typeof column.customSortFunc === 'function') {
            this._allGridData = column.customSortFunc(this._allGridData, sortColumn, sortDirection);
        } else {
            const defaultSortFunc = this._sorter.getDefaultSortFunction(column.columnType);
            this._allGridData = orderBy(this._allGridData, item => defaultSortFunc(item[sortColumn]), sortDirection);
        }
    }

    _groupGridDataIfNeed() {
        if (!this.isWithGrouping()) {
            return;
        }

        let result = [];
        let parentRows = this._allGridData.filter(r => r.parentKey == null);
        let keyColumn = this.getKeyColumn().columnName;
        for (let parentRow of parentRows) {
            result.push(parentRow);
            let childRows = this._allGridData.filter(r => r.parentKey == parentRow[keyColumn]);
            result.push(...childRows);
        }

        this._allGridData = result;
    }

    _getSortDirection() {
        return this.isCurrentSortAscending() ? 'asc' : 'desc';
    }

    _showOnlyCheckedRecordsChanged(isChecked) {
        this._showOnlyCheckedRecords = isChecked;
        this._applyAllFilters(0);
    }

    _setCommonFilter(filterText, withApply = true) {
        this._commonFilterText = filterText.trim();
        if (withApply) {
            this._applyAllFilters();
        }
    }

    _setFilterByColumn(columnName, filterText, withApply = true) {
        filterText = filterText.trim();
        if (filterText) {
            this._filterByColumns[columnName] = filterText;
        } else {
            delete this._filterByColumns[columnName];
        }

        if (withApply) {
            this._applyAllFilters();
        }
    }

    _applyAllFilters(delay = filterDelayInMilliseconds) {
        // Делаем задержку перед поиском, иначе он будет запускаться на каждый введённый символ
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
                this.showLoader();
                this._clearPreviousToggledRecord();
                this._currentPage = 0;
                if (this.props.serverData) {
                    // При серверном поиске нужно делать ограничение хотя бы от 2-х символов и желательно запускать поиск по кнопке "Найти"
                    this._getData();
                } else {
                    runAsync(() => this._filterOnClient(), defaultAsyncDelay);
                }
            },
            delay);
    }

    _filterOnClient() {
        this._filterGridData(this._allData);
        this._sortGridData();
        if (this.isWithGrouping()) {
            this._markExpandableRows();
            this._filterCollapsedRows(this._allGridData);
        }

        const results = this._getPageRecords(this._allGridData);
        if (this.isWithCheckboxColumn()) {
            this._fillAllGridRecordsKeysOnClient();
            this._checkRecords(results);
            this._handleHeaderChecked();
        }

        let pagesCount = this.getPagesCount(this._allGridData.length);
        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
            pagesCount: pagesCount,
            showPager: this._isNeedShowPager(pagesCount),
        });
    }

    _filterGridData(data) {
        this._allGridData = this._filter.apply(data, this._filterByColumns,
            { text: this.getCommonFilterText(), filterableColumns: this._filterableColumns }, this._columnsToStringConverters);

        if (this._showOnlyCheckedRecords) {
            this._filterByOnlyChecked();
        }
    }

    _filterCollapsedRows(data) {
        this._allGridData = data.filter(r => r.parentKey == null || ~this.getExpandedRecordsKeys().indexOf(r.parentKey));
    }

    _filterByOnlyChecked() {
        // При малом кол-ве отмеченных записей производительность чуть лучше варианта ниже,
        // однако при большом кол-ве выбранных записей этот вариант очень сильно проигрывает
        // return this._allGridData.filter(item => ~this.getCheckedRecordsKeys().indexOf(item[this.getKeyColumn().columnName]));

        let keyCol = this.getKeyColumn();
        setOps.pushUid(function() { return this[keyCol.columnName]; });
        const filteredData = setOps.intersection(this._allGridData, this.getCheckedRecordsKeys().map(key => ({ [keyCol.columnName]: key })));
        this._allGridData = this.getCurrentSortColumn() ? filteredData : utils.restoreDataOrder(this._allData, filteredData, keyCol.columnName);
        setOps.popUid();
    }

    _setPageSize(size) {
        this.showLoader();
        this._clearPreviousToggledRecord();
        const factor = this.getCurrentPageSize() / size;
        this._currentPageSize = size;
        this._currentPage = this._calculateCurrentPage(Math.round(this.getCurrentPage() * factor),
            this.getPagesCount(this._allGridData.length));
        if (this.props.serverData) {
            this._getData();
        } else {
            // Почему-то, если здесь задержка меньше 50, то overlay не всегда показывается
            runAsync(() => this._setPageSizeOnClient(), 50);
        }
        this.onChangePageSize(size);
    }

    _setPageSizeOnClient() {
        const results = this._getPageRecords(this._allGridData);
        if (this.isWithCheckboxColumn()) {
            this._checkRecords(results);
        }

        let pagesCount = this.getPagesCount(this._allGridData.length);
        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
            pagesCount: this.getPagesCount(this._allGridData.length),
            showPager: this._isNeedShowPager(pagesCount),
        });
    }

    _getData() {
        $.get(this.props.externalDataUrl, {
            // TODO Нужно ещё отправлять данные для фильтрации по столбцам
            'Paging.PageIndex': this.getCurrentPage(),
            'Paging.PageSize': this.getCurrentPageSize(),
            'Sorting.ColumnName': this.getCurrentSortColumn(),
            'Sorting.Direction': this._getSortDirection(),
            'Filter': this.getCommonFilterText(),
        }).done(data => {
            const results = this.props.mapData ? this.props.mapData(data.results) : data.results;

            if (this.isWithCheckboxColumn()) {
                if (!data.allKeys) {
                    throw new
                        Error('The property with name "allKeys" must come from server to be able to select rows in the grid with server side data approach');
                }

                this._allGridRecordsKeys = data.allKeys;
                this._checkRecords(results);
                this._handleHeaderChecked();
            }

            let pagesCount = this.getPagesCount(data.totalCount);
            this.setState({
                results: results,
                currentPage: this.getCurrentPage(),
                pagesCount: pagesCount,
                showPager: this._isNeedShowPager(pagesCount),
                externalResultsPerPage: this.getCurrentPageSize(),
                externalSortColumn: this.getCurrentSortColumn(),
                externalSortAscending: this.isCurrentSortAscending(),
            });
        });
    }

    _setLoaderPosition(loader) {
        if (this.isShowFilter() || this.isShowPageSizeSelector() || this.isWithCheckboxColumn()) {
            loader.css('top', '85px');
        } else {
            loader.css('top', '45px');
        }
    }

    _isRowSelected(rowData) {
        return this._selectedRow && rowData[this.getKeyColumn().columnName] === this._selectedRow[this.getKeyColumn().columnName];
    }

    _onRowSelected(row, event) {
        if (this.props.selectable) {
            this._selectRow(row.props.data, $(event.target).parents('tr'));
            this._raiseSelectedRowChangedEvent();
        }
    }

    _selectRow(rowData, rowElement) {
        this._previousSelectedRow = this._selectedRow;
        this._selectedRow = rowData;
        rowElement.parent().find('tr').removeClass('selected');
        rowElement.addClass('selected');
    }

    _raiseSelectedRowChangedEvent() {
        if (this.props.selectable && this._previousSelectedRow != this._selectedRow && typeof this.props.selectedRowChanged === 'function') {
            this.props.selectedRowChanged(this._selectedRow, this._previousSelectedRow);
        }
    }

    _exportFunc() {
        if (this.props.export.customExport === 'function') {
            this.props.export.customExport(); // TODO передать все необходимые параметры
            return;
        }

        this.showLoader();

        runAsync(() => {
                exportToXlsx({
                        data: this._allGridData,
                        columns: this._columnMetadata,
                        sheetName: this.props.export.sheetName,
                        fileName: this.props.export.fileName,
                        beforeHeaderExport: this.props.export.beforeHeaderExport,
                        afterHeaderExport: this.props.export.afterHeaderExport,
                        beforeBodyExport: this.props.export.beforeBodyExport,
                        afterBodyExport: this.props.export.afterBodyExport,
                    })
                    .always(() => this.hideLoader());
            },
            defaultAsyncDelay);
    }

    _saveCheckedRecordsInfoElem(elem) {
        this._checkedRecordsInfo = elem;
    }

    _removeCheckedRecordsInfoElem() {
        delete this._checkedRecordsInfo;
    }

    _updateCheckedRecordsInfo() {
        if (this.isWithCheckboxColumn()) {
            this._checkedRecordsInfo.innerText = this.getCheckedRecordsKeys().length;
        }
    }

    _getCustomFilterComponentProps() {
        return {
            getCommonFilterText: this.getCommonFilterText,
            isWithCheckboxColumn: this.isWithCheckboxColumn,
            isShowFilter: this.isShowFilter,
            isShowPageSizeSelector: this.isShowPageSizeSelector,
            getPageSizes: this.getPageSizes,
            getCurrentPageSize: this.getCurrentPageSize,
            pageSizeChanged: this._setPageSize,
            getCheckedRecordsKeys: this.getCheckedRecordsKeys,
            showOnlyCheckedRecordsChanged: this._showOnlyCheckedRecordsChanged,
            saveCheckedRecordsInfoElem: this._saveCheckedRecordsInfoElem,
            removeCheckedRecordsInfoElem: this._removeCheckedRecordsInfoElem,
            updateCheckedRecordsInfo: this._updateCheckedRecordsInfo,
        }
    }

    showLoader() {
        this._overlayCounter++;
        let overlay = $(this.refs.overlay);
        this._setLoaderPosition(overlay.find('.loader'));
        $(overlay).removeClass('hidden');
    }

    hideLoader() {
        this._overlayCounter--;
        if (this._overlayCounter <= 0) {
            this._overlayCounter = 0;
            $(this.refs.overlay).addClass('hidden');
        }
    }

    isWithGrouping() {
        return this.props.withGrouping;
    }

    isWithCheckboxColumn() {
        return this.props.withCheckboxColumn;
    }

    isShowPageSizeSelector() {
        return this.props.showPageSizeSelector;
    }

    isShowFilter() {
        return this.props.showFilter;
    }

    getCommonFilterText() {
        return this._commonFilterText;
    }

    getPageSizes() {
        return this._pageSizes;
    }

    getCurrentPageSize() {
        return this._currentPageSize;
    }

    getCurrentPage() {
        return this._currentPage;
    }

    getPagesCount(totalRecords) {
        return Math.ceil(totalRecords / this.getCurrentPageSize());
    }

    getCheckedRecordsKeys() {
        return this._checkedRecordsKeys;
    }

    getExpandedRecordsKeys() {
        return this._expandedRecordsKeys;
    }

    getGridData() {
        return this._allGridData.slice(0);
    }

    getCurrentSortColumn() {
        return this._currentSortColumn;
    }

    isCurrentSortAscending() {
        return this._isCurrentSortAscending;
    }

    isColumnsFilterDisplayed() {
        return this._isColumnsFilterDisplayed;
    }

    getColumnFilter(colName) {
        return this._filterByColumns[colName] ? this._filterByColumns[colName] : '';
    }

    isColumnSortable(colName) {
        return this._sortableColumns.indexOf(colName) !== -1;
    }

    getColumnTitle(colName) {
        let column = this._columnMetadata.find(c => c.columnName === colName);
        return column ? column.columnTitle : null;
    }

    getKeyColumn() {
        return this._keyColumn;
    }

    isShowColumnsFilter() {
        return this.props.showColumnsFilter && this._filterableColumns.length > 0;
    }

    isShowColumnFilter(colName) {
        return this.props.showColumnsFilter && this._filterableColumns.indexOf(colName) !== -1;
    }

    isExportEnabled() {
        return this.props.export != null;
    }

    getAllGridRecordsKeys() {
        const keyColumn = this.getKeyColumn();
        return this.getGridData().map(x => x[keyColumn.columnName]);
    }

    onChangePageSize(size) {
        if (typeof this.props.onChangePageSize === 'function') {
            this.props.onChangePageSize(size);
        }
    }

    _handleRowMetadata() {
        if (!this.isWithGrouping()) {
            return;
        }

        const originalFunc = this.props.rowMetadata.bodyCssClassName;
        this.props.rowMetadata.bodyCssClassName = rowData => {
            let originalClasses = '';
            if (typeof originalFunc === 'function') {
                originalClasses = originalFunc(rowData);
            }
            return rowData.parentKey != null ? `${originalClasses} child-row` : originalClasses;
        };
    }

    render() {
        return (
            <div className="custom-grid">
                <div className="overlay hidden" ref="overlay">
                    <Loader/>
                </div>
                { /* https://griddlegriddle.github.io/v0-docs/customization.html */ }
                <Griddle
                    {...this.props}
                    columnMetadata={this._columnMetadata}
                    filterPlaceholderText='Search...'
                    settingsText='Settings'
                    nextText='Next page'
                    previousText='Previous page'
                    maxRowsText='Page size'
                    enableCustomFormatText='Enable custom format'
                    noDataMessage={this.props.noDataMessage ? this.props.noDataMessage : defaultNoDataMessage}
                    showFilter
                    useCustomFilterComponent
                    customFilterComponent={GridToolbar}
                    customFilterComponentProps={this._getCustomFilterComponentProps()}
                    useExternal
                    externalSetPage={this._setPage}
                    externalChangeSort={this._changeSort}
                    externalSetFilter={this._setCommonFilter}
                    externalSetPageSize={this._setPageSize}
                    externalMaxPage={this.state.pagesCount}
                    externalCurrentPage={this.state.currentPage}
                    results={this.state.results.slice(0)}
                    resultsPerPage={this.state.externalResultsPerPage}
                    externalSortColumn={this.state.externalSortColumn}
                    externalSortAscending={this.state.externalSortAscending}
                    showPager={this.state.showPager}
                    isRowSelected={this._isRowSelected}
                    onRowSelected={this._onRowSelected}
                    isSelectable={this.props.selectable}
                />
            </div>
        );
    }
}

Grid.defaultProps = {
    rowMetadata: {},
    defaultCheckedRecordsKeys: [],
    defaultExpandedRecordsKeys: [],
    showFilter: true,
    showPageSizeSelector: true,
    showColumnsFilter: true,
    displayColumnsFilter: false,
};

Grid.defaultKeyColumn = '__id__';
