(function () {
    angular.module('filter').
        service('filterModel', filterModel);

    filterModel.$inject = [];

    function filterModel() {
        this.expandedCount = 0;
    }
})();
