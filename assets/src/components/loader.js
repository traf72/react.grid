import React from 'react';
import PropTypes from 'prop-types';
import 'loaders.css';
import { Loader as ReactLoader } from 'react-loaders';

const Loader = ({ cssClassName = '' }) => {
    return <ReactLoader className={cssClassName} type="line-spin-fade-loader" />;
}

Loader.propTypes = {
    cssClassName: PropTypes.string,
}

export default Loader;