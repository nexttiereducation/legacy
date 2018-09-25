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
    $scope.items = [];
    $scope.filterItems = {};

    $scope.getListItems = function (reload) {
        // Pass true as reload argument to update list
        $scope.items = new infiniteScroll('list', reload, ApiUrlService.achievements.getList());
    };

    $scope.openEditForm = function (item, index) {
        AdminDialog.editDialog($scope, item.id, index, 'achievements');
    };

    $scope.toggleDisable = function (item, index) {
        var updateText = (item.is_visible)
            ? 'Achievement Disabled.'
            : 'Achievement Enabled.';
        var dataPack = {
            'is_visible': !item.is_visible
        };
        ApiService
            .$patch(ApiUrlService.achievements.update(item.id), dataPack)
            .success(function (response) {
                $scope.items.items[index] = response;
                toastr.info(updateText);
            })
            .error(function () {
                toastr.error('Oops, Something went wrong, please try again.', 'Error');
            });
    };

    $scope.openNewItemForm = function () {
        AdminDialog.newDialog($scope, 'achievements');
    };

    // Run on Load
    var init = function () {
        $scope.getListItems();
    };

    init();
}
