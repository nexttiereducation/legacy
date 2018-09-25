(function() {
    'use strict';

    angular
        .module('adminModule')
        .controller('TasksCtrl', TasksCtrl);

    TasksCtrl.$inject = ['$scope', '$rootScope', '$location',
        'infiniteScroll', 'ApiUrlService', 'ApiService', 'ngDialog',
        'AdminDialog', '$filter', 'QueryBuilder', '$q', 'EditableList',
        '$http', 'StakeholderAuth', 'ConditionalTaskManager'
    ];

    function TasksCtrl($scope, $rootScope, $location, infiniteScroll,
        ApiUrlService, ApiService, ngDialog, AdminDialog, $filter,
        QueryBuilder, $q, EditableList, $http, StakeholderAuth,
        ConditionalTaskManager) {
        this.items = [];
        this.filterItems = {};
        this.orderingField = '';
        this.ctaOptions = {};
        this.sorting = {
            field: '',
            direction: ''
        };
        this.taskCategories = ['Freshmen', 'Sophomores', 'Juniors',
            'Seniors', 'Counselors', 'Tutorial'
        ];
        $http({
            method: 'OPTIONS',
            url: ApiUrlService.tasks.getItem(0),
            headers: {
                'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken()
            }
        }).then(function(response) {
            this.officialPhases = response.data.actions.PUT.phases_choices;
        });
        //TODO eventually replace the above, with the below
        ApiService.$get(ApiUrlService.dropDowns.phases()).success(function(
            response) {
            $rootScope.phaseList = response.data;
        });

        function phaseList(phaseIds) {
            if (!$rootScope.phaseList) { return phaseIds; }
            var result = [];
            var len = phaseIds.length;
            while (len--) {
                var phaseLen = $rootScope.phaseList.length;
                while (phaseLen--) {
                    if ($rootScope.phaseList[phaseLen].id === phaseIds[len]) {
                        result.push($rootScope.phaseList[phaseLen].name);
                        break;
                    }
                }
            }
        }

        function getListItems(reload) {
            var url = ApiUrlService.tasks.getList();
            var queryArray = [];
            QueryBuilder.arrayBuilder(queryArray, 'name', this.name);
            QueryBuilder.arrayBuilder(queryArray, 'institution_name', this.institution);
            QueryBuilder.arrayBuilder(queryArray, 'is_template', this.is_template);
            QueryBuilder.arrayBuilder(queryArray, 'phase', this.phase);
            QueryBuilder.arrayBuilder(queryArray, 'task_type', this.task_type);
            QueryBuilder.arrayBuilder(queryArray, 'ordering', this.orderingField);
            var queryStr = QueryBuilder.fromArray(queryArray);
            url += queryStr;
            // Pass true as reload argument to update list
            this.items = new infiniteScroll('list', reload, url);
        }

        function openEditForm(item, index) {
            var template = 'templates/partials/tasks-list-view-detail.html';
            ApiService.$get(ApiUrlService.tasks.getItem(item.id)).success(
                function(response) {
                    this.item = response;
                    this.categories = (response.category && response.category.length > 0)
                        ? response.category.split(',')
                        : [];
                    ApiService.$get(ApiUrlService.tasks.getDeadlines(item.id))
                        .success(function(response) {
                            var dateConvert = response.results.reduce(
                                function(pre, curr) {
                                    if (curr.start_date === null && curr.deadline === null) {
                                        pre.push({
                                            start_date: curr.start_date,
                                            start_date_offset: curr.start_date_offset,
                                            deadline: curr.deadline,
                                            deadline_offset: curr.deadline_offset,
                                            id: curr.id
                                        });
                                    } else if (curr.start_date === null) {
                                        pre.push({
                                            start_date: curr.start_date,
                                            start_date_offset: curr.start_date_offset,
                                            deadline: new Date(
                                                curr.deadline
                                            ),
                                            deadline_offset: curr.deadline_offset,
                                            id: curr.id
                                        });
                                    } else if (curr.deadline === null) {
                                        pre.push({
                                            start_date: new Date(curr.start_date),
                                            start_date_offset: curr.start_date_offset,
                                            deadline: curr.deadline,
                                            deadline_offset: curr.deadline_offset,
                                            id: curr.id
                                        });
                                    } else {
                                        pre.push({
                                            start_date: new Date(curr.start_date),
                                            start_date_offset: curr.start_date_offset,
                                            deadline: new Date(curr.deadline),
                                            deadline_offset: curr.deadline_offset,
                                            id: curr.id
                                        });
                                    }
                                    return pre;
                                }, []);
                            this.dates = new EditableList(dateConvert);
                        });
                    ngDialog.openConfirm({
                        template: template,
                        className: 'item-form ngdialog-theme-default',
                        scope: $scope,
                        closeByEscape: true,
                        closeByDocument: true
                    })
                        .then(function() {
                            if (this.item.phase == 'Non Applicant') {
                                this.item.phase = 'Universal Student';
                            }
                            this.item.category = this.categories.length > 0
                                ? this.categories.join(',')
                                : null;
                            this.item.scholarship = this.item.scholarship
                                ? this.item.scholarship.id
                                : null;
                            ApiService.$patch(ApiUrlService.tasks.update(item.id), this.item)
                                .success(function(response) {
                                    this.items.items[index] = response;
                                    toastr.info('Item Updated.');
                                }).error(function() {
                                    toastr.error(
                                        'Oops, Something went wrong, please try again.',
                                        'Error'
                                    );
                                });
                            patchApplicationDates(item.id, this.dates);
                        });
                });
        }

        function toggleDisable(item, index) {
            var updateText = (item.is_active) ? 'Task Disabled.' : 'Task Enabled.';
            var dataPack = {
                'is_visible': !item.is_visible
            };
            ApiService.$patch(ApiUrlService.tasks.update(item.id), dataPack)
                .success(function(response) {
                    this.items.items[index] = response;
                    toastr.info(updateText);
                }).error(function() {
                    toastr.error(
                        'Oops, Something went wrong, please try again.',
                        'Error'
                    );
                });
        }

        function openNewItemForm() {
            var template = 'templates/partials/tasks-list-view-detail.html';
            if (!(this.item && this.item.isNew)) {
                this.item = { isNew: true, is_visible: true, phases: [] };
                this.categories = [];
            }
            this.dates = new EditableList();
            ngDialog.openConfirm({
                template: template,
                className: 'ngdialog-theme-default item-form',
                scope: $scope,
                closeByEscape: true,
                closeByDocument: true
            })
                .then(function() {
                    delete this.item.isNew;
                    this.item.category = this.categories.length > 0 ?
                        this.categories.join(',') : null;
                    ApiService.$post(ApiUrlService.tasks.create(), this
                        .item).success(function(response) {
                        this.items.items.unshift(response);
                        patchApplicationDates(response.id, this
                            .dates);
                        toastr.info('New Item Created.');
                    }).error(function(response) {
                        toastr.error(response, 'Error');
                        this.item.isNew = true;
                    });
                },
                function() {
                    delete this.item;
                });
        }

        function lookupInstitution(newId) {
            this.item.institution_name = '-';
            ApiService.$get(ApiUrlService.institutions.getItem(newId))
                .success(function(response) {
                    this.item.institution_name = response.name;
                }).error(function() {
                    toastr.error(
                        'Could not find an institution with that ID.',
                        'Error'
                    );
                });
        }
        var patchApplicationDates = function(id, data) {
            var lists = data.separateLists();
            var patches = lists.patchList,
                news = lists.newList,
                deletes = lists.deleteList;
            news = news.reduce(function(pre, curr) {
                if (curr.start_date && (curr.start_date_offset
                    && curr.start_date_offset.length > 0
                    && curr.start_date_offset != 0)) {
                    return;
                }
                if (curr.deadline && (curr.deadline_offset &&
                    curr.deadline_offset.length > 0
                    && curr.deadline_offset != 0)) {
                    return;
                }
                var set = {
                    item: {
                        deadline: $filter('date')(curr.deadline, 'yyyy-MM-dd', 'UTC'),
                        deadline_offset: +curr.deadline_offset,
                        start_date: $filter('date')(curr.start_date, 'yyyy-MM-dd', 'UTC'),
                        start_date_offset: +curr.start_date_offset
                    }
                };
                pre.push(set);
                return pre;
            }, []);
            patches = patches.reduce(function(pre, curr) {
                if (curr.start_date && (curr.start_date_offset
                    && curr.start_date_offset.length > 0
                    && curr.start_date_offset != 0)) {
                    return;
                }
                if (curr.deadline && (curr.deadline_offset
                    && curr.deadline_offset.length > 0
                    && curr.deadline_offset != 0)) {
                    return;
                }
                var set = {
                    id: curr.id,
                    item: {
                        deadline: $filter('date')(curr.deadline, 'yyyy-MM-dd', 'UTC'),
                        deadline_offset: curr.deadline_offset,
                        start_date: $filter('date')(curr.start_date, 'yyyy-MM-dd', 'UTC'),
                        start_date_offset: curr.start_date_offset
                    }
                };
                pre.push(set);
                return pre;
            }, []);
            var promises = [];
            for (var i = 0; i < news.length; i++) {
                promises.push(
                    ApiService.$post(ApiUrlService.tasks.createDeadlines(id), news[i].item)
                        .success(function() {
                            toastr.info('Institution Application Dates Updated.');
                        }).error(function() {
                            toastr.error(
                                'Institution Application Dates Failed to Update.',
                                'Error');
                        })
                );
            }
            for (var j = 0; j < patches.length; j++) {
                promises.push(ApiService.$patch(
                    ApiUrlService.tasks.updateDeadlines(id, patches[j].id), patches[j].item)
                    .success(function() {
                        toastr.info('Institution Application Dates Updated.');
                    }).error(function() {
                        toastr.error(
                            'Institution Application Dates Failed to Update.',
                            'Error');
                    }));
            }
            for (var k = 0; k < deletes.length; k++) {
                promises.push(ApiService.$delete(
                    ApiUrlService.tasks.updateDeadlines(id, deletes[k].id))
                    .success(function() {
                        toastr.info('Institution Application Dates Updated.');
                    }).error(function() {
                        toastr.error(
                            'Institution Application Dates Failed to Update.',
                            'Error');
                    }));
            }
            $q.all(promises).finally(function() {
                this.dates = new EditableList();
            });
        };

        function toDate(dateStr) {
            if (!dateStr) { return ''; }
            return new Date(dateStr);
        }

        function toDateStr(date) {
            return $filter('date')(date, 'yyyy-MM-dd', 'UTC');
        }

        function setPhase(phaseId) {
            if (this.item.phases.indexOf(phaseId) === -1) {
                this.item.phases.push(phaseId);
            } else {
                var indexOfPhase = this.item.phases.indexOf(phaseId);
                this.item.phases.splice(indexOfPhase, 1);
            }
        }

        function setCategory(category) {
            this.item.category.push(category);
        }

        function setOrdering(newField) {
            if (newField == '-' + this.sorting.field) {
                this.sorting.direction = 'down'; /*descending*/
            } else {
                /*ascending*/
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

        function addNewDeadline(newDeadline) {
            if (newDeadline.start_date && (newDeadline.start_date_offset
                && newDeadline.start_date_offset.length > 0
                && newDeadline.start_date_offset != 0)) {
                this.newDeadlineError = 'Cannot Set Values for both Start Date and Start Offset';
                throw 'Cannot Set Values for both Start Date and Start Offset';
            }
            if (newDeadline.deadline && (newDeadline.deadline_offset
                && newDeadline.deadline_offset.length > 0
                && newDeadline.deadline_offset != 0)) {
                this.newDeadlineError = 'Cannot Set Values for both Deadline and Deadline Offset';
                throw 'Cannot Set Values for both Deadline and Deadline Offset';
            }
            var newDeadlineCopy = angular.copy(newDeadline);
            this.dates.addItem(newDeadlineCopy);
            newDeadline.start_date = '';
            newDeadline.start_date_offset = '';
            newDeadline.deadline = '';
            newDeadline.deadline_offset = '';
        }

        function deadlineChanged(deadline) {
            if (deadline.start_date && (deadline.start_date_offset
                && deadline.start_date_offset.length > 0
                && deadline.start_date_offset != 0)) {
                this.deadlineError = 'Cannot Set Values for both Start Date and Start Offset';
                throw 'Cannot Set Values for both Start Date and Start Offset';
            }
            if (deadline.deadline && (deadline.deadline_offset
                && deadline.deadline_offset.length > 0
                && deadline.deadline_offset != 0)) {
                this.deadlineError = 'Cannot Set Values for both Deadline and Deadline Offset';
                throw 'Cannot Set Values for both Deadline and Deadline Offset';
            }
            this.deadlineError = '';
            deadline.patchStatus = true;
        }
        var formatTypes = function(type) {
            var formatted = [];
            var unformatted = this.ctaOptions[type];
            for (var i = 0; i < unformatted.length; i++) {
                formatted.push({
                    abbv: Object.keys(unformatted[i])[0],
                    name: Object.values(unformatted[i])[0]
                });
            }
            this.ctaOptions[type] = formatted;
        };
        // Run on Load
        var init = function() {
            this.getListItems();
            ConditionalTaskManager.getConditionalTaskOptions()
                .then(function(result) {
                    this.ctaOptions = result;
                    formatTypes('taskTypes');
                    formatTypes('anchors');
                });
        };
        init();
    }
})();
