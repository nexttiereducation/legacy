(function() {
    angular
        .module('notificationsModule')
        .controller('NotificationsCtrl',NotificationsCtrl);

    NotificationsCtrl.$inject = ['$scope', '$rootScope', '$q', 'ngDialog',
        'NotificationManager', 'Track', '$mdDialog', '$mdMedia',
        '$location'
    ];

    function NotificationsCtrl($scope, $rootScope, $q, ngDialog,
        NotificationManager, Track, $mdDialog, $mdMedia, $location) {
        var vm = this;
        $scope.$mdMedia = $mdMedia;
        //vm methods
        this.removeNotification = removeNotification;
        this.removeAll = removeAll;
        this.closeNotificationDialog = closeNotificationDialog;
        this.onProfilePage = onProfilePage;
        ///////////////////////////////////////////////////////////////
        //vm properties
        this.notifications = [];
        this.loadingNotifications = true;
        this.counts = {};
        this.isMobile = $rootScope.isMobile();
        var NotificationTypes = {
            tasks: 0,
            communications: 1,
            achievements: 2
        };
        ///////////////////////////////////////////////////////////////
        ////////vm methods
        function removeNotification(item, e) {
            if (e) {
                e.stopPropagation(); //prevent note from being marked as read while we delete it
            }
            var id = item.id;
            //find item in list to remove it
            return NotificationManager.deleteNotification(id).then(function() {
                Track.event('A notification has been removed', {
                    notification: item
                });
                var index = this.notifications.indexOf(item);
                this.notifications.splice(index, 1);
                updateCount();
            });
        }

        function removeAll(category) {
            //set the correct value to 0 so that the DOM update doesn't have to wait on the backend to finish
            switch (category) {
                case NotificationTypes.tasks:
                    this.counts.tasks = 0;
                    break;
                case NotificationTypes.communications:
                    this.counts.communications = 0;
                    break;
                case NotificationTypes.achievements:
                    this.counts.achievements = 0;
                    break;
            }
            NotificationManager.deleteCategory(category).then(function() {
                loadNotifications();
                updateCount();
            });
        }

        function closeNotificationDialog() {
            $mdDialog.cancel();
            // $scope.closeThisDialog(); //worth doing, even if it doesn't work on mobile
        }
        ////////private methods////////
        function updateCount() {
            return NotificationManager.updateCount().then(function(result) {
                var response = result.data;
                this.counts.all = {
                    total: response.total,
                    read: response.read,
                    unread: response.unread
                };
                this.counts.tasks = response.categories.Task;
                this.counts.communications = response.categories.Communication;
                this.counts.achievements = response.categories.Accomplishment;
            });
        }

        function loadNotifications() {
            return NotificationManager.loadNotifications()
                .then(function(notifications) {
                    this.notifications = notifications;
                });
        }

        function onProfilePage() {
            return $location.absUrl().indexOf('profile') >= 0;
        }
        ////////
        (function activate() {
            var promises = [
                loadNotifications(),
                updateCount()
            ];
            $q.all(promises).finally(function() {
                this.loadingNotifications = false;
            });
        })();
    }
})();
