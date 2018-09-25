(function() {
    angular.module('file-helper', ['api-svc', 'api-urls-svc', 'stakeholder-svc'])
        .factory('FileHelper', FileHelper);

    FileHelper.$inject = ['$http', 'UrlHelper', 'API', 'StakeholderAuth'];

    function FileHelper($http, UrlHelper, API, StakeholderAuth) {

        var FileHelper = {
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
            return API.$delete(UrlHelper.stakeholder.attachment(attachmentId)).then(function(response) {
                // remove the file
                return response;
            });
        }

        function downloadFromUrl(url) {
            var link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute( 'download', '');
            link.click();
            link.remove();
        }

        function downloadTaskFile(taskId) {
            getS3URL(taskId).then(function(url) {
                var link = document.createElement( 'a' );
                link.setAttribute( 'href', url);
                link.setAttribute( 'download', '');
                link.click();
                link.remove();
            })
        }

        function downloadUserFile(fileId) {
            getUserURL(fileId).then(function(url) {
                updateLink(url);
            })
        }

        function getSystemLog(district_id) {
            return API.$get(UrlHelper.stakeholder.systemLog(district_id)).then(function(response) {
                return response.data.results;
            });
        }

        function downloadSystemLog(districtId, systemLogId) {
            return API.$get(UrlHelper.stakeholder.downloadSystemLog(districtId, systemLogId)).then(function (response) {
               return response.data.notes;
            });
        }

        function retrieveUserFiles() {
            return $http.get(UrlHelper.stakeholder.updateStakeholder(), {
                headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined //This is to ignore angular's default content type (application/json) this will allow the browser to set it as multipart/form-data
                }
            }).then(function(response) {
                return response.data.attachments;
            });
        }

        function uploadDistrictCSV(file, id) {
            if (!file.error) {
                var fd = new FormData();
                fd.append('file', file);

                return API.$postFile(UrlHelper.district.update(id), fd
                ).then(function(response) {
                    return response.data;
                }).catch(function(error) {
                    console.log(error);
                });
            }
        }

        function uploadProfilePicture(file) {
            if (!file.error) {
                var fd = new FormData();
                fd.append('profile_photo', file);

                return $http.patch(UrlHelper.stakeholder.updateStakeholder(), fd, {
                    headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined
                    }
                })
                .then(function(response) {
                    return response.data;
                }).catch(function(error) {
                    console.log(error);
                });
            }
        }

        function uploadTaskFiles(taskId, file) {
            if (!file.$error) {

                var fd = new FormData();
                fd.append('file', file);

                return $http.patch(UrlHelper.app.updateTask(taskId), fd, {
                    headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined //This is to ignore angular's default content type (application/json) this will allow the browser to set it as multipart/form-data
                    }
                }).then(function(response) {
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

                return $http.patch(UrlHelper.stakeholder.updateStakeholder(), fd, {
                    headers: {
                        'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken(),
                        'Content-Type': undefined //This is to ignore angular's default content type (application/json) this will allow the browser to set it as multipart/form-data
                    }
                }).then(function(response) {
                    return response.data;
                });
            }
        }

        function getLettersOfRec(stakeholderId) {
            return API.$get(UrlHelper.stakeholder.files(stakeholderId)).then(function(response) {
                return _.filter(response.data.results, function(letter) {
                    return letter.file_type === 'Letter of Recommendation';
                });
            });
        }

        // Private Methods

        function updateLink(url) {
            var link = document.createElement( 'a' );
            link.setAttribute( 'href', url);
            link.setAttribute( 'download', '');
            link.click();
            link.remove();
        }

        function getS3URL(taskId) {
            return API.$get(UrlHelper.tasks.attachment(taskId)).then(function(response) {
               return response.data.url;
            });
        }

        function getUserURL(attachmentId) {
            return API.$get(UrlHelper.stakeholder.attachment(attachmentId)).then(function(response) {
                return response.data.url;
            });
        }

        return FileHelper;
    }
})();
