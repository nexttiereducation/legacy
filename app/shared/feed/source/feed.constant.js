(function() {
    angular.module('feed')
        .constant('FeedConstants', {
            web: [
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_web1.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_web2.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_web3.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_web4.svg'
            ],
            parentWeb: [
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-web1.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-web2.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-web3.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-web4.svg'
            ],
            counselorWeb: [
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_web-1.svg',
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_web-2.svg',
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_web-3.svg',
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_web-4.svg'
            ],
            mobile: [
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_mobile1.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_mobile2.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_mobile3.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_mobile4.svg'
            ],
            parentMobile: [
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-mobile1.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-mobile2.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-mobile3.svg',
                'https://next-tier.s3.amazonaws.com/images/student-dashboard/StudentDashboard_redesign_parent-mobile4.svg'
            ],
            counselorMobile: [
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_mobile-1.svg',
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_mobile-2.svg',
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_mobile-3.svg',
                'https://s3.amazonaws.com/next-tier/images/counselor/cd_empty_mobile-4.svg'
            ],
            feedSummaryKeys: {
                accepted_connections: "Accepted Connections",
                accepted_recommendations: "Accepted Recommendations",
                achievements_earned: "Achievements Earned",
                failed_logins: "Failed Logins",
                files_uploaded_to_profile: "Files Uploaded to Profile",
                files_uploaded_to_task: "Files Uploaded to Tasks",
                notes_added: "Notes Added",
                rejected_recommendations: "Rejected Recommendations",
                schools_added: "Schools Added",
                schools_removed: "Schools Removed",
                submitted_applications: "Submitted Applications",
                successful_logins: "Successful Logins",
                tasks_completed: "Tasks Completed",
                tasks_due: "Tasks Due",
                tasks_started: "Tasks Started"
            },
            categories: {
                accepted_connections: 8,
                accepted_recommendations: 6,
                achievements_earned: 4,
                failed_logins: 12,
                files_uploaded_to_profile: 14,
                files_uploaded_to_task: 13,
                notes_added: 3,
                rejected_recommendations: 7,
                schools_added: 0,
                schools_removed: 10,
                submitted_applications: 5,
                successful_logins: 11,
                tasks_completed: 2,
                tasks_due: 9,
                tasks_started: 1
            },
            icons: {
                failed_logins: "https://next-tier.s3.amazonaws.com/build/images/ic_student_badge.png",
                files_uploaded_to_profile: "https://s3.amazonaws.com/next-tier/build/images/activity/files_uploaded.svg",
                files_uploaded_to_task: "https://s3.amazonaws.com/next-tier/build/images/activity/files_uploaded.svg",
                successful_logins: "https://next-tier.s3.amazonaws.com/build/images/ic_student_badge.png"
            }
        })
})();
