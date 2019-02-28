import React from 'react';
import PropTypes from 'prop-types';

export default class GridCheckbox extends React.Component {
    static propTypes = {
        extraProps: PropTypes.shape({
            getKeyColumn: PropTypes.func.isRequired,
            saveCheckboxToColletion: PropTypes.func.isRequired,
            removeCheckboxFromColletion: PropTypes.func.isRequired,
            recordCheckedChanged: PropTypes.func,
        }).isRequired,
        rowData: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    componentDidMount() {
        this.props.extraProps.saveCheckboxToColletion(this.inputRef.current);
    }

    componentWillUnmount() {
        this.props.extraProps.removeCheckboxFromColletion(this.inputRef.current);
    }

    _toggleChecked = e => {
        const { rowData, extraProps } = this.props;
        if (typeof extraProps.recordCheckedChanged === 'function') {
            extraProps.recordCheckedChanged(rowData, e.target.checked, this._shiftKey);
        }
    }

    _onClick = e => {
        this._shiftKey = e.shiftKey;
    }

    render() {
        const { rowData, extraProps } = this.props;

        return (
            <input
                ref={this.inputRef}
                type="checkbox"
                data-key={rowData[extraProps.getKeyColumn().columnName]}
                defaultChecked={rowData.isChecked}
                onChange={this._toggleChecked}
                onClick={this._onClick}
            />
        );
    }
}
