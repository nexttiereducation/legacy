(function () {

    angular.module('csv-export', []).factory('CsvExport', CsvExport);

    CsvExport.$inject = [];

    function CsvExport() {
        var service = {
            flattenObject : flattenObject,
            flattenArray : flattenArray,
            convertToCSV : convertToCSV,
            createColumnTitles : createColumnTitles,
            createColumnContent: createColumnContent,
            exportCSV : exportCSV,
            convertStudentsDataToCSVSummary: convertStudentsDataToCSVSummary
        };

    return service;

    ////////////////

    function convertStudentsDataToCSVSummary(studentsArray, fields, csvString) {
        for (var student = 0; student < studentsArray.length; student++) {
            var csvRow = generateRowOfStudentData(studentsArray[student], fields);
            csvString += csvRow.join(',') + '\r\n';
        }
        return csvString;
    }
    /////////////////

    function generateRowOfStudentData(student, fields) {
        var csvRow = [];
        for(var field = 0; field < fields.length; field++) {
            if (fields[field] == 'phase') {
                if (/enior/.test(student[fields[field]])) {
                    student[fields[field]] = 'Senior';
                } else if (fields[field] == 'phase') {
                    student[fields[field]] = 'Junior';
                }
            }else if (Array.isArray(student[fields[field]])) {
                if (student[fields[field]].length > 0) {
                    var string = '';
                    var arrayObject = student[fields[field]]
                    for(var k = 0; k < arrayObject.length; k++ ) {
                        if (k < 1) {
                            string += arrayObject[k].name;
                        }else {
                            string += ',' + arrayObject[k].name;
                        }
                    }
                    student[fields[field]] = ''' + string + ''';
                }else {
                    student[fields[field]] = undefined;
                }
            }else if (fields[field].match(/meta/) !== null) {
                student[fields[field]] = _.get(student, fields[field], undefined);
            }
            csvRow[field] = student[fields[field]];
        }
        return csvRow;
    }

    function exportCSV( fileName, csvData ) {
        var data = 'data:text/csv;charset=utf-8,' + csvData;
        data = encodeURI( data );
        var link = document.createElement( 'a' );
        link.setAttribute( 'href', data );
        link.setAttribute( 'download', fileName );
        link.click();
    }

    function flattenObject( obj ) {
        var result = {};
        for (var fieldName in obj) {
            var value =  obj[fieldName];
            if ( Array.isArray(value) ) {
                value = flattenArray(value);
            }
            result[fieldName] = value;
        }
        return result;
    }
    function flattenArray( array ) {
        var result = '';
        if (array !== undefined) {
            if (array instanceof Array) {
                for (var i = 0; i < array.length; i++) {
                    var value = array[i];
                    if (typeof value != 'string' && !isFinite(value)) {
                        var tmp = '';
                        //If the object has a 'name' use that for the value to include the CSV
                        if (value['name']) {
                            tmp = value['name'];
                        }
                        else
                            for (var fieldName in value) {
                                tmp += fieldName + ':' + value[fieldName] + ',';
                            }
                        value = tmp;
                    }
                    result += value;
                    if (i < array.length - 1) {
                        result += ','
                    }
                }
            }else if (typeof array == 'string') {
                result += array.replace(/'/g,'');
            }
        }
        return result;
    }
    /* Change an object array into a csv file. If the object has attributes that are arrays it will attempt
     * to flatten those arrays into a comma separated list of values.
     * IF the object array should actually look into an attribute for the object to flatten (ie, a container
     * for what you really want to render) then provide that field. This prevents requiring iteration over the
     * list prior to invocation to remove the wrapper.
     */
    function convertToCSV( params, repeatedObject ) {

        checkOrInitParams( params );
        var titles = createColumnTitles( params );
        var columnContent = createColumnContent( params, '', repeatedObject );
        return { 'csv': columnContent, 'titles': titles};
    }
    /**
     *
     */
    function checkOrInitParams(params ) {
        params.data = params.data || [];

        // if data is an Object, not in array [{}], then just create 1 item array.
        // So from now all data in array of object format.
        if (!Array.isArray(params.data)) {
            params.data = [params.data];
        }

        // Set params.fields default to first data element's keys
        if (!params.fields && (params.data.length === 0 || typeof params.data[0] !== 'object')) {
            throw new Error('params should include 'fields' and/or non-empty 'data' array of objects');
        }
        params.fields = params.fields || Object.keys(params.data[0]);

        //#check fieldNames.
        if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
            throw new Error('fieldNames and fields should be of the same length, if fieldNames is provided.');
        }

        // Get fieldNames from fields
        params.fieldNames = params.fields.map(function (field, i) {
            if (params.fieldNames && typeof params.fieldNames[i] === 'string') {
                return params.fieldNames[i];
            }
            return (typeof field === 'string') ? field : (field.label || field.value);
        });

        //#check delimiter
        params.del = params.del || ',';

        //#check end of line character
        params.eol = params.eol || '\r\n';

        //#check quotation mark
        params.quotes = typeof params.quotes === 'string' ? params.quotes : ''';

        //#check default value
        params.defaultValue = params.defaultValue;

        //#check hasCSVColumnTitle, if it is not explicitly set to false then true.
        params.hasCSVColumnTitle = params.hasCSVColumnTitle !== false;

    }

    /**
     * Create the title row with all the provided fields as column headings
     *
     * @param {Object} params Function parameters containing data, fields and delimiter
     * @returns {String} titles as a string
     */
    function createColumnTitles(params) {
        var str = '';

        //if CSV has column title, then create it
        if (params.hasCSVColumnTitle) {
            params.fieldNames.forEach(function (element) {
                if (str !== '') {
                    str += params.del;
                }
                str += JSON.stringify(element).replace(/\'/g, params.quotes);
            });
        }

        return str;
    }

    /**
     * Replace the quotation marks of the field element if needed (can be a not string-like item)
     *
     * @param {string} stringifiedElement The field element after JSON.stringify()
     * @param {string} quotes The params.quotes value. At this point we know that is not equal to double (')
     */
    function replaceQuotationMarks(stringifiedElement, quotes) {
        var lastCharIndex = stringifiedElement.length - 1;

        //check if it's an string-like element
        if (stringifiedElement[0] === ''' && stringifiedElement[lastCharIndex] === ''') {
            //split the stringified field element because Strings are immutable
            var splitElement = stringifiedElement.split('');

            //replace the quotation marks
            splitElement[0] = quotes;
            splitElement[lastCharIndex] = quotes;

            //join again
            stringifiedElement = splitElement.join('');
        }

        return stringifiedElement;
    }
    /**
     * Create the content column by column and row by row below the title
     *
     * @param {Object} params Function parameters containing data, fields and delimiter
     * @param {String} str Title row as a string
     * @returns {String} csv string
     */
    function createColumnContent( params, str, repeatedObject ) {
        var eol = params.eol || '\r\n';
        params.data.forEach(function( dataElement ) {
            if ( repeatedObject ) {
                dataElement['repeated'] = repeatedObject;
            }
            //if null or empty object do nothing
            if (dataElement && Object.getOwnPropertyNames(dataElement).length > 0) {
                var line = '';

                params.fields.forEach(function (fieldElement) {
                    var val;

                    if (fieldElement && (typeof fieldElement === 'string' || typeof fieldElement.value === 'string')) {
                        var path = (typeof fieldElement === 'string') ? fieldElement : fieldElement.value;
                        val = _.get(dataElement, path, fieldElement.default || params.defaultValue);
                    } else if (fieldElement && typeof fieldElement.value === 'function') {
                        val = fieldElement.value(dataElement) || fieldElement.default;
                    }

                    if (val !== undefined) {
                        var stringifiedElement = JSON.stringify(val);

                        if (typeof val === 'object') stringifiedElement = JSON.stringify(stringifiedElement);

                        if (params.quotes !== ''') {
                            stringifiedElement = replaceQuotationMarks(stringifiedElement, params.quotes);
                        }

                        line += stringifiedElement;
                    }

                    line += params.del;
                });

                //remove last delimeter
                line = line.substring(0, line.length - 1);
                line = line.replace(/\\'/g, Array(3).join(params.quotes));
                //If rows exists append
                if (str !== '') {
                    str += eol + line;
                } else {
                    str = line;
                }
            }
        });

        return str;
    }
}
})();
