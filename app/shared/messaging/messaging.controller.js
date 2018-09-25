(function() {
    'use strict';

    angular
        .module('messagingModule')
        .controller('MessagingController', MessagingController);

    MessagingController.$inject = ['$rootScope', '$scope', '$filter', '$location',
        '$mdComponentRegistry', '$mdSidenav', 'localStorageService',
        'ConnectionsManager', 'ConnectionsModel', 'StakeholderAuth',
        'MessagingManager', 'MessagingModel', 'Utils', '$compile',
        '$element', '$timeout', '$mdMedia', 'FeedModel', '$window'
    ];

    function MessagingController($rootScope, $scope, $filter, $location,
        $mdComponentRegistry, $mdSidenav, localStorageService,
        ConnectionsManager, ConnectionsModel, StakeholderAuth,
        MessagingManager, MessagingModel, Utils, $compile, $element,
        $timeout, $mdMedia, FeedModel, $window) {
        var vm = this;
        //vm methods
        this.acceptInvite = acceptInvite;
        this.close = close;
        this.declineInvite = declineInvite;
        this.goBack = goBack;
        this.inviteUser = inviteUser;
        this.removeConnection = removeConnection;
        this.revokeInvite = revokeInvite;
        this.search = search;
        this.selectConnection = selectConnection;
        this.selectTag = selectTag;
        this.showMessaging = showMessaging;
        this.toggleMessaging = toggleMessaging;
        this.toggleWS = toggleWS;
        this.unread = unread;
        this.viewStudentDetails = viewStudentDetails;
        ///////////////////////////////////////////////////////////////
        //vm properties
        this.chat = {};
        this.close = close;
        this.connectionEmail = null;
        this.connectionsModel = ConnectionsModel;
        this.feedModel = FeedModel;
        this.filteredConnections = null;
        this.groupChat = false;
        this.manageConnections = false;
        this.messagingModel = MessagingModel;
        this.open = open;
        this.searchPlaceholder = this.stakeholder.isCounselor ? 'Search by Name or Email' : 'Search or Invite by Name or Email';
        this.showConnections = true;
        this.showEmailError = false;
        this.stakeholder = StakeholderAuth.getStakeholder();
        this.tag = null;
        ///////////////////////////////////////////////////////////////
        //private vars
        var unwatchStakeholder;
        //////////////////////////////////////////
        //activate();
        (function activate() {
            setupWatchers();
            this.show = false;
            this.currentLocation = $window.location.pathname;
        })();

        function init() {
            ConnectionsManager.initializeConnections();
            MessagingManager.getRecent();
            if (!this.messagingModel.useWebsockets) {
                MessagingManager.startUnreadListener();
            }
            MessagingManager.getStudentTags();
            checkOpenMessages();
            unwatchStakeholder();
        }

        $rootScope.$on('connection.change', function(event, args) {
            ConnectionsManager.initializeConnections();
        });

        $rootScope.$on('toggleMessaging', function(event, args) {
            toggleMessaging();
        });

        $rootScope.$on('showMessaging', function(event, args) {
            showMessaging();
        });

        function toggleMessaging() {
            $timeout(function() {
                if (this.show) {
                    $mdSidenav('right').close().then(function() {
                        this.show = false;
                    });
                } else {
                    showMessaging();
                };
            }, 100);
        }

        function showMessaging() {
            $mdSidenav('right').open().then(function() {
                this.showConnections = true;
                this.show = true;
            });
        }

        $rootScope.$on('toggleSidebar', function(event, args) {
            toggleSidebar();
        });

        $rootScope.$on('closeSidebar', function(event, args) {
            closeSidebar();
        });

        function toggleSidebar() {
            $timeout(function() {
                if (this.showSidebar) {
                    $mdSidenav('sidebar').close().then(function() {
                        this.showSidebar = false;
                    });
                } else {
                    showSidebar();
                };
            }, 100);
        }

        function showSidebar() {
            $mdSidenav('sidebar').open().then(function() {
                this.showSidebar = true;
            });
        }

        function closeSidebar() {
            $mdSidenav('sidebar').close().then(function() {
                this.showSidebar = false;
            });
        }

        function toggleWS() {
            this.messagingModel.useWebsockets = !this.messagingModel.useWebsockets;
            localStorageService.set('ws', this.messagingModel.useWebsockets);
            alert('Page will refresh to activate your choice...');
            window.location.reload();
        }
        //////////////////////////////////////////
        //watchers
        function setupWatchers() {
            $rootScope.$on('messaging', function($event, connection) {
                $mdSidenav('right').open();
                if (connection) {
                    selectConnection(connection);
                }
            });
            $rootScope.$on('new-message', function($event, message) {
                if (!this.show || !this.chat || this.chat.id !== message.chatId) {
                    var currentMessage = this.messagingModel.recentMessagesData
                        .filter(function(recentMessageData) {
                            return recentMessageData.id === message.chatId;
                        });
                    if (currentMessage.length === 0) {
                        message.count = 1;
                        this.messagingModel.recentMessagesData.push(message);
                    } else {
                        currentMessage[0].count++;
                    }
                    MessagingManager.updateUnreadCount()
                } else {
                    MessagingManager.markRead(message.chatId);
                }
            });
            $rootScope.$watch(
                function() { return this.show },
                function(newVal, oldVal) {
                    if (newVal) {
                        localStorageService.set('messaging-open', 'true');
                    } else {
                        localStorageService.remove('messaging-open');
                    }
                }
            );
            unwatchStakeholder = $rootScope.$watch(
                function() {
                    return this.stakeholder.id;
                },
                function(newVal, oldVal) {
                    if (!newVal || location.pathname.indexOf('logout') > -1) {
                        return;
                    }
                    init();
                }
            );
        }
        ////////vm methods
        function viewStudentDetails(studentId) {
            $rootScope.$broadcast('showStudentDetails', studentId);
        }

        function search() {
            this.showSearchingMessage = true;
            ConnectionsManager.findConnection(this.contactSearch).then(
                function() {
                    this.showSearchingMessage = false;
                });
        }

        function selectConnection(connection) {
            var recentMessages = MessagingManager.getRecentMessageDataByChatId(
                connection.id);
            if (recentMessages && recentMessages.count > 0) {
                MessagingManager.markRead(connection.id);
            }
            this.chat = {
                name: connection.get_full_name ? connection.get_full_name : connection.full_name,
                id: connection.id,
                stakeholder_type: connection.stakeholder_type
            };
            this.showConnections = false;
            this.groupChat = false;
            localStorageService.set('messaging-current-conversation', connection);
        }

        function selectTag(tag) {
            this.tag = tag;
            this.showConnections = false;
            this.groupChat = true;
        }

        function inviteUser() {
            var address = this.invitationAddress || this.contactSearch;
            this.isInvalidEmail = !Utils.validateEmail(address);
            if (this.isInvalidEmail) {
                this.showEmailError = true;
                return;
            }
            ConnectionsManager.addConnection(address).then(function() {
                emitConnectionChange();
            }).catch(function(error) {
                var errorToDisplay = error.data.detail ? error.data.detail : error.data.Detail;
                toastr.error(errorToDisplay);
            });
            this.invitationAddress = '';
            this.contactSearch = '';
        }

        function removeConnection(event, connection) {
            event.stopPropagation(); //prevent the chat window from being opened
            ConnectionsManager.removeConnection(connection.id).then(
                function() { emitConnectionChange(); });
        }

        function acceptInvite(event, request) {
            ConnectionsManager.acceptInvite(request.invite_token).then(
                function() { emitConnectionChange(); });
        }

        function declineInvite(event, request) {
            ConnectionsManager.declineInvite(request.invite_token).then(
                function() { emitConnectionChange(); });
        }

        function revokeInvite(event, request) {
            ConnectionsManager.revokeInvite(request.invite_token).then(
                function() { emitConnectionChange(); });
        }

        function emitConnectionChange() {
            $rootScope.$emit('connection.change', { sender: 'messaging' });
        }

        function goBack() {
            this.chat = {};
            this.tag = null;
            if (this.groupChat) {
                this.showGroups = true;
                this.selectedTabIndex = 1;
                this.groupChat = false;
            } else {
                this.showGroups = false;
                this.selectedTabIndex = 0;
            }
            this.showConnections = true;
            localStorageService.remove('messaging-current-conversation');
        }

        function unread(obj) {
            var orderBy = $filter('orderBy');
            obj.unread = !!this.messagingModel.recentMessagesData[obj.id];
            this.connectionsModel.connections = orderBy(
                this.connectionsModel.connections,
                ['-unread', 'get_full_name']
            );
        }

        function close() {
            goBack();
            $mdSidenav('right').close();
            this.show = false;
        }

        function open() {
            $mdSidenav('right').open();
            this.show = true;
        }
        ///////////private methods
        function checkOpenMessages() {
            if ($location.search()['isiframe']) {
                $mdSidenav('right').close();
                return;
            }
            if (localStorageService.get('messaging-open')) {
                $mdSidenav('right').open();
                var currentConnection = localStorageService.get('messaging-current-conversation');
                if (currentConnection) {
                    selectConnection(currentConnection);
                }
            }
        }
    }
})();
