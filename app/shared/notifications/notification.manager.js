(function() {
    'use strict';

    angular
        .module('notificationsModule')
        .factory('NotificationManager', Notification);

    Notification.$inject = ['$rootScope', '$window', '$location', 'UrlHelper', 'TargetStakeholder', 'API', 'ngDialog', '$q', 'UrlConstants'];

    /* @ngInject */
    function Notification($rootScope, $window, $location, UrlHelper, TargetStakeholder, API, ngDialog, $q, UrlConstants) {
        var service = {
            count: {
                total: 0,
                unread: 0
            },
            checkNotifications: checkNotifications,
            deleteCategory : deleteCategory,
            deleteNotification : deleteNotification,
            getNotificationLink: getNotificationLink,
            loadNotifications: loadNotifications,
            loadMoreNotifications: loadMoreNotifications,
            start: start,
            testLink: testLink,
            updateCount: updateCount,
            useLink: useLink
        };
        this.user = {};

        $rootScope.$on('sessionEnded', function () {
            active = false;
            window.clearTimeout(timeoutPromise);
            service.count.unread = 0;
        });

        return service;

        ////////////////

        var timeoutPromise;
        var active = false;
        var shouldShowAchievements = false;

        function testLink(link) {
            return /(connections|task|achievements|recommendation)/gi.test(link);
        }
        function deleteNotification( id ) {
            return API.$delete( UrlHelper.notification.delete( id ) );
        }
        function deleteCategory( category ) {
            return API.$delete( UrlHelper.notification.deleteCategory( category ) );
        }
        function updateCount() {
            return API.$get(UrlHelper.notification.poll(), {hideLoader: true});
        }
        function loadNotifications(next, deferred, notifications) {
            var localDeferred = deferred || $q.defer();
            var notifications = notifications || [];
            API.$get(next || UrlHelper.notification.list()).then(function(response) {
                notifications.push.apply(notifications, response.data.results);
                if (response.data.next) {
                    loadNotifications(response.data.next, localDeferred, notifications);
                } else {
                    localDeferred.resolve(notifications);
                }
            });
            return localDeferred.promise;
        }
        /* The URL is the 'next' url provided from the list of notifications */
        function loadMoreNotifications( url ) {
            return API.$get( url );
        }
        function checkNotifications() {
            var pollInterval = 60*1000;
            if ( $rootScope.isDev == true) {
                pollInterval = 500*1000;
            }
            API.$get(UrlHelper.notification.poll(), {hideLoader: true})
                .then(function (result) {
                    var data = result.data;
                    service.count.unread = data.unread;
                    if (data.categories.Communication.unread !== 0) {
                        $rootScope.$emit('connection.change', {sender: 'notifications'});
                    }
                    //check for achievements and show them if they are unread
                    if (shouldShowAchievements && data.categories.Accomplishment.unread > 0) {
                        //show these achievements
                        ngDialog.open({
                            template: '/nte-lib/notifications/messages.html',
                            controller: 'AchievementPopupCtrl',
                            overlay: false,
                            className: 'achievement-popup-dialog',
                            closeByDocument: false,
                            closeByEscape: false,
                            showClose: true
                        }).closePromise
                            .then(function () {
                                if (active) {
                                    timeoutPromise = window.setTimeout(checkNotifications, pollInterval);
                                }
                            });
                    }
                    else {
                        if (active) {
                            timeoutPromise = window.setTimeout(checkNotifications, pollInterval);
                        }
                    }
                });
        }

        function start(user) {
            this.user = user;
            if (user.loggedIn || user.anonymous && user.isStudent) {
                if (!active) {
                    active = true;
                    checkNotifications();
                }
            }
        }

        function getNotificationLink(link) {
            var urlSuffix = '/counselor-notification';
            var baseUrl =  $rootScope.isProduction ?  UrlConstants.nteProd : UrlConstants.nteStaging;
            baseUrl += urlSuffix;

            var splitLink = link.split('//')[1].split('?')[0];
            if (/connections/gi.test( splitLink )) {
                window.location.href = '/edu/#/students';
            }
            else {
                //encode link
                var encodedLink = encodeURIComponent(link);
                baseUrl = baseUrl + '?counselor=' + encodedLink;
                return baseUrl;

            }
        }

        function useLink(notification) {
            var link = notification.goto;
            var deferred = $q.defer();
            var promise = deferred.promise;
            var isSuccessful = false;
            var stakeholder = this.user;
            //get any query params
            var params = link.split( '?' )[ 1 ];
            var searchObj = {};
            if (params) {
                //separate the parameters
                var search = params.split( '&' );
                for( var i = 0; i < search.length; i++ )
                {
                    var parts = search[ i ].split( '=' );
                    searchObj[ parts[ 0 ] ] = parts[ 1 ];
                }
            }
            //if a user is specified set it
            if (searchObj.user !== undefined) {
                //check to see if it's the current stakeholder
                if ( stakeholder.hasOwnProperty('id') && searchObj.user == stakeholder.id.toString() )
                {//clear peer so that it directs properly
                    TargetStakeholder.clearPeer();
                    deferred.resolve();
                }
                //check to make sure that the peer isn't already set
                else if ( ( TargetStakeholder.getPeerId() || '' ).toString() != searchObj.user )
                {
                    promise = TargetStakeholder.setPeerId( searchObj.user );
                }
                else
                {
                    deferred.resolve();
                }
            }
            else
            {
                deferred.resolve();
            }
            var splitLink = link.split( '//' )[1].split('/');
            var link = splitLink.length > 2 ? splitLink[0] + '/' +  splitLink[1] : splitLink[0];
            var taskId = splitLink.length > 2 ? splitLink[2].split('?')[0] : splitLink[1].split('?')[0];

            return promise.then( function ()
            {
                if ( /connections/gi.test( link ) )
                {
                    var url = '/edu/#/student-dashboard';
                    window.location.replace(url);
                    return true;
                }
                else if ( /task/gi.test( link ) )
                {
                    // var taskId = Number( link.match( /[^\d]*(\d*)/ )[ 1 ] );
                    var url = '/edu/#/studentTasks;action=tasks;stamp=' + new Date().getTime();
                    if (taskId) { url += ';id=' + taskId }
                    if (notification.category) { url += ';activity=' + notification.category };
                    window.location.replace(url);
                }
                else if ( /achievements/gi.test( link ) )
                {
                    if (/apply/.test(window.location.pathname)) {
                        $location.path(link);
                    } else {
                        $window.location.pathname = '/apply/' + link;
                    }
                    return true;
                }
                else if ( /task/gi.test( link ) )
                {
                    var schoolId = Number( link.match( /[^\d]*(\d*)/ )[ 1 ] );
                    var url = '/edu/#/studentTasks;id=' + schoolId + ';action=recommendation;stamp=' + new Date().getTime();
                    window.location.replace(url);
                }
                else if (/recommendation\/institution/gi.test(link)) {
                    var url = '/edu/#/colleges;tab=1';
                    window.location.replace(url);
                 } else if (/recommendation\/scholarship/gi.test(link)) {
                    var url = '/edu/#/scholarships;tab=3';
                    window.location.replace(url);
                } else {
                    window.location.replace('/edu/#/studentTasks');
                }
                return false;
            },function(error) {
                console.log(error);
            });
        }

    }
})();
