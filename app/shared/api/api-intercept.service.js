(function() {
    'use strict';

    angular
        .module('apiModule')
        .config([
            '$httpProvider',
            function ($httpProvider) {
                $httpProvider
                    .interceptors
                    .push('ApiInterceptService');
            }
        ])
        .service('ApiInterceptService', ApiInterceptService);

    ApiInterceptService.$inject = ['$rootScope', '$q', '$timeout'];

    function ApiInterceptService($rootScope, $q, $timeout) {

        var service = this;
        var requestCount = 0;
        var timeOutPromise;
        var showPromise;
        var isTimeOutActive = false;
        service.request = function (config) {

            if (config.url.indexOf('maps.googleapis') > 0) {
                config.headers.AUTHORIZATION = undefined;
            }

            var showLoaderOnGet = config.params && !config.params.hideLoader;
            var showLoaderOnPost = config.data && !config.data.hideLoader;
            var hideLoader = ((config.data && config.data.hideLoader) || (config.params && config.params.hideLoader));

            if (!hideLoader) { requestCount++; }

            if (showLoaderOnGet || showLoaderOnPost) {
                showPromise = $timeout(function () {
                    $rootScope.$broadcast('show-loading');
                }, 250);
            }
            if (!isTimeOutActive) {
                isTimeOutActive = true;
                timeOutPromise = $timeout(function () {
                    var errorMessage = 'Service temporarily down. Please try again.';
                    $rootScope.$broadcast('hide-loading', errorMessage);
                }, 60000);
            }
            return config;
        };

        service.responseError = function (response) {
            handleResponse(response);
            return $q.reject(response);
        };

        service.response = function (response) {
            handleResponse(response);
            return response;
        };

        function handleResponse(response) {
            if (!(response.config.params && response.config.params.hideLoader)) {
                if (requestCount > 0) {
                    requestCount--;
                } else {
                    requestCount = 0;
                }
            }
            $timeout.cancel(showPromise);
            if (requestCount === 0) {
                $rootScope.$broadcast('hide-loading');
            }
            $timeout.cancel(timeOutPromise);
            isTimeOutActive = false;
        }

    }
})();
