(function() {
    'use strict';

    angular
        .module('districtModule', ['ngRoute', 'LocalStorageModule',
            'navbar-svc', 'material-styles', 'ApiService', 'ApiUrlsService',
            'stakeholderService', 'site-so', 'dashboard', 'members',
            'high-school', 'd3-test', 'vokal.infiniteScroll', 'filter',
            'csv-export', 'mgcrea.ngStrap.tooltip', 'ngAnimate',
            'sidebar'
        ])
        .config(function(localStorageServiceProvider) {
            localStorageServiceProvider.setStorageType('sessionStorage');
        })
        .config(['$routeProvider', '$locationProvider',
            '$sceDelegateProvider',
            function($routeProvider, $locationProvider,
                $sceDelegateProvider) {
                $locationProvider.html5Mode(false);
                $routeProvider
                    .when('/district', {
                        templateUrl: 'district/dashboard/dashboard.html',
                        controller: 'Dashboard',
                        controllerAs: 'dash'
                    }).when('/district/:route/:id', {
                        templateUrl: 'district/dashboard/dashboard.html',
                        controller: 'Dashboard',
                        controllerAs: 'dash'
                    }).when('/district/:districtId', {
                        templateUrl: 'district/dashboard/dashboard.html',
                        controller: 'Dashboard',
                        controllerAs: 'dash'
                    });
                $sceDelegateProvider.resourceUrlWhitelist(['self',
                    'https://*.nexttiereducation.com/**',
                    'https://*.nexttier.com/**',
                    'https://*.cloudfront.net/**',
                    'http://*.s3.amazonaws.com/**',
                    'https://*.s3.amazonaws.com/**',
                    'https://*.facebook.com/**',
                    'https://fbcdn-profile-a.akamaihd.net/**'
                ]);
            }
        ])
        .constant('appSettings', {
            useLocationSearchByDefault: false,
            locationExpiry: 1000 * 60 * 60 * 4 //1000ms in second * 60 seconds in a min * 60 mins in an hour * 24 hours in a day (location expires after 4 days)
        })
        .run(['$route', '$rootScope', '$location',
            function($route, $rootScope, $location) {
                var original = $location.path;
                $location.path = function(path, reload) {
                    if (reload === false) {
                        var lastRoute = $route.current;
                        var un = $rootScope.$on(
                            '$locationChangeSuccess',
                            function() {
                                $route.current = lastRoute;
                                un();
                            });
                    }
                    return original.apply($location, [path]);
                };
            }
        ]);
})();
