'use strict';

angular.module('apiModule')
    .service('ApiUrlService',  ApiUrlService);

ApiUrlService.$inject = ['$rootScope', '$location', 'UrlConstants', 'WebsocketManager'];

function ApiUrlService($rootScope, $location, UrlConstants, WebsocketManager) {

    var ApiUrlService = {};

    ApiUrlService.init = initialize;

    var pathRoot = '';

    ApiUrlService.getPathRoot = function() {
        return pathRoot;
    };

    ApiUrlService.admin = {
        getList: function() {
            return pathRoot + '/admin/stakeholder/all/';
        },
        connect: function() {
            return pathRoot + '/admin/stakeholder/connections/all';
        }
    };

    ApiUrlService.app = {
        achievementList: function() {
            return pathRoot + '/achievements/';
        },
        ghostLogin: function() {
            return pathRoot + '/admin/ghost/';
        },
        institutionList: function() {
            return pathRoot + '/institutions/';
        },
        institution: function(institutionId) {
            return pathRoot + '/institutions/' + institutionId;
        },
        institutionDeadlines: function(institutionId) {
            return pathRoot + '/institutions/' + institutionId + '/dates';
        },
        institutionDetails: function(institutionId) {
            return pathRoot + '/institutions/' + institutionId + '/details/';
        },
        institutionFilters: function() {
            return pathRoot + '/meta';
        },
        featuredInstitutionList: function() {
            return pathRoot + '/stakeholder/sponsorship/active/';
        },
        updateTask: function(taskId) {
            return pathRoot + '/task_list/' + taskId;
        },
        createTaskNote: function(taskId) {
            return pathRoot + '/tasks/' + taskId + '/note/';
        },
        getTaskNotes: function(taskId) {
            return pathRoot + '/tasks/' + taskId + '/notes/';
        },
    };

    ApiUrlService.application = {
        groupList: function() {
            return pathRoot + '/group';
        },
        requestCounselorDocuments: function() {
            return pathRoot + '/request_counselor_documents';
        }
    };

    ApiUrlService.peer = {
        completedAchievements: function(id) {
            return pathRoot + '/student/' + id + '/achievements/completed/';
        },
        customTask: function(taskId) {
            return pathRoot + '/tasks/custom/' + (taskId || '');
        },
        institutionTracker: function(id) {
            return pathRoot + '/student/' + id + '/institution_tracker';
        },
        taskList: function(id) {
            return pathRoot + '/student/' + id + '/task_list';
        },
        team: function() {
            return pathRoot + '/team/';
        },
        deadline: function(taskId) {
            return pathRoot + '/tasks/' + taskId + '/deadlines';
        },
        existingDeadline: function(taskId, deadlineId) {
            return pathRoot + '/tasks/' + taskId + '/deadlines/' + deadlineId;
        },
        counselorModified: function() {
            return pathRoot + '/task/deadlines';
        },
        nteTasks: function(name, institutionName) {
            if (!name && ! institutionName) {
                return;
            }
            var query = pathRoot + '/tasks/?';
            if (name) {
                query += 'name=' + name;
            }
            if (institutionName) {
                if (name) {
                    query += '&institution_name=' + institutionName;
                } else {
                    query += 'institution_name=' + institutionName;
                }
            }
            return query;
        }
    };

    ApiUrlService.clever = {
        getAccessToken: function() { return pathRoot + '/clever/login/';},
        //the following endpoints will not be needed once clever is fully integrated
        exchangeCode: function() { return 'https://clever.com/oauth/tokens';}
    };

    ApiUrlService.login = function() {
        return pathRoot + '/stakeholder/login/';
    };

    ApiUrlService.stakeholder = {
        updateAlternateContact: function(id) {
            return pathRoot + '/stakeholder/alternate_contact/' + id + '/';
        },
        preferences: function() {
            return pathRoot + '/stakeholder/notification/preference/';
        },
        alternateContact: function() {
            return pathRoot + '/stakeholder/alternate_contact/';
        },
        attachment: function(attachmentId) {
            return pathRoot + '/stakeholder/attachment/' + attachmentId + '/';
        },
        bulk: function() {
            return pathRoot + '/stakeholder/bulk/';
        },
        completedAchievements: function() {
            return pathRoot + '/achievements/completed';
        },
        updateActScores: function(id) {
            return pathRoot + '/stakeholder/act_scores/' + id + '/';
        },
        updateSatScores: function(id) {
            return pathRoot + '/stakeholder/sat_scores/' + id + '/';
        },
        makeActScores: function() {
            return pathRoot + '/stakeholder/act_scores/';
        },
        makeSatScores: function() {
            return pathRoot + '/stakeholder/sat_scores/';
        },
        confirmRegistration: function(token) {
            return pathRoot + '/stakeholder/confirm/' + token;
        },
        connections: function() {
            return pathRoot  + '/stakeholder/connections/';
        },
        counselorSignIn: function() {
            return pathRoot + '/counselor/login/';
        },
        deleteConnection: function(id) {
            return pathRoot + '/stakeholder/connections/' + id;
        },
        details: function() {
            return pathRoot + '/stakeholder/';
        },
        facebookConfirmation: function() {
            return pathRoot + '/stakeholder/facebook';
        },
        forgotPassword: function() {
            return  pathRoot + '/stakeholder/forgot';
        },
        studentDetail: function() {
            return pathRoot + '/student/';
        },
        getTagsOnASchool: function(stakeholderId, institutionId) {
            return pathRoot + '/stakeholder/' + stakeholderId + '/tag/institution/' + institutionId;
        },
        institutionsByTag: function(tags) {
            var tagsString = tags.join('&');
            return pathRoot + '/institutions/?tag=' + tagsString;
        },
        institutionTags: function(stakeholderId) {
            return pathRoot + '/stakeholder/' + stakeholderId + '/institution/tags/';
        },
        tagInstitution: function(stakeholderId) {
            return pathRoot + '/stakeholder/' + stakeholderId + '/tag/institution/';
        },
        removeTagFromInstitution: function(stakeholderId, tagId, institutionId) {
            return pathRoot + '/stakeholder/' + stakeholderId + '/tag/' + tagId+ '/institution/' + institutionId;
        },
        institutionTracker: function() {
            return pathRoot + '/institution_tracker';
        },
        isAllowed: function(action, resource, id) {
            return pathRoot + '/stakeholder/entitlement/' + action + '/' + resource + '/' + id;
        },
        entitlements: function() {
            return pathRoot + '/stakeholder/entitlement/all/';
        },
        roles: function(id) {
            return pathRoot + '/stakeholder/' + id + '/entitlement/';
        },
        myRecommendations: function(id )  {
            return pathRoot + '/stakeholder/' + id + '/recommendation';
        },
        pendingConnections: function() {
            return pathRoot + '/stakeholder/connections/pending/';
        },
        recommendedSchools: function(id) {
            return pathRoot + '/student/' + id + '/recommendation';
        },
        register: function() {
            return pathRoot + '/stakeholder/register';
        },
        resendConfirmation: function() {
            return pathRoot + '/stakeholder/resend/confirm/';
        },
        resetPassword: function(token) {
            return pathRoot + '/stakeholder/reset/' + token;
        },
        signIn: function() {
            return pathRoot + '/stakeholder/login/';
        },
        singleRecommendedSchool: function(id, recommendationId) {
            return pathRoot + '/student/' + id + '/recommendation/' + recommendationId + '/';
        },
        systemLog: function(district_id) {
            return pathRoot + '/district/' + district_id + '/systemlog/';
        },
        downloadSystemLog: function(districtId, systemLogId) {
            return pathRoot + '/district/' + districtId + '/systemlog/' + systemLogId;
        },
        taskList: function() {
            return pathRoot + '/task_list';
        },
        updateInstitutionTracker: function(id) {
            return pathRoot + '/institution_tracker/' + id;
        },
        updateStakeholder: function() {
            return pathRoot + '/stakeholder/';
        },
        groupsStudentBelongsTo: function(counselorId, studentId) {
            return pathRoot + '/stakeholder/' + counselorId + '/tag/student/' + studentId;
        },
        studentsByGroup: function(groups) {
            var groupsString = groups.join('&');
            return pathRoot + '/students/?tag=' + groupsString;
        },
        studentGroups: function(counselorId) {
            return pathRoot + '/stakeholder/' + counselorId + '/student/tags/';
        },
        groupStudent: function(counselorId) {
            return pathRoot + '/stakeholder/' + counselorId + '/tag/student/';
        },
        removeStudentFromGroup: function(counselorId, groupId, studentId) {
            return pathRoot + '/stakeholder/' + counselorId + '/tag/' + groupId+ '/student/' + studentId;
        },
        metaData: function(studentId) {
            return pathRoot + '/student/' + studentId;
        },
        changePassword: function() {
            return pathRoot + '/stakeholder/password/change/';
        },
        deleteAccount: function() {
            return pathRoot + '/stakeholder/';
        },
        createAnonymous: function() {
            return pathRoot + '/stakeholder/anonymous';
        },
        parchment: function() {
            return pathRoot + '/stakeholder/parchment';
        },
        studentsInGroup: function(groupId) {
            return pathRoot + '/students/?group=' + groupId;
        },
        verifyNumber: function() {
            return pathRoot + '/stakeholder/alternate_contact/verification/';
        },
        files: function(stakeholderId) {
            return pathRoot + '/stakeholder/file_attachments/' + stakeholderId;
        }
    };

    ApiUrlService.invite = {
        details: function(token) {
            return pathRoot + '/stakeholder/invite/' + token;
        },
        create: function() {
            return pathRoot + '/stakeholder/invite/';
        },
        accept: function(token) {
            return pathRoot + '/stakeholder/invite/acceptance/' + token;
        },
        acceptAll: function() {
            return pathRoot + '/stakeholder/invite/acceptall/';
        },
        delete: function(token) {
            return pathRoot + '/stakeholder/invite/delete/' + token;
        }
    };

    ApiUrlService.notification = {
        directPush: function() {
            return pathRoot + '/notification/direct/push/';
        },
        list: function() {
            return pathRoot + '/notification/messages/';
        },
        delete: function(notificationId) {
            return pathRoot + '/notification/messages/' + notificationId;
        },
        update: function(notificationId) {
            return pathRoot + '/notification/messages/' + notificationId;
        },
        preferences: function() {
            return pathRoot + '/stakeholder/notification/preference/';
        },
        sharingAchievement: function() {
            return pathRoot + '/notification/achievement/';
        },
        fullList: function(id) {
            return pathRoot + '/notification/stakeholder/' + id + '/';
        },
        poll: function() {
            return pathRoot + '/notification/messages/count';
        },
        achievements: function() {
            return pathRoot + '/notification/messages/?read=False&category=3';
        },
        deleteCategory: function(categoryId) {
            return pathRoot + '/notification/messages/category/' + categoryId + '/';
        }
    };

    ApiUrlService.district = {
        getDistricts: function() {
            return ApiUrlService.getPathRoot() + '/districts/';
        },
        update: function() {
            return pathRoot + '/district/update/';
        }
    };

    ApiUrlService.legal = {
        terms: function() {
            return pathRoot + '/text/terms/';
        },
        policy: function() {
            return pathRoot + '/text/policy/';
        }
    };

    ApiUrlService.maps = {
        google: function(address) {
            return 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address;
        }
    };

    ApiUrlService.highschools = {
        getList: function(query) {
            return pathRoot + '/highschool/' + query;
        },
        highschool: function(id) {
            return pathRoot + '/highschool/' + id + '/';
        }
    };

    ApiUrlService.institution = {
        byId: function(id) {
            return pathRoot + '/institutions/' + id;
        },
        deadlines: function(id) {
            return pathRoot + '/institutions/' + id + '/dates';
        },
        details: function(id) {
            return pathRoot + '/institutions/' + id + '/details/';
        },
        list: function() {
            return pathRoot + '/institution_tracker/';
        },
        application: function() {
            return pathRoot + '/institution_application/';
        },
        applicationById: function(id) {
            return pathRoot + '/institution_application/' + id;
        },
        applicationPayment: function(pk) {
            return pathRoot + '/institution_application/' + pk + '/pay';
        },
        application_schema: function(schemaId) {
            return pathRoot + '/institution_application_schema/' + schemaId;
        },
        application_schemas: function(params) {
            var output = pathRoot + '/institution_application_schemas?';
            angular.forEach(params, function(val, key) {
                output = output + key + '=' + val + '&';
            });
            output = output.slice(0, -1);
            return output;
        },
        programs: function() {
            return pathRoot + '/program_codes/';
        }
    };

    ApiUrlService.dashboard = {
        feed: function() {
            return pathRoot + '/counselor/feed/';
        },
        feedData: function() {
            return pathRoot + '/counselor/feed/data/';
        }
    };

    ApiUrlService.majors = {
        getList: function(query) {
            return pathRoot + '/majors/' + query;
        },
        major: function(id) {
            return pathRoot + '/majors/' + id + '/';
        }
    };

    ApiUrlService.tasks = {
        testDates: function() {
            return pathRoot + '/tasks/tests/dates/';
        },
        attachment: function(taskId) {
            return  pathRoot + '/task_list/' + taskId + '/attachment/';
        },
        verify: function(taskId) {
            return pathRoot + '/task_list/' + taskId + '/verify/';
        }
    };

    return ApiUrlService;

    function initialize() {
        $rootScope.isProduction = false;
        $rootScope.isDev = false;
        $rootScope.isStaging = false;
        var hostName = $location.host();
        $rootScope.webApp =  hostName + '/apply';
        //Figure out if we are production, staging, or dev from host name
        if (/staging/.test( hostName ) || /stg/.test( hostName )) {
            $rootScope.environment = 'staging';
            $rootScope.isStaging = true;
        } else if (/local/.test( hostName ) || (/^192/.test( hostName ))) {
            //Browser won't accept a domain that is just one word
            $rootScope.environment = 'development';
            $rootScope.isDev = true;
        } else if (/demo/.test( hostName )) {
            $rootScope.environment = 'demo';
            $rootScope.isProduction = true;
        } else if (/nexttier/.test( hostName )) {
            $rootScope.environment = 'production';
            $rootScope.isProduction = true;
        } else {
            var periodIdx = $location.host().indexOf('.');
            $rootScope.webApp = hostName.substring(periodIdx, hostName.length);
            $rootScope.environment = 'staging';
            $rootScope.isStaging = true;
        }
        //Set location to find common images
        $rootScope.ENV_ROOT = UrlConstants.environmentRoot;

        function getPathRoot() {
            if ($rootScope.environment === 'development') {
                pathRoot = UrlConstants.stagingApi;
            } else if ($rootScope.environment === 'production') {
                pathRoot = UrlConstants.prodApi;
            } else if ($rootScope.environment === 'staging') {
                pathRoot = UrlConstants.stagingApi;
            } else if ($rootScope.environment === 'demo') {
                pathRoot = UrlConstants.demoApi;
            } else {
                pathRoot = UrlConstants.stagingApi;
            }
            return pathRoot;
        }

        pathRoot = getPathRoot();
        WebsocketManager.createNewConnection(pathRoot);
    }
}
