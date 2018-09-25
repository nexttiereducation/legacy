(function() {
    angular.module('filter')
        .directive('subCategoryFilter', SubCategoryFilter);

    SubCategoryFilter.$inject = ['$filter'];

    function SubCategoryFilter($filter) {
        var subCategorytFilter = {
            restrict: 'EA',
            scope: {
                subCategory: '='
            },
            templateUrl: 'sub-category.html',
            link: link
        };

        function link(scope, element, attr) {

            if (scope.subCategory.options) {
                scope.activeCount = evaluateOptions(scope.subCategory.options);
            }

            if (scope.subCategory.type === 'value') {
                scope.isValue = true;
            }

            scope.clear = clear;
            scope.triggerFilter = triggerFilter;
            scope.filteredOptions = [];


            scope.$on('nte-filter.toggle', function(event, arg) {
                arg.subCategory = scope.subCategory.displayName;

                if (scope.subCategory.queryName) {
                    arg.queryName = scope.subCategory.queryName;
                }

                if (arg.option.isActive === true) {
                    scope.activeCount++;
                }

                if (arg.option.isActive === false) {
                    scope.activeCount--;
                }

                toggleActive();
            });

            scope.$on('nte-filter.clear', function(event, arg) {
               clear(null, true);
            });


            function toggleActive() {
                if (scope.activeCount > 0) {
                    scope.subCategory.isActive = true;
                    element.find('.active-indicator').addClass('active');
                } else {
                    scope.subCategory.isActive = false;
                    element.find('.active-indicator').removeClass('active');
                }
            }

            function clear(event, shouldNotSendEvent) {
                if (event) event.stopPropagation();

                scope.activeCount = 0;
                toggleActive();

                if (shouldNotSendEvent) return;

                for(var i = 0, option; option = scope.subCategory.options[i]; ++i) {
                    option.isActive = false;
                }

                sendClearEvent();
            }

            function sendClearEvent() {
                scope.$broadcast('nte-filter.clear');
                scope.$emit('nte-filter.clear');
            }

            function triggerFilter() {
                if (!scope.subCategory.searchTerm) {
                    scope.filteredOptions = [];
                } else {
                    scope.filteredOptions = $filter('filter')(scope.subCategory.options, scope.subCategory.searchTerm);
                }
            }

            toggleActive();
            triggerFilter();

        }

        function evaluateOptions(options) {
            var activeCount = 0;
            for(var i = 0, option; option = options[i]; ++i) {
                if (option.isActive) activeCount++;
            }
            return activeCount;
        }

        return subCategorytFilter;
    }
})();
