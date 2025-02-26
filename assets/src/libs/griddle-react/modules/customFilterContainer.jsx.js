/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
"use strict";

var React = require('react');
var createReactClass = require('create-react-class');

var CustomFilterContainer = createReactClass({
  displayName: "CustomFilterContainer",

  getDefaultProps: function getDefaultProps() {
    return {
      "placeholderText": ""
    };
  },
  render: function render() {
    var that = this;

    if (typeof that.props.customFilterComponent !== 'function') {
      console.log("Couldn't find valid template.");
      return React.createElement("div", null);
    }

    return React.createElement(that.props.customFilterComponent, {
      changeFilter: this.props.changeFilter,
      results: this.props.results,
      currentResults: this.props.currentResults,
      extraProps: this.props.extraProps,
      placeholderText: this.props.placeholderText });
  }
});

module.exports = CustomFilterContainer;
