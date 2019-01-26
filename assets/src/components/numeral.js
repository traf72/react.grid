import numeral from 'numeral';

numeral.register('locale',
    'ru',
    {
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'тыс.',
            million: 'млн',
            billion: 'млрд',
            trillion: 'трлн'
        },
        ordinal(number) {
            return '-й';
        },
        currency: {
            symbol: '₽'
        }
    });

const userLocale = 'en';
numeral.locale(userLocale.trim().toLowerCase());
export default numeral;
