(function() {
    angular
        .module('messagingModule')
        .directive('groupChatWindow', GroupChat);

    GroupChat.$inject = ['MessagingManager', 'Track'];

    function GroupChat(MessagingManager, Track) {
        return {
            restrict: 'E',
            scope: {
                tag: '=',
            },
            templateUrl: 'group-chat.html',
            link: link
        };

        function link(scope, element, attr) {
            scope.groupChat = {};
            scope.groupChat.newMessage = null;
            scope.sendMessage = sendMessage;

            (function() {
                scope.studentsInTag = scope.tag.students;
            })();

            function sendMessage() {
                if (!scope.groupChat.newMessage) return;
                var ids = _.map(scope.studentsInTag, 'id');
                var message = {
                    ids: ids,
                    body: scope.groupChat.newMessage
                }
                MessagingManager.sendGroupMessage(message).then(function() {
                    Track.event("counselor_sent_blast", {
                        "body": message.body,
                        "number_of_recipients": message.ids.length
                    });
                   scope.groupChat.newMessage = null;
                   toastr.success('Message Sent');
                })
            }
        }
    }
})();
