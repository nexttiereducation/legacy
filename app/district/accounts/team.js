(function () {

    angular.module('members').controller('Team',Team );

    Team.$inject = [ 'DistrictManager', 'DistrictModel', '$scope', 'CsvExport', 'FileHelper', '$location', '$mdDialog', '$mdMedia', '$q', 'UrlHelper'];

    function Team(DistrictManager, DistrictModel, $scope, CsvExport, FileHelper, $location,  $mdDialog, $mdMedia, $q, UrlHelper) {
        var vm = this;

        //vm methods
        this.nextPage = nextPage;
        this.deleteAccount = deleteAccount;
        this.editAccount = editAccount;
        this.getType = getType;
        this.canEdit = canEdit;
        this.exportStakeholders = exportStakeholders;
        this.closeExport = closeExport;
        this.actuallyExport = actuallyExport;
        this.getFilteredStakeholders = getFilteredStakeholders;
        this.messageStakeholders = messageStakeholders;
        this.closeDialog = closeDialog;

        ///////////////////////////////////////////////////////////////
        //vm properties
        this.currentUrl;
        this.DistrictModel = DistrictModel;
        this.filters = [];
        this.promptContent = {
            promptTitle : '',
            title : '',
            confirmLabel :'',
            rejectLabel : '',
            optionLabel: '',
            option : false
        };
        this.analyticsIsDownloading = false;
        this.summaryIsDownloading = false;

        ///////////////////////////////////////////////////////////////
        //private vars

        var exportTypeModal = {
            templateUrl: '/district/accounts/export-roster.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        };

        var promptModal = {
            templateUrl: '/district/components/prompt.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        };

        var messageStakeholdersModal = {
            templateUrl: '/district/accounts/message-stakeholders.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        };

        // Show a basic modal from a controller

        //////////////////////////////////////////

        function closeExport(){
            exportTypeModal.hide();
        }

        ////////vm methods
        function closeDialog() {
            $mdDialog.hide();
        }

        function showModal(modal) {
            modal.scope = this.$new();
            $mdDialog.show(modal);
        }
        function actuallyExport(detailedReport){
            if(detailedReport){
                this.analyticsIsDownloading = true;
            } else{
                this.summaryIsDownloading = true;
            }

            DistrictManager.getDownloadAuth(detailedReport)
                .then(function(result){
                    var auth = result.data.auth;
                    var baseUrl = result.data.baseUrl;
                    var districtId =DistrictModel.district.id;
                    var queryString = DistrictModel.currentFilter;
                    var url = UrlHelper.district.districtExportWithAuth(detailedReport, auth, districtId, queryString);
                    FileHelper.downloadFromUrl(url);
                });
        }
        function exportStakeholders(){
            showModal(exportTypeModal);
        }
        function getType(type) {
            if (type == 'Student' || type == 'Parent') return type;
            return 'Faculty';
        }

        function canEdit(stake) {
            if(stake )
                return (stake.email.endsWith(this.DistrictModel.district.domain));
            return false;
        }

        function editAccount(stake, dash) {
            stake.emailSplice = stake.email.split('@')[0];
            DistrictManager.editStakeholder(stake);
            this.DistrictModel.sourcePage ='all';
            dash.routeTo('/edit/' + stake.id);
        }

        function actuallyDeleteAccount() {
            var stake = this.promptContent.option;
            DistrictManager.deleteStakeholder(stake)
                .then(function(){
                    _.pull(this.DistrictModel.pagedStakeholderList, stake);
                    toastr.info('Account deleted');
                    closeDialog();
                })
                .catch(function(ex){
                    console.log(ex);
                    toastr.error('There was a problem deleting the team member');
                });
        }
        function deleteAccount(stake) {
            this.promptContent.option = stake;
            this.promptContent.confirmLabel = 'Delete';
            this.promptContent.rejectLabel = 'Cancel';
            this.promptContent.title = 'Are you sure you want to delete ' + stake.email + '?';
            this.promptContent.optionLabel = null;
            this.promptContent.confirmFunction = actuallyDeleteAccount;
            showModal(promptModal);
        }
        function nextPage() {
            if (this.DistrictModel.url != null && this.DistrictModel.url !== this.currentUrl) {
                this.currentUrl = this.DistrictModel.url;
                DistrictManager.getAllMembers(this.DistrictModel.url);
            }
        }

        function getFilteredStakeholders(params) {
            var selectedCounselors = [];
            if (params.display.Counselors) {
                var counselors = params.display.Counselors;
                for (var idx = counselors.length; idx--;) {
                    if (counselors[idx] > -1) selectedCounselors.push(this.DistrictModel.getStakeholderPos(counselors[idx]).coun);
                }
            }

            if (selectedCounselors.length > 0) {
                this.DistrictModel.visibleMembers = selectedCounselors;
            }
            else {
                this.DistrictModel.visibleMembers = this.DistrictModel.members;
            }
            DistrictManager.initTeam(params.queryString);
        }

        function messageStakeholders() {
            showModal(messageStakeholdersModal);
        }

        ////////private methods////////
    }
})();
