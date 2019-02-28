import React from 'react';
import PropTypes from 'prop-types';

export default class GridHeaderCheckbox extends React.Component {
    static propTypes = {
        setHeaderCheckbox: PropTypes.func.isRequired,
        updateHeaderCheckbox: PropTypes.func.isRequired,
        removeHeaderCheckbox: PropTypes.func.isRequired,
        headerCheckedChanged: PropTypes.func.isRequired,
        isHeaderChecked: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }
    
    componentDidMount() {
        this.props.setHeaderCheckbox(this.inputRef.current);
        this.props.updateHeaderCheckbox();
    }

    componentDidUpdate() {
        this.props.updateHeaderCheckbox();
    }

    componentWillUnmount() {
        this.props.removeHeaderCheckbox();
    }

    _toggleChecked = e => {
        this.props.headerCheckedChanged(e.target.checked);
    }

    render() {
        return (
            <input
                ref={this.inputRef}
                type="checkbox"
                defaultChecked={this.props.isHeaderChecked}
                onChange={this._toggleChecked}
            />
        );
    }
}
