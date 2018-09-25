(function() {
    angular.module('filter')
        .directive('categoryFilter', CategoryFilter);

    CategoryFilter.$inject = ['filterModel'];

    function CategoryFilter(filterModel) {
        var categoryFilter = {
            restrict: 'EA',
            scope: {
                category: '='
            },
            templateUrl: 'category-template.html',
            replace: true,
            link: link
        };

        function link(scope, element, attr) {
            scope.isExpanded = false;
            scope.activeCount = scope.category.subCategories ? evaluateSubCategories(scope.category.subCategories) : 0;
            scope.toggleIsExpanded = toggleIsExpanded;
            scope.clear = clear;
            toggleActive();

            scope.$on('nte-filter.toggle', function(event, arg) {
                arg.category = scope.category.name;
                if (scope.category.queryName) {
                    arg.queryName = scope.category.queryName;
                }
                if (arg.option.isActive === true) {
                    scope.activeCount++;
                }

                if (arg.option.isActive === false && scope.activeCount > 0) {
                    scope.activeCount--;
                }

                toggleActive();
            });

            scope.$on('nte-filter.clear', function(event, arg) {
                clear(null, true);
            });

            scope.$on('nte-filter.clear-all', function () {
                clear(null, false);
            });

            function checkSubcategories() {
                for(var i = 0, subCategory; subCategory = scope.category.subCategories[i]; ++i) {
                    if (subCategory.isActive) {
                        scope.category.isActive = true;
                        return;
                    } else {
                        scope.category.isActive = false;
                    }
                }
            }

            function toggleActive() {
                if (scope.activeCount > 0) {
                    scope.category.isActive = true;
                    element.find('.category-indicator').addClass('active');
                    element.find('.category-clear').removeClass('hidden');
                } else {
                    scope.category.isActive = false;
                    element.find('.category-indicator').removeClass('active');
                    element.find('.category-clear').addClass('hidden');
                }
            }

            function toggleIsExpanded() {
                scope.isExpanded = !scope.isExpanded;
                if (scope.isExpanded) {
                    filterModel.expandedCount++;
                } else {
                    filterModel.expandedCount--;
                }
                scope.$emit('nte-filter.expanded');
            }

            function clear(event, shouldNotSendEvent) {
                if (event) event.stopPropagation();

                if (shouldNotSendEvent) {
                    if (scope.activeCount > 0) scope.activeCount--;
                    toggleActive();
                    checkSubcategories();
                    return;
                }

                scope.activeCount = 0;
                toggleActive();


                if (scope.category.subCategories) {
                    for(var i = 0, subCategory; subCategory = scope.category.subCategories[i]; ++i) {
                        subCategory.isActive = false;
                        for(var k = 0, option; option = subCategory.options[k]; ++k) {
                            option.isActive = false;
                        }
                    }
                }

                if (scope.options) {
                    for(var u = 0, option; option = scope.options[u]; ++u) {
                        option.isActive = false;
                    }
                }

                sendClearEvent();
            }

            function sendClearEvent() {
                scope.$broadcast('nte-filter.clear');
                scope.$emit('nte-filter.clear');
            }
        }

        function evaluateSubCategories(subCategories) {
            if (!subCategories) return;
            var activeCount = 0;
            for(var i = 0, subCategory; subCategory = subCategories[i]; ++i) {
                if (subCategory.isActive) activeCount++;
            }

            return activeCount;
        }

        return categoryFilter;
    }
})();
