angular
    .module('adminModule')
    .controller('NotificationsCtrl', [
        '$scope',
        '$rootScope',
        'infiniteScroll',
        'ApiUrlService',
        'ApiService',
        'ngDialog',
        'AdminDialog',
        function ($scope, $rootScope, infiniteScroll, ApiUrlService, ApiService, ngDialog, AdminDialog) {
            $scope.items = [];
            $scope.filterItems = {};

            $scope.getListItems = function (reload) {
                var url = ApiUrlService.notifications.getList();
                url += (!!$scope.query)
                    ? '?stakeholder_id=' + $scope.query
                    : '';
                // Pass true as reload argument to update list
                $scope.items = new infiniteScroll('list', reload, url);
            };

            $scope.openEditForm = function (item, index) {
                AdminDialog.editDialog($scope, item.id, index, 'notifications');
            };

            // Run on Load
            var init = function () {
                $scope.getListItems();
            };

            init();
        }
    ]);
