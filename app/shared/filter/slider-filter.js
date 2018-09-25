(function() {
    angular.module('filter')
        .directive('filterSlider', FilterSlider);

    FilterSlider.$inject = [];

    function FilterSlider() {
        var filterSlider = {
            restrict: 'EA',
            scope: {
                option: '='
            },
            templateUrl: 'slider-filter.html',
            replace: true,
            link: link
        };


        function link(scope, element, attr) {
            scope.toggleOption = toggleOption;

            scope.$on('slideEnded', function() {
                toggleOption();
            });

            scope.$on('nte-filter.clear', function (event, arg) {
                scope.option.isActive = false;
                scope.option.value = scope.option.rangeOptions.showSelectionBarEnd ? scope.option.rangeOptions.floor : scope.option.rangeOptions.ceil;
                element.find('.fancy-checkbox').removeClass('active');
            });

            function toggleOption() {
                var value = scope.option.value;
                var barEnd = scope.option.rangeOptions.showSelectionBarEnd ? scope.option.rangeOptions.showSelectionBarEnd : scope.option.rangeOptions.showSelectionBar;
                var floor = scope.option.rangeOptions.floor;
                var ceil = scope.option.rangeOptions.ceil;
                if (( value ===  floor && barEnd)|| (value === ceil && !barEnd)) {
                    scope.option.isActive = false;
                    scope.$emit('nte-filter.toggle', {option: scope.option});
                    element.find('.fancy-checkbox').removeClass('active');
                } else {
                    if (scope.option.isActive) {
                        scope.$emit('nte-filter.valueChange');
                        return;
                    }
                    scope.option.isActive = true;
                    element.find('.fancy-checkbox').addClass('active');
                    scope.$emit('nte-filter.toggle', {option: scope.option});
                }
            }
        }

        return filterSlider;
    }


})();
