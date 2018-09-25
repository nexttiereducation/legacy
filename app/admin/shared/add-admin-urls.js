angular
    .module('adminModule')
    .run(AddUrls);

AddAdminUrls.$inject = ['ApiUrlService'];

function AddAdminUrls(ApiUrlService) {
    ApiUrlService.init();

    ApiUrlService.peer = {
        taskList: function(id) {
            return ApiUrlService.getPathRoot() + '/student/' + id + '/task_list';
        }
    };

    ApiUrlService.stakeholders = {
        resetPassword: function() {
            return ApiUrlService.getPathRoot() + '/stakeholder/forgot/';
        },
        getList: function() {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/all/';
        },
        getItem: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/' + id + '/';
        },
        details: function(id) {
            return ApiUrlService.getPathRoot() + '/student/' + id;
        },
        delete: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/' + id + '/';
        },
        update: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/' + id + '/';
        },
        create: function() {
            return ApiUrlService.getPathRoot() + '/stakeholder/register/';
        },
        getConnections: function(email) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/connections/all/';
        },
        createConnection: function(email) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/connections/all/';
        },
        deleteConnection: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/connections/' + id + '/';
        },
        getPreferences: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/' + id + '/preferences/';
        },
        updatePreferences: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/' + id + '/preferences/';
        },
        checkStakeHolderEntitlement: function(action_name, user_id, resource) {
            return ApiUrlService.getPathRoot() + '/stakeholder/entitlement/' + action_name + '/' + resource + '/' + user_id + '/';
        },
        roles: function(id) {
            return ApiUrlService.getPathRoot() + '/stakeholder/' + id + '/entitlement/';
        },
        addRole: function() {
            return ApiUrlService.getPathRoot() + '/stakeholder/entitlement/';
        },
        removeRole: function(stakeHolId, roleId) {
            return ApiUrlService.getPathRoot() + '/stakeholder/' + stakeHolId + '/entitlement/' + roleId + '/';
        },
        getPhaseDates: function() {
            return ApiUrlService.getPathRoot() + '/admin/dates';
        },
        updatePhaseDates: function() {
            return ApiUrlService.getPathRoot() + '/admin/dates/update/';
        },
        getActiveSponsorships: function() {
            return ApiUrlService.getPathRoot() + '/stakeholder/sponsorship/active/';
        },
        exportAmbassadorList: function() {
            return ApiUrlService.getPathRoot() + '/admin/ambassador/csv/';
        },
        exportAmbassadorReferences: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/stakeholder/' + id + '/ambassador_refs/csv/';
        },
        invite: function() {
            return ApiUrlService.getPathRoot() + '/stakeholder/invite/';
        },
    };

    ApiUrlService.dropDowns = {
        options: function() {
            return ApiUrlService.getPathRoot() + '/admin/options/';
        },
        phases: function() {
            return ApiUrlService.getPathRoot() + '/admin/phase/all';
        },
        categories: function() {
            return ApiUrlService.getPathRoot() + '/admin/category/all';
        },
    };

    ApiUrlService.achievements = {
        getList: function() {
            return ApiUrlService.getPathRoot() + '/achievements/';
        },
        getItem: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/achievement/' + id + '/';
        },
        update: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/achievement/' + id + '/';
        },
        create: function() {
            return ApiUrlService.getPathRoot() + '/achievements/';
        }
    };

    ApiUrlService.sponsoredSchools = {
        create: function() {
            return ApiUrlService.getPathRoot() + '/admin/sponsorship/';
        },
        getList: function() {
            return ApiUrlService.getPathRoot() + '/admin/sponsorship/';
        },
        getSponsor: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/sponsorship/' + id + '/';
        },
        update: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/sponsorship/' + id + '/';
        },
        deleteSponsor: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/sponsorship/' + id + '/';
        }
    };

    ApiUrlService.institutions = {
        getList: function() {
            return ApiUrlService.getPathRoot() + '/admin/institutions/all/';
        },
        create: function() {
            return ApiUrlService.getPathRoot() + '/institutions/';
        },
        getFilters: function() {
            return ApiUrlService.getPathRoot() + '/meta/';
        },
        getItem: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/';
        },
        getDeprecatedApplicationDates: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/application/';
        },
        updateDeprecatedApplicationDates: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/application/';
        },
        getApplicationDates: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/dates/';
        },
        updateApplicationDates: function(id, dateId) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/dates/' + dateId;
        },
        createApplicationDates: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/dates/';
        },
        bulkCreateApplicationDates: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/dates/bulk';
        },
        getDetails: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/details/';
        },
        updateDetails: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/details/';
        },
        getPrograms: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/programs/';
        },
        updatePrograms: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/programs/' + id + '/';
        },
        addProgram: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/programs/';
        },
        update: function(id) {
            return ApiUrlService.getPathRoot() + '/institutions/' + id + '/';
        },
        updateRollingDate: function() {
            return ApiUrlService.getPathRoot() + '/admin/update/rolling/';
        },
        uploadCSV: function() {
            return ApiUrlService.getPathRoot() + '/admin/institutions/upload/';
        }
    };

    ApiUrlService.tasks = {
        getList: function() {
            return ApiUrlService.getPathRoot() + '/tasks/';
        },
        create: function() {
            return ApiUrlService.getPathRoot() + '/tasks/';
        },
        getItem: function(id) {
            return ApiUrlService.getPathRoot() + '/tasks/' + id + '/';
        },
        update: function(id) {
            return ApiUrlService.getPathRoot() + '/tasks/' + id + '/';
        },
        getDeadlines: function(id) {
            return ApiUrlService.getPathRoot() + '/tasks/' + id + '/deadlines';
        },
        createDeadlines: function(id) {
            return ApiUrlService.getPathRoot() + '/tasks/' + id + '/deadlines';
        },
        updateDeadlines: function(id, deadlineId) {
            return ApiUrlService.getPathRoot() + '/tasks/' + id + '/deadlines/' + deadlineId;
        },
        createCustom: function() {
            return ApiUrlService.getPathRoot() + '/tasks/custom/';
        },
        conditionalTasks: function() {
            return ApiUrlService.getPathRoot() + '/conditional/tasks/'
        },
        conditionalTask: function(id) {
            return ApiUrlService.getPathRoot() + '/conditional/task/' + id
        }
    };

    ApiUrlService.groups = {
        getList: function() {
            return ApiUrlService.getPathRoot() + '/group';
        },
        add: function(id) {
            return ApiUrlService.getPathRoot() + '/group/' + id + '/add';
        },
        remove: function(id) {
            return ApiUrlService.getPathRoot() + '/group/' + id + '/remove';
        }
    };

    ApiUrlService.policy = {
        create: function() {
            return ApiUrlService.getPathRoot() + '/text/';
        },
        getToU: function() {
            return ApiUrlService.getPathRoot() + '/text/terms/';
        },
        getPP: function() {
            return ApiUrlService.getPathRoot() + '/text/policy/';
        },
        updateText: function(id) {
            return ApiUrlService.getPathRoot() + '/text/' + id + '/';
        }
    };

    ApiUrlService.entitlements = {
        createRole: function() {
            return ApiUrlService.getPathRoot() + '/admin/role/create/';
        },
        roleDetail: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/role/' + id + '/';
        },
        getRoleList: function() {
            return ApiUrlService.getPathRoot() + '/admin/role/';
        },
        createAction: function() {
            return ApiUrlService.getPathRoot() + '/admin/action/create/';
        },
        actionDetail: function(id) {
            return ApiUrlService.getPathRoot() + '/admin/action/' + id + '/';
        },
        getActionList: function() {
            return ApiUrlService.getPathRoot() + '/admin/action/';
        },
        editRelationship: function() {
            return ApiUrlService.getPathRoot() + '/admin/role/action/';
        }
    };

    ApiUrlService.highschool = {
        create: function() {
            return ApiUrlService.getPathRoot() + '/highschool/';
        },
        getItem: function(id) {
            return ApiUrlService.getPathRoot() + '/highschool/' + id + '/';
        },
        update: function(id) {
            return ApiUrlService.getPathRoot() + '/highschool/' + id + '/';
        },
        bulkUpload: function() {
            return ApiUrlService.getPathRoot() + '/highschool/upload';
        }
    };
}
