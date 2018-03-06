'use strict';

import React from 'react';
import 'loaders.css';
import { Loader as ReactLoader } from 'react-loaders';

export default class Loader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <ReactLoader className={this.props.cssClassName} type="line-spin-fade-loader"/>;
    }
}

Loader.defaultProps = { cssClassName: '' };
