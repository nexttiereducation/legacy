'use strict';

angular
    .module('sidebarModule')
    .directive('SidebarDirective', SidebarDirective);

SidebarDirective.$inject = [
    '$location',
    '$rootScope',
    '$window',
    'MessagingModel',
    'NotificationManager',
    'SidebarManager',
    'StakeholderAuthService'
];

function SidebarDirective($location, $rootScope, $window, MessagingModel, NotificationManager, SidebarManager, StakeholderAuthService) {
    return {
        restrict: 'E',
        templateUrl: function(elem, attrs) {
            return attrs.logoOnly
                ? 'sidebar-logo.html'
                : 'sidebar.html';
        },
        link: link
    };

    function link(scope, element, attr) {
        var translateFixed = false;

        scope.isOpen = false;
        scope.languageDialogEventBound = false;
        scope.logout = logout;
        scope.messagingModel = MessagingModel;
        scope.notificationManager = NotificationManager;
        scope.openNotifications = openNotifications;
        scope.routeToFeature = routeToFeature;
        scope.routeToSecondaryPage = routeToSecondaryPage;
        scope.selectedPermission;
        scope.stakeholder = StakeholderAuthService;
        scope.toggleMessaging = toggleMessaging;
        scope.toggleSidebar = toggleSidebar;

        function routeToFeature(permission) {
            if (scope.selectedPermission) {
                scope.selectedPermission.active = false;
            }

            scope.isOpen = false;
            if (permission.isLocalRoute) {
                window.location.href = permission.route;
            } else {
                window.location.href = '/edu/#' +
                        permission.route;
            }
        }

        function routeToSecondaryPage(route) {
            if (scope.selectedPermission) {
                scope.selectedPermission.active = false;
            }
            window.location.href = route;
        }

        function logout() {
            StakeholderAuthService.logout();
            $window.location.href = location.protocol + '//' + location.host + '/edu/#/login';
        }

        function openNotifications(event) {
            $rootScope.$broadcast('closeSidebar');
            scope.showNotificationsDialogue(event);
        }

        function toggleMessaging() {
            $rootScope.$broadcast('closeSidebar');
            $rootScope.$broadcast('showMessaging');
        }

        function toggleSidebar() {
            scope.isOpen = !scope.isOpen;
            $rootScope.$broadcast('toggleSidebar');
            if (!translateFixed) {
                allowTranslateBodyToScroll();
            }
        }

        function determineSelectedFeature() {
            scope.selectedPermission = _.find(scope.permissions, function (permission) {
                return window.location.pathname.indexOf(permission.route) !== -1;
            });
            if (scope.selectedPermission) {
                scope.selectedPermission.active = true;
            }
        }

        function allowTranslateBodyToScroll() {
            var iframe = $window.document.querySelector('.goog-te-menu-frame');
            if (iframe) {
                var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                var body = innerDoc.querySelector('body');
                body.style.cssText = 'max-width:100% !important; overflow: auto';
                translateFixed = true;
            }
        }

        (function () {
            scope.permissions = SidebarManager.getFeatures();
            scope.stakeholderUser = StakeholderAuthService.getStakeholder();
            determineSelectedFeature();
            $rootScope.$on('$locationChangeSuccess', determineSelectedFeature);
            allowTranslateBodyToScroll();
        })();
    }
}
