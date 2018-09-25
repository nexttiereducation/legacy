(function() {
    'use strict';

    angular
        .module('navbarModule')
        .controller('NavbarCtrl', NavbarCtrl);

    NavbarCtrl.$inject = [
        '$scope', '$rootScope', '$mdMedia', '$window', '$location', '$timeout',
        '$q', '$filter', 'StakeholderAuthService', 'InstitutionTracker', 'localStorageService'
    ];

    function NavbarCtrl($scope, $rootScope, $mdMedia, $window, $location, $timeout,
                    $q, $filter, StakeholderAuthService, InstitutionTracker, localStorageService) {
        var vm = this;
        $rootScope.$mdMedia = $mdMedia;
        this.openMenu = openMenu;
        this.goToLocation = goToLocation;
        this.configureTabs = configureTabs;
        this.switchTabs = switchTabs;
        this.toggleMessaging = toggleMessaging;
        this.nteApplicationGroup = {};

        function activate(forceUpdate) {
            var promises = [
                getTrackedSchools(),
                getApplicationGroups()
            ];
            return $q.all(promises).then(function() {
                StakeholderAuthService.updateStakeholder().then(function(response) {
                    setupStakeholder(response, forceUpdate);
                })
            });
        }
        activate();
        setupListeners();

        function getTrackedSchools() {
            InstitutionTracker.updateSchoolList();
        }
        /* ======================= STAKEHOLDER ======================= */
        function setupStakeholder(user, forceUpdate) {
            this.stakeholder = user;
            setupPermissions();
            setupApplications();
            setupTabs(forceUpdate);
        }

        function setupPermissions() {
            this.currentPath = getCurrentLocation();
            if (localStorageService.get('photoUrl')) {
                var photoObject = localStorageService.get('photoUrl');
                this.stakeholder.photoUrl = photoObject.photoUrl;
            }
            this.loggedIn = this.stakeholder.loggedIn;
            this.showDistrict = this.loggedIn
                              && (StakeholderAuthService.isAllowed('view all', 'district')
                              || StakeholderAuthService.isAdmin());
            this.isAdmin = StakeholderAuthService.isAdmin();
            this.isAnon = StakeholderAuthService.isAnonymous();
            this.isCounselor = StakeholderAuthService.isCounselor();
            this.isParent = StakeholderAuthService.isParent();
            this.isStudent = this.stakeholder.isStudent;
            this.showProfile = this.loggedIn && !StakeholderAuthService.isAnonymous();
            this.showNotifications = this.loggedIn && !this.isAdmin && !this.isCounselor && !this.isParent;
        }
        /* ======================= APPLICATIONS ======================= */
        function getApplicationGroups() {
            InstitutionTracker.getApplicationGroups().then(function(response) {
                var groupList = response.results;
                this.nteApplicationGroup = _.find(groupList, { name: 'NextTier Application' });
                $rootScope.nteApplicationGroup = _.find(groupList, { name: 'NextTier Application' });
                $rootScope.$broadcast('nteApplicationGroup', $rootScope.nteApplicationGroup);
            });
        }

        function setupApplications() {
            var hasNextTierApplication = checkNextTierApplications();
            if (hasNextTierApplication !== this.hasNextTierApplication) {
                this.hasNextTierApplication = hasNextTierApplication;
                var configObj = getConfig();
                $timeout(configureTabs(configObj), 0);
            }
        }

        function checkNextTierApplications() {
            var hasNextTierApplication = 0;
            _.forEach(this.stakeholder.institution_trackers, function(institution) {
                if (institution.application_group
                    && (institution.application_group.id === this.nteApplicationGroup.id)) {
                    hasNextTierApplication++;
                }
            })
            return hasNextTierApplication > 0;
        }
        /* ======================= TABS ======================= */
        function setupTabs(forceUpdate) {
            this.currentPath = getCurrentLocation();
            this.noNavbarHighlights = (this.currentPath === '/profile/') || (this.currentPath === '/apply/achievements');
            switch (this.currentPath) {
                case '/profile/':
                    this.placeholder = 'Profile';
                    break;
                case '/apply/achievements':
                    this.placeholder = 'Achievements';
                    break;
                case '/scholarships/':
                    this.placeholder = 'Scholarships';
                    break;
                default:
                    if (this.currentPath.indexOf('/applications/') > -1) {
                        this.placeholder = 'Applications';
                    } else {
                        this.placeholder = '';
                    }
                    break;
            };
            if (!forceUpdate) {
                var storedTabs = localStorageService.get('tabs');
                this.selectedTabIndex = -1;
            }
            if (storedTabs && storedTabs.length > 0) {
                angular.forEach(storedTabs, function(tab) {
                    tab = checkIfTabIsActive(tab, storedTabs);
                });
                this.tabs = storedTabs;
            } else {
                var configObj = getConfig();
                $timeout(configureTabs(configObj), 0);
            }
        };

        function switchTabs(newTabRole) {
            var configObj = getConfig(newTabRole);
            $timeout(configureTabs(configObj), 0);
        }

        function configureTabs(configObj) {
            this.tabs = [];
            angular.forEach(configObj.tabs, function(tab) {
                if (!tab.label) {
                    tab.label = $filter('toTitleCase')(tab.path);
                };
                if (tab.condition == false) {
                    return;
                } else {
                    if (configObj.tabPathPrefix && !tab.ignorePrefix) {
                        tab.fullPath = '/' + configObj.tabPathPrefix + '/' + tab.path;
                    } else {
                        tab.fullPath = '/' + tab.path;
                    }
                    if (tab.trailingSlash) {
                        tab.fullPath = tab.fullPath + '/';
                    }
                    this.tabs.push(checkIfTabIsActive(tab, this.tabs));
                }
            });
            localStorageService.set('tabs', this.tabs);
        }

        function checkIfTabIsActive(tab, tabs) {
            if ((tab.fullPath == this.currentPath) || (this.currentPath.indexOf(tab.fullPath) >= 0)) {
                tab.isActive = true;
                this.showTabs = true;
                this.selectedTabIndex = ((tabs.length === 0) ? 0 : tabs.indexOf(tab));
            } else {
                tab.isActive = false;
            }
            return tab;
        }

        function getConfig(newTabRole) {
            var anonymous = {
                condition: (!this.loggedIn || StakeholderAuthService.isAnonymous()),
                tabs: []
            };
            var student = {
                condition: this.loggedIn && !this.isAdmin && !this.showCounselorDashboard && !this.isCounselor,
                tabPathPrefix: 'apply',
                tabs: [
                    {
                        path: 'student-dashboard',
                        label: 'Dashboard',
                        ignorePrefix: true,
                        trailingSlash: true
                    },
                    {
                        path: 'dashboard',
                        label: 'Tasks',
                        condition: StakeholderAuthService.isAllowed('feature', 'tasks')
                                   && !StakeholderAuthService.isAllowed( 'feature', 'new-tasks')
                    },
                    {
                        path: 'edu/#/studentTasks',
                        label: 'Tasks',
                        condition: StakeholderAuthService.isAllowed('feature', 'new-tasks'),
                        ignorePrefix: true
                    },
                    {
                        path: 'search',
                        label: 'Colleges',
                        condition: StakeholderAuthService.isAllowed('feature', 'old-colleges')
                                   && !StakeholderAuthService.isAllowed( 'feature', 'new-colleges')
                    },
                    {
                        path: 'edu/#/colleges',
                        label: 'Colleges',
                        condition: StakeholderAuthService.isAllowed('feature', 'new-colleges'),
                        ignorePrefix: true
                    },
                    {
                        path: 'scholarships',
                        condition: StakeholderAuthService.isAllowed('feature', 'scholarships')
                                   && !StakeholderAuthService.isAllowed( 'feature', 'new-scholarships'),
                        ignorePrefix: true,
                        trailingSlash: true
                    },
                    {
                        path: 'edu/#/scholarships',
                        label: 'Scholarships',
                        condition: StakeholderAuthService.isAllowed('feature', 'new-scholarships'),
                        ignorePrefix: true
                    },
                    {
                        path: 'applications',
                        condition: this.stakeholder.stakeholder_type == 'Student'
                                   && this.stakeholder.phase == 'Senior'
                                   && (StakeholderAuthService.isAllowed('feature', 'applications') || this.hasNextTierApplication),
                        ignorePrefix: true,
                        trailingSlash: true
                    }
                ]
            };
            var parent = {
                condition: this.loggedIn && !this.isAdmin && !this.showCounselorDashboard && !this.isCounselor,
                tabPathPrefix: 'apply',
                tabs: [
                    {
                        path: 'student-dashboard',
                        label: 'Dashboard',
                        ignorePrefix: true,
                        trailingSlash: true
                    },
                    {
                        path: 'dashboard',
                        label: 'Tasks',
                        condition: StakeholderAuthService.isAllowed('feature', 'tasks')
                                   && !StakeholderAuthService.isAllowed( 'feature', 'new-tasks')
                    },
                    {
                        path: 'edu/#/studentTasks',
                        label: 'Tasks',
                        condition: StakeholderAuthService.isAllowed('feature', 'new-tasks'),
                        ignorePrefix: true
                    },
                    {
                        path: 'search',
                        label: 'Colleges',
                        condition: StakeholderAuthService.isAllowed('feature', 'old-colleges')
                                   && !StakeholderAuthService.isAllowed( 'feature', 'new-colleges')
                    },
                    {
                        path: 'edu/#/colleges',
                        label: 'Colleges',
                        condition: StakeholderAuthService.isAllowed('feature', 'new-colleges'),
                        ignorePrefix: true
                    },
                    {
                        path: 'scholarships',
                        condition: StakeholderAuthService.isAllowed('feature', 'scholarships')
                                   && !StakeholderAuthService.isAllowed( 'feature', 'new-scholarships'),
                        ignorePrefix: true,
                        trailingSlash: true
                    },
                    {
                        path: 'edu/#/scholarships',
                        label: 'Scholarships',
                        condition: StakeholderAuthService.isAllowed('feature', 'new-scholarships'),
                        ignorePrefix: true
                    }
                ]
            };
            var counselor = {
                tabPathPrefix: 'cp',
                condition: this.stakeholder.loggedIn,
                tabs: [{
                    path: 'dashboard',
                    label: 'Home',
                    condition: (StakeholderAuthService.isAllowed('feed events')
                               && !StakeholderAuthService.isAdmin())
                },
                {
                    path: 'edu/#/students',
                    label: 'Students',
                    condition: StakeholderAuthService.isAllowed('feature', 'new-team'),
                    ignorePrefix: true
                },
                {
                    path: 'tasks',
                    label: 'Tasks',
                    condition: StakeholderAuthService.isAllowed('feature', 'old-couns-task')
                               && !StakeholderAuthService.isAllowed( 'feature', 'new-couns-task')
                },
                {
                    path: 'edu/#/counselor-tasks',
                    label: 'Tasks',
                    condition: StakeholderAuthService.isAllowed('feature', 'new-couns-task'),
                    ignorePrefix: true
                },
                {
                    path: 'search',
                    label: 'Colleges',
                    condition: !StakeholderAuthService.isAdmin()
                               && StakeholderAuthService.isAllowed('feature', 'old-colleges')
                               && !StakeholderAuthService.isAllowed( 'feature', 'new-colleges')
                },
                {
                    path: 'edu/#/colleges',
                    label: 'Colleges',
                    condition: !StakeholderAuthService.isAdmin()
                               && StakeholderAuthService.isAllowed('feature', 'new-colleges'),
                    ignorePrefix: true
                },
                {
                    path: 'scholarships',
                    condition: StakeholderAuthService.isAllowed('feature', 'scholarships')
                               && !StakeholderAuthService.isAllowed( 'feature', 'new-scholarships'),
                    ignorePrefix: true,
                    trailingSlash: true
                },
                {
                    path: 'edu/#/scholarships',
                    label: 'Scholarships',
                    condition: StakeholderAuthService.isAllowed('feature', 'new-scholarships'),
                    ignorePrefix: true
                },
                {
                    path: 'district',
                    condition: StakeholderAuthService.isAllowed('view all', 'district')
                               || StakeholderAuthService.isAdmin(),
                    ignorePrefix: true,
                    trailingSlash: true
                },
                {
                    path: 'counselor-community',
                    label: 'Community',
                    condition: StakeholderAuthService.isAllowed('feature', 'counselor-resource'),
                    ignorePrefix: true,
                    trailingSlash: true
                }]
            };
            var admin = {
                condition: StakeholderAuthService.isAdmin(),
                tabPathPrefix: 'admin',
                tabs: [
                    {
                        path: '#/stakeholders',
                        label: 'Stakeholders'
                    },
                    {
                        path: '#/institutions',
                        label: 'Institutions'
                    },
                    {
                        path: '#/tasks',
                        label: 'Tasks'
                    },
                    {
                        path: '#/achievements',
                        label: 'Achievements'
                    },
                    {
                        path: '#/highschools',
                        label: 'High Schools'
                    },
                    {
                        path: '#/policy',
                        label: 'Policy'
                    },
                    {
                        path: '#/entitlements',
                        label: 'Entitlements'
                    },
                    {
                        path: '#/sponsor',
                        label: 'Sponsored Schools'
                    }
                ]
            };
            var configObj = {};
            var tabRole = newTabRole || this.stakeholder.stakeholder_type;
            switch (tabRole) {
                case 'Admin':
                    configObj = admin;
                    break;
                case 'Student':
                    if (StakeholderAuthService.isAdmin() && !newTabRole) {
                        configObj = admin;
                    } else {
                        configObj = student;
                    }
                    break;
                case 'Counselor':
                    configObj = counselor;
                    break;
                case 'Parent':
                    configObj = parent;
                    break;
                default:
                    configObj = anonymous;
            }
            return configObj;
        }
        /* ======================= LOCATION ======================= */
        function getCurrentLocation() {
            return $window.location.pathname;
        }

        function goToLocation(newPath) {
            if (this.currentPath !== newPath) {
                $window.location.assign(newPath);
            }
        }
        /* ======================= ELEMENTS ======================= */
        function openMenu($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        function toggleMessaging() {
            $rootScope.$broadcast('toggleMessaging');
        }
        /* ======================= LISTENERS ======================= */
        function setupListeners() {
            $scope.$watch(
                function watchStakeholder(scope) {
                    return (this.stakeholder);
                },
                function handleStakeholderChange(newValue, oldValue) {
                    activate(true);
                }
            );
            $rootScope.$on('stakeholderUpdated', function(event, data) {
                setupStakeholder(data, true);
            });
            $rootScope.$on('entitlements-set', function() {
                setupPermissions();
            });
        }
    }
})();
