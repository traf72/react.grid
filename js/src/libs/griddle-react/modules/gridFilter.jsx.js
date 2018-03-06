/*
   See License / Disclaimer https://raw.githubusercontent.com/DynamicTyped/Griddle/master/LICENSE
*/
"use strict";

var React = require('react');
var createReactClass = require('create-react-class');

var GridFilter = createReactClass({
    displayName: "GridFilter",

    getDefaultProps: function getDefaultProps() {
        return {
            "placeholderText": ""
        };
    },
    handleChange: function handleChange(event) {
        this.props.changeFilter(event.target.value);
    },
    render: function render() {
        return React.createElement("div", { className: "filter-container" }, React.createElement("input", { type: "text", name: "filter", placeholder: this.props.placeholderText, className: "form-control", onChange: this.handleChange }));
    }
});

module.exports = GridFilter;
