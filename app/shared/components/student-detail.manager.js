(function() {
    'use strict';

    angular
        .module('student-detail', ['student'])
        .factory('StudentDetailManager', StudentDetailManager);

    StudentDetailManager.$inject = ['$q', 'API', 'UrlHelper', 'StudentModel'];

    function StudentDetailManager($q, API, UrlHelper, StudentModel) {
        return {
            getFollowedSchools: getFollowedSchools,
            getGroupsStudentBelongsTo: getGroupsStudentBelongsTo,
            getStudentDetail: getStudentDetail,
            getStudentTaskList: getStudentTaskList
        };

        function getFollowedSchools(studentId) {
            return API.$get(UrlHelper.peer.institutionTracker(studentId), { hideLoader: true })
                .then(function(response) {
                    return response.data;
                }).catch(function(error) {
                    return error;
                });
        }

        function getGroupsStudentBelongsTo(studentId) {
            var counselorId = StakeholderAuth.getStakeholder().id;
            return API.$get(UrlHelper.stakeholder.groupsStudentBelongsTo(counselorId, studentId))
                .then(function(response) {
                    return response.data.results;
                }).catch(function(error) {
                    return error;
                });
        }

        function getStudentDetail(studentIds, next, deferred) {
            var localDeferred = deferred || $q.defer();
            var students = [];
            if (studentIds && studentIds.constructor !== Array) {
                students.push(studentIds);
            } else {
                students = studentIds;
            }
            var data = {};
            if (!next) {
                data.id = students;
                StudentModel.studentsDetails = [];
            }
            API.$get(next || UrlHelper.stakeholder.studentDetail(), data)
                .then(function(response) {
                    StudentModel.studentsDetails.push.apply(
                        StudentModel.studentsDetails, response.data.results);
                    if (response.data.next) {
                        getStudentDetail(null, response.data.next, localDeferred);
                    } else {
                        var studentsDetails = StudentModel.studentsDetails;
                        localDeferred.resolve(studentsDetails);
                    }
                }).catch(function(error) {
                    return error;
                });
            return localDeferred.promise;
        }

        function getStudentTaskList(studentId, next, deferred, taskList) {
            //Get the tasks for each team member
            var localDeferred = deferred || $q.defer();
            taskList = taskList || [];
            API.$get(next || UrlHelper.peer.taskList(studentId))
                .then(function(response) {
                    //Adds three new properties to the students - taskCount, taskCompleted, and schoolCount
                    taskList.push.apply(taskList, response.data.results);
                    if (response.data.next) {
                        getStudentTaskList(studentId, response.data.next,
                            localDeferred, taskList);
                    } else {
                        var taskInfo = countTaskListInformation(
                            taskList, studentId);
                        localDeferred.resolve(taskInfo);
                    }
                }).catch(function(err) {
                    console.log(err);
                });
            return localDeferred.promise;
        }
        ///////////Private Methods
        function countTaskListInformation(taskList) {
            var today = new Date();
            var counts = {};
            var completed = 0;
            var pastDue = 0;
            var leadTime = 0;
            var leadTimeCount = 0;
            for (var j = 0; j < taskList.length; j++) {
                var aTaskLink = taskList[j];
                if (!aTaskLink.archived) {
                    counts[aTaskLink.task.institution_name] = 1 + (counts[aTaskLink.task.institution_name] || 0);
                    if (aTaskLink.completed) completed += 1;
                    if (aTaskLink.task.deadline != null) {
                        var taskDifferential = jsUtilities.dates.days(today, aTaskLink.task.deadline);
                        if (taskDifferential <= 0) {
                            pastDue++;
                        } else {
                            leadTime += taskDifferential;
                            leadTimeCount++;
                        }
                    }
                }
            }
            //Subtract one to account for universal tasks that have no school
            var schools = Object.keys(counts).length > 0 ? Object.keys(counts).length - 1 : 0;
            return {
                taskCount: taskList.length,
                schoolCount: schools,
                taskCompleted: completed,
                status: getStatus(leadTimeCount, leadTime, pastDue),
                taskList: taskList
            };
        }
    }
})();
