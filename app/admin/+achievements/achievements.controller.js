(function() {
    'use strict';

    angular
        .module('adminModule')
        .controller('AchievementsCtrl', AchievementsCtrl);

    AchievementsCtrl.$inject = [
        '$rootScope',
        '$scope',
        'AdminDialog',
        'ApiUrlService',
        'ApiService',
        'infiniteScroll',
        'ngDialog'
    ];

    function AchievementsCtrl($scope, $rootScope, infiniteScroll, ApiUrlService, ApiService, ngDialog, AdminDialog) {
        this.items = [];
        this.filterItems = {};

        function getListItems(reload) {
            // Pass true as reload argument to update list
            this.items = new infiniteScroll('list', reload, ApiUrlService.achievements.getList());
        }

        function openEditForm(item, index) {
            AdminDialog.editDialog($scope, item.id, index, 'achievements');
        }

        function toggleDisable(item, index) {
            var updateText = (item.is_visible)
                ? 'Achievement Disabled.'
                : 'Achievement Enabled.';
            var dataPack = {
                'is_visible': !item.is_visible
            };
            ApiService
                .$patch(ApiUrlService.achievements.update(item.id), dataPack)
                .success(function (response) {
                    this.items.items[index] = response;
                    toastr.info(updateText);
                })
                .error(function () {
                    toastr.error('Oops, Something went wrong, please try again.', 'Error');
                });
        }

        function openNewItemForm() {
            AdminDialog.newDialog($scope, 'achievements');
        }

        // Run on Load
        var init = function () {
            this.getListItems();
        };

        init();
    }
})();
