'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

export default class GridHeaderCheckbox extends React.Component {
    constructor(props) {
        super(props);

        this._toggleChecked = this._toggleChecked.bind(this);
    }

    componentDidMount() {
        this.props.setHeaderCheckbox(ReactDOM.findDOMNode(this));
        this.props.updateHeaderCheckbox();
    }

    componentDidUpdate() {
        this.props.updateHeaderCheckbox();
    }

    componentWillUnmount() {
        this.props.removeHeaderCheckbox();
    }

    _toggleChecked(e) {
        this.props.headerCheckedChanged(e.target.checked);
    }

    render() {
        return <input type="checkbox" defaultChecked={this.props.isHeaderChecked} onChange={this._toggleChecked} />;
    }
}
