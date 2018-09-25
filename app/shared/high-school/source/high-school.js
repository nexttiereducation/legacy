(function() {
    angular.module('high-school')
        .controller('HighSchoolController', HighSchoolController);

    HighSchoolController.$inject = ["$scope", "HighSchoolManager", "StakeholderAuth", "Track", "localStorageService"];

    function HighSchoolController($scope, HighSchoolManager, StakeholderAuth, Track, localStorageService) {
        var vm = this;

        //vm methods
        this.searchHighSchoolsByZipCodeOrName = searchHighSchoolsByZipCodeOrName;
        this.selectHighSchool = selectHighSchool;
        this.addHighSchool = addHighSchool;
        this.removeHighSchool = removeHighSchool;
        this.getHighSchoolDetails = getHighSchoolDetails;

        ///////////////////////////////////////////////////////////////
        //vm properties

        this.highSchools = [];
        this.highSchoolSearchObject = { highSchoolSearchZipCode: "", highSchoolSearchName: "" };
        this.user = StakeholderAuth.getUser();

        (function() {
            if (this.user.highschool) {
                getHighSchoolDetails(this.user.highschool);
            }
        })();

        function searchHighSchoolsByZipCodeOrName() {
            if ((this.highSchoolSearchObject.highSchoolSearchName == "" && this.highSchoolSearchObject.highSchoolSearchZipCode == "")
                || (this.highSchoolSearchObject.highSchoolSearchName.length === 0 && this.highSchoolSearchObject.highSchoolSearchZipCode.length === 0)) {
                this.highSchools = [];
                return;
            }

            if ((this.highSchoolSearchObject.highSchoolSearchZipCode.length !== 5 && this.highSchoolSearchObject.highSchoolSearchName == "")) return;

            var query = HighSchoolManager.createSearchQuery({}, this.highSchoolSearchObject.highSchoolSearchName, this.highSchoolSearchObject.highSchoolSearchZipCode);

            return HighSchoolManager.searchSchools(query).then(function(response) {
                this.highSchools = response.data.results;
                return this.highSchools;
            }).catch(function() {
                toastr.error("Error searching for school.")
            })

        }

        function selectHighSchool(highSchool) {
            if (!this.selectedHighSchool) {
                this.selectedHighSchool = highSchool;
                this.highSchools = [];
            } else {
                delete this.selectedHighSchool;
                this.highSchoolSearchObject.highSchoolSearchName = "";
                this.highSchoolSearchObject.highSchoolSearchZipCode = "";
            }

        }

        function addHighSchool(highSchool) {
            if (!this.user.loggedIn) {
                $scope.$emit("highSchoolAdded", highSchool.id);
                return;
            }
            HighSchoolManager.updateHighSchool(highSchool.id).then(function(response) {
                this.user.highschool = response.data.highschool;
                StakeholderAuth.saveStakeholderData(this.user);
                getHighSchoolDetails(this.user.highschool).then(function(response) {
                    Track.setHighSchool(response.data.name, response.data.nces);
                    Track.event("set_highschool", data )
                });


                delete this.selectedHighSchool;
                this.highSchoolSearchObject.highSchoolSearchName = "";
                this.highSchoolSearchObject.highSchoolSearchZipCode = "";

                $scope.$emit("highSchoolAdded");
            }).catch(function() {
                toastr.error("Error adding high school.")
            });
        }

        function removeHighSchool() {
            delete this.highSchoolDetails;
            HighSchoolManager.updateHighSchool(null).then(function(response) {
                this.user.highschool = null;
                StakeholderAuth.saveStakeholderData(this.user);
                this.highSchoolSearchObject.highSchoolSearchName = "";
                this.highSchoolSearchObject.highSchoolSearchZipCode = "";
                delete this.user.highschool;
            }).catch(function() {
                toastr.error("Error removing high school.")
            });
        }

        function getHighSchoolDetails(highSchoolId) {
            return HighSchoolManager.getDetails(highSchoolId).then(function(response) {
                this.highSchoolDetails = response.data;
                return response;
            }).catch(function(error) {
                toastr.error("Unable to load high school details.")
                return error;
            })
        }


    }
})();
