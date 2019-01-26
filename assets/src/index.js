'use strict';

import './index.less';
import '@babel/polyfill';
import $ from 'jquery';
import 'bootstrap';
import React from 'react';
import ReactDOM from 'react-dom';
import Grid from './components/grid/grid';
import runAsync from './components/async';
import cities from 'cities.json';

const columnMetadata = [{
        columnName: 'country',
        displayName: 'Country',
        cssClassName: 'country-column',
    }, {
        columnName: 'name',
        displayName: 'City',
        cssClassName: 'city-column',
    }, {
        columnName: 'lat',
        displayName: 'Latitude',
        cssClassName: 'latitude-column',
        dataType: 'number',
    }, {
        columnName: 'lng',
        displayName: 'Longitude',
        cssClassName: 'longitude-column',
        dataType: 'number',
    },
];

class Sample extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
        };

        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    _getData(isRefresh) {
        runAsync(() => this.setState({
            data: cities.slice(1),
            isRefresh: isRefresh,
        }), 200);
    }

    refresh() {
        this.refs.grid.showLoader();
        this._getData(true);
    }

    render() {
        return (
            <Grid ref="grid" 
                tableClassName="grid table"
                results={this.state.data}
                isRefresh={this.state.isRefresh}
                resultsPerPage={30}
                showFilter
                showPageSizeSelector
                withCheckboxColumn
                columnMetadata={columnMetadata}
                selectable
                defaultSelectedRow="firstOnPage"
                refreshFunc={this.refresh}
            />
        );
    }
}

ReactDOM.render(<Sample />, document.getElementById('grid'));
