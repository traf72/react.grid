﻿import './grid.less';
import '../font-awesome';
import drop from 'lodash/drop';
import take from 'lodash/take';
import orderBy from 'lodash/orderBy';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import PropTypes from 'prop-types';
import Griddle from '../../libs/griddle-react';
import setOps from '../../libs/setOps';
import Loader from '../loader';
import Filter, { orCharacter as orFilterCharacter, negateCharacter as negateFilterCharacter, equalCharacter as equalFilterCharacter } from '../filter';
import Sorter from '../sorter';
import Converter from '../converter';
import ColumnDefaultFormatter from '../column-formatter';
import { restoreDataOrder, delay } from '../utils';
import exportToXlsx from './grid-export';
import GridToolbar from './grid-toolbar';
import IconsHeader from './grid-icons-header';
import GridHeaderCheckbox from './grid-header-checkbox';
import GridCheckbox from './grid-checkbox';
import GridCollapse from './grid-collapse';
import LinkColumn from './grid-link-column';
import CustomHeaderComponent from './grid-header';
import uuid from 'uuid';

const million = 1000000;
const filterDelayInMilliseconds = 600;
const defaultAsyncDelay = 20;
const defaultPageSizes = [10, 15, 20, 25, 50, 100];
const defaultNoDataMessage = 'No results found';
const expandColumnName = 'isExpanded';
const defaultKeyColumn = '__id__';
const filterTypes = {
    equal: 'equal',
    notEqual: 'not-equal',
    not: 'not',
}

