(function(){
    angular.module('members').controller('Entitlements',Entitlements);

    Entitlements.$inject = [ 'DistrictManager', 'DistrictModel', '$q', '$modal', '$scope'];

    function Entitlements(DistrictManager, DistrictModel, $q, $modal, $scope) {
        var vm = this;
        this.selectRole = selectRole;
        this.editRole = editRole;
        this.updateRole = updateRole;
        this.deleteRole = deleteRole;
        this.createRole = createRole;
        this.roleHasAction = roleHasAction;
        this.toggleEntitlement = toggleEntitlement;

        this.DistrictModel = DistrictModel;
        this.editableRoles = []
        this.selectedRole;
        this.actions = [];
        activate();

        ///Private Variables
        var confirmModal = $modal({
            scope: $scope,
            template: '/district/components/prompt.html',
            show: false
        });
        this.promptContent = {
            promptTitle : '',
            title : '',
            confirmLabel :'',
            rejectLabel : '',
            optionLabel: '',
            option : false
        };
        return;

        function activate(){
            DistrictManager.getRoles()
                .then(function(roles){
                    this.editableRoles = _.filter(roles, function(role){ return ! role.enterprise; } )
                })
                .catch(function(){
                    toastr.error('Problem loading current roles');
                });
            DistrictManager.getActions()
                .then(function(actions){
                    this.actions = actions;
                })
                .catch(function(){
                    toastr.error('Problem loading current actions list');
                })
        }
        function actuallyDelete(role){
            return function(){
                DistrictManager.deleteRole(role)
                    .then(function(ex){
                        _.remove(this.editableRoles, role);
                    })
                    .catch(function(ex){
                        console.log(ex);
                        toastr.error('Problem deleting role.');
                    })
            };
        }
        function showModal () {
            confirmModal.$promise
                .then(confirmModal.show)
        }
        function deleteRole(role){

            this.promptContent.option = false;
            this.promptContent.confirmLabel = 'Delete Role';
            this.promptContent.rejectLabel = 'Cancel';
            this.promptContent.title = 'Remove the role: ' + role.name + '?';
            this.promptContent.confirmFunction = actuallyDelete(role);
            showModal();
        }
        function updateRole(role){
            DistrictManager.renameRole(role)
                .then(function(ex){
                    role.edit=false;
                })
                .catch(function(ex){
                    console.log(ex);
                    toastr.error('Problem renaming role.');
                })
        }
        function createRole(){
            DistrictManager.createRole()
                .then(function(newRole){
                    this.editableRoles.unshift(newRole);
                    newRole.edit = true;
                })
                .catch(function(ex){
                    if(ex.status == 409){
                        toastr.error('Rename existing 'New Role' before creating another');
                    }
                    else {
                        toast.error('Problem creating role');
                    }
                });
        }
        function roleHasAction(action){
            if(! this.selectedRole ) return false;

            var idx = _.findIndex(this.selectedRole.actions, function(roleAction){ return roleAction.id == action.id; });
            return idx >= 0;
        }
        function editRole(role){
            role.edit=true;
        }
        function selectRole(role){
            this.selectedRole = role;
        }
        function toggleEntitlement(action){
            if(! this.selectedRole ) return;
            var idx = _.findIndex(this.selectedRole.actions, function(roleAction){ return roleAction.id == action.id; });
            var add = idx < 0;

            DistrictManager.updateActionList(this.selectedRole, action, add)
                .then(function(ex){
                    if(add){
                        this.selectedRole.actions.push(action);
                    }
                    else{
                        this.selectedRole.actions.splice(idx, 1);
                    }
                })
                .catch(function(ex){
                    console.log(ex);
                    toastr.error('Problem changing action list.');
                })

        }
    }
})();
