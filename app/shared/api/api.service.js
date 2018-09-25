'use strict';

angular
    .module('apiModule')
    .factory('ApiService', ApiService);

ApiService.$inject = [
    '$cookies',
    '$http',
    '$location',
    '$q',
    '$rootScope',
    'localStorageService',
];

function ApiService($http, $rootScope, $location, $q, localStorageService, $cookies) {

    function getAuthToken() {
        return localStorageService.get('authToken');
    }

    function removeAuthToken() {
        try {
            $cookies.remove('authToken', {domain: $rootScope.webApp});
        } catch (Exception) { }
        localStorageService.remove('authToken');
    }

    function setAuthToken(token) {
        localStorageService.set('authToken', token);
        try {
            $cookies.put('authToken', token, {domain: $rootScope.webApp});
        } catch (Exception) {
            console.warn('Failed to setup view of student dashboard.');
        }
    }

    function getLocation(href) {
        var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
        return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        };
    }

    function apiRequest(method, path, requestData) {
        var authToken = getAuthToken();
        var headers = (authToken)
            ? { 'AUTHORIZATION': 'Token ' + authToken }
            : {};
        if (path.substring(0, 11) == 'http://api/') {
            var newPath = path.substring(11, path.length);
            path = newPath;
        }
        var options = {
            method: method,
            url: path,
            headers: headers,
            data: requestData || {}
        };
        if (method === 'get') {
            options.params = options.data;
            delete options.data;
        }
        if (method == 'delete') {
            headers['Content-Type'] = 'application/json;charset=utf-8';
        }
        if (method === 'postFile') {
            headers['Content-Type'] = undefined; // To ensure multipart boundary is added
            options.method = 'post';
            options.headers = headers;
            options.transformRequest = angular.identity;
        }
        var canceler = $q.defer();
        options.timeout = canceler.promise;
        var track = function (start, method, authToken) {
            return function () {
                if (method != 'get' && method != 'post') {
                    return;
                }
                var elapsed = new Date() - start;
                var partialAuth = (authToken)
                    ? authToken.substring(0, 5)
                    : '';
                var stakeholderEmail = JSON
                    .parse(sessionStorage.getItem('ls.stakeholder'))
                    .email;
                var emailDomain = stakeholderEmail.replace(/.*@/, '');
                var url = $location.protocol() + '://' + location.host + '/metrics/' + partialAuth + '/' + elapsed
                            + '/' + method + getLocation(path).pathname + '?user_email_domain=' + emailDomain;
                //Don't really care about success or failure
                $http.get(url);
            };
        };
        var start = new Date();
        var logIt = track(start, method, authToken);
        var promise = $http(options);
        promise.success(function () {
            if ($rootScope.isDev) { return; }
            logIt();
        });
        promise.error(function (data, status, headers, config) {
            if (status == 401 || status == 403) {
                console.log('API unauthorized. ' + options.url);
                $rootScope.FORBIDDEN = true;
                return status;
            }
        });
        return promise;
    }

    // Get all from a paginated endpoint
    function recursiveGet(url, requestData) {
        var promise = apiRequest('get', url, requestData).then(function (response) {
            return response.data.next
                ? recursiveGet(response.data.next)
                    .then(function (results) {
                        return response.data.results.concat(results);
                    })
                : response.data.results;
        });
        return promise;
    }

    function getPaged(url, requestData) {
        var defer = $q.defer();
        recursiveGet(url, requestData)
            .then(function (data) {
                defer.resolve(data);
            })
            .catch(function (err) {
                $rootScope.$broadcast(
                    'pagedLoadingError',
                    { details: 'Could not load all of the requested paged content.' }
                );
                defer.reject(err);
            });
        return defer.promise;
    }

    return {
        $get: function (path, params) {
            return apiRequest('get', path, params || {});
        },
        $getPaged: function (path, requestData) {
            return getPaged(path, requestData);
        },
        $post: function (path, requestData) {
            return apiRequest('post', path, requestData);
        },
        $postFile: function (path, requestData) {
            return apiRequest('postFile', path, requestData, '');
        },
        $put: function (path, requestData) {
            return apiRequest('put', path, requestData, '');
        },
        $patch: function (path, requestData) {
            return apiRequest('patch', path, requestData, '');
        },
        $delete: function (path, requestParams) {
            return apiRequest('delete', path, requestParams, '');
        },
        getAuthToken: getAuthToken,
        setAuthToken: setAuthToken,
        removeAuthToken: removeAuthToken
    };
}
