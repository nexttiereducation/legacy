(function() {
    angular
        .module('district', ['api-svc', 'api-urls-svc'])
        .service('DistrictModel', DistrictModel);

    DistrictModel.$inject = [];

    function DistrictModel() {
        var that = this;
        this.getStakeholderPos = getStakeholderPos;
        this.getStakeholder = getStakeholder;
        this.isValid = isValid;
        this.currentFilter = '';
        this.district = {};
        this.allDistricts;
        this.allDistrictsNextPage;
        this.members = [];
        this.visibleMembers = [];
        this.filters = [];
        this.url;
        this.pagedStakeholderList;
        this.sourcePage = null;
        this.currentPage = null;
        this.totalResults = null;
        return;

        function isValid() {
            return that.district && that.district.id;
        }

        function getStakeholderPos(id) {
            for (var idx = that.members.length; idx--;) {
                if (that.members[idx].id == id) {
                    return { coun: that.members[idx], index: idx };
                }
            }
            return {};
        }

        function getStakeholder(id) {
            return getStakeholderPos(id).coun;
        }
    }
})();
