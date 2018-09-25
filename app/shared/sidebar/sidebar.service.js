(function() {
    'use strict';

    angular
        .module('sidebarModule')
        .factory('SidebarService', SidebarService);

    SidebarService.$inject = ['StakeholderAuthService'];

    function SidebarService(StakeholderAuthService) {

        var STUDENT_DASHBOARD = {
            route: '/student-dashboard/',
            isLocalRoute: false,
            title: 'Dashboard',
            icon: 'icon-dashboard',
            hasCustomIcon: true,
            order: 1
        }

        var STUDENT_TASKS = {
            route: '/studentTasks/',
            isLocalRoute: false,
            title: 'Tasks',
            icon: 'content_paste',
            order: 2
        }

        var COLLEGES = {
            route: '/colleges/',
            isLocalRoute: false,
            title: 'Colleges',
            icon: 'account_balance',
            order: 4
        }

        var SCHOLARSHIPS = {
            route: '/scholarships/',
            isLocalRoute: false,
            title: 'Scholarships',
            icon: 'attach_money',
            order: 5
        };

        var CAREERS = {
            route: '/careers/',
            isLocalRoute: false,
            title: 'Careers',
            icon: 'work',
            order: 6
        }

        var APPLICATIONS = {
            route: '/applications/',
            isLocalRoute: false,
            title: 'Applications',
            icon: 'school',
            order: 7
        }

        var APPLICATION_MANAGER = {
            route: '/application-manager/',
            isLocalRoute: false,
            title: 'Application Manager',
            icon: 'school',
            order: 7
        }

        var COUNSELOR_DASHBOARD = {
            route: '/dashboard/',
            isLocalRoute: false,
            title: 'Home',
            icon: 'icon-counselor_dashboard',
            hasCustomIcon: true,
            order: 1
        }

        var STUDENTS = {
            route: '/students/',
            isLocalRoute: false,
            title: 'Students',
            icon: 'person',
            order: 2
        }

        var COUNSELOR_TASKS = {
            route: '/counselor-tasks/',
            isLocalRoute: false,
            title: 'Tasks',
            icon: 'assignment_turned_in',
            order: 3
        }

        var COMMUNITY = {
            route: '/counselor-community/',
            isLocalRoute: true,
            title: 'Community',
            icon: 'public',
            order: 8
        }

        var DISTRICT = {
            route: '/district/',
            isLocalRoute: true,
            title: 'District',
            icon: 'location_city',
            order: 9
        }

        return {getFeatures: getFeatures};

        function getFeatures() {
            if (StakeholderAuthService.isStudent()) {
                return _.sortBy(getStudentFeatures(), function (permission) {
                    return permission.order;
                });
            }

            if (StakeholderAuthService.isParent()) {
                return _.sortBy(getParentFeatures(), function (permission) {
                    return permission.order;
                });
            }

            if (StakeholderAuthService.isCounselor()) {
                return _.sortBy(getCounselorFeatures(), function (permission) {
                    return permission.order;
                });
            }
        }

        function getStudentFeatures() {
            var features = [STUDENT_DASHBOARD, STUDENT_TASKS, COLLEGES, SCHOLARSHIPS];

            var entitlements = determineFeatures();
            for (var i = 0, feature; feature = entitlements[i]; ++i) {
                features.push(feature);
            }

            return features;
        }

        function getParentFeatures() {
            var features = [STUDENT_DASHBOARD, STUDENT_TASKS, COLLEGES, SCHOLARSHIPS];

            var entitlements = determineFeatures();
            for (var i = 0, feature; feature = entitlements[i]; ++i) {
                features.push(feature);
            }

            return features;
        }

        function getCounselorFeatures() {
            var features = [
                COUNSELOR_DASHBOARD,
                STUDENTS,
                COLLEGES,
                SCHOLARSHIPS,
                COUNSELOR_TASKS,
                COMMUNITY
            ]

            var entitlements = determineFeatures();
            for (var i = 0, feature; feature = entitlements[i]; ++i) {
                features.push(feature);
            }

            return features;
        }

        function determineFeatures() {
            var features = new Array();

            if (StakeholderAuthService.isStudent() && StakeholderAuthService.isSenior()) {
                features.push(APPLICATIONS);
            }
            if (StakeholderAuthService.isAllowed('feature', 'careers')) {
                features.push(CAREERS);
            }

            if (StakeholderAuthService.isCounselor && StakeholderAuthService.isAllowed('feature', 'application-manager')) {
                features.push(APPLICATION_MANAGER);
            }

            if (StakeholderAuthService.isParent() && JSON.parse(sessionStorage.getItem('ls.parentViewApps'))) {
                features.push(APPLICATIONS);
            }

            if (StakeholderAuthService.isAllowed('view all', 'district') || StakeholderAuthService.isAdmin()) {
                features.push(DISTRICT)
            }

            return features;
        }

    }
})();
