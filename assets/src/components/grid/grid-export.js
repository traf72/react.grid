﻿import { boolTypes, dateTypes } from '../data-types';
import Formatter from '../formatter';
import moment from '../moment';
import sortBy from 'lodash/sortBy';

const headerBackgroundColor = '#EDEDEF';
let formatter;
let exportSettings;

export default function exportToXlsx(settings) {
    formatter = new Formatter();
    exportSettings = { ...settings }
    exportSettings.exportableColumns = prepareColumns(settings.columns);

    const exportData = [];

    callCallback(exportSettings.beforeHeaderExport, exportData);
    exportHeader(exportData);
    callCallback(exportSettings.afterHeaderExport, exportData);

    callCallback(exportSettings.beforeBodyExport, exportData);
    exportBody(exportData);
    callCallback(exportSettings.afterBodyExport, exportData);

    return saveExportedFile(exportData);
}

function prepareColumns(columns) {
    const exportableColumns = columns.filter(c => c.exportable !== false && c.visible !== false);
    return sortBy(exportableColumns, ['order']);
}

function callCallback(callback, exportedData) {
    if (typeof callback === 'function') {
        callback({
            exportedData: exportedData,
            allData: exportSettings.data,
            exportableColumns: exportSettings.exportableColumns,
            allColumns: exportSettings.columns,
        });
    }
}

function exportHeader(exportData) {
    const headerCells = [];
    const headerDefaultStyle = {
        backgroundColor: headerBackgroundColor,
        font: { isBold: true },
    };

    exportSettings.exportableColumns.forEach(col => {
        if (typeof col.customHeaderExport === 'function') {
            headerCells.push(col.customHeaderExport(col, headerDefaultStyle));
        } else {
            headerCells.push({
                value: col.displayName ? col.displayName : col.columnName,
                style: headerDefaultStyle,
            });
        }
    });

    exportData.push(headerCells);
}

function exportBody(exportData) {
    for (const row of exportSettings.data) {
        const cells = [];
        for (const col of exportSettings.exportableColumns) {
            if (typeof col.customCellExport === 'function') {
                cells.push(col.customCellExport(col, row));
                continue;
            }

            cells.push({
                value: getFormattedValue(col.columnType, row[col.columnName]),
                type: col.columnType,
                style: {
                    backgroundColor: typeof col.exportCellBackgroundColor === 'function'
                        ? col.exportCellBackgroundColor(row, col)
                        : col.exportCellBackgroundColor,
                    font: {
                        color: typeof col.exportCellFontColor === 'function'
                            ? col.exportCellFontColor(row, col)
                            : col.exportCellFontColor,
                        isBold: typeof col.exportCellFontIsBold === 'function'
                            ? col.exportCellFontIsBold(row, col)
                            : col.exportCellFontIsBold,
                        isItalic: typeof col.exportCellFontIsItalic === 'function'
                            ? col.exportCellFontIsItalic(row, col)
                            : col.exportCellFontIsItalic,
                        size: typeof col.exportCellFontSize === 'function'
                            ? col.exportCellFontSize(row, col)
                            : col.exportCellFontSize,
                        name: typeof col.exportCellFontName === 'function'
                            ? col.exportCellFontName(row, col)
                            : col.exportCellFontName,
                    }
                }
            });
        }
        exportData.push(cells);
    }
}

function saveExportedFile(exportData) {
    const {
        sheetName = 'Sheet',
        fileName = 'ExportedData',
        exportUrl
    } = exportSettings;

    return $.post(exportUrl, { fileName, sheetName, data: exportData })
        .done(downloadUrl => {
            if (downloadUrl) {
                location.href = downloadUrl;
            }
        });
}

function getFormattedValue(type, value) {
    if (!type) {
        return value;
    }

    type = type.trim().toLowerCase();
    if (boolTypes.includes(type)) {
        return formatter.formatBool(value);
    }
    if (dateTypes.includes(type)) {
        return moment(value).format('YYYYMMDDhhmmss');
    }

    return value;
}
