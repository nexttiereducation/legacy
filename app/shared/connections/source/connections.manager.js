(function() {
    angular.module('connections')
        .factory('ConnectionsManager', ConnectionsManager);

    ConnectionsManager.inject = ['API', 'UrlHelper', 'StakeholderAuth', 'ConnectionsModel'];

    function ConnectionsManager(API, UrlHelper, StakeholderAuth, ConnectionsModel) {
        return {
            acceptInvite: acceptInvite,
            addConnection: addConnection,
            declineInvite: declineInvite,
            deleteConnection: deleteConnection,
            getConnections: getConnections,
            getPendingConnections: getPendingConnections,
            initializeConnections: initializeConnections,
            revokeInvite: revokeInvite,
            findConnection: findConnection,
            getStudentsWithRecommendation: getStudentsWithRecommendation
        };

        function getConnections() {
            return API.$getPaged(UrlHelper.connections.all(), {hideLoader: true}).then(function(connections) {
                ConnectionsModel.connections = connections.data.results;
                return connections;
            });
        }

        function findConnection(connectionSearchKey) {
            return API.$getPaged(UrlHelper.connections.all(connectionSearchKey), {hideLoader: true}).then(function(connections) {
                return ConnectionsModel.connections = connections
            });
        }


        function getStudentsWithRecommendation(schoolId, next, recursive) {
            return API.$get(next || UrlHelper.connections.all(null, schoolId)).then(function(connections) {
                if (!recursive) {
                    ConnectionsModel.studentRecs = [];
                }

                ConnectionsModel.studentRecs.push.apply(ConnectionsModel.studentRecs, connections.data.results);

                if (connections.data.next) {
                    getStudentsWithRecommendation(schoolId, connections.data.next, true);
                };

                return ConnectionsModel.studentRecs;
            });
        }

        function deleteConnection(connectionId) {
            return API.$delete(UrlHelper.connections.delete(connectionId)).then(function(response) {
                return response.data;
            });
        }

        function addConnection(email) {
            if (StakeholderAuth.isStudent()) {
                var body = {
                    email: email
                };
            } else {
                var body = {
                    email: email,
                    invite_type: 'Student'
                };
            }

            return API.$post(UrlHelper.connections.add(), body).then(function(response) {
                return response.data;
            });
        }

        function getPendingConnections() {
            return API.$get(UrlHelper.connections.pending(), {hideLoader: true}).then(function(response) {
                ConnectionsModel.pendingConnections = parsePendingConnections(response.data.results);
                return response.data;
            })
        }

        function acceptInvite(token) {
            return API.$post(UrlHelper.connections.accept(token), { status: "Accept" }).then(function(response) {
                initializeConnections();
               return response.data;
            });
        }

        function declineInvite(token) {
            return API.$post(UrlHelper.connections.accept(token), { status: "Ignore" }).then(function(response) {
                getPendingConnections();
                return response.data;
            });
        }

        function revokeInvite(token) {
            return API.$delete(UrlHelper.connections.revokeInvite(token)).then(function(response) {
                getPendingConnections();
                return response.data;
            });
        }

        function initializeConnections() {
            getPendingConnections();
            // getConnections();
        }

        function parsePendingConnections(pendingConnections) {
            var userEmail = StakeholderAuth.getUser().email;
            var connections = {
                invites: [],
                requests: []
            };

            for(var i = 0, pending; pending = pendingConnections[i]; ++i) {
                if (pending.invite_email === userEmail) {
                    connections.requests.push(pending);
                } else {
                    connections.invites.push(pending)
                }
            }

            return connections
        }

    }

})();
