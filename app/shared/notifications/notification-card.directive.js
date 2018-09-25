(function() {
    'use strict';

    angular
        .module('notificationsModule')
        .directive('notificationCard', NotificationCard);

    NotificationCard.$inject = [
        'StakeholderAuth',
        'UrlHelper',
        'API',
        '$rootScope',
        '$window',
        'NotificationManager',
        '$sce'
    ];

    function NotificationCard(StakeholderAuth, UrlHelper, API, $rootScope, $window,
        NotificationManager, $sce) {
        return {
            restrict: 'A',
            scope: {
                item: '=notificationCard',
                rm: '&',
                close: '&'
            },
            templateUrl: '/nte-lib/notifications/notification-card.html',
            link: function(scope, element, attrs) {
                var setImage = function() {
                    var baseUrl = 'https://next-tier.s3.amazonaws.com/build/images/notifications';
                    if (!scope.item.image) {
                        if (scope.item.category === 1) {
                            scope.item.unreadImage = baseUrl + '/ic_thumb_noti_item_tasks.svg';
                            scope.item.readImage = baseUrl + '/ic_thumb_noti_item_tasks_viewed.svg';
                        } else if (scope.item.category === 2) {
                            scope.item.unreadImage = baseUrl + '/ic_thumb_noti_item_commv.svg';
                            scope.item.readImage = baseUrl + '/ic_thumb_noti_item_comm_viewed.svg';
                        } else if (scope.item.category === 3) {
                            scope.item.unreadImage = scope.item.achievement.photo_url || (baseUrl + '/ic_thumb_noti_item_accomplishment.svg');
                            scope.item.readImage = scope.item.achievement.bw_photo_url || (baseUrl + '/ic_thumb_noti_item_accomplishment_viewed.svg');
                        }
                    }
                };
                setImage();
                scope.markRead = function() {
                    if (!scope.item.read && !scope.removing) {
                        API.$patch(UrlHelper.notification.update(scope.item.id), { read: true })
                            .then(function(response) {
                                scope.item = response.data;
                                setImage();
                            });
                    }
                };
                scope.handleNotification = function(link) {
                    if (StakeholderAuth.isCounselor()) {
                        scope.goToNotificationUrl(link);
                    } else {
                        scope.view();
                    }
                };
                scope.view = function() {
                    scope.markRead();
                    NotificationManager.useLink(scope.item).then(
                        function(response) {
                            if (response) {
                                scope.close();
                            }
                        });
                };
                scope.remove = function(e) {
                    scope.removing = true;
                    scope.rm({ event: e }).finally(function() {
                        scope.removing = false;
                    });
                };
                scope.testLink = NotificationManager.testLink;
                scope.goToNotificationUrl = function(
                    notificationUrl) {
                    scope.markRead();
                    var url = NotificationManager.getNotificationLink(
                        notificationUrl);
                    if (url) {
                        url = url + '&isiframe=true';
                        scope.applyUrl = $sce.trustAsResourceUrl(
                            url);
                        // var applyModal = $modal(
                        // 	{
                        // 		scope: scope,
                        // 		template: '/nte-lib/notifications/student-dashboard-modal.html',
                        // 		container: 'body'
                        // 	}
                        // );
                        scope.close();
                    } else {
                        scope.close();
                    }
                };
            }
        };
    }
})();
