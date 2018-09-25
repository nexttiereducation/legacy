'use strict';

angular
    .module('adminModule', [
        'angular-table',
        'angularFileUpload',
        'apiModule',
        'checklist-model',
        'infinite-scroll',
        'LocalStorageModule',
        'materialModule',
        'navbarModule',
        'ngDialog',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'site-so',
        'stakeholderModule',
        'textAngular',
        'ui.grid',
        'ui.mask'
    ])
    .config([
        '$routeProvider',
        '$locationProvider',
        '$sceDelegateProvider',
        'localStorageServiceProvider',
        function ($routeProvider, localStorageServiceProvider, $locationProvider, $sceDelegateProvider) {
            localStorageServiceProvider.setStorageType('sessionStorage');
            toastr.options.timeOut = 20;
            toastr.options.extendedTimeOut = 60;
            var requireUser = {
                User: [
                    '$location',
                    '$rootScope',
                    '$q',
                    'StakeholderAuth',
                    'localStorageService',
                    function ($location, $rootScope, $q, StakeholderAuth, localStorageService) {
                        var deferred = $q.defer();
                        if ($rootScope.loggedIn) {
                            if (StakeholderAuth.getUser()) {
                                deferred.resolve(StakeholderAuth.getUser());
                            } else {
                                deferred.reject('No valid user');
                                // window.location = '/app/login';
                            }
                        } else {
                            if (localStorageService.get('authToken')
                                && localStorageService.get('stakeholder')) {
                                StakeholderAuth.setSession(
                                    localStorageService.get('authToken'),
                                    localStorageService.get('stakeholder')
                                );
                            }
                            deferred.reject('No user token');
                            // window.location = '/app/login';
                        }
                        return deferred.promise;
                    }
                ]
            };
            $routeProvider
                .when('/admin', {
                    templateUrl: 'admin/admin.html',
                    redirectTo: '/admin/stakeholders'
                })
                .when('/admin/stakeholders', {
                    templateUrl: 'admin/+stakeholders/stakeholders.html',
                    controller: 'StakeholdersCtrl',
                    resolve: requireUser,
                    active: 'stakeholders'
                })
                .when('/admin/institutions', {
                    templateUrl: 'admin/+institutions/institutions.html',
                    controller: 'InstitutionsCtrl',
                    resolve: requireUser,
                    active: 'institutions'
                })
                .when('/admin/tasks', {
                    templateUrl: 'admin/+tasks/tasks.html',
                    controller: 'TasksCtrl',
                    resolve: requireUser,
                    active: 'tasks'
                })
                .when('/admin/achievements', {
                    templateUrl: 'admin/+achievements/achievements.html',
                    controller: 'AchievementsCtrl',
                    resolve: requireUser,
                    active: 'achievements'
                })
                .when('/admin/notifications', {
                    templateUrl: 'admin/+notifications/notifications.html',
                    controller: 'NotificationsCtrl',
                    resolve: requireUser,
                    active: 'notifications'
                })
                .when('/admin/highschools', {
                    templateUrl: 'admin/+highSchools/highSchools.html',
                    controller: 'HighSchoolCtrl',
                    resolve: requireUser,
                    active: 'highschools'
                })
                .when('/admin/policy', {
                    templateUrl: 'admin/+policy/policy.html',
                    controller: 'PolicyCtrl',
                    resolve: requireUser,
                    active: 'policy'
                })
                .when('/admin/entitlements', {
                    templateUrl: 'admin/+entitlements/entitlements.html',
                    controller: 'EntitlementsCtrl',
                    resolve: requireUser,
                    active: 'entitlements'
                })
                .when('/admin/sponsor', {
                    templateUrl: 'admin/+sponsoredSchools/sponsoredSchools.html',
                    controller: 'SponsoredSchoolsCtrl',
                    controllerAs: 'vm',
                    resolve: requireUser,
                    active: 'sponsor'
                })
                .otherwise({redirectTo: '/admin/stakeholders'});
            $locationProvider.html5Mode(false).hashPrefix('');
            $sceDelegateProvider.resourceUrlWhitelist(['self']);
        }
    ])
    .run(function ($rootScope, $location, StakeholderAuth) {
        $rootScope.$on('$routeChangeSuccess', function (ev, data) {
            if (data.$$route && data.$$route.controller) {
                $rootScope.controller = data.$$route.controller;
            }
        });
    });
