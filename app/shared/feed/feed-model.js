(function() {
    angular.module('feed')
        .service('FeedModel', FeedModel);

    FeedModel.$inject = [];

    function FeedModel() {
        this.feed = [];
        this.feedSummary = {};
        this.today = moment();
        this.sevenDaysAgo = moment().subtract(7, 'days');
        this.loadMore = true;

        function clear() {
            this.feed = [];
            this.feedSummary = {};
            this.today = moment();
            this.sevenDaysAgo = moment().subtract(7, 'days');
            this.loadMore = true;
        }
    }

})();
