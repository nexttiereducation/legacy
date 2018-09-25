(function() {
  'use strict';

  // Declare app level module which depends on views, and components
  angular.module('nteLegacy', [
      'ngDialog',
      'ngRoute',
      'ngSanitize',
      'ngTouch',
      'angular-table',
      'angularFileUpload',
      'checklist-model',
      'infinite-scroll',
      'LocalStorageModule',
      'textAngular',
      'ui.grid',
      'ui.mask',
      'apiModule',
      'materialModule',
      'navbarModule',
      'stakeholderModule',
      'adminModule',
      'districtModule'
  ]).
  config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {
    $routeProvider.otherwise({redirectTo: '/admin'});
  }]);

}());
