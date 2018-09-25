(function() {
    'use strict';

    angular
        .module('notificationsModule')
        .directive('notificationBadge', NotificationBadge);

    NotificationBadge.$inject = ['NotificationManager'];

    function NotificationBadge(NotificationManager) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs) {
                scope.notification = NotificationManager;
            },
            templateUrl: '/nte-lib/notifications/notification-badge.html'
        };
    }
})();
