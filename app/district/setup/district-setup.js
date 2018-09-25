(function() {
    angular
      .module('dashboard')
      .controller('DistrictSetup', DistrictSetup);

    DistrictSetup.$inject = ['DistrictManager', 'DistrictModel',
        '$routeParams', '$location', 'HighSchoolManager',
        'StakeholderAuth'
    ];

    function DistrictSetup(DistrictManager, DistrictModel, $routeParams,
        $location, HighSchoolManager, StakeholderAuth) {
        var vm = this;
        //vm methods
        this.loadMoreDistricts = loadMoreDistricts;
        this.newDistrict = newDistrict;
        this.selectDistrict = selectDistrict;
        this.showHighSchool = showHighSchool;
        this.updateSelectedDistrict = updateSelectedDistrict;
        this.update = update;
        this.searchHighSchoolsByZipCodeOrName = searchHighSchoolsByZipCodeOrName;
        this.selectHighSchool = selectHighSchool;
        this.removeHighSchool = removeHighSchool;
        ///////////////////////////////////////////////////////////////
        //vm properties
        this.user = StakeholderAuth.getUser()
        this.DistrictModel = DistrictModel;
        this.showHighSchoolFinder = false;
        this.highSchools = [];
        this.highSchoolSearchObject = {
            highSchoolSearchZipCode: '',
            highSchoolSearchName: ''
        };
        ///////////////////////////////////////////////////////////////
        //private vars
        this.districtid = -1;
        if (this.user.district) {
            this.districtid = this.user.district.id
        }
        // Show a basic modal from a controller
        //////////////////////////////////////////
        activate();
        return;
        ////////vm methods
        function showHighSchool() {
            this.showHighSchoolFinder = true;
        }

        function selectDistrict(district) {
            this.showHighSchoolFinder = false;
            DistrictManager.selectDistrict(null, district);
            this.districtid = district.id;
            if (StakeholderAuth.isAdmin()) {
                this.user.district = district;
            }
        }

        function newDistrict() {
            this.districtid = -1;
            DistrictModel.district = { highschools: [] };
        }

        function searchHighSchoolsByZipCodeOrName() {
            if ((this.highSchoolSearchObject.highSchoolSearchName == ''
                 && this.highSchoolSearchObject.highSchoolSearchZipCode == '')
                || (this.highSchoolSearchObject.highSchoolSearchName.length === 0
                    && this.highSchoolSearchObject.highSchoolSearchZipCode.length === 0)) {
                this.highSchools = [];
                return;
            }
            if (this.highSchoolSearchObject.highSchoolSearchZipCode.length !== 5
                && this.highSchoolSearchObject.highSchoolSearchName == '') {
                  return
            };
            var query = HighSchoolManager.createSearchQuery(
              {},
              this.highSchoolSearchObject.highSchoolSearchName,
              this.highSchoolSearchObject.highSchoolSearchZipCode
            );
            HighSchoolManager.searchSchools(query)
                .then(function(response) {
                    _.pullAllBy(response.data.results, this.districtHighSchools, 'id');
                    this.highSchools = response.data.results;
                }).catch(function() {
                    toastr.error('Error searching for school.')
                });
        }

        function selectHighSchool(highSchool) {
            DistrictManager.addHighSchool(highSchool)
                .then(function() {
                    this.DistrictModel.district.highschools.push(highSchool);
                    this.highSchoolSearchObject.highSchoolSearchName = '';
                    this.highSchoolSearchObject.highSchoolSearchZipCode = '';
                    this.showHighSchoolFinder = false;
                }).catch(function(ex) {
                    console.log(ex);
                    toastr.error('Error adding high school.')
                });
        }

        function removeHighSchool(highSchool) {
            DistrictManager.removeHighSchool(highSchool)
                .then(function() {
                    _.pull(this.DistrictModel.district.highschools, highSchool);
                }).catch(function(ex) {
                    console.log(ex);
                    toastr.error('Error removing high school.')
                });
        }

        function update() {
            if (DistrictModel.isValid()) {
                DistrictManager.saveDistrict(DistrictModel.district)
                    .catch(function(error) {
                        toastr.error('Error Updating District', error);
                    });
            } else {
                DistrictManager.createDistrict()
                    .then(function(district) {
                        this.districtid = district.id;
                        DistrictManager.selectDistrict(district.id);
                        if (StakeholderAuth.isAdmin()) {
                            this.user.district = district;
                        }
                    }).catch(function(error) {
                        toastr.error('Error Creating District', error);
                    });
            }
        }

        function loadMoreDistricts() {
            if (DistrictModel.allDistrictsNextPage) { DistrictManager.getMoreDistricts(); }
        }

        function updateSelectedDistrict() {
            if (this.districtid && this.districtid > 0) {
                if (this.districtid && $routeParams && $routeParams.districtId !=
                    this.districtid) {
                    $location.path('/' + this.districtid + '/');
                } else {
                    DistrictManager.selectDistrict(this.districtid);
                }
            } else {
                DistrictModel.district = {};
            }
        }
        ////////private methods////////
        function activate() {
            DistrictManager.getAllDistricts()
                .then(function(response) {
                    if (this.user.district) {
                        DistrictManager.selectDistrict(this.user.district);
                    }
                    if (DistrictModel.district && DistrictModel.district
                        .id) {
                        this.districtid = DistrictModel.district.id;
                    }
                });
        }
    }
})();
