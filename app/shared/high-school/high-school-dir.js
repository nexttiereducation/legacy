(function() {
    angular.module('high-school')
        .directive('highSchool', HighSchool);

    HighSchool.$inject = [];

    function HighSchool() {
        return {
            restrict: 'E',
            scope: {},
            bindToController: {
                task: '=',
                hideDescription: '=',
                forRegistration: '='
            },
            templateUrl: '/nte-lib/high-school/source/high-school.html',
            controller: 'HighSchoolController as vm'
        };
    }

})();