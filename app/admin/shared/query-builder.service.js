angular
    .module('adminModule')
    .factory('QueryBuilder', [

        function() {
            function arrayBuilder(array, field, value, addFalse) {
                addFalse = addFalse || false;
                if (value || addFalse) {
                    array.push(field + '=' + value);
                }
                return array;
            }

            function fromArray(array) {
                var queryStr = (array.length > 0) ? '?' + array.join( '&') : '';
                queryStr = replace(queryStr);
                return queryStr;
            }

            function fromObject(object, addFalse) {
                addFalse = addFalse || false;
                var queryArray = [];
                var keys = Object.keys(object);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var value = object[key];
                    this.arrayBuilder(queryArray, key, value, addFalse);
                }
                var queryStr = this.fromArray(queryArray);
                return queryStr;
            }

            var replace = function(str) {
                var ret = str.replace(/\+/g, '%2B');
                return ret;
            };

            return this;
        }
    ]);
