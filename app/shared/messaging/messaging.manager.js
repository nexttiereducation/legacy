(function() {
    'use strict';

    angular
        .module('messagingModule')
        .factory('MessagingManager', MessagingManager);

    MessagingManager.$inject = ['$q', '$rootScope', '$timeout', 'API',
        'UrlHelper', 'MessagingModel', 'ConnectionsModel', 'Track',
        'WebsocketManager'
    ];

    function MessagingManager($q, $rootScope, $timeout, API, UrlHelper,
        MessagingModel, ConnectionsModel, Track, WebsocketManager) {
        var messagingManager = {
            getMessages: getMessages,
            getRecent: getRecent,
            getRecentMessageDataByChatId: getRecentMessageDataByChatId,
            getStudentsForGroup: getStudentsForGroup,
            getStudentTags: getStudentTags,
            markRead: markRead,
            sendGroupMessage: sendGroupMessage,
            sendMessage: sendMessage,
            updateUnreadCount: updateUnreadCount,
            ///////LEGACY:///////
            sendLegacyMessage: sendLegacyMessage,
            startUnreadListener: startUnreadListener
        };
        //Legacy:
        var hasStartedListener = false;
        //
        WebsocketManager.addMessageHandler(handleSocketMessage);

        function handleSocketMessage(event) {
            var messageData = JSON.parse(event.data);
            if (messageData.chatId) {
                if (!MessagingModel[messageData.chatId]) {
                    MessagingModel[messageData.chatId] = {
                        'messages': []
                    };
                }
                MessagingModel[messageData.chatId].messages.push(messageData);
                $timeout(function() {
                    $rootScope.$broadcast('new-message', messageData);
                }, 0);
            }
        }

        function getMessages(chatId, next) {
            var url = chatId ? UrlHelper.messaging.getMessages(chatId) : next;
            return API.$get(url, { hideLoader: true })
                .then(function(response) {
                    return response.data;
                });
        }

        function sendMessage(recipientId, messageText, studentGradYear) {
            var message = {
                'messageText': messageText,
                'recipientId': recipientId,
                'type': 'messaging'
            };
            Track.event('sent_message', {
                'recipient_id': recipientId,
                'recipient_grad_year': studentGradYear,
                'body': messageText
            });
            WebsocketManager.send(JSON.stringify(message));
        }

        function sendGroupMessage(message) {
            return API.$post(UrlHelper.messaging.group(), message)
                .then(function(response) {
                    return response.data;
                });
        }

        function markRead(stakeholderId) {
            return API.$patch(UrlHelper.messaging.markRead(stakeholderId), { hideLoader: true })
                .then(function(response) {
                    getRecentMessageDataByChatId(stakeholderId).count = 0;
                    updateUnreadCount();
                    return response.data;
                });
        }

        function getRecentMessageDataByChatId(chatId) {
            for (var i = 0, message; message = MessagingModel.recentMessagesData[i]; ++i) {
                if (message.id === chatId) {
                    return message;
                }
            }
        }

        function getStudentTags() {
            return API.$getPaged(UrlHelper.messaging.studentTags(), { hideLoader: true })
                .then(function(tags) {
                    MessagingModel.studentTags = tags;
                });
        }

        function getStudentsForGroup(groupId) {
            return API.$getPaged(UrlHelper.stakeholder.studentsInGroup(groupId))
                .then(function(students) {
                    return students;
                });
        }

        function getRecent() {
            API.$get(UrlHelper.messaging.unread(), { hideLoader: true })
                .then(function(response) {
                    parseRecent(response.data);
                });
        }

        function parseRecent(recentMessagesData) {
            MessagingModel.recentMessagesData = recentMessagesData;
            updateUnreadCount();
        }

        function updateUnreadCount() {
            MessagingModel.unreadCount = 0;
            MessagingModel.recentMessagesData.forEach(function(recentMessageData) {
                MessagingModel.unreadCount += recentMessageData.count;
            });
            MessagingModel.recentMessagesData = _.orderBy(MessagingModel.recentMessagesData, ['count'], ['desc']);
        }
        return messagingManager;
        ////////////
        ////////////
        ///LEGACY///
        ////////////
        ////////////
        function sendLegacyMessage(stakeholderId, message, studentGradYear) {
            var data = {
                id: stakeholderId,
                body: message,
                hideLoader: true
            };
            return API.$post(UrlHelper.messaging.message(stakeholderId), data)
                .then(function(response) {
                    Track.event('sent_message', {
                        'recipient_id': stakeholderId,
                        'recipient_grad_year': studentGradYear,
                        'body': message
                    });
                    return response.data;
                });
        }

        function startUnreadListener() {
            if (hasStartedListener) {
                $timeout(function() {
                    getRecent();
                    startUnreadListener();
                }, 100000);
            } else {
                hasStartedListener = true;
                startUnreadListener();
            }
        }
    }
})();
