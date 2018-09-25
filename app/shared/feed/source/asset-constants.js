(function() {
    angular.module('feed')
        .constant('AssetConstants',
        {
            taskURL : "https://next-tier.s3.amazonaws.com/build/images/tasks/ic_thumb_noti_item_tasks.svg",
            noteURL : "https://next-tier.s3.amazonaws.com/build/images/notifications/ic_thumb_noti_item_commv.svg",
            achievementURL : "https://next-tier.s3.amazonaws.com/build/images/notifications/ic_thumb_noti_item_accomplishment.svg",
            schoolURL : "https://next-tier.s3.amazonaws.com/build/images/ic_schools_ind.png",
            studentURL : "https://next-tier.s3.amazonaws.com/build/images/ic_student_badge.png",
            connectionsURL : "https://s3.amazonaws.com/next-tier/images/counselor/cd_connection-accepted.svg",
            communityResponseURL: "https://s3.amazonaws.com/next-tier/images/counselor/cd_community-reply.svg"
        }
    );
})();
