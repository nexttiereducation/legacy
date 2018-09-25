(function() {
    angular.module('members')
        .controller('Metadata', MetadataController);

    MetadataController.$inject = ['DistrictManager', 'DistrictModel'];

    function MetadataController(DistrictManager, DistrictModel) {
        'use strict';
        var vm = this;

        // Methods
        this.updateMetadata = updateMetadata;

        // Properties
        this.metadata;

        (function () {
            getMetadata();
        })();

        return;

        // Method Definitions
        function updateMetadata() {
            var uniqueIdentifier = document.getElementById('uniqueIdentifier').value;

            if (this.metadata) { // make a patch request if there already is a unique identifier
                DistrictManager.updateMetadata(uniqueIdentifier, this.metadata.id).then(function(response){
                    this.metadata = response;
                });
            } else { // make a post request
                DistrictManager.setMetadata(uniqueIdentifier).then(function(response){
                    this.metadata = response;
                });
            }
        }

        // Private Methods
        function getMetadata() {
            var district_id = DistrictModel.district.id;
            return DistrictManager.getMetadata(district_id).then(function(response){
                this.metadata = response.results[0];
            });
        }
    }
})();
