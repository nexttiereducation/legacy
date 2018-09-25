(function() {
    'use strict';

    angular
        .module('fileModule')
        .factory('FileService', FileService);

    FileService.$inject = ['$http', 'ApiUrlService', 'ApiService', 'StakeholderAuth'];

    function FileService($http, ApiUrlService, ApiService, StakeholderAuth) {

        var FileService = {
            deleteUserFile: deleteUserFile,
            downloadFromUrl: downloadFromUrl,
            downloadTaskFile: downloadTaskFile,
            downloadUserFile: downloadUserFile,
            getSystemLog: getSystemLog,
            retrieveUserFiles: retrieveUserFiles,
            uploadDistrictCSV: uploadDistrictCSV,
            uploadProfilePicture: uploadProfilePicture,
            uploadTaskFiles: uploadTaskFiles,
            uploadUserFiles: uploadUserFiles,
            getLettersOfRec: getLettersOfRec,
            downloadSystemLog: downloadSystemLog
        };

        function deleteUserFile(attachmentId) {
            return ApiService.$delete(ApiUrlService.stakeholder.attachment(attachmentId))
                .then(function(response) {
                    // remove the file
                    return response;
                });
        }

        function downloadFromUrl(url) {
            var link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', '');
            link.click();
            link.remove();
        }

        function downloadTaskFile(taskId) {
            getS3URL(taskId).then(function(url) {
                var link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', '');
                link.click();
                link.remove();
            });
        }

        function downloadUserFile(fileId) {
            getUserURL(fileId).then(function(url) {
                updateLink(url);
            });
        }

        function getSystemLog(district_id) {
            return ApiService.$get(ApiUrlService.stakeholder.systemLog(district_id))
                .then(function(response) {
                    return response.data.results;
                });
        }

        function downloadSystemLog(districtId, systemLogId) {
            return ApiService.$get(ApiUrlService.stakeholder.downloadSystemLog(districtId, systemLogId))
                .then(function(response) {
                    return response.data.notes;
                });
        }

        function retrieveUserFiles() {
            return $http.get(ApiUrlService.stakeholder.updateStakeholder(), {
                headers: {
                    'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                    'Content-Type': undefined //This is to ignore angular's default content type (application/json) this will allow the browser to set it as multipart/form-data
                }
            })
                .then(function(response) {
                    return response.data.attachments;
                });
        }

        function uploadDistrictCSV(file, id) {
            if (!file.error) {
                var fd = new FormData();
                fd.append('file', file);
                return ApiService.$postFile(ApiUrlService.district.update(id), fd)
                    .then(function(response) {
                        return response.data;
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        }

        function uploadProfilePicture(file) {
            if (!file.error) {
                var fd = new FormData();
                fd.append('profile_photo', file);
                return $http.patch(ApiUrlService.stakeholder.updateStakeholder(), fd, {
                    headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined
                    }
                })
                    .then(function(response) {
                        return response.data;
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        }

        function uploadTaskFiles(taskId, file) {
            if (!file.$error) {
                var fd = new FormData();
                fd.append('file', file);
                return $http.patch(ApiUrlService.app.updateTask(taskId), fd, {
                    headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined //This is to ignore angular's default content type (application/json) this will allow the browser to set it as multipart/form-data
                    }
                })
                    .then(function(response) {
                        return response.data;
                    });
            }
        }

        function uploadUserFiles(file, fileDetails) {
            if (!file.$error) {
                var fd = new FormData();
                fd.append('attachment', file);
                if (fileDetails) {
                    angular.forEach(fileDetails, function(val, key) {
                        fd.append(key, val);
                    });
                } else {
                    fd.append('file_name', file.name);
                }
                return $http.patch(ApiUrlService.stakeholder.updateStakeholder(), fd, {
                    headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined //This is to ignore angular's default content type (application/json) this will allow the browser to set it as multipart/form-data
                    }
                })
                    .then(function(response) {
                        return response.data;
                    });
            }
        }

        function getLettersOfRec(stakeholderId) {
            return ApiService.$get(ApiUrlService.stakeholder.files(stakeholderId))
                .then(function(response) {
                    return _.filter(response.data.results, function(letter) {
                        return letter.file_type === 'Letter of Recommendation';
                    });
                });
        }

        // Private Methods

        function updateLink(url) {
            var link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', '');
            link.click();
            link.remove();
        }

        function getS3URL(taskId) {
            return ApiService.$get(ApiUrlService.tasks.attachment(taskId))
                .then(function(response) {
                    return response.data.url;
                });
        }

        function getUserURL(attachmentId) {
            return ApiService.$get(ApiUrlService.stakeholder.attachment(attachmentId))
                .then(function(response) {
                    return response.data.url;
                });
        }

        return FileService;
    }
})();
