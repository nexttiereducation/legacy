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
    $scope.roles = [];
    $scope.rolesNext = null;
    $scope.actions = [];
    $scope.actionsNext = null;
    $scope.roleItems = [];
    $scope.actionsDiv = true;
    $scope.actionChoices = [];

    ApiService.$get(ApiUrlService.dropDowns.options())
        .success(
        // In the event an 'event name' isn't used, update it here
        function (response) {
            $scope.actionChoices = response.action;
        });

    $scope.getRoleItems = function () {
        ApiService.$get(ApiUrlService.entitlements.getRoleList())
            .success(function (response) {
                $scope.roles = response.results;
                $scope.rolesNext = response.next;
                angular.forEach($scope.roles, function (role) {
                    role.groupedActions = _.groupBy(role.actions, 'name');
                    role.groups = _.keys(role.groupedActions);
                });
                if ($scope.rolesNext) {
                    $scope.getMoreRoleItems();
                }
            })
            .error(function (response) {
                toastr.error(response, 'Error');

            });

    };

    $scope.getMoreRoleItems = function () {
        if (!$scope.rolesNext) {
            return;
        }
        ApiService.$get($scope.rolesNext)
            .success(function (response) {
                Array
                    .prototype
                    .push
                    .apply($scope.roles, response.results);

                $scope.rolesNext = response.next;
                angular.forEach($scope.roles, function (role) {
                    role.groupedActions = _.groupBy(role.actions, 'name');
                    role.groups = _.keys(role.groupedActions);
                });
                if ($scope.rolesNext) {
                    $scope.getMoreRoleItems();
                }
            })
            .error(function (response) {
                toastr.error(response, 'Error');
            });
    }

    $scope.getActionItems = function () {
        ApiService.$get(ApiUrlService.entitlements.getActionList())
            .success(function (response) {
                $scope.actions = response.results;
                $scope.actionsNext = response.next;
                $scope.getMoreActionItems();
            })
            .error(function (response) {
                toastr.error(response, 'Error');
            });

    };

    $scope.getMoreActionItems = function () {
        if (!$scope.actionsNext) {
            return;
        }
        ApiService.$get($scope.actionsNext)
            .success(function (response) {
                Array
                    .prototype
                    .push
                    .apply($scope.actions, response.results);
                $scope.actionsNext = response.next;
                $scope.getMoreActionItems();
            })
            .error(function (response) {
                toastr.error(response, 'Error');

            });
    }

    $scope.openNewRoleForm = function () {
        var template = 'scripts/project/Entitlements_feature/entitlementsRoleEdit-form.html';
        $scope.role = {};
        ngDialog.openConfirm({
              template: template,
              className: 'ngdialog-theme-default item-form',
              scope: $scope,
              closeByEscape: true,
              closeByDocument: true
            })
            .then(function () { // save and close
                ApiService.$post(ApiUrlService.entitlements.createRole(), {name: $scope.role.name})
                    .success(function (response) {
                        toastr.info('New Item Created.');
                        $scope.reloadRoleList();
                    })
                    .error(function (response) {
                        toastr.error(response, 'Error');
                    });
            });

    };

    $scope.openEditForm = function (index) {
        var template = 'scripts/project/Entitlements_feature/entitlementsRoleEdit-form.html';
        $scope.role = $scope.roles[index];
        ngDialog.openConfirm({
              template: template,
              className: 'ngdialog-theme-default item-form',
              scope: $scope,
              closeByEscape: true,
              closeByDocument: true
            })
            .then(function () { // save and close
                $scope.updateRole($scope.role);
            });
    };

    $scope.updateRole = function (role) {
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
                $scope.reloadRoleList();
            })
            .error(function () {
                toastr.error('There was an Error with updating the Role', 'Error');
            });

    };

    $scope.openDeleteForm = function (role) {
        $scope.role = role;
        var template = 'scripts/project/Entitlements_feature/entitlementsDelete-form.html';
        ngDialog.openConfirm({
          template: template,
          className: 'ngdialog-theme-default item-form',
          scope: $scope,
          closeByEscape: true,
          closeByDocument: true
        });
    };

    $scope.openDeleteActionForm = function (action) {
        $scope.action = action;
        var template = 'scripts/project/Entitlements_feature/entitlementsDeleteActions-form.html';
        ngDialog.openConfirm({
          template: template,
          className: 'ngdialog-theme-default item-form',
          scope: $scope,
          closeByEscape: true,
          closeByDocument: true
        });
    };

    $scope.deleteAction = function () {
        ApiService.$delete(ApiUrlService.entitlements.actionDetail($scope.action.id))
            .success(function () {
                $scope.reloadActionList();
            })
            .error(function () {
                toastr.error('Failed to remove a Action', 'Error');
            });
        toastr.info('Item Deleted.');
    };

    $scope.deleteRole = function () {
        ApiService.$delete(ApiUrlService.entitlements.roleDetail($scope.role.id))
            .success(function () {
                $scope.reloadRoleList();
            })
            .error(function () {
                toastr.error('Failed to remove a Role', 'Error');
            });
        toastr.info('Item Deleted.');
    };

    $scope.openEntitleForm = function (index, role) {
        var template = 'scripts/project/Entitlements_feature/change-entitlementsForm.html';
        $scope.prepRoleActions(role.id);
        ngDialog
            .openConfirm({
              template: template,
              className: 'ngdialog-theme-default item-form',
              scope: $scope,
              closeByEscape: true,
              closeByDocument: true
            })
            .then(function () { // save and close
                $scope.reloadRoleList();
            })
    };

    $scope.prepRoleActions = function (id) {
        ApiService.$get(ApiUrlService.entitlements.roleDetail(id))
            .success(function (response) {
                $scope.role = response;
                $scope.createDisplayActions();
            })
            .error(function (response) {
                toastr.error(response, 'Error');
                //$scope.item.isNew = true;
            });
    };

    $scope.createDisplayActions = function () {
        $scope.displayActions = [];
        for (var i = 0; i < $scope.actions.length; i++) {
            var isEntitled = false;
            var action = $scope.actions[i];
            for (var j = 0; j < $scope.role.actions.length; j++) {
                isEntitled = action.id === $scope
                    .role
                    .actions[j]
                    .id;
                if (isEntitled) {
                    break;
                }
            }
            $scope.displayActions.push({
                name: action.name,
                id: action.id,
                resource: action.resource,
                isEntitled: isEntitled
            });
        }

    };

    $scope.changeActionState = function (action, index) {

        $scope.displayActions[index].isEntitled = !$scope.displayActions[index].isEntitled;

        if (checkIsEntitled(action)) {
            ApiService.$delete(ApiUrlService.entitlements.editRelationship(), {
                    'role_id': $scope.role.id,
                    'action_id': action.id
                })
                .success(function (response) {
                    toastr.info('Item Deleted.');
                    $scope.prepRoleActions($scope.role.id);
                })
                .error(function (response) {
                    toastr.error(response, 'Error');
                });
        } else {
            ApiService.$post(ApiUrlService.entitlements.editRelationship(), {
                    'role_id': $scope.role.id,
                    'action_id': action.id
                })
                .success(function (response) {
                    toastr.info('Item Updated.');
                    $scope.prepRoleActions($scope.role.id);
                })
                .error(function (response) {
                    toastr.error(response, 'Error');
                });
        }
    };

    function checkIsEntitled(action) {
        for (var j = 0; j < $scope.role.actions.length; j++) {
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

    $scope.openNewActionForm = function () {
        var template = 'scripts/project/Entitlements_feature/entitlementsAction-addForm.html';
        $scope.action = {};
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
                if (!($scope.action.resource == undefined)) {
                    res = $scope.action.resource.trim();
                }
                ApiService.$post(ApiUrlService.entitlements.createAction(), {
                        name: $scope.action.name,
                        resource: res
                    })
                    .success(function (response) {
                        $scope.reloadActionList();
                        toastr.info('New Item Created.');
                    })
                    .error(function (response) {
                        toastr.error(response, 'Error');
                    });
            });
    };

    $scope.openEditActionForm = function (action) {
        var template = 'scripts/project/Entitlements_feature/entitlements-EditActionForm.html';
        $scope.action = action;
        ngDialog
            .openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            })
            .then(function () { // save and close
                $scope.updateAction(action);

            })

    };

    $scope.updateAction = function (action) {

        ApiService.$patch(ApiUrlService.entitlements.actionDetail(action.id), {
                'id': action.id,
                'enterprise': action.enterprise,
                'name': action.name,
                'resource': action.resource
            })
            .success(function () {
                toastr.info('Item Updated.');
                $scope.reloadActionList();
            })
            .error(function () {
                toastr.error('There was an Error with updating the Action', 'Error');
            });

    };

    $scope.openActionForm = function () {
        $scope.actionsDiv = !$scope.actionsDiv;
    };

    $scope.viewRoles = function () {
        $scope.reloadRoleList();
        $scope.actionsDiv = true;
    };

    $scope.viewActions = function () {
        $scope.reloadActionList();
        $scope.actionsDiv = false;
    };

    $scope.reloadRoleList = function () {
        $scope.getRoleItems();
    };

    $scope.reloadActionList = function () {
        $scope.getActionItems();
    };

    var init = function () {
        $scope.getRoleItems();
        $scope.getActionItems();
    };

    init();
}
