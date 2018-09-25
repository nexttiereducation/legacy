(function () {

    angular.module('members').controller('MessageStakeholders', MessageStakeholdersController);

    MessageStakeholdersController.$inject = ['DistrictManager', 'DistrictModel'];

    function MessageStakeholdersController(DistrictManager, DistrictModel) {
        var vm = this;

        //vm methods
        this.sendNotifications = sendNotifications;
        this.sendWelcomeMessage = sendWelcomeMessage;

        ///////////////////////////////////////////////////////////////
        //vm properties
        this.districtManager = DistrictManager;
        this.districtModel = DistrictModel;
        this.message = '';

        ///////////////////////////////////////////////////////////////
        //private vars

        (function (){
        })();

        return;

        ////////vm methods
        function sendNotifications() {
            var district_id = this.districtModel.district.id;
            var query_string = this.districtModel.currentFilter ? this.districtModel.currentFilter : '';
            data = { 'body': this.message };
            this.districtManager.sendNotifications(district_id, data, query_string);
        }

        function sendWelcomeMessage() {
            var query_string = this.districtModel.currentFilter ? this.districtModel.currentFilter : '';
            var district_id = this.districtModel.district.id;
            var data = { body: 'New Account Email' };
            this.districtManager.sendNotifications(district_id, data, query_string);
        }

        ////////private methods////////
    }
})();
