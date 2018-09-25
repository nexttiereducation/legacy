(function() {
    angular.module('filter')
        .directive('nteFilter', NteFilter);

    NteFilter.$inject = ['$rootScope', 'filterModel'];

    function NteFilter($rootScope, filterModel) {
        var nteFilter = {
            restrict: 'EA',
            scope: {
                filters: '=',
                onFilterChange: '&',
                filterToggle: '=',
                onSearch: '&',
                hideFilters: '=',
                results: '='
            },
            templateUrl: 'filter-template.html',
            replace: false,
            link: link
        };

        function link(scope, element, attr) {
            scope.showFilters = attr.showFilters || (!$rootScope.isMobile() && !$rootScope.isTablet());
            scope.currentFilters = {};
            scope.clearSearch = clearSearch;
            var onFilterChange = scope.onFilterChange();
            var onSearch = scope.onSearch();

            scope.$on('nte-filter.toggle', function(event, arg) {
               onChange();
            });

            scope.$on('nte-filter.clear', function(event, arg) {
                event.stopPropagation();
                onChange();
            });

            scope.$on('nte-filter.valueChange', function(event, arg) {
                event.stopPropagation();
                onChange();
            });

            scope.$on('nte-filter.clear-all', function () {
                clearSearch();
            });

            scope.$on('showFilters', function() {
                scope.showFilters = true;
            })

            scope.toggleFilterDisplay = function() {
                scope.showFilters = !scope.showFilters;
            };

            scope.triggerSearch = function() {
                onChange();
            };

            scope.$on('nte-filter.expanded', function () {
                if (filterModel.expandedCount > 0) {
                    element.find('.filters').addClass('top');
                } else {
                    element.find('.filters').removeClass('top');
                }
            });


            function onChange() {
                var params = buildQueryParams();
                params.queryString = buildQueryString(params.query);
                delete params.query;
                onFilterChange(params);
            }

            function buildQueryParams() {
                var params = {
                    query: {},
                    display: {}
                };
                for(var i = 0, category; category = scope.filters[i]; ++i) {
                    if (!category.isActive) continue;
                    if (category.subCategories) {
                        for(var j = 0, subCategory; subCategory = category.subCategories[j]; ++j) {
                            if (!subCategory.isActive) continue;
                            for(var k = 0, option; option = subCategory.options[k]; ++k) {
                                if (!option.isActive) continue;
                                var value = option.id ? option.id : option.value;
                                if (Object.keys(params.query).indexOf(subCategory.queryName) !== -1) {
                                    params.query[subCategory.queryName].push(value);
                                    option.value ? params.display[subCategory.displayName].push(option.value) : params.display[subCategory.displayName].push(value);
                                } else {
                                    params.query[subCategory.queryName] = [value];
                                    params.display[subCategory.displayName] = [value];
                                }

                            }
                        }
                    }

                    if (category.options) {
                        for(var l = 0, categoryOption; categoryOption = category.options[l]; ++l) {
                            if (!categoryOption.isActive) continue;
                            var categoryValue = categoryOption.value ? categoryOption.value : categoryOption.id;
                            var categoryId = categoryOption.id ? categoryOption.id : categoryOption.value;
                            if (Object.keys(params.query).indexOf(category.queryName) !== -1) {
                                params.query[category.queryName].push(categoryId);
                                params.display[category.name].push(categoryValue);
                            } else {
                                params.query[category.queryName] = [categoryId];
                                params.display[category.name] = [categoryValue];
                            }

                        }
                    }


                }

                if (scope.searchTerm) {
                    params.query['search'] = [scope.searchTerm];
                    params.display['Search'] = [scope.searchTerm]
                }

                return params;
            }

            function buildQueryString(params) {
                if (!params) return null;
                var queryString = "?";
                Object.keys(params).forEach(function(key) {
                    var vals = params[key];
                    for(var i = 0, val; val = vals[i]; ++i) {
                        queryString += key + "=" + val + "&";
                    }
                });

                queryString = queryString.replace( /\+/g, "%2B" );
                return queryString.slice(0, -1); //because we always add an & after a value we will always have one extra
            }

            function clearSearch() {
                scope.searchTerm = '';
                onChange();
            }

        }

        return nteFilter;
    }


})();
