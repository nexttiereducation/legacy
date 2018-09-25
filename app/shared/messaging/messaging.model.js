(function() {
    'use strict';

    angular
        .module('messagingModule')
        .service('MessagingModel',MessagingModel);

    MessagingModel.$inject = ['localStorageService'];

    function MessagingModel(localStorageService) {
        this.recentMessagesData = [];
        this.unreadCount = 0;
        this.studentTags = null;
        this.useWebsockets = localStorageService.get('ws') ? JSON.parse(localStorageService.get('ws')) : false;
    }
})();
