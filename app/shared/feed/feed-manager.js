(function() {
    angular.module('feed')
        .factory('FeedManager', FeedManager);

    FeedManager.$inject = ['API', 'UrlHelper', 'FeedModel', 'AssetConstants', 'StakeholderAuth', 'Utils'];

    function FeedManager(API, UrlHelper, FeedModel, AssetConstants, StakeholderAuth, Utils) {

        return {
            dateIsOlderThanSevenDays: dateIsOlderThanSevenDays,
            dateIsToday: dateIsToday,
            getFeed: getFeed,
            getFeedSummary: getFeedSummary,
            getFilteredFeed: getFilteredFeed,
            getStudentById: getStudentById,
            parseFeedData: parseFeedData,
            parseGoToLink: parseGoToLink
        };

        function getFeed(next) {
            return API.$get(next).then(function(response) {
                return response;
            });
        }

        function getFeedSummary() {
            var url = UrlHelper.feed.feedSummary();

            return API.$get(url).then(function(response) {
                return response;
            });
        }

        function getFilteredFeed(query) {
            return API.$get(UrlHelper.feed.filterFeed(query)).then(function(response) {
                return response;
            });
        }

        function parseFeedData(data) {
            for (var i = 0, item; item = data[i]; ++i) {
                resolveCategoryData(item);
                addDisplayDate(item);
            }
        }

        function resolveCategoryData(item) {
            // Documentation for categories can be found in api-server
            // feed/models.py
            switch (item.category) {
            case 0:
            {
                item.displayCategory = 'Schools Added';
                item.defaultImage = AssetConstants.schoolURL;
                break;
            }
            case 1:
            {
                item.displayCategory = 'Tasks Started';
                item.defaultImage = AssetConstants.taskURL;
                break;
            }
            case 2:
            {
                item.displayCategory = 'Tasks Completed';
                item.defaultImage = AssetConstants.taskURL;
                break;
            }
            case 3:
                {
                    item.displayCategory = 'Notes Added';
                    item.defaultImage = AssetConstants.noteURL;
                }
                break;

            case 4:
            {
                item.displayCategory = 'Achievements Earned';
                item.defaultImage = AssetConstants.achievementURL;
                break;
            }
            case 5:
            {
                item.displayCategory = 'Submitted Applications';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 6:
            {
                item.displayCategory = 'Accepted Recommendations';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 7:
            {
                item.displayCategory = 'Rejected Recommendations';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 8:
            {
                item.displayCategory = 'Accepted Connections';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 9:
            {
                item.displayCategory = 'Tasks Due';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 10:
            {
                item.displayCategory = 'Schools Removed';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 11:
            {
                item.displayCategory = 'Successful Logins';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 12:
            {
                item.displayCategory = 'Failed Logins';
                item.defaultImage = AssetConstants.studentURL;
                break;
            }
            case 13:
            {
                item.displayCategory = 'Files Uploaded to Tasks';
                item.defaultImage = AssetConstants.fileURL;
                break;
            }
            case 14:
            {
                item.displayCategory = 'Files Uploaded to Profile';
                item.defaultImage = AssetConstants.fileURL;
                break;
            }
            case 16:
            {
                item.displayCategory = 'Counselor Community Response';
                item.defaultImage = AssetConstants.communityResponseURL;
                break;
            }
            case 18:
            {
                item.displayCategory = 'Invitation to Connect';
                item.defaultImage = AssetConstants.connectionsURL;
                break;
            }

            }
            if (item.stakeholder.profile_photo) {
                item.imageURL = item.stakeholder.profile_photo;
            } else {
                item.imageURL = item.defaultImage;
            }

        }

        function addDisplayDate(item) {
            var whenCreated = getDateString(item.created_on);
            item.displayDate = Utils.toTitleCase(whenCreated);
        }

        function getDateString(date) {
            var formattedDate = moment(date);

            if (dateIsToday(formattedDate)) {
                return 'today';
            }
            if (dateIsYesterday(formattedDate)) {
                return 'yesterday';
            }

            if (dateIsOlderThanSevenDays(formattedDate)) {
                FeedModel.loadMore = false;
            }

            return 'older';
        }


        function dateIsToday(date) {
            if (FeedModel.today.month() === date.month() && FeedModel.today.date() === date.date()) {
                return true;
            }
        }

        function dateIsYesterday(date) {
            if (FeedModel.today.month() === date.month() && FeedModel.today.date() - date.date() === 1) {
                return true;
            }

            if (FeedModel.today.month() === (date.month() + 1) && date.date() === 1) {
                return true;
            }

            if (FeedModel.today.month() === 1 && (date.month() === 12 && date.date() === 31)) {
                return true;
            }
        }

        function dateIsOlderThanSevenDays(date) {
            if (FeedModel.sevenDaysAgo.isBefore(date)) {
                return true;
            }
        }

        function getStudentById(studentId) {
            return API.$get(UrlHelper.feed.peerDetails(studentId), { hideLoader: true }).then(function(response) {
                return response;
            });
        }

        function setImageUrl(studentId, item) {
            return getStudentById(studentId).then(function(response) {
                if (response.data.profile_photo) {
                    item.imageURL = StakeholderAuth.parseUserPhoto(response.data.profile_photo, 'Student');
                }
            });

        }

        function parseGoToLink(item) {
            var link = item.goto;
            var stakeholder = item.stakeholder.id;
            var baseUrl = '/apply/counselor-notification';
            var splitLink = link.split('//')[1].split('?')[0];
            if (/connections/gi.test(splitLink)) {
                window.location.href = '/edu/#/students;connectionId=' + stakeholder;
            }  else if ( /task/gi.test( link ) ) {
                var taskId = Number( link.match( /[^\d]*(\d*)/ )[ 1 ] );
                var url = '/edu/#/studentTasks;action=tasks;stamp=' + new Date().getTime() + ';student=' + stakeholder + ';name='
                    + item.stakeholder.first_name + ' ' + item.stakeholder.last_name + ';activity=' + item.category;
                if (taskId) { url += ';id=' + taskId; }
                window.location.href = url;
            } else if (/forum/gi.test(splitLink)) {
                var splitLinkArray = splitLink.split('/');
                var communityUrl = '/counselor-community/?entry=' + splitLinkArray[splitLinkArray.length - 1];
                window.location.href = communityUrl;
            } else {
                //encode link
                var encodedLink = encodeURIComponent(link);
                baseUrl = baseUrl + '?counselor=' + encodedLink;
                return baseUrl;

            }
        }

    }

})();
