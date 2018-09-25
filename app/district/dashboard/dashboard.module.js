(function(){

    angular
      .module('dashboard', [
        'stakeholder-svc',
        'track-svc',
        'district'
      ])
      .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when( '/dashboard', {
                templateUrl: 'dashboard/dashboard.html',
                controller: 'Dashboard',
                controllerAs: 'vm',
                reloadOnSearch: false
            })
            .when( '/dashboard/summary', {
                templateUrl: 'dashboard/dashboard.html',
                controller: 'Dashboard',
                controllerAs: 'vm',
                reloadOnSearch: false
            });
      }]);
})();
