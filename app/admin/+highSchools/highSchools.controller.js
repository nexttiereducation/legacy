(function() {
    'use strict';

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
        this.items = [];
        this.filterItems = {};
        this.hsName = '';
        this.districts = [];

        this.getListItems = getListItems;
        this.openDeleteDialog = openDeleteDialog;

        function searchHighSchoolsByZipCodeOrName() {
            getListItems(true);
        }

        function openEditForm(item, index) {
            AdminDialog.editDialog($scope, item.id, index, 'highschool');
        }

        function openNewItemForm() {
            AdminDialog.newDialog($scope, 'highschool');
        }

        // File uploading stuff
        this.uploadStatus = 'Upload CSV';
        this.uploader = new FileUploader({
            url: ApiUrlService
                .highschool
                .bulkUpload(),
            removeAfterUpload: true,
            headers: {
                'AUTHORIZATION': 'Token ' + StakeholderAuthService.getAuthToken()
            }
        });

        this.uploader.filters.push({
            name: 'csvFilter',
            fn: function (item) {
                return /\.csv$/i.test(item.name);
            }
        });

        this.uploader.onWhenAddingFileFailed = function () {
            toastr.error('File must be CSV format.', 'Error');
        };
        this.uploader.onAfterAddingFile = function (fileItem) {
            this.uploadStatus = 'Uploading...';
            fileItem.upload();
        };
        this.uploader.onErrorItem = function (fileItem, response, status, headers) {
            toastr.error('Upload Failed!', 'Error');
            this.uploadStatus = 'Upload CSV';
        };
        this.uploader.onSuccessItem = function (fileItem, response, status, headers) {
            toastr.info('Upload Successful');
            this.uploadStatus = 'Upload CSV';
            this.getListItems();
            this.items.nextPage();
        };

        getListItems();
        getDistricts();

        function getListItems(reload) {
            var queryParms = '';
            if (this.hsName) {
                queryParms = '?name=' + this.hsName;
            }
            // Pass true as reload argument to update list
            this.items = new infiniteScroll('list', reload, ApiUrlService.highschools.getList(queryParms));
        }

        function getDistricts() {
            ApiService
                .$get(ApiUrlService.district.getDistricts())
                .then(function (response) {
                    this.districts = response.data.results;
                });
        }
        function openDeleteDialog(item, index) {
            this.item = item;
            ngDialog
                .openConfirm({template: 'templates/partials/confirm-delete.html', scope: $scope})
                .then(function () {
                    ApiService
                        .$delete(ApiUrlService.highschool.getItem(item.id))
                        .success(function () {
                            this.items.items.splice(index, 1);
                            toastr.info('High School successfully deleted.');
                        })
                        .error(function () {
                            toastr.error('Failed to delete High School.', 'Error');
                        });
                });
        }
    }
})();
