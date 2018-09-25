(function() {
    'use strict';

    angular
        .module('messagingModule')
        .directive('messaging', Messaging);

    function Messaging() {
        return {
            restrict: 'EA',
            scope: '=',
            replace: true,
            templateUrl: 'messaging.html',
            controller: 'Messaging as vm'
        };
    }

})();