// TODO Вариант с данными с сервера нужно ещё дорабатывать, как минимум фильтрацию и сортировку
export default class Grid extends React.PureComponent {
    static propTypes = {
        resultsPerPage: PropTypes.number,
        isServerData: PropTypes.bool,
        serverDataUrl: PropTypes.string,
        rowMetadata: PropTypes.shape({
            bodyCssClassName: PropTypes.func,
        }),
        columnMetadata: PropTypes.arrayOf(PropTypes.shape({
            columnName: PropTypes.string.isRequired,
            displayName: PropTypes.string,
            columnTitle: PropTypes.string,
            keyColumn: PropTypes.bool,
            visible: PropTypes.bool,
            filterable: PropTypes.bool,
            sortable: PropTypes.bool,
            exportable: PropTypes.bool,
            showTitle: PropTypes.bool,
            order: PropTypes.number,
            cssClassName: PropTypes.string,
            columnType: PropTypes.string,
            columnFormat: PropTypes.string,
            toStringConverter: PropTypes.func,
            customSortFunc: PropTypes.func,
            urlField: PropTypes.string,
            url: PropTypes.string,
            customComponent: PropTypes.element,
            customComponentProps: PropTypes.object,
            customHeaderComponent: PropTypes.element,
            customHeaderComponentProps: PropTypes.object,
        })),
        results: PropTypes.arrayOf(PropTypes.object),
        defaultCheckedRecordsKeys: PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ])),
        defaultExpandedRecordsKeys: PropTypes.arrayOf(PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ])),
        showFilter: PropTypes.bool,
        showPageSizeSelector: PropTypes.bool,
        showColumnsFilter: PropTypes.bool,
        displayColumnsFilter: PropTypes.bool,
        withCheckboxColumn: PropTypes.bool,
        withGrouping: PropTypes.bool,
        isRefresh: PropTypes.bool,
        selectable: PropTypes.bool,
        currentPage: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        defaultSelectedRow: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        commonFilter: PropTypes.shape({
            values: PropTypes.arrayOf(PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    text: PropTypes.string,
                    filterType: PropTypes.oneOf(Object.values(filterTypes)),
                }),
            ])),
            append: PropTypes.bool,
        }),
        columnsFilter: PropTypes.arrayOf(PropTypes.shape({
            values: PropTypes.arrayOf(PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    text: PropTypes.string,
                    filterType: PropTypes.oneOf(Object.values(filterTypes)),
                }),
            ])),
            colName: PropTypes.string.isRequired,
            append: PropTypes.bool,
        })),
        sortOptions: PropTypes.shape({
            columnName: PropTypes.string.isRequired,
            direction: PropTypes.string,
        }),
        refreshFunc: PropTypes.func,
        checkedRecordsChanged: PropTypes.func,
        selectedRowChanged: PropTypes.func,
        onChangePageSize: PropTypes.func,
        onError: PropTypes.func,
        mapData: PropTypes.func,
        export: PropTypes.shape({
            exportUrl: PropTypes.string.isRequired,
            sheetName: PropTypes.string,
            fileName: PropTypes.string,
            beforeHeaderExport: PropTypes.func,
            afterHeaderExport: PropTypes.func,
            beforeBodyExport: PropTypes.func,
            afterBodyExport: PropTypes.func,
            customExport: PropTypes.func,
        }),
        noDataMessage: PropTypes.string,
        tableClassName: PropTypes.string,
    }

    static defaultProps = {
        rowMetadata: {},
        defaultCheckedRecordsKeys: [],
        defaultExpandedRecordsKeys: [],
        showFilter: true,
        showPageSizeSelector: true,
        showColumnsFilter: true,
        displayColumnsFilter: false,
        onError: message => alert(message),
    }

    constructor(props) {
        super(props);

        this._gridId = uuid.v4();

        this.overlay = React.createRef();

        this._initProperties();
        this._setInitialPageSize(props.resultsPerPage);

        this.state = this._getStateFromProps(props);
    }

    componentWillMount() {
        this._setSelectedRow();
    }

    componentDidMount() {
        if (this.props.isServerData) {
            this.showLoader();
            this._getData();
        }
        this._raiseSelectedRowChangedEvent();
    }

    componentWillReceiveProps(props) {
        this.setState(this._getStateFromProps(props));
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

    _getStateFromProps(props) {
        this._columnMetadata = cloneDeep(props.columnMetadata);
        this._clearPreviousToggledRecord();

        this._allGridData = this._allData = props.isServerData ? [] : cloneDeep(props.results);

        this._setKeyColumn();
        this._filter = new Filter(this.getKeyColumn().columnName);
        this._handleColumnMetadata();
        this._handleRowMetadata();

        this._removeNotActualColumnsFromColumnsFilter();

        this._applyExternalFiltersIfNeed();
        this._applySortOptions(props.sortOptions);
        this._filterGridData(this._allGridData);
        this._sortGridData();
        this._groupGridDataIfNeed();

        if (this.isWithCheckboxColumn() || this.isWithGrouping()) {
            this._fillAllGridRecordsKeysOnClient();
        }

        if (this.isWithCheckboxColumn()) {
            this._addCheckboxColumn();
            this._changeCheckedRecordsKeys(setOps.intersection(props.defaultCheckedRecordsKeys.slice(0), this._allGridRecordsKeys), false);
            this._checkRecords(this._allGridData);
            this._handleHeaderChecked();
        }
        if (this.isWithGrouping()) {
            this._changeExpandedRecordsKeys(setOps.intersection(props.defaultExpandedRecordsKeys.slice(0), this._allGridRecordsKeys));
            this._addExpandColumn();
            this._filterCollapsedRows(this._allGridData);
        }

        const pagesCount = this.getPagesCount(this._allGridData.length);
        this._setCurrentPage(pagesCount);

        return {
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
        for (const columnName in this._filterByColumns) {
            if (!this._filterableColumns.includes(columnName)) {
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
                columnName: defaultKeyColumn,
                keyColumn: true,
                visible: false,
            };
            this._columnMetadata.push(this.getKeyColumn());
        }
        if (this.getKeyColumn().columnName === defaultKeyColumn) {
            this._allGridData.forEach((item, index) => item[defaultKeyColumn] = index);
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
        for (const column of columnsWithDataType) {
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
        for (const column of columnsWithConvertFunctions) {
            this._columnsToStringConverters[column.columnName] = column.toStringConverter;
        }
    }

    _makeHeaders() {
        this._columnMetadata.filter(col => col.visible !== false && !col.customHeaderComponent)
            .forEach(col => {
                col.customHeaderComponent = CustomHeaderComponent;
                col.customHeaderComponentProps = this._getCustomHeaderComponentProps();
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
            const rowIndex = this._allGridData.findIndex(x => x[this.getKeyColumn().columnName] === this.props.defaultSelectedRow);
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
        const self = this;

        if (this.props.commonFilter && this.props.commonFilter.values && this.props.commonFilter.values.length) {
            this._setCommonFilter(getFullFilterText(this.props.commonFilter.values, this.getCommonFilterText(), this.props.commonFilter.append), false);
        }

        if (this.props.columnsFilter && this.props.columnsFilter.length) {
            this._isColumnsFilterDisplayed = true;
            for (const columnFilter of this.props.columnsFilter) {
                const fullFilter = getFullFilterText(columnFilter.values, this._filterByColumns[columnFilter.colName], columnFilter.append);
                this._setFilterByColumn(columnFilter.colName, fullFilter, false);
            }
        }

        function getFullFilterText(values, currentFilterText, isAppend) {
            const externalFilterText = self._makeFilterString(values);
            const currentFilter = currentFilterText ? currentFilterText : '';
            return isAppend && currentFilter !== '' ? `${currentFilter}${orFilterCharacter}${externalFilterText}` : externalFilterText;
        }
    }

    _applySortOptions(sortOptions) {
        if (sortOptions) {
            this._currentSortColumn = sortOptions.columnName;
            this._isCurrentSortAscending = !sortOptions.direction || sortOptions.direction.toLowerCase() !== 'desc';
        }
    }

    _makeFilterString(filterValues) {
        if (!filterValues || !filterValues.length) {
            return '';
        }

        const filterStrings = [];
        for (const val of filterValues) {
            if (typeof val === 'string') {
                filterStrings.push(val);
            } else if (val.text && typeof val.text === 'string') {
                switch (val.filterType) {
                    case filterTypes.equal:
                        filterStrings.push(`${equalFilterCharacter}${val.text}`);
                        break;
                    case filterTypes.notEqual:
                        filterStrings.push(`${negateFilterCharacter}${equalFilterCharacter}${val.text}`);
                        break;
                    case filterTypes.not:
                        filterStrings.push(`${negateFilterCharacter}${val.text}`);
                        break;
                    default:
                        filterStrings.push(val.text);
                }
            }
        }

        return filterStrings.join(orFilterCharacter);
    }

    _columnsFilterVisibilityChanged = () => {
        this._isColumnsFilterDisplayed = !this.isColumnsFilterDisplayed();
    }

    _getCustomHeaderComponentProps() {
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

    _saveCheckboxToColletion = checkbox => {
        this._checkboxes.push(checkbox);
    }

    _removeCheckboxFromColletion = checkbox => {
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
        const parentsWithChildren = this._allGridData.filter(r => r.parentKey != null).map(r => r.parentKey);
        const keyColumn = this.getKeyColumn().columnName;
        for (const record of this._allGridData) {
            const recordKey = record[keyColumn];
            if (parentsWithChildren.includes(recordKey)) {
                record[expandColumnName] = ~this.getExpandedRecordsKeys().indexOf(recordKey);
            } else {
                record[expandColumnName] = null;
            }
        }
    }

    _onRowCollapse = rowData => {
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

    _onRowExpand = rowData => {
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

    _headerCheckedChanged = isChecked => {
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

    _recordCheckedChanged = (rowData, isChecked, multi) => {
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

    _setHeaderCheckbox = headerCheckbox => {
        this.headerCheckbox = headerCheckbox;
    }

    _removeHeaderCheckbox = () => {
        delete this.headerCheckbox;
    }

    _updateHeaderCheckbox = () => {
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
        records.forEach(item => item.isChecked = this.getCheckedRecordsKeys().includes(item[this.getKeyColumn().columnName]));
        if (withCheckboxes) {
            this._checkboxes.forEach(c => c.checked = this.getCheckedRecordsKeys().find(k => k.toString() === c.dataset.key) != null);
        }
    }

    _setPage = async page => {
        this.showLoader();
        this._currentPage = page;
        if (this.props.isServerData) {
            this._getData();
        } else {
            await delay(defaultAsyncDelay);
            this._setPageOnClient();
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

    _changeSort = async (sortColumn, isAsc) => {
        this.showLoader();
        this._clearPreviousToggledRecord();
        this._currentPage = 0;
        this._currentSortColumn = sortColumn;
        this._isCurrentSortAscending = isAsc;
        if (this.props.isServerData) {
            this._getData();
        } else {
            await delay(defaultAsyncDelay);
            this._sortOnClient();
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

        const result = [];
        const parentRows = this._allGridData.filter(r => r.parentKey == null);
        const keyColumn = this.getKeyColumn().columnName;
        for (const parentRow of parentRows) {
            result.push(parentRow);
            const childRows = this._allGridData.filter(r => r.parentKey == parentRow[keyColumn]);
            result.push(...childRows);
        }

        this._allGridData = result;
    }

    _getSortDirection() {
        return this.isCurrentSortAscending() ? 'asc' : 'desc';
    }

    _showOnlyCheckedRecordsChanged = isChecked => {
        this._showOnlyCheckedRecords = isChecked;
        this._applyAllFilters(0);
    }

    _setCommonFilter = (filterText, withApply = true) => {
        this._commonFilterText = filterText.trim();
        if (withApply) {
            this._applyAllFilters();
        }
    }

    _setFilterByColumn = (columnName, filterText, withApply = true) => {
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

    _applyAllFilters(sleep = filterDelayInMilliseconds) {
        // Делаем задержку перед поиском, иначе он будет запускаться на каждый введённый символ
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(async () => {
            this.showLoader();
            this._clearPreviousToggledRecord();
            this._currentPage = 0;
            if (this.props.isServerData) {
                // При серверном поиске нужно делать ограничение хотя бы от 2-х символов и желательно запускать поиск по кнопке "Найти"
                this._getData();
            } else {
                await delay(defaultAsyncDelay);
                this._filterOnClient();
            }
        }, sleep);
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

        const pagesCount = this.getPagesCount(this._allGridData.length);
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
        this._allGridData = data.filter(r => r.parentKey == null || this.getExpandedRecordsKeys().includes(r.parentKey));
    }

    _filterByOnlyChecked() {
        // При малом кол-ве отмеченных записей производительность чуть лучше варианта ниже,
        // однако при большом кол-ве выбранных записей этот вариант очень сильно проигрывает
        // return this._allGridData.filter(item => this.getCheckedRecordsKeys().includes(item[this.getKeyColumn().columnName]));

        const keyCol = this.getKeyColumn();
        setOps.pushUid(function () { return this[keyCol.columnName]; });
        const filteredData = setOps.intersection(this._allGridData, this.getCheckedRecordsKeys().map(key => ({ [keyCol.columnName]: key })));
        this._allGridData = this.getCurrentSortColumn() ? filteredData : restoreDataOrder(this._allData, filteredData, keyCol.columnName);
        setOps.popUid();
    }

    _setPageSize = async size => {
        this.showLoader();
        this._clearPreviousToggledRecord();
        const factor = this.getCurrentPageSize() / size;
        this._currentPageSize = size;
        this._currentPage = this._calculateCurrentPage(Math.round(this.getCurrentPage() * factor),
            this.getPagesCount(this._allGridData.length));
        if (this.props.isServerData) {
            this._getData();
        } else {
            // Почему-то, если здесь задержка меньше 50, то overlay не всегда показывается
            await delay(50);
            this._setPageSizeOnClient();
        }
        this.onChangePageSize(size);
    }

    _setPageSizeOnClient() {
        const results = this._getPageRecords(this._allGridData);
        if (this.isWithCheckboxColumn()) {
            this._checkRecords(results);
        }

        const pagesCount = this.getPagesCount(this._allGridData.length);
        this.setState({
            results: results,
            currentPage: this.getCurrentPage(),
            pagesCount: this.getPagesCount(this._allGridData.length),
            showPager: this._isNeedShowPager(pagesCount),
        });
    }

    _getData() {
        $.get(this.props.serverDataUrl, {
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

            const pagesCount = this.getPagesCount(data.totalCount);
            this.setState({
                results: results,
                currentPage: this.getCurrentPage(),
                pagesCount: pagesCount,
                showPager: this._isNeedShowPager(pagesCount),
                externalResultsPerPage: this.getCurrentPageSize(),
                externalSortColumn: this.getCurrentSortColumn(),
                externalSortAscending: this.isCurrentSortAscending(),
            });
        }).fail(() => this.props.onError('An error occurred while fetching data from server'));
    }

    _setLoaderPosition(loader) {
        if (this.isShowFilter() || this.isShowPageSizeSelector() || this.isWithCheckboxColumn()) {
            loader.css('top', '85px');
        } else {
            loader.css('top', '45px');
        }
    }

    _isRowSelected = rowData => {
        return this._selectedRow && rowData[this.getKeyColumn().columnName] === this._selectedRow[this.getKeyColumn().columnName];
    }

    _onRowSelected = (row, event) => {
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

    _exportFunc = async () => {
        if (this.props.export.customExport === 'function') {
            this.props.export.customExport(); // TODO передать все необходимые параметры
            return;
        }

        this.showLoader();
        await delay(defaultAsyncDelay);
        exportToXlsx({
            data: this._allGridData,
            columns: this._columnMetadata,
            exportUrl: this.props.export.exportUrl,
            sheetName: this.props.export.sheetName,
            fileName: this.props.export.fileName,
            beforeHeaderExport: this.props.export.beforeHeaderExport,
            afterHeaderExport: this.props.export.afterHeaderExport,
            beforeBodyExport: this.props.export.beforeBodyExport,
            afterBodyExport: this.props.export.afterBodyExport,
        })
        .fail(() => this.props.onError('An error occurred while exporting data'))
        .always(() => this.hideLoader());
    }

    _saveCheckedRecordsInfoElem = elem => {
        this._checkedRecordsInfo = elem;
    }

    _removeCheckedRecordsInfoElem = () => {
        delete this._checkedRecordsInfo;
    }

    _updateCheckedRecordsInfo = () => {
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

    onChangePageSize = size => {
        if (typeof this.props.onChangePageSize === 'function') {
            this.props.onChangePageSize(size);
        }
    }

    showLoader() {
        this._overlayCounter++;
        const overlay = $(this.overlay.current);
        this._setLoaderPosition(overlay.find('.loader'));
        overlay.removeClass('hidden');
    }

    hideLoader() {
        this._overlayCounter--;
        if (this._overlayCounter <= 0) {
            this._overlayCounter = 0;
            $(this.overlay.current).addClass('hidden');
        }
    }

    isWithGrouping = () => {
        return this.props.withGrouping;
    }

    isWithCheckboxColumn = () => {
        return this.props.withCheckboxColumn;
    }

    isShowPageSizeSelector = () => {
        return this.props.showPageSizeSelector;
    }

    isShowFilter = () => {
        return this.props.showFilter;
    }

    getCommonFilterText = () => {
        return this._commonFilterText;
    }

    getPageSizes = () => {
        return this._pageSizes;
    }

    getCurrentPageSize = () => {
        return this._currentPageSize;
    }

    getCurrentPage = () => {
        return this._currentPage;
    }

    getPagesCount = totalRecords => {
        return Math.ceil(totalRecords / this.getCurrentPageSize());
    }

    getCheckedRecordsKeys = () => {
        return this._checkedRecordsKeys;
    }

    getExpandedRecordsKeys = () => {
        return this._expandedRecordsKeys;
    }

    getGridData() {
        return this._allGridData.slice(0);
    }

    getCurrentSortColumn = () => {
        return this._currentSortColumn;
    }

    isCurrentSortAscending = () => {
        return this._isCurrentSortAscending;
    }

    isColumnsFilterDisplayed = () => {
        return this._isColumnsFilterDisplayed;
    }

    getColumnFilter = colName => {
        return this._filterByColumns[colName] ? this._filterByColumns[colName] : '';
    }

    isColumnSortable = colName => {
        return this._sortableColumns.includes(colName);
    }

    getColumnTitle = colName => {
        const column = this._columnMetadata.find(c => c.columnName === colName);
        return column ? column.columnTitle : null;
    }

    getKeyColumn = () => {
        return this._keyColumn;
    }

    isShowColumnsFilter = () => {
        return this.props.showColumnsFilter && this._filterableColumns.length > 0;
    }

    isShowColumnFilter = colName => {
        return this.props.showColumnsFilter && this._filterableColumns.includes(colName);
    }

    isExportEnabled = () => {
        return this.props.export != null;
    }

    getAllGridRecordsKeys() {
        const keyColumn = this.getKeyColumn();
        return this.getGridData().map(x => x[keyColumn.columnName]);
    }

    render() {
        return (
            <div className="custom-grid">
                <div className="overlay hidden" ref={this.overlay}>
                    <Loader />
                </div>
                { /* https://griddlegriddle.github.io/v0-docs/customization.html */}
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
