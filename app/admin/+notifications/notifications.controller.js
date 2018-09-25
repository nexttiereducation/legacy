(function() {
    'use strict';

    angular
        .module('adminModule')
        .controller('NotificationsCtrl', NotificationsCtrl);

    NotificationsCtrl.$inject = [
        '$scope',
        '$rootScope',
        'infiniteScroll',
        'ApiUrlService',
        'ApiService',
        'ngDialog',
        'AdminDialog'
    ];

    function NotificationsCtrl($scope, $rootScope, infiniteScroll, ApiUrlService, ApiService, ngDialog, AdminDialog) {
        this.items = [];
        this.filterItems = {};

        function getListItems(reload) {
            var url = ApiUrlService.notifications.getList();
            url += (this.query)
                ? '?stakeholder_id=' + this.query
                : '';
            // Pass true as reload argument to update list
            this.items = new infiniteScroll('list', reload, url);
        }

        function openEditForm(item, index) {
            AdminDialog.editDialog($scope, item.id, index, 'notifications');
        }

        // Run on Load
        function init() {
            this.getListItems();
        }

        this.init();
    }
})();
