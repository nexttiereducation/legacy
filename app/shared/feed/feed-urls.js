(function() {
    angular.module('feed').run(addUrls);

    addUrls.$inject = ['UrlHelper'];

    function addUrls(urlHelper) {

        urlHelper.init();

        var pathRoot = urlHelper.getPathRoot();

        urlHelper.feed = {
            counselorFeed: function() {
                return pathRoot + '/counselor/feed';
            },
            studentFeed: function() {
                return pathRoot + '/student/connections/feed';
            },
            feedSummary: function() {
                return pathRoot + '/counselor/feed/data';
            },
            peerDetails: function(studentId) {
                return pathRoot + '/student/' + studentId;
            },
            filterFeed: function(query) {
                return pathRoot + '/counselor/feed?' + query;
            }
        };

    }

})();
