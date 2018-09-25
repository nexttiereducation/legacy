(function() {
    angular
        .module('utilsModule')

        .filter('titleCase', function() {
            return function(input) {
                if (input) {
                    var output = input.replace(/([^\W_]+[^\s-]*) */g, function(input) {
                        return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
                    });

                    // Certain minor words should be left lowercase unless
                    // they are the first or last words in the string
                    var lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
                        'By', 'For', 'From', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
                    angular.forEach(lowers, function(lower) {
                        output = output.replace(new RegExp('\\s' + lower + '\\s', 'g'),
                            function(txt) {
                                return txt.toLowerCase();
                            });
                    });

                    // Certain words such as initialisms or acronyms should be left uppercase
                    var uppers = ['Id', 'Tv', 'Url', 'Gpa', 'Rss', 'Sat', 'Act', 'Pcf'];
                    angular.forEach(uppers, function(upper) {
                        output = output.replace(new RegExp('\\b' + upper + '\\b', 'g'),
                            upper.toUpperCase());
                    });

                    return output;
                }
                return;
            };
        })

        .filter('sentenceCase', function() {
            return function(input) {
                if (input) {
                    var output = input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
                    return output;
                }
                return;
            };
        })

        .filter('boolAsString', function() {
            return function(input) {
                if (input) {
                    var val = input.toLowerCase();
                    if (val === true || val === 'true' || val === 'y' || val === 't') {
                        return 'Yes';
                    } else {
                        return 'No';
                    }
                }
                return;
            };
        })

        .filter('underscoresToSpaces', function() {
            return function(input) {
                if (input) {
                    var output = input.replace(/_/g, ' ');
                    return output;
                }
                return;
            };
        })

        .filter('percent', function($filter) {
            return function(input) {
                if (input) {
                    var output = $filter('number')(input, 0) + '%';
                    return output;
                }
                return;
            };
        })

        .filter('dollars', function($filter) {
            return function(input) {
                if (input) {
                    var output = $filter('number')(input, 2);
                    return output;
                }
                return;
            };
        })

        .filter('jsonStringify', function() {
            return function(input) {
                if (input) {
                    return JSON.stringify(input);
                }
                return;
            };
        })

        .filter('urbanization', function() {
            return function(input) {
                if (input) {
                    var urbanizationTable = {
                        '11': 'City: Large',
                        '12': 'City: Midsize',
                        '13': 'City: Small',
                        '21': 'Suburb: Large',
                        '22': 'Suburb: Midsize',
                        '23': 'Suburb: Small',
                        '31': 'Town: Fringe',
                        '32': 'Town: Distant',
                        '33': 'Town: Remote',
                        '41': 'Rural: Fringe',
                        '42': 'Rural: Distant',
                        '43': 'Rural: Remote',
                        '-3': null
                    };
                    return urbanizationTable[input];
                }
                return;
            };
        })

        .filter('removeParent', function() {
            return function(input) {
                if (input) {
                    var indx = _.indexOf(input, '.');
                    var output = input;
                    if (indx < input.length) {
                        output = input.substring(indx + 1);
                    }
                    return output;
                }
                return;
            };
        });

})();
