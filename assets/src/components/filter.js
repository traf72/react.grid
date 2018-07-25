'use strict';

import setOps from '../libs/setOps';
import utils from './utils';

export const orCharacter = '|';
export const negateCharacter = '!';
export const equalCharacter = '=';
export const startsWithCharacter = '+';
export const escapeCharacter = '\\';

const maxParsedSymbolsCount = 2; // Парсим на предмет наличия спец. символов только первые 2 символа
const allSpecialCharacter = [negateCharacter, equalCharacter, startsWithCharacter, escapeCharacter];

export default class Filter {
    constructor(keyCol) {
        this._keyColumn = keyCol || 'id';
        this._filterFunctionsMapping = {};
        this._mapFilterFunctions();
    }

    _mapFilterFunctions() {
        this._filterFunctionsMapping.default = this._like;
        this._filterFunctionsMapping[equalCharacter] = this._equal;
        this._filterFunctionsMapping[startsWithCharacter] = this._startsWith;
    }

    apply(inputData, filterByColumns, commonFilter, toStringConverters) {
        if (!inputData || !Array.isArray(inputData)) {
            throw new Error('Parameter "inputData" must be an Array and cannot be null or undefined');
        }

        if (!inputData.length) {
            return inputData;
        }
        this._columnsToStringConverters = toStringConverters ? toStringConverters : {};

        this._setKeyMethod();

        let filteredData = inputData;
        if (filterByColumns) {
            for (let key in filterByColumns) {
                filteredData = this._applyFilterByColumn(filterByColumns[key], key, filteredData);
            }
        }

        if (commonFilter && commonFilter.text && commonFilter.text.trim()) {
            const filterableColumns = commonFilter.filterableColumns || Object.keys(inputData[0]);
            filteredData = this._applyCommonFilter(commonFilter.text, filterableColumns, filteredData);
        }

        this._resetKeyMethod();

        return filteredData;
    }

    _applyFilterByColumn(filterText, column, inputData) {
        if (!filterText || !filterText.trim()) {
            return inputData;
        }

        const filterFunctions = this._getFilterFunctions(filterText);
        return this._combineFilterFunctions(filterFunctions, this._or, column, inputData)();
    }

    _applyCommonFilter(filterText, filterableColumns, inputData) {
        if (!filterText || !filterText.trim() || !filterableColumns || !filterableColumns.length) {
            return inputData;
        }

        const filterFunctions = this._getFilterFunctions(filterText);
        const filteredDataArray = [];
        for (let column of filterableColumns) {
            filteredDataArray.push(this._combineFilterFunctions(filterFunctions, this._or, column, inputData)());
        }

        return filteredDataArray.length == 1
            ? filteredDataArray[0]
            : this._restoreInitialDataOrder(inputData,
                filteredDataArray.reduce((prev, current) => this._or(prev, current)));
    }

    // Функции объекта setOps сортируют входные данные в непонятном порядке для увеличения производительности,
    // а нам нужно возвратить данные в исходном порядке, поэтому приходится делать такой хак
    _restoreInitialDataOrder(inputData, filteredData) {
        return utils.restoreDataOrder(inputData, filteredData, this._keyColumn);
    }

    _combineFilterFunctions(filterFunctions, combineFunction, column, inputData) {
        if (!filterFunctions || !filterFunctions.length) {
            return () => inputData;
        }
        if (filterFunctions.length == 1) {
            return filterFunctions[0].bind(this, column, inputData);
        }
        const resultFn = filterFunctions.reduce((prev, current) => combineFunction
            .bind(this, prev(column, inputData), current(column, inputData)));
        return this._restoreInitialDataOrder.bind(this, inputData, resultFn());
    }

    _getFilterFunctions(filterText) {
        const filterFunctions = [];
        const filterStrings = utils.splitStringWithEscaping(filterText, orCharacter, escapeCharacter).filter(item => !!item || !!item.trim());
        for (let filterString of filterStrings) {
            filterString = filterString.trim();
            const specialCharacters = this._parseSpecialCharacters(filterString);
            let filterFunction = this._filterFunctionsMapping.default;
            for (let character of specialCharacters.characters) {
                if (character in this._filterFunctionsMapping) {
                    filterFunction = this._filterFunctionsMapping[character];
                    break;
                }
            }

            const negate = specialCharacters.characters.includes(negateCharacter);
            filterFunctions.push(filterFunction.bind(this, negate, specialCharacters.actualFilterString));
        }

        return filterFunctions;
    }

    _parseSpecialCharacters(filterString) {
        const specialCharacters = [];
        let actualFilterString = filterString;
        let currentSymbol = actualFilterString[0];
        let parsedSymbolsCount = 0;
        const totalParsedSymbolsCount = Math.min(maxParsedSymbolsCount, actualFilterString.length);
        while (parsedSymbolsCount < totalParsedSymbolsCount &&
            allSpecialCharacter.includes(currentSymbol) &&
            !specialCharacters.includes(currentSymbol))
        {
            actualFilterString = actualFilterString.substring(1);
            if (currentSymbol === escapeCharacter) {
                break;
            }
            
            specialCharacters.push(currentSymbol);
            currentSymbol = actualFilterString[0];
            parsedSymbolsCount++;
        }

        return {
            characters: specialCharacters,
            actualFilterString: actualFilterString,
        };
    }

    _like(negate, filterText, column, inputData) {
        return negate
            ? inputData.filter(item =>
                (item[column] == null && filterText)
                || (item[column] != null && !this._getToStringConverter(column)(item[column]).toLowerCase().includes(filterText.toLowerCase()))
            )
            : inputData.filter(item =>
                (item[column] == null && !filterText)
                || (item[column] != null && this._getToStringConverter(column)(item[column]).toLowerCase().includes(filterText.toLowerCase()))
            );
    }

    _equal(negate, filterText, column, inputData) {
        return negate
            ? inputData.filter(item =>
                (item[column] == null && filterText)
                || (item[column] != null && this._getToStringConverter(column)(item[column]).toLowerCase() !== filterText.toLowerCase())
            )
            : inputData.filter(item =>
                (item[column] == null && !filterText)
                || (item[column] != null && this._getToStringConverter(column)(item[column]).toLowerCase() === filterText.toLowerCase())
            );
    }

    _startsWith(negate, filterText, column, inputData) {
        return negate
            ? inputData.filter(item =>
                (item[column] == null && filterText)
                || (item[column] != null && !this._getToStringConverter(column)(item[column]).toLowerCase().startsWith(filterText.toLowerCase()))
            )
            : inputData.filter(item =>
                (item[column] == null && !filterText)
                || (item[column] != null && this._getToStringConverter(column)(item[column]).toLowerCase().startsWith(filterText.toLowerCase()))
            );
    }

    _getToStringConverter(column) {
        return this._columnsToStringConverters[column] ? this._columnsToStringConverters[column] : input => input.toString();
    }

    _or(input1, input2) {
        if (!input1.length) {
            return input2;
        }
        if (!input2.length) {
            return input1;
        }
        return setOps.union(input1, input2);
    }

    _and(input1, input2) {
        if (!input1.length) {
            return input1;
        }
        if (!input2.length) {
            return input2;
        }
        return setOps.intersection(input1, input2);
    }

    _setKeyMethod() {
        const keyCol = this._keyColumn;
        setOps.pushUid(function() { return this[keyCol]; });
    }

    _resetKeyMethod() {
        setOps.popUid();
    }
}
