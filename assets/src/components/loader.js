import React from 'react';
import 'loaders.css';
import { Loader as ReactLoader } from 'react-loaders';

const Loader = ({cssClassName = ''}) => {
    return <ReactLoader className={cssClassName} type="line-spin-fade-loader" />;
}

export default Loader;