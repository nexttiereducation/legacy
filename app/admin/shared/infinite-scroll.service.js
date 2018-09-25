angular
    .module('adminModule')
    .service('infiniteScroll',

    ['$filter', 'ApiService', 'ApiUrlService',

    function($filter, ApiService, ApiUrlService) {
        var infiniteScroll = function(type, reload, initialUrl) {
            this.items = [];
            this.busy = false;
            this.after = 1;
            this.type = type;
            this.reload = reload;
            this.url = initialUrl;
            if (this.reload) {
                this.next_page = 1;
                this.reload = false;
                this.nextPage();
            }
        };

        infiniteScroll.prototype.getNextPageUrl = function(responseData) {
            this.url = responseData.next || responseData.next_page || null;
        };

        infiniteScroll.prototype.nextPage = function() {
            if (this.busy) {
                return;
            }
            this.busy = true;
            // Can use a switch/if statement to change url based
            // on this.type passed in from controller/initialization
            var url = this.url;
            ApiService.$get(url).success(function(data) {
                var items = data.results;
                for (var i = 0; i < items.length; i++) {
                    var isInArray = $filter('filter')(this.items, { id: items[i].id }, true).length > 0;
                    if (!isInArray) {
                        this.items.push(items[i]);
                    }
                }
                this.getNextPageUrl(data);
                this.busy = false;
                if (this.url === null) {
                    toastr.info('All results loaded.');
                }
            }.bind(this)).error(function() {
                toastr.error('Error', 'There was an Error');
            });
        };
        return infiniteScroll;
    }
]);
