import React from 'react';
import ReactDOM from 'react-dom';

export default class GridCheckbox extends React.Component {
    componentDidMount() {
        this.props.extraProps.saveCheckboxToColletion(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
        this.props.extraProps.removeCheckboxFromColletion(ReactDOM.findDOMNode(this));
    }

    _toggleChecked = e => {
        if (typeof this.props.extraProps.recordCheckedChanged === 'function') {
            this.props.extraProps.recordCheckedChanged(this.props.rowData, e.target.checked, this._shiftKey);
        }
    }

    _onClick = e => {
        this._shiftKey = e.shiftKey;
    }

    render() {
        return (
            <input type="checkbox" data-key={this.props.rowData[this.props.extraProps.getKeyColumn().columnName]} defaultChecked={this.props.rowData.isChecked} onChange={this._toggleChecked} onClick={this._onClick}/>
        );
    }
}
