'use strict';

import Filter from '../../src/components/filter.js';
import {expect} from 'chai';
import moment from 'moment';

describe("Filter test", () => {
    let filter = new Filter();
    let columnsToStringConverters = {
        isWorked: input => input === true ? 'Yes' : (input === false ? 'No' : null),
        startDate: input => moment(input).format('DD.MM.YYYY'),
    };

    let data = [
        {id: 1, name: 'Иванов Иван', position: 'Инженер', isWorked: true, startDate: new Date(2016, 0, 1)},
        {id: 2, name: 'Петров Алексей', position: 'Менеджер', isWorked: false, startDate: new Date(2016, 3, 28)},
        {id: 3, name: 'Сидоров Сидор', position: 'Директор', isWorked: true, startDate: new Date(2014, 11, 31)},
        {id: 4, name: 'Петров Иван', position: 'Системный администратор', isWorked: true, startDate: new Date(2015, 10, 15)},
        {id: 5, name: 'Иванов Александр', position: 'Уборщик', isWorked: true, startDate: new Date(1900, 1, 1)},
        {id: 6, name: null, position: null, isWorked: false, startDate: null},
        {id: 7, name: undefined, position: undefined, isWorked: false, startDate: undefined},
        {id: 0, name: '', position: '', isWorked: false, startDate: null},
    ];

    it("Test parse special characters", () => {
        let result = filter._parseSpecialCharacters('');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('#emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('#emp');

        result = filter._parseSpecialCharacters('\\#emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('#emp');

        result = filter._parseSpecialCharacters('\\\\#emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('\\#emp');

        result = filter._parseSpecialCharacters('!emp');
        expect(result.characters).to.deep.equal(['!']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('\\!emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('!emp');

        result = filter._parseSpecialCharacters(' !emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal(' !emp');

        result = filter._parseSpecialCharacters('=emp');
        expect(result.characters).to.deep.equal(['=']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('\\=emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('=emp');

        result = filter._parseSpecialCharacters(' =emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal(' =emp');

        result = filter._parseSpecialCharacters('!=emp');
        expect(result.characters).to.deep.equal(['!', '=']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('\\!=emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('!=emp');

        result = filter._parseSpecialCharacters('!\\=emp');
        expect(result.characters).to.deep.equal(['!']);
        expect(result.actualFilterString).to.equal('=emp');

        result = filter._parseSpecialCharacters('=!emp');
        expect(result.characters).to.deep.equal(['=', '!']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('\\=!emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('=!emp');

        result = filter._parseSpecialCharacters('=\\!emp');
        expect(result.characters).to.deep.equal(['=']);
        expect(result.actualFilterString).to.equal('!emp');

        result = filter._parseSpecialCharacters('*emp');
        expect(result.characters).to.deep.equal(['*']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('\\*emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('*emp');

        result = filter._parseSpecialCharacters(' *emp');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal(' *emp');

        result = filter._parseSpecialCharacters('!*emp');
        expect(result.characters).to.deep.equal(['!', '*']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('*!emp');
        expect(result.characters).to.deep.equal(['*', '!']);
        expect(result.actualFilterString).to.equal('emp');

        result = filter._parseSpecialCharacters('=');
        expect(result.characters).to.deep.equal(['=']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('\\=');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('=');

        result = filter._parseSpecialCharacters('!');
        expect(result.characters).to.deep.equal(['!']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('\\!');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('!');

        result = filter._parseSpecialCharacters('*');
        expect(result.characters).to.deep.equal(['*']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('\\*');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('*');

        result = filter._parseSpecialCharacters('!=');
        expect(result.characters).to.deep.equal(['!', '=']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('\\!=');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('!=');

        result = filter._parseSpecialCharacters('!\\=');
        expect(result.characters).to.deep.equal(['!']);
        expect(result.actualFilterString).to.equal('=');

        result = filter._parseSpecialCharacters('=!');
        expect(result.characters).to.deep.equal(['=', '!']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('!*');
        expect(result.characters).to.deep.equal(['!', '*']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('*!');
        expect(result.characters).to.deep.equal(['*', '!']);
        expect(result.actualFilterString).to.equal('');

        result = filter._parseSpecialCharacters('e');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('!e');
        expect(result.characters).to.deep.equal(['!']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('=e');
        expect(result.characters).to.deep.equal(['=']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('*e');
        expect(result.characters).to.deep.equal(['*']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('!=e');
        expect(result.characters).to.deep.equal(['!', '=']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('!*e');
        expect(result.characters).to.deep.equal(['!', '*']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('=!e');
        expect(result.characters).to.deep.equal(['=', '!']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('*!e');
        expect(result.characters).to.deep.equal(['*', '!']);
        expect(result.actualFilterString).to.equal('e');

        result = filter._parseSpecialCharacters('\\!e');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('!e');

        result = filter._parseSpecialCharacters('\\!!e');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('!!e');

        result = filter._parseSpecialCharacters('!\\!e');
        expect(result.characters).to.deep.equal(['!']);
        expect(result.actualFilterString).to.equal('!e');

        result = filter._parseSpecialCharacters('\\==e');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('==e');

        result = filter._parseSpecialCharacters('=\\=e');
        expect(result.characters).to.deep.equal(['=']);
        expect(result.actualFilterString).to.equal('=e');

        result = filter._parseSpecialCharacters('\\*e');
        expect(result.characters).to.deep.equal([]);
        expect(result.actualFilterString).to.equal('*e');

        result = filter._parseSpecialCharacters('!=!=e');
        expect(result.characters).to.deep.equal(['!', '=']);
        expect(result.actualFilterString).to.equal('!=e');

        result = filter._parseSpecialCharacters('!*!*e');
        expect(result.characters).to.deep.equal(['!', '*']);
        expect(result.actualFilterString).to.equal('!*e');

        result = filter._parseSpecialCharacters('!=e=!');
        expect(result.characters).to.deep.equal(['!', '=']);
        expect(result.actualFilterString).to.equal('e=!');

        result = filter._parseSpecialCharacters('!*e*!');
        expect(result.characters).to.deep.equal(['!', '*']);
        expect(result.actualFilterString).to.equal('e*!');
    });

    it("Test apply filter by columns", () => {
        expect(filter.apply.bind(null, null)).to.throw(Error);
        expect(filter.apply.bind(null, undefined)).to.throw(Error);
        expect(filter.apply.bind(null, {})).to.throw(Error);

        let filterByColumns = null;
        let result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns = { };
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = '';
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = '  ';
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = null;
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = undefined;
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = '!';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        filterByColumns.id = '100|1000';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        filterByColumns.id = '1';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(1);

        filterByColumns.id = '!1';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(7);
        expect(result.find(item => item.id === 1)).to.be.an('undefined');

        filterByColumns.id = '  !1';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(7);
        expect(result.find(item => item.id === 1)).to.be.an('undefined');

        filterByColumns.id = '|';
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = '  |  ';
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        filterByColumns.id = '1|3';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(1);
        expect(result[1].id).to.be.equal(3);

        filterByColumns.id = '1\\|3';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        filterByColumns.id = '1 || 3';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(1);
        expect(result[1].id).to.be.equal(3);

        filterByColumns.id = '1|3 | 5';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(3);
        expect(result[0].id).to.be.equal(1);
        expect(result[1].id).to.be.equal(3);
        expect(result[2].id).to.be.equal(5);

        filterByColumns.id = '!1|!3';
        result = filter.apply(data, filterByColumns);
        expect(result).to.be.deep.equal(data);

        delete filterByColumns.id;
        filterByColumns.name = 'петр';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(4);

        filterByColumns.name = 'ПЕТР';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(4);

        filterByColumns.position = 'админ';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(4);

        filterByColumns.id = '1';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        delete filterByColumns.id;
        delete filterByColumns.name;
        delete filterByColumns.position;

        filterByColumns.name = '=';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(3);
        expect(result[0].id).to.be.equal(6);
        expect(result[1].id).to.be.equal(7);
        expect(result[2].id).to.be.equal(0);

        filterByColumns.name = '!=';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(5);
        expect(result.find(item => item.id === 0)).to.be.an('undefined');
        expect(result.find(item => item.id === 6)).to.be.an('undefined');
        expect(result.find(item => item.id === 7)).to.be.an('undefined');

        filterByColumns.name = '*';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(8);

        filterByColumns.name = '!*';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        filterByColumns.name = '=петр';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        filterByColumns.name = '*петр';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(4);

        filterByColumns.name = '=Петров Иван';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(4);

        filterByColumns.name = '  =Петров Иван';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(4);

        filterByColumns.name = '=Петров Иван || =иванов александр';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(4);
        expect(result[1].id).to.be.equal(5);

        filterByColumns.id = '=4';
        filterByColumns.name = '=Петров ИВАН';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(4);

        delete filterByColumns.id;
        filterByColumns.name = '!ан';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(5);
        expect(result.find(item => item.id === 1)).to.be.an('undefined');
        expect(result.find(item => item.id === 4)).to.be.an('undefined');
        expect(result.find(item => item.id === 5)).to.be.an('undefined');

        filterByColumns.name = '!*петр';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(6);
        expect(result.find(item => item.id === 2)).to.be.an('undefined');
        expect(result.find(item => item.id === 4)).to.be.an('undefined');

        filterByColumns.name = '!=Петров ИВАН';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(7);
        expect(result.find(item => item.id === 4)).to.be.an('undefined');

        filterByColumns.name = '=!Петров ИВАН';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(7);
        expect(result.find(item => item.id === 4)).to.be.an('undefined');

        delete filterByColumns.name;
        filterByColumns.isWorked = 'true';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(4);
        expect(result[0].id).to.be.equal(1);
        expect(result[1].id).to.be.equal(3);
        expect(result[2].id).to.be.equal(4);
        expect(result[3].id).to.be.equal(5);

        filterByColumns.isWorked = 'false';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(4);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(6);
        expect(result[2].id).to.be.equal(7);
        expect(result[3].id).to.be.equal(0);

        filterByColumns.isWorked = 'Y';
        result = filter.apply(data, filterByColumns);
        expect(result.length).to.be.equal(0);

        result = filter.apply(data, filterByColumns, null, columnsToStringConverters);
        expect(result.length).to.be.equal(4);
        expect(result[0].id).to.be.equal(1);
        expect(result[1].id).to.be.equal(3);
        expect(result[2].id).to.be.equal(4);
        expect(result[3].id).to.be.equal(5);

        filterByColumns.isWorked = '=no';
        result = filter.apply(data, filterByColumns, null, columnsToStringConverters);
        expect(result.length).to.be.equal(4);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(6);
        expect(result[2].id).to.be.equal(7);
        expect(result[3].id).to.be.equal(0);

        filterByColumns.isWorked = '=YES';
        filterByColumns.startDate = '2014';
        result = filter.apply(data, filterByColumns, null, columnsToStringConverters);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(3);

        filterByColumns.startDate = '=15.11.2015';
        result = filter.apply(data, filterByColumns, null, columnsToStringConverters);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(4);
    });

    it("Test apply common filter", () => {
        let commonFilter = { text: 'с' };
        let result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(4);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(3);
        expect(result[2].id).to.be.equal(4);
        expect(result[3].id).to.be.equal(5);

        commonFilter.text = '!с';
        result = filter.apply(data, null, commonFilter);
        expect(result).to.be.deep.equal(data);

        commonFilter.text = 'кт|ей';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(2);
        expect(result[1].id).to.be.equal(3);

        commonFilter.text = '*СИ';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(2);
        expect(result[0].id).to.be.equal(3);
        expect(result[1].id).to.be.equal(4);

        commonFilter.text = 'Иванов Иван';
        commonFilter.filterableColumns = ['name'];
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(1);

        commonFilter.filterableColumns = null;
        commonFilter.text = 'not found';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(0);

        commonFilter.text = '=not found';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(0);

        commonFilter.text = '!';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(0);

        commonFilter.text = '01.01.2016';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(0);

        result = filter.apply(data, null, commonFilter, columnsToStringConverters);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(1);

        commonFilter.text = '!=';
        commonFilter.filterableColumns = ['name', 'position'];
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(5);
        expect(result.find(item => item.id === 0)).to.be.an('undefined');
        expect(result.find(item => item.id === 6)).to.be.an('undefined');
        expect(result.find(item => item.id === 7)).to.be.an('undefined');

        commonFilter.text = '=';
        result = filter.apply(data, null, commonFilter);
        expect(result.length).to.be.equal(3);
        expect(result[0].id).to.be.equal(6);
        expect(result[1].id).to.be.equal(7);
        expect(result[2].id).to.be.equal(0);

        commonFilter.text = '';
        result = filter.apply(data, null, commonFilter);
        expect(result).to.be.deep.equal(data);

        commonFilter.text = null;
        result = filter.apply(data, null, commonFilter);
        expect(result).to.be.deep.equal(data);

        commonFilter.text = undefined;
        result = filter.apply(data, null, commonFilter);
        expect(result).to.be.deep.equal(data);

        commonFilter.text = 'с';
        commonFilter.filterableColumns = [];
        result = filter.apply(data, null, commonFilter);
        expect(result).to.be.deep.equal(data);
    });

    it("Test apply", () => {
        let filterByColumns = {id: '1'};
        let commonFilter = { text: 'же' };
        let result = filter.apply(data, filterByColumns, commonFilter);
        expect(result.length).to.be.equal(1);
        expect(result[0].id).to.be.equal(1);

        filterByColumns.id = '3';
        result = filter.apply(data, filterByColumns, commonFilter);
        expect(result.length).to.be.equal(0);
    });
});