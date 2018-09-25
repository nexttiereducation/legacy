(function() {
    angular.module('connections').run(addUrls);

    addUrls.$inject = ['UrlHelper'];

    function addUrls(urlHelper) {

        urlHelper.connections = {
            all: function(searchKey, recSchoolId) {
                searchKey = searchKey ? searchKey : '';
                recSchoolId = recSchoolId ? recSchoolId : '';
                return urlHelper.getPathRoot() + '/stakeholder/connections/all?search=' + searchKey + '&recommended_school_id=' + recSchoolId;
            },
            delete: function(stakeholderId) { return urlHelper.getPathRoot() + '/stakeholder/connections/delete/' + stakeholderId },
            pending: function() { return urlHelper.getPathRoot() + '/stakeholder/connections/pending' },
            add: function() { return urlHelper.getPathRoot() + '/stakeholder/invite' },
            accept: function(token) { return urlHelper.getPathRoot() + '/stakeholder/invite/acceptance/' + token },
            revokeInvite: function(token) { return urlHelper.getPathRoot() + '/stakeholder/invite/delete/' + token }
        };

    }

})();