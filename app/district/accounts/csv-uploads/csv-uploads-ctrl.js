(function () {
    angular.module('members')
        .controller('CSVUploads', CSVUploadsController);

    CSVUploadsController.$inject = ['FileHelper', 'DistrictModel', 'DistrictManager'];

    function CSVUploadsController(FileHelper, DistrictModel, DistrictManager) {
        'use strict';
        var vm = this;

        // Methods
        this.assignRow = assignRow;
        this.closeResultsPanel = closeResultsPanel;
        this.createUser = createUser;
        this.nextPage = nextPage;
        this.selectSystemLog = selectSystemLog;
        this.setSelectedNotUpdatedId = setSelectedNotUpdatedId;
        this.setSelectedUnusedRowId = setSelectedUnusedRowId;
        this.setSelectedUpdatedId = setSelectedUpdatedId;
        this.uploadCSV = uploadCSV;

        // Properties
        this.activeTab = 'summary';
        this.DistrictModel = DistrictModel;
        this.rowValidForCreation = false;
        this.selectedNotUpdatedId = -1;
        this.selectedUnusedRowId = -1;
        this.selectedUpdatedId = -1;
        this.systemLog;
        this.systemLogId;
        this.tooltip = {
            title: 'The row doesn't have the minimum set of data to create a user.\nYou must provide the following values:\n* stakeholder_type\n* password\n* email\n*graduation_year (if a stakeholder is a student)',
            checked: false
        };
        this.updatedStakeholders = { next: null, idArray: null, stakeholderArray: [], name: 'ids_updated' };
        this.notUpdatedStakeholders = { next: null, idArray: null, stakeholderArray: [], name: 'ids_not_updated' };
        this.counts = {'ids_updated': 0, 'error_messages': 0, 'rows_not_used' : 0, 'ids_not_updated': 0};
        this.updateCounts = updateCounts;

        (function (){
            getSystemLog();
        })();

        return;

        // Method Definitions
        function assignRow() {
            var object = this.csvResponse.rows_not_used[this.selectedUnusedRowId];
            var newObject = JSON.parse(JSON.stringify(object));
            newObject.id = this.selectedNotUpdatedId;

            DistrictManager.updateTeamMember(newObject).then(function(response) {
                if (this.selectedUnusedRowId > -1) {
                    this.csvResponse.rows_not_used.splice(this.selectedUnusedRowId, 1);
                }
                this.selectedUnusedRowId = -1;
                if (this.selectedNotUpdatedId > -1) {
                    _.remove(this.notUpdatedStakeholders, function(stakeholder){
                        return stakeholder.id === this.selectedNotUpdatedId;
                    });
                }
                this.selectedNotUpdatedId = -1;
                var stakeholder = response.data;
                this.updatedStakeholders.stakeholderArray.push(stakeholder);
                toastr.info('Successfully updated team member');
            }).catch(function(error){
                displayAllErrors(error);
                toastr.error('Failed to update team member');
            });
        }

        function closeResultsPanel() {
            this.csvResponse = undefined;
            this.selectedNotUpdatedId = -1;
            this.selectedUpdatedId = -1;
            this.selectedUnusedRowId = -1;
            this.activeTab = 'summary';
            this.updatedStakeholders = { next: null, idArray: null, stakeholderArray: [], name: 'ids_updated' };
            this.notUpdatedStakeholders = { next: null, idArray: null, stakeholderArray: [], name: 'ids_not_updated' };
            this.rowValidForCreation = false;
            this.systemLogId = -1;
        }

        function createUser() {
            var data = this.csvResponse.rows_not_used[this.selectedUnusedRowId];
            var newData = JSON.parse(JSON.stringify(data));
            newData.district = DistrictModel.district.id;
            DistrictManager.createTeamMember(newData).then(function(response){
                if (this.selectedUnusedRowId > -1) {
                    this.csvResponse.rows_not_used.splice(this.selectedUnusedRowId, 1);
                }
                this.selectedUnusedRowId = -1;
                toastr.info('User account creation successful!');
                DistrictManager.getStakeholder(response.data.id).then(function(response){
                    var stakeholder = response;
                    this.updatedStakeholders.stakeholderArray.push(stakeholder);
                })
            }).catch(function(error){
                if (error.status === 409){
                    toastr.error('User account creation failed. There is a conflict with an existing user.');
                } else if (error.status === 400){
                    displayAllErrors(error);
                    toastr.error('User account creation failed. The request is invalid.');
                } else {
                    toastr.error('User acount creation failed.')
                }
            });
        }

        function nextPage(stakeholderRequestObject) {
            getMoreStakeholders(stakeholderRequestObject);
        }

        function getSystemLog() {
            var district_id = DistrictModel.district.id;
            FileHelper.getSystemLog(district_id).then(function(response){
                this.systemLog = response;
            });
        }

        function selectSystemLog(logObject) {

            FileHelper.downloadSystemLog(logObject.district, logObject.id).then(function (notes) {
                this.csvResponse = notes;
                this.updateCounts(this.csvResponse);
                this.systemLogId = logObject.id;
                this.updatedStakeholders.idArray = this.csvResponse.ids_updated;
                this.notUpdatedStakeholders.idArray = this.csvResponse.ids_not_updated;
                getStakeholders(this.updatedStakeholders);
                getStakeholders(this.notUpdatedStakeholders);
            });
        }

        function updateCounts(csvResponse) {
            this.counts['ids_updated'] = csvResponse.ids_updated.length;
            this.counts['error_messages'] = Object.keys(csvResponse.error_messages).length;
            this.counts['rows_not_used'] = csvResponse.rows_not_used.length;
            this.counts['ids_not_updated'] = csvResponse.ids_not_updated.length;
        }

        function setSelectedNotUpdatedId(id) {
            this.selectedNotUpdatedId = this.selectedNotUpdatedId === id ? -1: id;
        }

        function setSelectedUnusedRowId(id) {
            this.selectedUnusedRowId = this.selectedUnusedRowId === id ? -1 : id;
            setRowValidForCreation();
        }

        function setSelectedUpdatedId(id) {
            this.selectedUpdatedId = this.selectedUpdatedId === id ? -1 : id;
        }

        function uploadCSV(file){
            var id = DistrictModel.district.id;
            FileHelper.uploadDistrictCSV(file, id).then(function(response){
                this.csvResponse = response;
                this.updateCounts(this.csvResponse);
                this.updatedStakeholders.idArray = this.csvResponse.ids_updated;
                this.notUpdatedStakeholders.idArray = this.csvResponse.ids_not_updated;
                this.systemLogId = this.csvResponse.system_log;
                getStakeholders(this.updatedStakeholders);
                getStakeholders(this.notUpdatedStakeholders);
            });
        }

        // Private Methods
        /** stakeholderRequestObject = { idArray: idArray, stakeholderArray: stakeholderArray,
        * nextUrlName: nextUrlName }
        */
        function getStakeholders(stakeholderRequestObject) {
            stakeholderRequestObject.systemLogId = this.systemLogId;
            return DistrictManager.getStakeholders(stakeholderRequestObject).then(function(response) {
                stakeholderRequestObject.stakeholderArray = response.results;
                if (response.next != null) {
                    stakeholderRequestObject.next = response.next;
                }
                return response.results;
            });
        }
        /** moreStakeholderRequestObject = { next: next, stakeholderArray: stakeholderArray,
        * nextUrlName: nextUrlName }
        */
        function getMoreStakeholders(moreStakeholderRequestObject) {
            if (moreStakeholderRequestObject.next){
                return DistrictManager.getMoreStakeholders(moreStakeholderRequestObject.next).then(function(response) {
                    moreStakeholderRequestObject.stakeholderArray = moreStakeholderRequestObject.stakeholderArray.concat(response.results);
                    moreStakeholderRequestObject.next = response.next;
                });
            }
        }
        /**
         * Displays all errors attached to the error object in a toastr.
         */
        function displayAllErrors(error) {
            var count = Object.keys(error.data).length;
            for (var i=0; i < count; i++) {
                toastr.error(Object.keys(error.data) + ': ' + error.data[Object.keys(error.data)[i]]);
            }
        }
        function setRowValidForCreation() {
            var row = this.csvResponse.rows_not_used[this.selectedUnusedRowId];
            if ( row.hasOwnProperty('email') && row.hasOwnProperty('password') && row.hasOwnProperty('stakeholder_type') ) {
                this.rowValidForCreation = (row['stakeholder_type'].toLowerCase() === 'student' && !row.hasOwnProperty('graduation_year')) ? false : true;
            } else {
                this.rowValidForCreation = false;
            }
        }
    }
})();
