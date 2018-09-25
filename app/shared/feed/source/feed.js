(function() {
    angular.module('feed')
        .controller('Feed', Feed);

    Feed.$inject = ['$sce', '$modal', '$mdMedia', '$mdDialog', '$scope', '$rootScope', '$location', '$window',
                    '$mdSidenav', 'StakeholderAuth', 'FeedManager', 'FeedModel', 'FeedConstants',
                    'UrlHelper', 'localStorageService', 'Track'];

    function Feed($sce, $modal, $mdMedia, $mdDialog, $scope, $rootScope, $location, $window,
                  $mdSidenav, StakeholderAuth, FeedManager, FeedModel, FeedConstants,
                  UrlHelper, localStorageService, Track) {

        var feedVM = this;
        //feed methods
        feedthis.closeDialog = closeDialog;
        feedthis.activityToShow = activityToShow;
        feedthis.addFilter = addFilter;
        feedthis.filterFeedList = filterFeedList;
        feedthis.getActivityIcon = getActivityIcon;
        feedthis.getFeed = getFeed;
        feedthis.getFilteredFeed = getFilteredFeed;
        feedthis.isSelected = isSelected;
        feedthis.isFiltered = isFiltered;
        feedthis.followGoToLink = followGoToLink;
        feedthis.removeFilter = removeFilter;
        feedthis.showSummary = showSummary;

        ///////////////////////////////////////////////////////////////
        //feed properties
        feedthis.feed = null;
        feedthis.feedSummary = null;
        feedthis.isCounselor = StakeholderAuth.isCounselor();
        feedthis.isParent = StakeholderAuth.isParent();
        feedthis.isStudent = StakeholderAuth.isStudent();
        feedthis.today = Date.now();
        feedthis.stakeholder = StakeholderAuth.getStakeholder();
        feedthis.taskFilter = '';
        feedthis.taskFilterDisplay = '';
        feedthis.next = '';
        feedthis.defaultUrl = StakeholderAuth.isCounselor() ? UrlHelper.feed.counselorFeed() : UrlHelper.feed.studentFeed();
        feedthis.selectedFilter = {
            date: '',
            displayDate: '',
            category: []
        };
        feedthis.feedConstants = FeedConstants;
        feedthis.weeklySummary = {
            "submitted_applications": 0,
            "schools_added": 0,
            "tasks_started": 0,
            "tasks_completed": 0,
            "notes_added": 0,
            "achievements_earned": 0,
            "accepted_recommendations": 0,
            "rejected_recommendations": 0,
            "accepted_connections": 0,
            "tasks_due": 0,
            "schools_removed": 0,
            "successful_logins": 0,
            "failed_logins": 0,
            "files_uploaded_to_task": 0,
            "files_uploaded_to_profile": 0
        };
        feedthis.showCarousel = false;

        // For "NEW SINCE LAST LOGIN" once back-end is set up
        // feedthis.recentSummary = {
        //     "submitted_applications": 0,
        //     "schools_added": 0,
        //     "tasks_started": 0,
        //     "tasks_completed": 0,
        //     "notes_added": 0,
        //     "achievements_earned": 0,
        //     "accepted_recommendations": 0,
        //     "rejected_recommendations": 0,
        //     "accepted_connections": 0,
        //     "tasks_due": 0
        // };

        ///////////////////////////////////////////////////////////////
        //private vars
        var categoryQuery = "category=";
        var dayQuery = "days=";
        var nextUrl;
        //////////////////////////////////////////
        //activate()
        (function activate() {
            FeedModel.clear();
            getFeed(feedthis.defaultUrl);
            getFeedSummary();
        })();
        //////////////////////////////////////////
        //watchers

        ////////feed methods
        function closeDialog() {
            $mdDialog.cancel();
            if (feedthis.stakeholder.stakeholder-type=='counselor') {
                $window.location.href = '/cp/dashboard';
            }
        }

        function activityToShow(object) {
            var activityToShow = false;
            if (!object || Object.keys(object).length < 3) {
                return false;
            }
            angular.forEach(object, function(value, key) {
                if (value !== 0) {
                    activityToShow = true;
                };
            })
            return activityToShow;
        }

        function filterFeedList(item) {

            if (feedthis.selectedFilter.date === '' && feedthis.selectedFilter.category === '') return true;

            if (feedthis.selectedFilter.date === '') {
                if (item.displayCategory === feedthis.selectedFilter.category) return true;
            }
            if (feedthis.selectedFilter.category === '') {
                if (item.displayDate === feedthis.selectedFilter.date) return true;
            }

            return !!(item.displayCategory === feedthis.selectedFilter.category && item.displayDate === feedthis.selectedFilter.date);
        }

        function followGoToLink(item) {
            if (/nte\/\/\?students/.test(item.location)) {
                //Not yet implemented
                return;
            }
            if (StakeholderAuth.isStudent() || StakeholderAuth.isParent()) {
                return;
            } else if (StakeholderAuth.isCounselor()) {
                var url = FeedManager.parseGoToLink(item);
                var scope = $scope;
                if (url) {
                   $window.location.href = url;
                    // url = url + '&isiframe=true';
                    // scope.applyUrl = $sce.trustAsResourceUrl(url);
                    // $mdDialog.show({
                    //     scope: scope,
                    //     templateUrl: '/nte-lib/notifications/student-dashboard-modal.html'
                    // });
                }
            }
        }

        function getActivityIcon(activity) {
            var iconUrl = 'https://s3.amazonaws.com/next-tier/build/images/activity/' + activity + '.svg';
            return iconUrl;
        }

        function getFeed(next) {
            if ((!next || nextUrl === next) && next !== feedthis.defaultUrl) return;
            nextUrl = next;
            $rootScope.$broadcast('show-loading');
            return FeedManager.getFeed(next).then(function(response) {
                Array.prototype.push.apply(FeedModel.feed, response.data.results);
                FeedManager.parseFeedData(FeedModel.feed);
                feedthis.nextUrl = response.data.next;
                feedthis.feed = FeedModel.feed;
                if (!feedthis.feed || feedthis.feed.length === 0) {
                    feedthis.showCarousel = true;
                }
                $rootScope.$broadcast('hide-loading');
                return FeedModel;
            }).catch(function() {
                $rootScope.$broadcast('hide-loading');
                toastr.error("Unable to load feed data.");
            });
        }

        function getFeedSummary() {
            $rootScope.$broadcast('show-loading');
            if (StakeholderAuth.isCounselor()) {
                return FeedManager.getFeedSummary().then(function(response) {
                    feedthis.feedSummary = response;
                    var summary = response.data.results;
                    feedthis.feedSummary.today = summary[summary.length - 1];
                    feedthis.feedSummary.yesterday = summary[summary.length - 2];

                    for (var i = 0, dailySummary; dailySummary = summary[i]; ++i) {
                        if (FeedManager.dateIsOlderThanSevenDays(dailySummary.day)) {
                            getCompiledSummary(feedthis.weeklySummary, dailySummary);
                        }
                        if (sinceLastLogin(dailySummary.day)) {
                            getCompiledSummary(feedthis.recentSummary, dailySummary);
                        }
                    }
                    $rootScope.$broadcast('hide-loading');
                })
                    .catch(function() {
                        $rootScope.$broadcast('hide-loading');
                    });
            }
        }

        function sinceLastLogin(itemDate) {
            var stakeholder = localStorageService.get("stakeholder");
            return itemDate > stakeholder.last_login;
        }

        function getFilteredFeed(displayDate) {
            var query = buildQuery();
            $scope.$broadcast('show-loading');
            FeedManager.getFilteredFeed(query).then(function(response) {
                FeedManager.parseFeedData(response.data.results);
                var feed = [];
                feedthis.nextUrl = (!response.data.next || response.data.next === feedthis.nextUrl) ? null : response.data.next;
                if (feedthis.selectedFilter.date === 1) {
                    for (var i = 0; i < response.data.results.length; i++) {
                        if (response.data.results[i].displayDate === displayDate) {
                            feed.push(response.data.results[i]);
                        }
                    }
                    FeedModel.feed = feed;
                    feedthis.feed = FeedModel.feed;
                } else {
                    FeedModel.feed = response.data.results;
                    feedthis.feed = FeedModel.feed;
                }
                $scope.$broadcast('hide-loading');
                return response;
            })
                .catch(function() {
                    $scope.$broadcast('hide-loading');
                });
        }

        function addFilter(categoryId, dayId, displayDate) {
            if (dayId === feedthis.selectedFilter.date) {
                feedthis.selectedFilter.category.push(categoryId);
            } else {
                feedthis.selectedFilter.category = [];
                feedthis.selectedFilter.category.push(categoryId);
                feedthis.selectedFilter.date = dayId;
                feedthis.selectedFilter.displayDate = displayDate;
            }
            Track.event("feed_filter_added");
            getFilteredFeed(feedthis.selectedFilter.displayDate);
            scrollToTop();
        }

        function removeFilter(categoryId) {
            var newFilter = feedthis.selectedFilter.category.filter(function(element) {
                return element !== categoryId;
            })
            feedthis.selectedFilter.category = newFilter;
            FeedModel.feed = [];
            if (newFilter.length === 0) {
                feedthis.selectedFilter.date = '';
                getFeed(feedthis.defaultUrl);
            } else {
                getFilteredFeed(feedthis.selectedFilter.displayDate);
            }
            Track.event("feed_filter_removed");
            scrollToTop();
        }

        function getCompiledSummary(compiledSummary, dailySummary) {
            for (var key in compiledSummary) {
                if (compiledSummary.hasOwnProperty(key)) {
                    if (dailySummary[key]) {
                        compiledSummary[key] += dailySummary[key];
                    }
                }
            }
            return compiledSummary;
        }

        function isSelected(key, date) {
            return isSelectedCategory(key, date) && feedthis.selectedFilter.displayDate === date;
        }

        function isFiltered() {
            return feedthis.selectedFilter.category.length > 0 || feedthis.selectedFilter.displayDate.length > 0;
        }

        function showSummary() {
            $mdSidenav('left').open();
        }

        ////////private methods
        function isSelectedCategory(key, date) {
            for (var i = 0; i < feedthis.selectedFilter.category.length; i++) {
                if (feedthis.selectedFilter.category[i] === FeedConstants.categories[key]) {
                    return true;
                }
            }
        }

        function buildQuery() {
            var query = "";
            if (feedthis.selectedFilter.category.length > 0) {
                for (var i = 0; i < feedthis.selectedFilter.category.length; i++) {
                    query += (categoryQuery + feedthis.selectedFilter.category[i] + "&&");
                }
            }
            if (feedthis.selectedFilter.date || feedthis.selectedFilter.date === 0) {
                query += (dayQuery + feedthis.selectedFilter.date)
            }
            return query;
        }

        function scrollToTop() {
            $('#top').scrollTop(0);
        }
    }
})();
