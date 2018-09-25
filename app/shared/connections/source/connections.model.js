(function() {
    angular.module('connections')
        .service('ConnectionsModel', ConnectionsModel);

    ConnectionsModel.$inject = [];

    function ConnectionsModel() {
        this.connections = [];
        this.pendingConnections = [];
        this.studentRecs = [];
    }

})();