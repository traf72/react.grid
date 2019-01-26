export const byteTypes = ['byte', 'tinyint'];
export const shortTypes = ['short', 'int16', 'smallint'];
export const intTypes = ['int', 'int32'];
export const longTypes = ['long', 'int64', 'bigint'];
export const floatingTypes = ['float', 'single', 'double', 'real', 'number'];
export const decimalTypes = ['decimal', 'money', 'smallmoney', 'numeric'];
export const dateTypes = ['datetime', 'datetime2', 'date', 'datetimeoffset', 'smalldatetime'];
export const timeTypes = ['time'];
export const boolTypes = ['bool', 'boolean', 'bit'];
export const stringTypes = ['string', 'char', 'varchar', 'text', 'nchar', 'nvarchar', 'ntext'];
export const allIntegerTypes = byteTypes.concat(shortTypes).concat(intTypes).concat(longTypes);
export const allNumberTypes = allIntegerTypes.concat(floatingTypes).concat(decimalTypes);

export const attrTypes = ['Simple', 'Multilingual', 'List', 'OleObject'];
export const attrOwners = ['Position', 'Employee'];
