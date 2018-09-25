angular
    .module('nteLegacy', ['apiModule', 'stakeholderModule'])
    .factory('EntitlementsService', EntitlementsService);

EntitlementsService.$inject = ['$q', 'ApiService', 'ApiUrlService', 'StakeholderAuthService'];

/* @ngInject */
function EntitlementsService($q, ApiService, ApiUrlService, StakeholderAuthService) {
    var checks = {};
    var service = {
        canCreateStudents: function () {
            if (checks.createStudent != null) {
                var cachedDeferred = $q.defer();
                cachedDeferred.resolve();
                return cachedDeferred.promise;
            }
            return isAllowed('createStudent', 'email').success(function () {
                checks.createStudent = true;
                return checks.createStudent;
            });
        }
    };
    return service;

    ////////////////

    function isAllowed(action, resource) {
        return ApiService.$get(ApiUrlService.stakeholder.isAllowed(action, resource, StakeholderAuthService.getStakeholder().id));
    }

}
