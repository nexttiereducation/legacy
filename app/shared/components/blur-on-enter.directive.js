(function() {
    angular.module('nteExtensions', [])
        .directive('blurOnEnter', blurOnEnter);

    function blurOnEnter() {
        var linkFn = function(scope,element,attrs) {
            element.bind('keypress', function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        element.blur();
                    });
                    event.preventDefault();
                }
            });
        };

        return {
            link:linkFn
        };
    }
})();
