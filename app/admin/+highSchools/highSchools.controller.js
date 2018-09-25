angular
    .module('adminModule')
    .controller('HighSchoolCtrl', HighSchoolCtrl);

HighSchoolCtrl.$inject = [
    '$rootScope',
    '$scope',
    'AdminDialog',
    'ApiUrlService',
    'ApiService',
    'FileUploader',
    'infiniteScroll',
    'ngDialog',
    'StakeholderAuthService'
];

function HighSchoolCtrl($scope, $rootScope, infiniteScroll, ApiUrlService, ApiService,
    ngDialog, AdminDialog, FileUploader, StakeholderAuthService) {
    $scope.items = [];
    $scope.filterItems = {};
    $scope.hsName = '';
    $scope.districts = [];

    $scope.getListItems = getListItems;
    $scope.openDeleteDialog = openDeleteDialog;

    $scope.searchHighSchoolsByZipCodeOrName = function () {
        getListItems(true);
    };

    $scope.openEditForm = function (item, index) {
        AdminDialog.editDialog($scope, item.id, index, 'highschool');
    };

    $scope.openNewItemForm = function () {
        AdminDialog.newDialog($scope, 'highschool');
    };

    // File uploading stuff
    $scope.uploadStatus = 'Upload CSV';
    $scope.uploader = new FileUploader({
        url: ApiUrlService
            .highschool
            .bulkUpload(),
        removeAfterUpload: true,
        headers: {
            'AUTHORIZATION': 'Token ' + StakeholderAuthService.getAuthToken()
        }
    });

    $scope.uploader.filters.push({
            name: 'csvFilter',
            fn: function (item) {
                return /\.csv$/i.test(item.name);
            }
        });

    $scope.uploader.onWhenAddingFileFailed = function () {
        toastr.error('File must be CSV format.', 'Error');
    };
    $scope.uploader.onAfterAddingFile = function (fileItem) {
        $scope.uploadStatus = 'Uploading...';
        fileItem.upload();
    };
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
        toastr.error('Upload Failed!', 'Error');
        $scope.uploadStatus = 'Upload CSV';
    };
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
        toastr.info('Upload Successful');
        $scope.uploadStatus = 'Upload CSV';
        $scope.getListItems();
        $scope.items.nextPage();
    };

    getListItems();
    getDistricts();

    function getListItems(reload) {
        var queryParms = '';
        if ($scope.hsName) {
            queryParms = '?name=' + $scope.hsName;
        }
        // Pass true as reload argument to update list
        $scope.items = new infiniteScroll('list', reload, ApiUrlService.highschools.getList(queryParms));
    }

    function getDistricts() {
        ApiService
            .$get(ApiUrlService.district.getDistricts())
            .then(function (response) {
                $scope.districts = response.data.results;
            });
    }
    function openDeleteDialog(item, index) {
        $scope.item = item;
        ngDialog
            .openConfirm({template: 'templates/partials/confirm-delete.html', scope: $scope})
            .then(function () {
                ApiService
                    .$delete(ApiUrlService.highschool.getItem(item.id))
                    .success(function () {
                        $scope.items.items.splice(index, 1);
                        toastr.info('High School successfully deleted.');
                    })
                    .error(function () {
                        toastr.error('Failed to delete High School.', 'Error');
                    });
            });
    }

}
