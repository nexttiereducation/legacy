(function() {
    'use strict';

    angular
        .module('adminModule')
        .controller('InstitutionsCtrl', InstitutionsCtrl);

    InstitutionsCtrl.$inject = [
        '$filter',
        '$http',
        '$q',
        '$rootScope',
        '$scope',
        'AdminDialog',
        'ApiService',
        'ApiUrlService',
        'EditableList',
        'FileUploader',
        'infiniteScroll',
        'ngDialog',
        'QueryBuilder',
        'XLSXReaderService'
    ];

    function InstitutionsCtrl($scope, $rootScope, infiniteScroll, ngDialog, ApiUrlService, AdminDialog,
        XLSXReaderService, ApiService, $filter, QueryBuilder, FileUploader, $q, $http, EditableList) {

        this.items = [];/**/
        this.filterItems = {};
        this.orderingField = 'name';
        this.newDate = false;
        this.newDeadline = {};
        this.newGroup = {};
        this.sorting = {
            field: '',
            direction: ''
        };
        // To be used when code is refactored to separate out detail fields from institution.
        this.detailsKeyHash = {
            'male_enrollment': true,
            'institution': true,
            'undergrad_population': true,
            'grad_population': true,
            'avg_gpa': true,
            'in_state_tuition': true,
            'out_of_state_tuition': true,
            'initial_financial_aid': true,
            'admission_rate': true,
            'female_enrollment': true,
            'mission_statement': true,
            'mission_statement_url': true,
            'sat_reading_25': true,
            'sat_reading_75': true,
            'sat_math_25': true,
            'sat_math_75': true,
            'sat_writing_25': true,
            'sat_writing_75': true,
            'act_25': true,
            'act_math_25': true,
            'act_english_25': true,
            'act_writing_25': true,
            'act_75': true,
            'act_math_75': true,
            'act_english_75': true,
            'act_writing_75': true,
            'financial_aid_deadlines': true,
            'financial_aid_url': true,
            'scholarship_url': true,
            'scholarship_deadlines': true,
            'css_deadlines': true,
            'has_application_fee': true,
            'application_fee': true,
            'has_group_app_supplements': true,
            'test_required': true,
            'test_accepted': true,
            'sat2': true,
            'letters_of_recommendation': true,
            'number_of_letters': true,
            'essay_required': true,
            'number_of_essays': true,
            'transcripts_or_report': true,
            'offers_interviews': true,
            'interview_importance': true,
            'non_profit': true,
            'admissions_telephone': true,
            'smart_search_keywords': true,
            'group_app_essays_required': true,
            'admissions_rep_required': true,
            'audition_required': true,
            'display_name': true,
            'facebook_url': true,
            'instagram_url': true,
            'portfolio_required': true,
            'scholarship_process': true,
            'snapchat_handle': true,
            'twitter_url': true,
            'writing_sample_required': true,
            'youtube_url': true
        };
        // Fields passed into excel spreadsheet that need to be parsed into a boolean.
        // Note some fields were already expressed as a boolean so not every bool field in institution/instution-details is listed here.
        this.boolFieldsHash = {
            'is_visible': true,
            'is_displayed': true,
            'is_undergraduate': true,
            'is_form': true,
            'is_account': true,
            'is_group': true,
            'has_application_fee': true,
            'test_required': true,
            'sat2': true,
            'offers_interviews': true,
            'non_proft': true,
            'portfolio_required': true,
            'writing_sample_required': true,
            'audition_required': true,
            'admissions_rep_required': true
        };
        // Fields passed that are intended to be dates
        this.dateFieldsHash = {
            'financial_aid_deadlines': true,
            'scholarship_deadlines': true,
            'css_deadlines': true
        };
        this.oldDatesHash = {
            'early_decision': true,
            'early_decision_2': true,
            'early_action': true,
            'early_action_2': true,
            'priority': true,
            'priority_2': true,
            'regular_decision': true,
            'restrictive_early_action': true
        };
        this.dateKeyConverter = {
            'Early Decision': 'early_decision',
            'Early Decision 2': 'early_decision_2',
            'Early Action': 'early_action',
            'Early Action 2': 'early_action_2',
            'Priority Decision': 'priority',
            'Priority Decision 2': 'priority_2',
            'Regular Decision': 'regular_decision',
            'Restrictive Early Action': 'restrictive_early_action',
            'Rolling': 'rolling'
        };

        var patchDeprecatedApplicationDates = function (id, data) {
            ApiService
                .$patch(ApiUrlService.institutions.updateDeprecatedApplicationDates(id), data)
                .success(function () {
                    this.deprecatedDates = {};
                    toastr.info('Institution Application Dates Updated.');
                })
                .error(function () {
                    toastr.error('Institution Application Dates Failed to Update.', 'Error');
                });
        };

        var patchApplicationDates = function (id, data) {
            var lists = data.separateLists();
            var patches = lists.patchList,
                news = lists.newList,
                deletes = lists.deleteList;
            patches = patches.reduce(function (pre, curr) {
                var set = {
                    dateId: curr.id
                };
                var item = {
                    deadline: $filter('date')(curr.deadline, 'yyyy-MM-dd', 'UTC')
                };
                set.item = item;
                pre.push(set);
                return pre;
            }, []);
            var promises = [];
            for (var i = 0; i < patches.length; i++) {
                promises.push(
                    ApiService.$patch(
                        ApiUrlService.institutions.updateApplicationDates(id, patches[i].dateId), patches[i].item
                    )
                        .success(function () {
                            toastr.info('Institution Application Dates Updated.');
                        }).error(function () {
                            toastr.error('Institution Application Dates Failed to Update.', 'Error');
                        })
                );
            }
            for (var j = 0; j < deletes.length; j++) {
                promises.push(
                    ApiService.$delete(
                        ApiUrlService.institutions.updateApplicationDates(id, deletes[j].id)
                    )
                        .success(function () {
                            toastr.info('Institution Application Dates Updated.');
                        }).error(function () {
                            toastr.error('Institution Application Dates Failed to Update.', 'Error');
                        })
                );
            }
            if (news.length !== 0) {
                news = {
                    dates: news.reduce(function (pre, curr) {
                        pre[curr.application_type] = $filter('date')(curr.deadline, 'yyyy-MM-dd', 'UTC');
                        return pre;
                    }, {})
                };
                promises.push(ApiService.$post(ApiUrlService.institutions.bulkCreateApplicationDates(id), news));
            }
            return $q
                .all(promises)
                . finally(function () {
                    this.dates = new EditableList();
                });
        };

        function getListItems(reload) {
            var url = ApiUrlService.institutions.getList();
            var queryArray = [];
            QueryBuilder.arrayBuilder(queryArray, 'search', this.query);
            QueryBuilder.arrayBuilder(queryArray, 'institution_name', this.institution);
            QueryBuilder.arrayBuilder(queryArray, 'ordering', this.orderingField);
            var queryStr = QueryBuilder.fromArray(queryArray);
            url += queryStr;
            // Pass true as reload argument to update list
            this.items = new infiniteScroll('list', reload, url);
        }

        //TODO: Move this to decorate the API
        function getNextPages(nextUrl, objectName) {
            ApiService.$get(nextUrl)
                .success(function (response) {
                    $scope[objectName] = $scope[objectName].concat(response.results);
                    var next = response.next;
                    if (next) {
                        this.getNextPages(next, objectName);
                    }
                });
        }

        function updateRolling() {
            this.item = {};
            ngDialog.openConfirm({
                template: 'templates/partials/update-rolling.html',
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            })
                .then(function () { //confirm date change
                    var date = (this.item.rollingDate)
                        ? $filter('date')(this.item.rollingDate, 'yyyy-MM-dd', 'UTC')
                        : '';
                    if (date) {
                        ApiService.$post(ApiUrlService.institutions.updateRollingDate(), {'rolling_date': date});
                    }
                });
        }

        function deleteProgram(index) {
            this.deletedPrograms.push(this.programs[index].id);
            this.programs.splice(index, 1);
        }

        function isHiddenProgram(programName) {
            for (var i = 0; i < this.programsOptions.length; i++) {
                if (programName == this.programsOptions[i].display_name) {
                    return false;
                }
            }
            return true;
        }

        function openEditForm(item, index) {
            this.deletedPrograms = [];
            var template = 'templates/partials/institutions-list-view-detail.html';
            ApiService.$get(ApiUrlService.institutions.getItem(item.id))
                .success(function (response) {
                    var originalDetails = {};
                    delete response.details;
                    this.item = angular.copy(response);
                    ApiService
                        .$get(ApiUrlService.institutions.getDeprecatedApplicationDates(item.id))
                        .success(function (response) {
                            var dateConvert = Object
                                .keys(response)
                                .reduce(function (pre, curr) {
                                    pre[curr] = (response[curr])
                                        ? new Date(response[curr])
                                        : null;
                                    return pre;
                                }, {});
                            this.deprecatedDates = dateConvert;
                        });
                    ApiService.$get(ApiUrlService.institutions.getApplicationDates(item.id))
                        .success(function (response) {
                            var dateConvert = response
                                .results
                                .reduce(function (pre, curr) {
                                    pre.push({
                                        deadline: new Date(curr.deadline),
                                        application_type: curr.application_type,
                                        id: curr.id
                                    });
                                    return pre;
                                }, []);
                            this.dates = new EditableList(dateConvert);
                        });
                    ApiService.$get(ApiUrlService.institutions.getDetails(item.id))
                        .success(function (response) {
                            response.financial_aid_deadline = (response.financial_aid_deadline)
                                ? new Date(response.financial_aid_deadline)
                                : null;
                            response.scholarship_deadline = (response.scholarship_deadline)
                                ? new Date(response.scholarship_deadline)
                                : null;
                            this.itemGroups = new EditableList(response.groups);
                            delete response.groups;
                            originalDetails = angular.copy(response);
                            this.details = response;
                        });
                    this.programs = [];
                    ApiService.$get(ApiUrlService.institutions.getPrograms(item.id))
                        .success(function (response) {
                            this.programs = this.programs.concat(response.results);
                            var next = response.next;
                            if (next) {
                                this.getNextPages(next, 'programs');
                            }
                        });
                    this.item.hasNCES = item.unit_id !== null;
                    ngDialog
                        .openConfirm({
                            template: template,
                            className: 'ngdialog-theme-default item-form',
                            scope: $scope,
                            closeByEscape: true,
                            closeByDocument: true
                        })
                        .then(function () { //save and close
                            var institutionChanges = AdminDialog.getObjectChanges(response, this.item);
                            var detailChanges = AdminDialog.getObjectChanges(originalDetails, this.details);
                            var dateConvert = Object
                                .keys(this.deprecatedDates || {})
                                .reduce(function (pre, curr) {
                                    pre[curr] = (this.deprecatedDates[curr])
                                        ? $filter('date')(this.deprecatedDates[curr], 'yyyy-MM-dd', 'UTC')
                                        : null;
                                    return pre;
                                }, {});
                            if (Object.keys(institutionChanges).length > 0 || Object.keys(detailChanges).length > 0) {
                                ApiService
                                    .$patch(ApiUrlService.institutions.update(item.id), institutionChanges)
                                    .success(function (response) {
                                        this.items.items[index] = response;
                                        toastr.info('Institution Updated.');
                                        ApiService.$patch(ApiUrlService.institutions.updateDetails(item.id), detailChanges)
                                            .success(function () {
                                                this.details = {};
                                                toastr.info('Institution Details Updated.');
                                            })
                                            .error(function () {
                                                toastr.error('Institution Details Failed to Update.', 'Error');
                                            });
                                    })
                                    .error(function () {
                                        toastr.error('Institution Failed to Update.', 'Error');
                                    });
                            }
                            patchDeprecatedApplicationDates(item.id, dateConvert);
                            patchApplicationDates(item.id, this.dates);
                            patchGroups({
                                'institutions': [item.id]
                            });
                            for (var j = 0; j < this.deletedPrograms.length; j++) {
                                ApiService.$delete(ApiUrlService.institutions.updatePrograms(this.deletedPrograms[j]))
                                    .error(function () {
                                        toastr.error('Failed to remove \'' + this.programs[j].name + '\' from Institution.', 'Error');
                                    });
                            }
                            for (var i = 0; i < this.programs.length; i++) {
                                if (this.programs[i].value) {
                                    var dataPack = {
                                        'program_category': this.programs[i].value,
                                        'institution': item.id,
                                        'name': this.programs[i].name
                                    };
                                    var name = this.programs[i].name;
                                    ApiService
                                        .$post(ApiUrlService.institutions.addProgram(item.id), dataPack)
                                        .error(function () {
                                            toastr.error('Failed to add \'' + name + '\' to Institution.', 'Error');
                                        });
                                }
                            }
                        });
                });
        }

        function toggleDisable(item, index) {
            var updateText = (item.is_displayed)
                ? 'Institution Disabled.'
                : 'Institution Enabled.';
            var dataPack = {
                'is_displayed': !item.is_displayed
            };
            ApiService
                .$patch(ApiUrlService.institutions.update(item.id), dataPack)
                .success(function (response) {
                    this.items.items[index] = response;
                    toastr.info(updateText);
                })
                .error(function () {
                    toastr.error('Oops, Something went wrong, please try again.', 'Error');
                });
        }

        function openNewItemForm() {
            var template = 'templates/partials/institutions-list-view-detail.html';
            if (!(this.item && this.item.isNew)) {
                this.details = {};
                this.item = {
                    isNew: true
                };
                this.deprecatedDates = {};
                this.programs = [];
                this.dates = new EditableList();
                this.itemGroups = new EditableList();
            }

            ngDialog.openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            })
                .then(function () { //save and close
                    delete this.item.isNew;
                    ApiService.$post(ApiUrlService.institutions.create(), this.item)
                        .success(function (response) {
                            this.items.items.unshift(response);
                            toastr.info('New Institution Created.');
                            patchDeprecatedApplicationDates(response.id, this.deprecatedDates);
                            patchApplicationDates(response.id, this.dates);
                            patchGroups({
                                'institutions': [response.id]
                            });
                            ApiService.$patch(ApiUrlService.institutions.updateDetails(response.id), this.details)
                                .success(function () {
                                    this.details = {};
                                    toastr.info('Institution Details Updated.');
                                })
                                .error(function () {
                                    toastr.error('Institution Details Failed to Update.', 'Error');
                                });
                            for (var i = 0; i < this.programs.length; i++) {
                                if (this.programs[i].value) {
                                    var dataPack = {
                                        'program_category': this.programs[i].value
                                    };
                                    var name = this.programs[i].name;
                                    ApiService
                                        .$patch(ApiUrlService.institutions.updatePrograms(response.id), this.details)
                                        .error(function () {
                                            toastr.error('Failed to add \'' + name + '\' to Institution.', 'Error');
                                        });
                                }
                            }

                        })
                        .error(function (response) {
                            toastr.error(response, 'Error');
                            //keep the information from the last 'Add New' dialog
                            this.item.isNew = true;
                        });

                });
        }

        function addNewGroup(newGroup) {
            if (!newGroup.str) {
                return {};
            }
            newGroup = newGroup.str.split('|');
            var newItem = {
                id: newGroup[0],
                name: newGroup[1],
                newStatus: true
            };
            this.itemGroups.addItem(newItem);
            return {};
        }

        function pushProgram(index) {
            var found = false;
            var programName = this.programsOptions[index].display_name;
            for (var i = 0; i < this.programs.length; i++) {
                if (programName === this.programs[i].name) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.programs.push({
                    name: programName,
                    value: this.programsOptions[index].value
                });
            }
            //return -1 to reset the assocated select box
            return -1;
        }

        function setOrdering(newField) {
            if (newField == '-' + this.sorting.field) {
                this.sorting.direction = 'down';/* descending */
            } else {
                /* ascending */
                this.sorting = {
                    field: newField,
                    direction: 'up'
                };
            }
            this.orderingField = newField;
        }

        function reloadList() {
            this.getListItems();
            this.items.nextPage();
        }

        // File uploading stuff

        function uploadInstitutions(files) {
            this.uploadingInstitutions = true;
            this.errorReport = [];
            var excelFile = files[0];
            getAllInstitutions()
                .then(function () {
                    XLSXReaderService.readFile(excelFile)
                        .then(function (response) {
                            var institutionsData = response.sheets[Object.keys(response.sheets)[0]].data;
                            var institutionKeys = institutionsData[0].filter(function (key) {
                                return key ? true : false;
                            });
                            parseInstitutionsData(institutionsData, 1, institutionKeys).then(function () {
                                downloadInstitutionErrorReportIfReady();
                            });
                        });
                })
                .finally(function () {
                    this.uploadingInstitutions = false;
                });
        }
        init();

        function parseDate(excelDate) {
            // 11/1/2016,1/3/2017 format of m/d/yyyy to yyyy-m-d
            if (excelDate.indexOf(',') > -1) {
                var tempDates = excelDate.split(',').map(function (tempDate) {
                    return tempDate.trim();
                });
                for (var i = 0; i < tempDates.length; i++) {
                    var temp = tempDates[i].split('/');
                    tempDates[i] = temp[2] + '-' + temp[0] + '-' + temp[1];
                }
                return tempDates.join(',').split(',');
            }
            if (excelDate == '') {
                return '';
            }
            var date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
            var result = '';
            result = date.getUTCFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            return [result];
        }

        function parseInstitutionsData(institutionsData, i, institutionKeys) {
            var lastOne = (i == institutionsData.length - 1);
            var institutionObject = buildInstitutionJSONObject(institutionsData[i], institutionKeys);
            return createInstitutionFromExcelData(institutionObject)
                .then(function () {
                    // Final
                    console.log('Done with ' + i + ' of ' + (institutionsData.length - 1));
                    if (lastOne) {
                        var deferred = $q.defer();
                        deferred.resolve(institutionsData);
                        return deferred.promise;
                    } else {
                        return parseInstitutionsData(institutionsData, i + 1, institutionKeys);
                    }
                })
                .catch(function (error) {
                    toastr.error(error);
                    addToErrorReport(institutionObject, error);
                    return parseInstitutionsData(institutionsData, i + 1, institutionKeys);
                });
        }

        function buildInstitutionJSONObject(institutionData, institutionKeys) {
            var institutionObject = {};
            for (var j = 0; j < institutionKeys.length; j++) {
                //setting all url values that do not have a value to null
                if (institutionKeys[j].match('url') !== null
                    && (institutionData[j] === undefined || institutionData[j] === '')) {
                    institutionData[j] = null;
                }
                //formatting data
                if (institutionKeys[j].match('url') !== null
                    && institutionData[j] !== null && typeof institutionData[j].match === 'function'
                    && institutionData[j].match('http') === null) {
                    institutionData[j] = 'https://' + institutionData[j];
                    institutionObject[institutionKeys[j]] = institutionData[j];
                } else if (institutionKeys[j] == 'male_enrollment') {
                    if (institutionData[j]) {
                        institutionObject[institutionKeys[j]] = Math.round(
                            (institutionData[j] / (institutionData[j] + institutionData[institutionKeys.indexOf('female_enrollment')]))
                            * 100
                        );
                    } else {
                        institutionObject[institutionKeys[j]] = institutionData[j];
                    }
                } else if (institutionKeys[j] == 'female_enrollment') {
                    if (institutionData[j]) {
                        institutionObject[institutionKeys[j]] = Math.round(
                            (institutionData[j] / (institutionData[j] + institutionData[institutionKeys.indexOf('male_enrollment')]))
                            * 100
                        );
                    } else {
                        institutionObject[institutionKeys[j]] = institutionData[j];
                    }
                } else if ((institutionKeys[j] == 'sector'
                            || institutionKeys[j] == 'region'
                            || institutionKeys[j] == 'urbanization')
                            && institutionData[j] !== undefined) {
                    institutionObject[institutionKeys[j]] = institutionData[j]
                        ? institutionData[j].toString()
                        : '';
                } else if (institutionKeys[j] === 'group_application' || institutionKeys[j] === 'smart_search_keywords') {
                    institutionObject[institutionKeys[j]] = institutionData[j]
                        ? institutionData[j].split(',')
                        : [];
                } else if (institutionKeys[j] === 'rolling') {
                    if (parseToBool(institutionData[j])) {
                        institutionObject[institutionKeys[j]] = '2016-12-01';
                        // var date = convertExcelSerializedDate(institutionData[j]);
                        // institutionObject[institutionKeys[j]] = $filter( 'date' )( date, 'yyyy-MM-dd', 'UTC' );
                    }
                } else if (this.oldDatesHash[institutionKeys[j]]) {
                    if (institutionData[j]) {
                        if ((typeof institutionData[j] == 'string')
                            && institutionData[j].match(/\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/) !== null) {
                            institutionObject[institutionKeys[j]] = institutionData[j];
                        } else {
                            var date = convertExcelSerializedDate(institutionData[j]);
                            institutionObject[institutionKeys[j]] = $filter('date')(date, 'yyyy-MM-dd', 'UTC');
                        }
                    } else {
                        institutionObject[institutionKeys[j]] = institutionData[j];
                    }
                } else if (this.dateFieldsHash[institutionKeys[j]]) {
                    institutionData[j] = institutionData[j]
                        ? institutionData[j]
                        : '';
                    institutionObject[institutionKeys[j]] = parseDate(institutionData[j].toString());
                } else if (institutionKeys[j] === 'group_app_essays_required'
                            || institutionKeys[j] === 'has_group_app_supplements') {
                    institutionObject[institutionKeys[j]] = parseGroupMultiField(institutionData[j]);
                } else if (institutionData[j] == undefined) {
                    institutionObject[institutionKeys[j]] = null;
                } else if (this.boolFieldsHash[institutionKeys[j]]) {
                    institutionObject[institutionKeys[j]] = parseToBool(institutionData[j]);
                } else {
                    institutionObject[institutionKeys[j]] = institutionData[j];
                }
            }
            return institutionObject;
        }

        function createInstitutionFromExcelData(institutionObject) {
            if (!institutionObject.name) {
                var defer = $q.defer();
                defer.resolve();
                return defer.promise;
            }
            for (var i = 0; i < this.allInstitutions.length; i++) {
                if (this.allInstitutions[i].name == institutionObject.name) {
                    return updateExistingInstitutionFromExcelData(institutionObject, this.allInstitutions[i]);
                }
            }
            return ApiService
                .$post(ApiUrlService.institutions.create(), institutionObject)
                .success(function (institution) {
                    this.dates = new EditableList();
                    var promises = [];
                    setNewApplicationDatesFromExcel(institutionObject);
                    promises.push(patchApplicationDates(institution.id, this.dates));
                    promises.push(
                        ApiService.$patch(
                            ApiUrlService.institutions.updateDetails(institution.id), institutionObject
                        ).success(function () {
                            addInstitutionToGroup(institutionObject.group, this.groupList, institution.id);
                            toastr.info('Updated Institution Details!');
                        }).error(function (error) {
                            toastr.error('Error Updating institution Details!');
                            addToErrorReport(institutionObject, error);
                        }));
                    return $q.all(promises);
                })
                .error(function (error) {
                    addToErrorReport(institutionObject, error);
                });
        }

        //Update the instution, then the dates, then add it to a group
        function updateExistingInstitutionFromExcelData(institutionObject, institution) {
            var institutionChanges = getInstitutionChanges(institutionObject, institution);
            return updateInstitutionAndDetails(institution, institutionChanges, institutionObject)
                .then(function () {
                    return updateApplicationDatesFromExcel(institutionObject, institution).then(function () {
                        return addInstitutionToGroup(institutionObject.group, this.groupList, institution.id);
                    });
                })
                .catch(function (error) {
                    if (error == null) {
                        error = 'Failed to add institution to group';
                    }
                    addToErrorReport(institutionObject, error);
                });
        }

        function updateInstitutionAndDetails(institution, institutionChanges, institutionObject) {
            //update institution
            return ApiService
                .$patch(ApiUrlService.institutions.update(institution.id), institutionChanges)
                .success(function (institution) {
                    //update institution details
                    return ApiService
                        .$patch(ApiUrlService.institutions.updateDetails(institution.id), institutionObject)
                        .success(function () {
                            toastr.info('Updated Institution Details!');
                        })
                        .error(function (error) {
                            toastr.error('Error Updating institution Details!');
                            addToErrorReport(institutionObject, error);
                        });
                })
                .error(function (error) {
                    addToErrorReport(institutionObject, error);
                });
        }

        function addInstitutionToGroup(groupName, institutionGroups, institutionId) {
            if (groupName !== undefined && institutionId !== undefined) {
                this.itemGroups = new EditableList();
                for (var k = 0; k < institutionGroups.length; k++) {
                    var group = institutionGroups[k];
                    if (group.name === groupName) {
                        $scope
                            .itemGroups
                            .addItem({id: group.id, name: groupName, newStatus: true});
                        return patchGroups({'institutions': [institutionId]});
                    }
                }
            }
        }

        function getInstitutionChanges(updatedInstitutionObject, institutionFromAPI) {
            var institutionChanges = {};
            var institutionObjectProperties = Object.keys(updatedInstitutionObject);
            var institutionProperties = Object.keys(institutionFromAPI);
            for (var i = 0; i < institutionProperties.length; i++) {
                if (institutionObjectProperties.indexOf(institutionProperties[i]) !== -1) {
                    if (updatedInstitutionObject[institutionProperties[i]] !== institutionFromAPI[institutionProperties[i]]) {
                        institutionChanges[institutionProperties[i]] = updatedInstitutionObject[institutionProperties[i]];
                    }
                }
            }
            return institutionChanges;
        }

        function updateApplicationDatesFromExcel(institutionObject, institution) {
            var institutionObjectClone = angular.copy(institutionObject);
            return ApiService.$get(ApiUrlService.institutions.getApplicationDates(institution.id))
                .success(function (response) {
                    var applicationDates = response
                        .results
                        .reduce(function (pre, curr) {
                            pre.push({
                                deadline: new Date(curr.deadline),
                                application_type: curr.application_type,
                                id: curr.id
                            });
                            return pre;
                        }, []);

                    if (applicationDates !== []) {
                        var updatedDates = [];
                        for (var i = 0; i < applicationDates.length; i++) {
                            if (!institutionObjectClone['rolling'] && applicationDates[i].application_type === 'Rolling') {
                                deleteRollingDate(applicationDates[i].id, institution.id);
                            }
                            if (institutionObjectClone[this.dateKeyConverter[applicationDates[i].application_type]]) {
                                if (institutionObjectClone[this.dateKeyConverter[applicationDates[i].application_type]] !== applicationDates[i].deadline) {
                                    applicationDates[i].deadline = institutionObjectClone[this.dateKeyConverter[applicationDates[i].application_type]];
                                    applicationDates[i].patchStatus = true;
                                    updatedDates.push(applicationDates[i]);
                                    delete institutionObjectClone[this.dateKeyConverter[applicationDates[i].application_type]];
                                }
                            }
                        }
                        this.dates = new EditableList(updatedDates);
                        patchApplicationDates(institution.id, this.dates);
                    }

                    this.dates = new EditableList();
                    setNewApplicationDatesFromExcel(institutionObjectClone);
                    return patchApplicationDates(institution.id, this.dates);

                });
        }

        function deleteRollingDate(id, institutionId) {
            ApiService.$delete(ApiUrlService.app.institution(institutionId) + '/dates/' + id)
                .success(function () {
                    toastr.info('Rolling deleted');
                })
                .error(function () {
                    toastr.error('Deletion of rolling failed', 'Error');
                });
        }

        function patchGroups(data) {
            var lists = this.itemGroups.separateLists();
            var news = lists.newList,
                deletes = lists.deleteList;
            var promises = [];
            for (var i = 0; i < news.length; i++) {
                promises.push(ApiService.$post(ApiUrlService.groups.add(news[i].id), data).success(function () {
                    toastr.info('Institution Application Dates Updated.');
                }).error(function () {
                    toastr.error('Institution Application Dates Failed to Update.', 'Error');
                }));
            }
            for (var j = 0; j < deletes.length; j++) {
                promises.push(ApiService.$post(ApiUrlService.groups.remove(deletes[j].id), data).success(function () {
                    toastr.info('Institution Application Dates Updated.');
                }).error(function () {
                    toastr.error('Institution Application Dates Failed to Update.', 'Error');
                }));
            }
            return $q.all(promises).finally(function () {
                this.itemGroups = new EditableList();
            });
        }

        function setNewApplicationDatesFromExcel(institutionObject) {
            if (institutionObject['regular_decision'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Regular Decision',
                    deadline: institutionObject['regular_decision'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['rolling']) {
                this.newDeadline = {
                    application_type: 'Rolling',
                    deadline: institutionObject['rolling'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['early_decision'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Early Decision',
                    deadline: institutionObject['early_decision'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['early_decision_2'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Early Decision 2',
                    deadline: institutionObject['early_decision_2'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['early_action'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Early Action',
                    deadline: institutionObject['early_action'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['early_action_2'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Early Action 2',
                    deadline: institutionObject['early_action_2'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['restrictive_early_action'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Restrictive Early Action',
                    deadline: institutionObject['restrictive_early_action'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['priority'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Priority Decision',
                    deadline: institutionObject['priority'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }

            if (institutionObject['priority_2'] !== undefined) {
                this.newDeadline = {
                    application_type: 'Priority Decision 2',
                    deadline: institutionObject['priority_2'],
                    newStatus: true
                };
                this.dates.addItem(this.newDeadline);
            }
        }

        function addToErrorReport(institutionObject, error) {
            if (!this.errorReport[0]) {
                var headers = Object.keys(institutionObject);
                headers.push('error');
                this.errorReport.push(headers);
            }
            var row = [];
            var errorReportHeaders = this.errorReport[0];
            if (error != null) {
                for (var i = 0; i < errorReportHeaders.length; i++) {
                    if (i === errorReportHeaders.length - 1) {
                        var errorKeys = Object.keys(error);
                        var errors = [];
                        for (var j = 0; j < errorKeys.length; j++) {
                            errors.push(errorKeys[j] +
                                    ': ' +
                                    error[errorKeys[j]]);
                        }
                        errors.join('|');
                        row.push(errors);
                    } else {
                        row.push(institutionObject[errorReportHeaders[i]]);
                    }
                }
            }
            this.errorReport.push(row);
        }

        function downloadInstitutionErrorReportIfReady() {
            if (this.errorReport !== []) {
                var csv = createInstitutionsReportCSV(this.errorReport);
                if (csv) {
                    downloadInstitutionsCsv(csv, 'Institution Error Report');
                }
                delete this.errorReport;
                this.uploadingInstitutions = false;
            }
        }

        function createInstitutionsReportCSV(institutionsData) {
            var csvString = undefined;
            for (var i = 0; i < institutionsData.length; i++) {
                if (csvString === undefined) {
                    csvString = institutionsData[i].join(',') + '%0D%0A';
                } else {
                    csvString = csvString + institutionsData[i].join(',') + '%0D%0A';
                }
            }
            if (csvString) {
                var csv = 'data:text/csv;charset=utf-8,' + csvString;
                return csv;
            } else {
                return undefined;
            }

        }

        function downloadInstitutionsCsv(csv, name) {
            var link = document.createElement('a');
            link.setAttribute('href', csv);
            link.setAttribute('download', name);
            link.click();
        }

        function convertExcelSerializedDate(serializedDate) {
            var utc_days = Math.floor(serializedDate - 25568);
            var utc_value = utc_days * 86400;
            var date_info = new Date(utc_value * 1000);
            var fractional_day = serializedDate - Math.floor(serializedDate) + 0.0000001;
            var total_seconds = Math.floor(86400 * fractional_day);
            var seconds = total_seconds % 60;
            total_seconds -= seconds;
            var hours = Math.floor(total_seconds / (60 * 60));
            var minutes = Math.floor(total_seconds / 60) % 60;
            return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
        }

        function getAllInstitutions(next, deferred, institutions) {
            var localDeferred = deferred || $q.defer();
            if (!next) {
                this.loadingAllInstitutions = true;
                institutions = [];
            }
            ApiService.$get(next || ApiUrlService.institutions.getList())
                .success(function (response) {
                    institutions.push.apply(institutions, response.results);
                    if (response.next) {
                        getAllInstitutions(response.next, localDeferred, institutions);
                    } else {
                        localDeferred.resolve(institutions);
                        this.allInstitutions = institutions;
                        this.loadingAllInstitutions = false;
                    }
                })
                .error(function () {
                    toastr.error('Error fetching all institutions');
                    this.loadingAllInstitutions = false;
                });
            return localDeferred.promise;
        }

        function parseGroupMultiField(unparsedMultiField) {
            var result = {};
            if (unparsedMultiField && unparsedMultiField !== 'F') {
                var tempArray = unparsedMultiField.split(',');
                for (var i = 0; i < tempArray.length; i++) {
                    var values = tempArray[i].split(':');
                    result[values[0].toLowerCase()] = parseToBool(values[1]);
                }
            }
            return result;
        }

        function parseToBool(boolString) {
            return (boolString === 'T' || boolString === true || boolString === 'R');
        }

        // Run on Load
        function init() {
            ApiService.$get(ApiUrlService.institutions.getFilters())
                .success(function (response) {
                    this.programsOptions = [];
                    if (response.program) {
                        this.programsOptions = response.program.choices || [];
                    }
                });
            $http({
                'url': ApiUrlService.institutions.getDetails(0),
                'method': 'OPTIONS'
            }).then(function (response) {
                var data = response.data.actions.PUT;
                this.essayRequiredChoices = data.essay_required.choices;
                this.interviewImportanceChoices = data.interview_importance.choices;
                this.lettersOfRecommendationChoices = data.letters_of_recommendation.choices;
                this.testAcceptedChoices = data.test_accepted.choices;
                this.transcriptsOrReportChoices = data.transcripts_or_report.choices;
            });
            ApiService.$get(ApiUrlService.groups.getList())
                .success(function (response) {
                    var results = response.results;
                    this.groupList = results.reduce(function (pre, curr) {
                        pre.push({'id': curr.id, 'name': curr.name});
                        return pre;
                    }, []);
                });
            this.getListItems();
        }
    }
})();
