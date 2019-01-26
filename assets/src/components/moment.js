import moment from 'moment';

moment.locale('en');

moment.isToday = function(date) {
    return date ? moment().isSame(moment(date), 'day') : false;
}

moment.isYesterday = function(date) {
    return date ? moment().subtract(1, 'day').isSame(moment(date), 'day') : false;
}

export default moment;
