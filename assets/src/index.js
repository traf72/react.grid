import './index.less';
import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import Grid from './components/grid';
import { delay } from './components/utils';
import cities from 'cities.json';

const columnMetadata = [
    {
        columnName: 'country',
        displayName: 'Country',
        cssClassName: 'country-column',
    },
    {
        columnName: 'name',
        displayName: 'City',
        cssClassName: 'city-column',
    },
    {
        columnName: 'lat',
        displayName: 'Latitude',
        cssClassName: 'latitude-column',
        columnType: 'number',
    },
    {
        columnName: 'lng',
        displayName: 'Longitude',
        cssClassName: 'longitude-column',
        columnType: 'number',
    },
];

class Sample extends React.PureComponent {
    state = {
        data: []
    }

    componentDidMount() {
        this.refresh();
    }

    async _getData(isRefresh) {
        await delay(200);
        this.setState({
            data: cities.map(c => ({...c, lat: +c.lat, lng: +c.lng})),
            isRefresh,
        });
    }

    refresh = () => {
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
