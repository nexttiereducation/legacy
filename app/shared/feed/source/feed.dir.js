(function() {
    angular.module('feed')
        .directive('feed', Feed);

    Feed.$inject = [];

    function Feed() {
        return {
            restrict: 'E',
            templateUrl: 'feed.html',
            controller: 'Feed as feedVM',
            replace: true
        };
    }
})();