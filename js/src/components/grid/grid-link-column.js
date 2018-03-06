'use strict';

import React from 'react';

export default class LinkColumn extends React.Component {
    render() {
        return <a href={this.props.rowData[this.props.metadata.urlField]} onMouseDown={this.props.metadata.onMouseDown}>{this.props.data}</a>;
    }
}
