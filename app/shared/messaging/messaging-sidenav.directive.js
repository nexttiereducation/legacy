(function() {
    'use strict';

    angular
        .module('messagingModule')
        .directive('messagingSidenav', messagingSidenav);

    function messagingSidenav() {
        return {
            replace: true,
            restrict: 'EA',
            scope: '=',
            templateUrl: 'messaging-sidenav.html'
        };
    }
})();
