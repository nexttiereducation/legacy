(function() {
    'use strict';

    angular
        .module('adminModule')
        .controller('EntitlementsCtrl', EntitlementsCtrl);

    EntitlementsCtrl.$inject = [
        '$scope',
        '$rootScope',
        'AdminDialog',
        'ApiUrlService',
        'ApiService',
        'infiniteScroll',
        'ngDialog',
        'QueryBuilder'
    ];

    function EntitlementsCtrl($filter, $q, $rootScope, $scope,
        AdminDialog, ApiUrlService, ApiService, EditableList, infiniteScroll, ngDialog, QueryBuilder) {
        this.roles = [];
        this.rolesNext = null;
        this.actions = [];
        this.actionsNext = null;
        this.roleItems = [];
        this.actionsDiv = true;
        this.actionChoices = [];

        ApiService.$get(ApiUrlService.dropDowns.options())
            .success(
            // In the event an 'event name' isn't used, update it here
                function (response) {
                    this.actionChoices = response.action;
                });

        function getRoleItems() {
            ApiService.$get(ApiUrlService.entitlements.getRoleList())
                .success(function (response) {
                    this.roles = response.results;
                    this.rolesNext = response.next;
                    angular.forEach(this.roles, function (role) {
                        role.groupedActions = _.groupBy(role.actions, 'name');
                        role.groups = _.keys(role.groupedActions);
                    });
                    if (this.rolesNext) {
                        this.getMoreRoleItems();
                    }
                })
                .error(function (response) {
                    toastr.error(response, 'Error');

                });

        }

        function getMoreRoleItems() {
            if (!this.rolesNext) {
                return;
            }
            ApiService.$get(this.rolesNext)
                .success(function (response) {
                    Array
                        .prototype
                        .push
                        .apply(this.roles, response.results);

                    this.rolesNext = response.next;
                    angular.forEach(this.roles, function (role) {
                        role.groupedActions = _.groupBy(role.actions, 'name');
                        role.groups = _.keys(role.groupedActions);
                    });
                    if (this.rolesNext) {
                        this.getMoreRoleItems();
                    }
                })
                .error(function (response) {
                    toastr.error(response, 'Error');
                });
        }

        function getActionItems() {
            ApiService.$get(ApiUrlService.entitlements.getActionList())
                .success(function (response) {
                    this.actions = response.results;
                    this.actionsNext = response.next;
                    this.getMoreActionItems();
                })
                .error(function (response) {
                    toastr.error(response, 'Error');
                });

        }

        function getMoreActionItems() {
            if (!this.actionsNext) {
                return;
            }
            ApiService.$get(this.actionsNext)
                .success(function (response) {
                    Array
                        .prototype
                        .push
                        .apply(this.actions, response.results);
                    this.actionsNext = response.next;
                    this.getMoreActionItems();
                })
                .error(function (response) {
                    toastr.error(response, 'Error');

                });
        }

        function openNewRoleForm() {
            var template = 'scripts/project/Entitlements_feature/entitlementsRoleEdit-form.html';
            this.role = {};
            ngDialog.openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            })
                .then(function () { // save and close
                    ApiService.$post(ApiUrlService.entitlements.createRole(), {name: this.role.name})
                        .success(function (response) {
                            toastr.info('New Item Created.');
                            this.reloadRoleList();
                        })
                        .error(function (response) {
                            toastr.error(response, 'Error');
                        });
                });

        }

        function openEditForm(index) {
            var template = 'scripts/project/Entitlements_feature/entitlementsRoleEdit-form.html';
            this.role = this.roles[index];
            ngDialog.openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            })
                .then(function () { // save and close
                    this.updateRole(this.role);
                });
        }

        function updateRole(role) {
            var action_set = [];
            if (!role.action_set == []) {
                action_set = role.action_set;
            }
            ApiService.$patch(ApiUrlService.entitlements.roleDetail(role.id), {
                'id': role.id,
                'name': role.name,
                'enterprise': role.enterprise,
                'description': role.description,
                'action_set': action_set
            })
                .success(function () {
                    toastr.info('Item Updated.');
                    this.reloadRoleList();
                })
                .error(function () {
                    toastr.error('There was an Error with updating the Role', 'Error');
                });

        }

        function openDeleteForm(role) {
            this.role = role;
            var template = 'scripts/project/Entitlements_feature/entitlementsDelete-form.html';
            ngDialog.openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            });
        }

        function openDeleteActionForm(action) {
            this.action = action;
            var template = 'scripts/project/Entitlements_feature/entitlementsDeleteActions-form.html';
            ngDialog.openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            });
        }

        function deleteAction() {
            ApiService.$delete(ApiUrlService.entitlements.actionDetail(this.action.id))
                .success(function () {
                    this.reloadActionList();
                })
                .error(function () {
                    toastr.error('Failed to remove a Action', 'Error');
                });
            toastr.info('Item Deleted.');
        }

        function deleteRole() {
            ApiService.$delete(ApiUrlService.entitlements.roleDetail(this.role.id))
                .success(function () {
                    this.reloadRoleList();
                })
                .error(function () {
                    toastr.error('Failed to remove a Role', 'Error');
                });
            toastr.info('Item Deleted.');
        }

        function openEntitleForm(index, role) {
            var template = 'scripts/project/Entitlements_feature/change-entitlementsForm.html';
            this.prepRoleActions(role.id);
            ngDialog
                .openConfirm({
                    template: template,
                    className: 'ngdialog-theme-default item-form',
                    scope: $scope,
                    closeByEscape: true,
                    closeByDocument: true
                })
                .then(function () { // save and close
                    this.reloadRoleList();
                });
        }

        function prepRoleActions(id) {
            ApiService.$get(ApiUrlService.entitlements.roleDetail(id))
                .success(function (response) {
                    this.role = response;
                    this.createDisplayActions();
                })
                .error(function (response) {
                    toastr.error(response, 'Error');
                    //this.item.isNew = true;
                });
        }

        function createDisplayActions() {
            this.displayActions = [];
            for (var i = 0; i < this.actions.length; i++) {
                var isEntitled = false;
                var action = this.actions[i];
                for (var j = 0; j < this.role.actions.length; j++) {
                    isEntitled = action.id === $scope
                        .role
                        .actions[j]
                        .id;
                    if (isEntitled) {
                        break;
                    }
                }
                this.displayActions.push({
                    name: action.name,
                    id: action.id,
                    resource: action.resource,
                    isEntitled: isEntitled
                });
            }

        }

        function changeActionState(action, index) {

            this.displayActions[index].isEntitled = !this.displayActions[index].isEntitled;

            if (checkIsEntitled(action)) {
                ApiService.$delete(ApiUrlService.entitlements.editRelationship(), {
                    'role_id': this.role.id,
                    'action_id': action.id
                })
                    .success(function (response) {
                        toastr.info('Item Deleted.');
                        this.prepRoleActions(this.role.id);
                    })
                    .error(function (response) {
                        toastr.error(response, 'Error');
                    });
            } else {
                ApiService.$post(ApiUrlService.entitlements.editRelationship(), {
                    'role_id': this.role.id,
                    'action_id': action.id
                })
                    .success(function (response) {
                        toastr.info('Item Updated.');
                        this.prepRoleActions(this.role.id);
                    })
                    .error(function (response) {
                        toastr.error(response, 'Error');
                    });
            }
        }

        function checkIsEntitled(action) {
            for (var j = 0; j < this.role.actions.length; j++) {
                var isEntitled = action.id === $scope
                    .role
                    .actions[j]
                    .id;
                if (isEntitled) {
                    break;
                }
            }
            return isEntitled;
        }

        function openNewActionForm() {
            var template = 'scripts/project/Entitlements_feature/entitlementsAction-addForm.html';
            this.action = {};
            ngDialog
                .openConfirm({
                    template: template,
                    className: 'ngdialog-theme-default item-form',
                    scope: $scope,
                    closeByEscape: true,
                    closeByDocument: true
                })
                .then(function () { // save and close
                    var res = '';
                    if (!(this.action.resource == undefined)) {
                        res = this.action.resource.trim();
                    }
                    ApiService.$post(ApiUrlService.entitlements.createAction(), {
                        name: this.action.name,
                        resource: res
                    })
                        .success(function (response) {
                            this.reloadActionList();
                            toastr.info('New Item Created.');
                        })
                        .error(function (response) {
                            toastr.error(response, 'Error');
                        });
                });
        }

        function openEditActionForm(action) {
            var template = 'scripts/project/Entitlements_feature/entitlements-EditActionForm.html';
            this.action = action;
            ngDialog
                .openConfirm({
                    template: template,
                    className: 'ngdialog-theme-default item-form',
                    scope: $scope,
                    closeByEscape: true,
                    closeByDocument: true
                })
                .then(function () { // save and close
                    this.updateAction(action);

                });

        }

        function updateAction(action) {

            ApiService.$patch(ApiUrlService.entitlements.actionDetail(action.id), {
                'id': action.id,
                'enterprise': action.enterprise,
                'name': action.name,
                'resource': action.resource
            })
                .success(function () {
                    toastr.info('Item Updated.');
                    this.reloadActionList();
                })
                .error(function () {
                    toastr.error('There was an Error with updating the Action', 'Error');
                });

        }

        function openActionForm() {
            this.actionsDiv = !this.actionsDiv;
        }

        function viewRoles() {
            this.reloadRoleList();
            this.actionsDiv = true;
        }

        function viewActions() {
            this.reloadActionList();
            this.actionsDiv = false;
        }

        function reloadRoleList() {
            this.getRoleItems();
        }

        function reloadActionList() {
            this.getActionItems();
        }

        var init = function () {
            this.getRoleItems();
            this.getActionItems();
        };

        init();
    }
})();
