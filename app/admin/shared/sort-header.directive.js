angular
    .module('adminModule')
    .directive('sortHeader', [

        function() {
            return {
                restrict: 'A',
                scope: true,
                link: function(scope, element, attrs) {
                    var isActive, isAscending;
                    var field = attrs.sortHeader;
                    element.addClass('sortable');
                    var manageClass = function() {
                        element.toggleClass('active', isActive)
                            .toggleClass('ascending', isAscending)
                            .toggleClass('descending', !isAscending);
                    };
                    var checkStatus = function(currentOrder) {
                        isActive = (currentOrder == field || currentOrder == '-' + field);
                        isAscending = (!(/^-/.test(currentOrder)));
                    };
                    var nextOrdering = function(currentOrder) {
                        checkStatus(currentOrder);
                        if (isActive) {
                            if (isAscending) {
                                currentOrder = '-' + field;
                            } else {
                                currentOrder = '';
                            }
                        } else {
                            currentOrder = field;
                        }
                        return currentOrder;
                    };
                    element.on('click', function() {
                        var currentOrder = nextOrdering(scope.orderingField);
                        scope.setOrdering(currentOrder);
                        scope.reloadList();
                    });
                    scope.$watch('orderingField', function() {
                        checkStatus(scope.orderingField);
                        manageClass();
                    });
                }
            };
        }
    ]);
