(function() {
    'use strict';

    angular
        .module('messagingModule')
        .directive('chatWindow', Chat);

    Chat.$inject = ['$timeout', 'MessagingManager', 'MessagingModel'];

    function Chat($timeout, MessagingManager, MessagingModel) {
        return {
            restrict: 'E',
            scope: {
                chat: '='
            },
            templateUrl: 'chat.html',
            link: link
        };

        function link(scope, element, attr) {
            var timer;
            var latest_date = '';
            scope.MessagingModel = MessagingModel;
            scope.newMessage = null;
            scope.studentGradYear;
            scope.nextPage = null;
            scope.messages = [];
            scope.sendMessage = sendMessage;
            scope.linkify = linkify;
            scope.newDate = newDate;
            scope.getMessages = getMessages;
            scope.$watch('chat', function(newVal, oldVal) {
                if (newVal.id === oldVal.id) return;
                getMessages(false);
            });
            scope.$on('$destroy', function() {
                clearTimeout(timer);
            });
            scope.$on('new-message', function() {
                scrollChat();
            });

            function sendMessage() {
                if (!scope.newMessage) return;
                if (scope.MessagingModel.useWebsockets) {
                    MessagingManager.sendMessage(
                        scope.chat.id,
                        scope.newMessage,
                        scope.studentGradYear
                    );
                } else {
                    MessagingManager.sendLegacyMessage(
                        scope.chat.id,
                        scope.newMessage,
                        scope.studentGradYear
                    ).then(function() {
                        getMessages(false);
                    });
                }
                scope.newMessage = null;
            }

            function newDate(date) {
                if (latest_date !== date) {
                    latest_date = date;
                    return true;
                } else {
                    return false;
                }
            }

            function linkify(input) {
                var output = Autolinker.link(input, {
                    replaceFn: getLink,
                    location: 'smart',
                    newWindow: false,
                    truncate: 25
                });
                return output;
            }

            function getLink(match) {
                var fullUrl = match.getUrl();
                var url = fullUrl.split(';;');
                var itemName = url[1] ? decodeURI(url[1]) : match.getAnchorText();
                return '<br><a href="' + url[0] + '">' + itemName + '</a>';
            }

            function getMessages(getNextPage) {
                MessagingManager.getMessages(
                    getNextPage ? null : scope.chat.id,
                    getNextPage ? scope.nextPage : null
                ).then(function(response) {
                    if (!scope.MessagingModel.useWebsockets) {
                        handleMessages(response, getNextPage);
                    } else {
                        scope.messages = MessagingModel[scope.chat.id].messages;
                        setGradYear(scope.messages[0]);
                    }
                });
            }

            function handleMessages(response, getNextPage) {
                if (scope.messageCount === response.count && !getNextPage) { return; }
                if (scope.messages.length === 0 || response.next === null || parseNext(response.next) > 2) {
                    scope.nextPage = response.next;
                }
                scope.messageCount = response.count;
                var oldMessages = scope.messages.map(function(oldMessage) { return oldMessage.id; });
                var messages = response.results;
                for (var i = 0, message; message = messages[i]; ++i) {
                    if (oldMessages.indexOf(message.id) === -1) {
                        scope.messages.push(message);
                    }
                }
                scope.messages = _.sortBy(scope.messages, 'created_on');
                if (getNextPage) { return; }
                scrollToBottom();
                if (!scope.studentGradYear && scope.messages.length > 0) {
                    setGradYear(scope.messages[0]);
                }
            }
            // parse next url from database and returns what number page
            function parseNext(nextString) {
                var regex = /page=(\d+)/;
                var page = regex.exec(nextString);
                return +page[1];
            }

            function setGradYear(message) {
                if (message.recipient.full_name === scope.chat.name) {
                    scope.studentGradYear = message.recipient.graduation_year ? message.recipient.graduation_year : 'None';
                } else {
                    scope.studentGradYear = message.author.graduation_year ? message.author.graduation_year : 'None';
                }
            }

            function polling() {
                timer = setTimeout(function() {
                    getMessages(false);
                    polling();
                }, 10000);
            }
            (function() {
                getMessages(false);
                if (!scope.MessagingModel.useWebsockets) {
                    polling();
                }
            })();
            /**
             * Scroll the chat window to the most recent message on load
             **/
            function scrollToBottom() {
                $timeout(function() {
                    var chatHistory = element.find('.chat-history')[0];
                    chatHistory.scrollTop = (chatHistory.scrollHeight + 20);
                });
            }
        }
    }
})();
