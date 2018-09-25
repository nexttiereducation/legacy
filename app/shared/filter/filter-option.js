(function() {
    angular.module('filter')
        .directive('filterOption', FilterOption);

    FilterOption.$inject = ['Track'];

    function FilterOption(Track) {
        var filterOption = {
            restrict: 'EA',
            scope: {
                option: '='
            },
            templateUrl: 'filter-option.html',
            replace: true,
            link: link
        };


        function link(scope, element, attr) {
            scope.toggleOption = toggleOption;

            scope.$on('nte-filter.clear', function (event, arg) {
                scope.option.isActive = false;
                element.find('.fancy-checkbox').removeClass('active');
            });


            if (scope.option.isActive) {
                element.find('.fancy-checkbox').addClass('active');
            } else {
                element.find('.fancy-checkbox').removeClass('active');
            }

            function toggleOption() {
                scope.option.isActive = !scope.option.isActive;
                if (scope.option.isActive) {
                    Track.event('filter_activated', {
                        'value': scope.option.value
                    });
                }
                scope.$emit('nte-filter.toggle', {option: scope.option});
            }

        }

        return filterOption;
    }

})();
