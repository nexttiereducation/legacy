angular
    .module('adminModule')
    .factory('XLSXReaderService',

    ['$q', '$rootScope',

    function($q, $rootScope){
        var service = function(data) {
            angular.extend(this, data);
        };
        service.readFile = function(file, toJSON) {
            var deferred = $q.defer();
            //Read the cells as cells, or convert into json
            XLSXReader(file, !toJSON, toJSON, function(data) {
                $rootScope.$apply(function() {
                    deferred.resolve(data);
                });
            });
            return deferred.promise;
        };
        return service;
    }
]);
