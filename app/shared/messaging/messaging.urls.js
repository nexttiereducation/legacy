(function() {
    'use strict';

    angular
        .module('messagingModule')
        .run(addUrls);

    addUrls.$inject = ['UrlHelper'];

    function addUrls(UrlHelper) {
        UrlHelper.init();

        var pathRoot = UrlHelper.getPathRoot();

        UrlHelper.messaging = {
            getMessages: function(stakeholderId) { return pathRoot + '/messages/thread/' + stakeholderId; },
            group: function() { return pathRoot + '/messages/group/'; } ,
            markRead: function(stakeholderId) { return pathRoot + '/messages/update/' + stakeholderId; },
            message: function() { return pathRoot + '/messages/'; },
            studentsInTag: function(id) { return pathRoot + '/tag/' + id + '/students/'; },
            studentTags: function() { return pathRoot + '/stakeholder/1/student/tags/';},
            unread: function() { return pathRoot + '/messages/unread'; }
        };
    }

})();
