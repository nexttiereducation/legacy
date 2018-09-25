(function() {
    'use strict';

    angular
        .module('utilsModule')
        .filter('toTitleCase', titleCaseFilter);

    function titleCaseFilter() {
        return function(input) {
            return input.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };
    };

})();
