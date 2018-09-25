(function () {

    angular.module('members').controller('EditMembers', EditMember);

    EditMember.$inject = [ 'DistrictManager','DistrictModel','$routeParams', '$location','HighSchoolManager'];

    function EditMember(DistrictManager, DistrictModel, $routeParams, $location, HighSchoolManager) {
        var vm = this;
        this.cancelEdit = cancelEdit;
        this.toggleEntitlement = toggleEntitlement;
        this.applyChanges = applyChanges;
        this.addAll = addAll;
        this.routeTo = routeTo;
        this.selectHighSchool = selectHighSchool;
        this.removeHighSchool = removeHighSchool;

        this.DistrictModel = DistrictModel;

        this.highSchools = [];
        this.form = {};
        this.roles = [];
        this.activity = [];
        activate();
        return;

        function activate(){

            if(! DistrictModel.selectedStakeholder){
                addMember();
            }

            this.editType = 'create';
            if(/load/.test($location.path())){
                this.selectedTabIndex = 1;
                this.editType = 'load';
            }
            if(/roles/.test($location.path())){
                this.selectedTabIndex = 3;
                this.editType = 'roles';
            }
            if(/find/.test($location.path())){
                this.selectedTabIndex = 2;
                this.editType = 'find';
            }
            if(/metadata/.test($location.path())) {
                this.selectedTabIndex = 4;
                this.editType = 'metadata';
            }
            if(this.editType === 'create' && $routeParams && $routeParams.id) {
                this.selectedTabIndex = 0;
                DistrictManager.getStakeholder($routeParams.id)
                    .then(function (data) {
                        if(data.highschool) {
                            HighSchoolManager.getDetails(data.highschool)
                                .then(function (response) {
                                    data.highschool = response.data;
                                    //Call it again to update highschool on edit object
                                    DistrictManager.editStakeholder(data);
                                });
                        }
                        if(! data.highschool) data.highschool='';
                        DistrictManager.editStakeholder(data);
                        var listOfSchools = this.DistrictModel.district.highschools;
                        this.highSchools = listOfSchools;

                    });
            }

            loadRoles();
        }

        ////////////////
        function loadRoles(){

            var listOfSchools = this.DistrictModel.district.highschools;
            this.highSchools = listOfSchools;
            console.log('Help me!')
            console.log(this.DistrictModel)
            if(!this.DistrictModel.district.roles || this.DistrictModel.district.roles.length < 1) {
                DistrictManager.getRoles()
                    .catch(function(ex){
                        if(this.DistrictModel.district.id){
                            toastr.error('Problem retreiving entitlement data. Try again.');
                        } else {
                            toastr.error('Please choose a district before editing');
                        }
                    })
            }
        }
        function addAll(dash){
            DistrictManager.addMatches(this.DistrictModel.district.id)
                .then(function (response) {
                    DistrictManager.selectDistrict(this.DistrictModel.district);
                    toastr.info(response.detail);
                    dash.routeTo('/all');
                })
                .catch(function (error) {
                    toastr.error('Error Adding Members to District', error);
                })
        }
        function addMember(){
            this.DistrictModel.selectedStakeholder = {
                first_name : undefined,
                last_name : undefined,
                email : '',
                stakeholder_type : 'Counselor',
                password: undefined,
                roles: []
            };
            this.editType = 'create';
            for(var idx=this.roles.length; idx--; ){
                if(/Guide/.test(this.roles[idx].description)){
                    this.DistrictModel.selectedStakeholder.roles.push(this.roles[idx].id);
                }
            }
        }
        function routeBack(dash){
            if(DistrictModel.sourcePage){
                DistrictModel.currentPage = DistrictModel.sourcePage;
                DistrictModel.sourcePage = null;
            }
            else {
                DistrictModel.currentPage = 'all';
            }
            dash.routeTo('/'+ DistrictModel.currentPage);
        }
        function cancelEdit(dash){
            addMember();
            this.form.editForm.$setPristine();
            routeBack(dash);
        }
        function toggleEntitlement(id){
            this.form.editForm.$setDirty();
            var idx = this.DistrictModel.selectedStakeholder.roles.indexOf(id);
            if( idx > -1 ){ this.DistrictModel.selectedStakeholder.roles.splice(idx,1)}
            else this.DistrictModel.selectedStakeholder.roles.push(id);
        }
        function checkIfDoneEditing(){
            if(this.form.editForm && this.form.editForm.$dirty) {
                if( confirm('Continue and lose your changes?') ){
                    this.form.editForm.$setPristine();
                }
                else {
                    return false;
                }
            }
            return true;
        }

        function applyChanges( dash ){
            var updatedStakeholder = this.DistrictModel.selectedStakeholder;
            if( updatedStakeholder ){
                if( updatedStakeholder.emailSplice ){
                    updatedStakeholder.email = updatedStakeholder.emailSplice + '@' + this.DistrictModel.district.domain;
                }
                if(updatedStakeholder.highschool){
                    updatedStakeholder.highschoolObj = updatedStakeholder.highschool;
                    updatedStakeholder.highschool = updatedStakeholder.highschoolObj.id;
                }
                if(updatedStakeholder.id){
                    DistrictManager.updateTeamMember( updatedStakeholder )
                        .then(function(){
                            this.form.editForm.$setPristine();
                            updatedStakeholder.highschool = updatedStakeholder.highschoolObj;
                            if(!updatedStakeholder.highschool){
                                this.DistrictModel.originalStakeholderObject.highschool = null;
                            }
                            jQuery.extend(this.DistrictModel.originalStakeholderObject, updatedStakeholder);

                            routeBack(dash);
                        })
                        .catch(function( error ){
                            toastr.error('Error Updating Member', error);
                        })
                }
                else {
                    updatedStakeholder.district = this.DistrictModel.district.id;
                    DistrictManager.createTeamMember( updatedStakeholder )
                        .then(function (response) {
                            this.form.editForm.$setPristine();
                            updatedStakeholder.highschool = updatedStakeholder.highschoolObj;
                            updatedStakeholder.id = response.data.id;
                        })
                        .catch(function (error) {
                            toastr.error('Error Adding Member to District', error);
                        })
                }
            }
        }

        function routeTo(path){
            $location.path(path, false);
        }


        function selectHighSchool(highSchool) {
            this.DistrictModel.selectedStakeholder.highschool = highSchool;
            this.highSchools = [];
            this.highSchoolSearchObject.highSchoolSearchName = '';
            this.highSchoolSearchObject.highSchoolSearchZipCode = '';
        }


        function removeHighSchool() {
            this.form.editForm.$setDirty();
            this.DistrictModel.selectedStakeholder.highschool = null;
        }

    }
})();
