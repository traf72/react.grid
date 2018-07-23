'use strict';

import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';

const alertId = 'custom-alert';
const alertContainerId = 'alert-container';
const alertCloseBtnId = 'alert-close-btn';

class Alert extends React.Component {
    constructor(props) {
        super(props);
        this._onCloseFunction = this._onCloseFunction.bind(this);
        this._closeAlert = this._closeAlert.bind(this);
    }

    componentDidMount() {
        $(document.body).on('click', this._closeAlert);
        if (this.props.automaticCloseTimeoutInMs) {
            this._timerId = setTimeout(() => $(`#${alertId}`).fadeOut('slow', () => this._closeAlert()), this.props.automaticCloseTimeoutInMs);
        }
    }

    componentWillUnmount() {
        $(document.body).off('click', this._closeAlert);
    }

    _closeAlert(e) {
        if (e != null && e.target.id === alertCloseBtnId) {
            e.preventDefault();
        }

        clearTimeout(this._timerId);
        $(`#${alertCloseBtnId}`).alert();
        this._onCloseFunction();
        ReactDom.unmountComponentAtNode(document.getElementById(alertContainerId));
    }

    _onCloseFunction() {
        if (typeof this.props.onCloseFunction === 'function') {
            this.props.onCloseFunction();
        }
    }

    render() {
        return (
            <div className={'alert alert-' + this.props.type} id={alertId}>
                <a href="#" id={alertCloseBtnId} className="close" aria-label="close">&times;</a>
                {this.props.message}
            </div>
        );
    }
}

Alert.propTypes = {
    type: PropTypes.string,
    message: PropTypes.string,
    automaticCloseTimeoutInMs: PropTypes.number,
};

function showAlert(type, message, automaticCloseTimeoutInMs, onCloseFunction) {
    ReactDom.render(<Alert type={type} message={message} automaticCloseTimeoutInMs={automaticCloseTimeoutInMs} onCloseFunction={onCloseFunction} />, getContainer().get(0));
}

function getContainer() {
    let container = $(`#${alertContainerId}`);
    if (!container.length) {
        container = $('<div/>', {
            'id': alertContainerId,
            'class': 'alert-container',
        }).appendTo(document.body);
    }
    return container;
}

export function showSuccess(message, automaticCloseTimeoutInMs, onCloseFunction) {
    showAlert('success', message, automaticCloseTimeoutInMs == null ? 3000 : automaticCloseTimeoutInMs, onCloseFunction);
}

export function showWarning(message, automaticCloseTimeoutInMs, onCloseFunction) {
    showAlert('warning', message, automaticCloseTimeoutInMs, onCloseFunction);
}

export function showError(message, automaticCloseTimeoutInMs, onCloseFunction) {
    showAlert('danger', message, automaticCloseTimeoutInMs, onCloseFunction);
}

export function showInfo(message, automaticCloseTimeoutInMs, onCloseFunction) {
    showAlert('info', message, automaticCloseTimeoutInMs, onCloseFunction);
}
