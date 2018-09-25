(function() {
    angular.module('utilsModule')
        .filter('http', function () {
            return function (https) {
                return https.replace(/https:\/\//, 'http://');
            };
        });
})();
