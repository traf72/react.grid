/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
'use strict';

var React = require('react');
var createReactClass = require('create-react-class');
var ColumnProperties = require('./columnProperties.js');
var deep = require('./deep.js');
var isFunction = require('lodash/isFunction');
var fromPairs = require('lodash/fromPairs');
var assign = require('lodash/assign');
var defaults = require('lodash/defaults');
var toPairs = require('lodash/toPairs');
var without = require('lodash/without');

var GridRow = createReactClass({
  displayName: 'GridRow',

  getDefaultProps: function getDefaultProps() {
    return {
      "isChildRow": false,
      "showChildren": false,
      "data": {},
      "columnSettings": null,
      "rowSettings": null,
      "hasChildren": false,
      "useGriddleStyles": true,
      "useGriddleIcons": true,
      "isSubGriddle": false,
      "paddingHeight": null,
      "rowHeight": null,
      "parentRowCollapsedClassName": "parent-row",
      "parentRowExpandedClassName": "parent-row expanded",
      "parentRowCollapsedComponent": "▶",
      "parentRowExpandedComponent": "▼",
      "onRowClick": null,
      "isRowSelected": null,
      "onRowSelected": null,
	  "isSelectable": false,
      "multipleSelectionSettings": null,
    };
  },
  getInitialState: function getInitialState() {
	var isSelected = this.props.isSelectable && typeof this.props.isRowSelected === 'function' ? this.props.isRowSelected(this.props.data) : false;
	return { isSelected: isSelected };
  },
  handleClick: function handleClick(e) {
    if (this.props.onRowClick !== null && isFunction(this.props.onRowClick)) {
      this.props.onRowClick(this, e);
    } else if (this.props.hasChildren) {
      this.props.toggleChildren();
    }
	
	if (this.props.isSelectable && typeof this.props.onRowSelected === 'function') {
		this.props.onRowSelected(this, e);
	}
  },
  handleSelectionChange: function handleSelectionChange(e) {
    //hack to get around warning that's not super useful in this case
    return;
  },
  handleSelectClick: function handleSelectClick(e) {
    if (this.props.multipleSelectionSettings.isMultipleSelection) {
      if (e.target.type === "checkbox") {
        this.props.multipleSelectionSettings.toggleSelectRow(this.props.data, this.refs.selected.checked);
      } else {
        this.props.multipleSelectionSettings.toggleSelectRow(this.props.data, !this.refs.selected.checked);
      }
    }
  },
  verifyProps: function verifyProps() {
    if (this.props.columnSettings === null) {
      console.error("gridRow: The columnSettings prop is null and it shouldn't be");
    }
  },
  render: function render() {
    var _this = this;

    this.verifyProps();
    var that = this;
    var columnStyles = null;

    if (this.props.useGriddleStyles) {
      columnStyles = {
        margin: "0px",
        padding: that.props.paddingHeight + "px 5px " + that.props.paddingHeight + "px 5px",
        height: that.props.rowHeight ? this.props.rowHeight - that.props.paddingHeight * 2 + "px" : null,
        backgroundColor: "#FFF",
        borderTopColor: "#DDD",
        color: "#222"
      };
    }

    var columns = this.props.columnSettings.getColumns();

    // make sure that all the columns we need have default empty values
    // otherwise they will get clipped
    var defaultValues = fromPairs(columns, []);

    // creates a 'view' on top the data so we will not alter the original data but will allow us to add default values to missing columns
    var dataView = assign({}, this.props.data);

    defaults(dataView, defaultValues);
    var data = toPairs(deep.pick(dataView, without(columns, 'children')));
    var nodes = data.map(function (col, index) {
      var returnValue = null;
      var meta = _this.props.columnSettings.getColumnMetadataByName(col[0]);

      //todo: Make this not as ridiculous looking
      var firstColAppend = index === 0 && _this.props.hasChildren && _this.props.showChildren === false && _this.props.useGriddleIcons ? React.createElement('span', { style: _this.props.useGriddleStyles ? { fontSize: "10px", marginRight: "5px" } : null }, _this.props.parentRowCollapsedComponent) : index === 0 && _this.props.hasChildren && _this.props.showChildren && _this.props.useGriddleIcons ? React.createElement('span', { style: _this.props.useGriddleStyles ? { fontSize: "10px" } : null }, _this.props.parentRowExpandedComponent) : "";

      if (index === 0 && _this.props.isChildRow && _this.props.useGriddleStyles) {
        columnStyles = assign(columnStyles, { paddingLeft: 10 });
      }

      var colTitle;
      if (meta != null && meta.showTitle) {
          colTitle = col[1];
      }

      if (_this.props.columnSettings.hasColumnMetadata() && typeof meta !== 'undefined' && meta !== null) {
        if (typeof meta.customComponent !== 'undefined' && meta.customComponent !== null) {
          var customComponent = React.createElement(meta.customComponent, { data: col[1], rowData: dataView, metadata: meta, extraProps: meta.customComponentProps });
          returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index, style: columnStyles, title: colTitle }, customComponent);
        } else {
          returnValue = React.createElement('td', { onClick: _this.handleClick, className: meta.cssClassName, key: index, style: columnStyles, title: colTitle }, firstColAppend, col[1]);
        }
      }

      return returnValue || React.createElement('td', { onClick: _this.handleClick, key: index, style: columnStyles, title: colTitle }, firstColAppend, col[1]);
    });

    if (nodes && this.props.multipleSelectionSettings && this.props.multipleSelectionSettings.isMultipleSelection) {
      var selectedRowIds = this.props.multipleSelectionSettings.getSelectedRowIds();

      nodes.unshift(React.createElement('td', { key: 'selection', style: columnStyles }, React.createElement('input', {
        type: 'checkbox',
        checked: this.props.multipleSelectionSettings.getIsRowChecked(dataView),
        onChange: this.handleSelectionChange,
        ref: 'selected' })));
    }

    //Get the row from the row settings.
    var className = that.props.rowSettings && that.props.rowSettings.getBodyRowMetadataClass(that.props.data) || "standard-row";

	if (this.props.isSelectable) {
		className += ' selectable';
	}
	
	if (this.state.isSelected) {
		className += ' selected';
	}
	
    if (that.props.isChildRow) {
      className = "child-row";
    } else if (that.props.hasChildren) {
      className = that.props.showChildren ? this.props.parentRowExpandedClassName : this.props.parentRowCollapsedClassName;
    }
    return React.createElement('tr', { onClick: this.props.multipleSelectionSettings && this.props.multipleSelectionSettings.isMultipleSelection ? this.handleSelectClick : null, className: className }, nodes);
  }
});

module.exports = GridRow;
