(function() {
    angular.module('student', [])
        .service('StudentModel', StudentModel);

    function StudentModel() {

        this.currentStudentId = -1;
        this.currentStudentList = [];
        this.studentsDetails = [];
    }
})();
