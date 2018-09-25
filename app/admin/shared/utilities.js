angular
    .module('adminModule')
    .factory('jsUtilities', jsUtilities);

jsUtilities.$inject = [];

function jsUtilities() {
    // Source: http://stackoverflow.com/questions/497790
    var dates = {
        convert: function(d) {
            // Converts the date in d to a date-object. The input can be:
            //   a date object: returned without modification
            //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
            //   a number     : Interpreted as number of milliseconds
            //                  since 1 Jan 1970 (a timestamp)
            //   a string     : Any format supported by the javascript engine, like
            //                  'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.
            //  an object     : Interpreted as an object with year, month and date
            //                  attributes.  **NOTE** month is 0-11.
            return (d.constructor === Date
                    ? d
                    : d.constructor === Array
                        ? new Date(d[0], d[1], d[2])
                        : d.constructor === Number
                            ? new Date(d)
                            : d.constructor === String
                                ? new Date(d)
                                : typeof d === 'object'
                                    ? new Date(d.year, d.month, d.date)
                                    : NaN);
        },
        compare: function(a, b) {
            // Compare two dates (could be of any type supported by the convert
            // function above) and returns:
            //  -1 : if a < b
            //   0 : if a = b
            //   1 : if a > b
            // NaN : if a or b is an illegal date
            // NOTE: The code inside isFinite does an assignment (=).
            return (isFinite(a = this.convert(a).valueOf())
                    && isFinite(b = this.convert(b).valueOf())
                ? (a > b) - (a < b)
                : NaN);
        },
        inRange: function(d, start, end) {
            // Checks if date in d is between dates in start and end.
            // Returns a boolean or NaN:
            //    true  : if d is between start and end (inclusive)
            //    false : if d is before start or after end
            //    NaN   : if one or more of the dates is illegal.
            // NOTE: The code inside isFinite does an assignment (=).
            return (isFinite(d = this.convert(d).valueOf())
                    && isFinite(start = this.convert(start).valueOf())
                    && isFinite(end = this.convert(end).valueOf())
                ? start <= d && d <= end
                : NaN);
        },
        days: function(a, b) {
            //Return the number of minutes between two dates
            var oneDay = 24 * 60 * 60 * 1000; //hours*minutes*seconds*millis
            return Math.round((this.convert(b) - this.convert(a)) / oneDay);
        },
        convertToString: function(date) {
            //Takes in a Date object and converts to a string in form
            // YYYY-MM-DD where MM === '01' is januaray
            var day = date.getDate();
            if (day < 10) {
                day = '0' + day;
            }
            var monthIndex = date.getMonth();
            monthIndex = monthIndex + 1;
            if (monthIndex < 10) {
                monthIndex = '0' + monthIndex;
            }
            var year = date.getFullYear();
            date = year + '-' + monthIndex + '-' + day;
            return date;
        },
        convertToDate: function(string) {
            //Converts a string in format YYYY-MM-DD Where MM === '01'
            //is january, to a Date object where '00' is january
            var day = string.substring(8);
            var month = string.substring(5, 7);
            var year = string.substring(0, 4);
            return new Date(year, (month - 1), day);
        },
        tester: function() {
            console.log('we made it ');
        }
    }
    return {
        dates: dates
    }
}
