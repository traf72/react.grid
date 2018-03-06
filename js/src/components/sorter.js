'use strict';

import {allNumberTypes, dateTypes, boolTypes} from './dataTypes.js';

export default class Sorter {
	getDefaultSortFunction(dataType) {
		if (!dataType) {
			return this.sortStrings;
		}
		
		dataType = dataType.trim().toLowerCase();
		if (~allNumberTypes.indexOf(dataType) || ~boolTypes.indexOf(dataType)) {
			return this.sortNumbers;
		}
		if (~dateTypes.indexOf(dataType)) {
			return this.sortDates;
		}
		return this.sortStrings;
	}
	
	sortNumbers(item) {	
		return item == null ? -Infinity : item;
	}
	
	sortStrings(item) {	
		return item == null ? '' : item.toLowerCase();
	}
	
	sortDates(item) {	
		return item == null ? new Date(-8640000000000000) : item;
	}
}
