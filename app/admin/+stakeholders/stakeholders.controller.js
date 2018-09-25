(function() {
    'use strict';

    angular
        .module('adminModule')
        .controller('StakeholdersCtrl',

            [ '$q', '$scope',
                '$window', '$rootScope', 'infiniteScroll', 'ApiUrlService', 'ApiService',
                'XLSXReaderService', 'ngDialog', 'AdminDialog', 'QueryBuilder',
                'NotificationPreference', '$filter', '$http', 'StakeholderAuth',
                '$location', 'CsvExport', 'jsUtilities',

                function($q, $scope, $window, $rootScope, infiniteScroll, ApiUrlService,
                    ApiService, XLSXReaderService, ngDialog, AdminDialog, QueryBuilder,
                    NotificationPreference, $filter, $http, StakeholderAuth,
                    $location, CsvExport, jsUtilities) {

                    this.items = [];
                    this.filterItems = {};
                    this.query = '';
                    this.userLookup = {};
                    this.orderingField = 'email';
                    this.myRoles = [];
                    this.rolesToChange = [];
                    this.host = $location.host().replace(/^admin[\.\-]?/, '');
                    this.sorting = {
                        field: '',
                        direction: ''
                    };
                    this.passwordChange = {
                        email: null,
                        newPassword: null,
                        confirmPassword: null
                    };
                    this.changePasswordStatus = {};
                    function getRoleItems() {
                        ApiService.$get(ApiUrlService.entitlements.getRoleList()).success(
                            function(response) {
                                this.myRoles = response.results;
                            }).error(function(response) {
                            toastr.error(response, 'Error');
                        });
                    }
                    $http({
                        method: 'OPTIONS',
                        url: ApiUrlService.tasks.getItem(0),
                        headers: {
                            'AUTHORIZATION': 'Token ' + StakeholderAuth.getAuthToken()
                        }
                    }).then(function(response) {
                        this.officialPhases = response.data.actions.PUT.phases_choices;
                    });
                    function toDate(dateStr) {
                        if (!dateStr) {
                            return '';
                        }
                        return new Date(dateStr);
                    }
                    function getListItems(reload) {
                        var url = ApiUrlService.stakeholders.getList();
                        var queryArray = [];
                        QueryBuilder.arrayBuilder(queryArray, 'email', this.query);
                        QueryBuilder.arrayBuilder(queryArray, 'ordering',
                            this.orderingField);
                        if (this.hideAnonymous) {
                            QueryBuilder.arrayBuilder(queryArray, 'type', 'Student');
                            QueryBuilder.arrayBuilder(queryArray, 'type', 'Parent');
                            QueryBuilder.arrayBuilder(queryArray, 'type', 'Counselor');
                        }
                        var queryStr = QueryBuilder.fromArray(queryArray);
                        url += queryStr;
                        // Pass true as reload argument to update list
                        this.items = new infiniteScroll('list', reload, url);
                    }
                    function getNextPages(nextUrl, objectName) {
                        ApiService.$get(nextUrl).success(function(response) {
                            $scope[objectName] = $scope[objectName].concat(
                                response.results);
                            var next = response.next;
                            if (next) {
                                this.getNextPages(next, objectName);
                            }
                        });
                    }
                    // Run on Load
                    function init() {
                        this.getRoleItems();
                        this.getListItems();
                    }
                    function openFormToQueryStakeholders() {
                        var template = 'templates/partials/export-stakeholders-report.html';
                        this.item = { isNew: true };
                        this.registrationFilter = false;
                        ngDialog.openConfirm({
                            template: template,
                            className: 'ngdialog-theme-default item-form',
                            scope: $scope,
                            closeByEscape: true,
                            closeByDocument: true
                        }).then(function() {
                            exportStakeholdersReport();
                        });
                    }
                    function openEditForm(item, index) {
                        this.rolesToChange = [];
                        var itemId = item.id;
                        var template =
            'templates/partials/stakeholders-list-view-detail.html';
                        this.sheets = undefined;
                        this.connections = [];
                        this.deletedConnections = [];
                        ApiService.$get(ApiUrlService.stakeholders.getItem(itemId)).success(
                            function(response) {
                                this.previewSpreadsheet = false;
                                this.item = response;
                                var isAmbassador = response.is_ambassador;
                                checkRoles();
                                this.userLookup = {};
                                //get connections
                                this.item.connectionType = this.getConnectionType(
                                    response.stakeholder_type);
                                this.item.displayConnectionType = this.getDisplayConnectionType(
                                    response.stakeholder_type);
                                if (response.stakeholder_type !=='Anonymous') {
                                    var field = (response.stakeholder_type === 'Student')
                                        ? 'student_email' : 'adult_email';
                                    var queryObj = {};
                                    queryObj[field] = response.email;
                                    var url = ApiUrlService.stakeholders.getConnections() +
                          QueryBuilder.fromObject(queryObj);
                                    ApiService.$get(url).success(function(response) {
                                        this.connections = response.results;
                                        if (response.next) {
                                            this.getNextPages(
                                                response.next,
                                                'connections');
                                        }
                                    });
                                }
                                //get notification preferences
                                this.notifications = new NotificationPreference(itemId);
                                this.notifications.get();
                                ngDialog.openConfirm({
                                    template: template,
                                    className: 'ngdialog-theme-default item-form',
                                    scope: $scope,
                                    closeByEscape: true,
                                    closeByDocument: true
                                }).then(function() {
                                    finalizeRoleChange();
                                    if (this.item.gender) {
                                        delete this.item.gender;
                                    }
                                    delete this.item.student_connections;
                                    delete this.item.adult_connections;
                                    ApiService.$patch(ApiUrlService.stakeholders
                                        .update(itemId), $scope.item)
                                        .success(function(
                                            response) {
                                            this.items.items[index] = response;
                                            toastr.info(
                                                'Item Updated.'
                                            );
                                            var linkToken = response.ambassador_uid;
                                            if (response.is_ambassador && !isAmbassador) {
                                                //this user is a new ambassador, show their url
                                                ngDialog.open({
                                                    plain: true,
                                                    template: '<p>Stakeholder\'s ambassador link is: ' +
                                            $scope
                                                .host +
                                            '/join?aid=' +
                                            linkToken,
                                                    showClose: true
                                                });
                                            }
                                        }).error(function() {
                                            toastr.error(
                                                'Oops, Something went wrong, please try again.',
                                                'Error');
                                        });
                                    //update notifications
                                    this.notifications.update();
                                    //remove deleted connections
                                    for (var j = 0; j < this.deletedConnections.length; j++) {
                                        ApiService.$delete(
                                            ApiUrlService.stakeholders.deleteConnection(this.deletedConnections[j])
                                        )
                                            .error(
                                                function() {
                                                    toastr.error(
                                                        'Failed to remove a connection.',
                                                        'Error'
                                                    );
                                                });
                                    }
                                    //add new connections
                                    for (var i = 0; i < this.connections.length; i++) {
                                        if (!this.connections[i].id) {
                                            var dataPack = this.connections[i];
                                            ApiService.$post(
                                                ApiUrlService.stakeholders.createConnection(),
                                                dataPack
                                            ).error(
                                                function() {
                                                    toastr.error(
                                                        'Failed to add a connection.',
                                                        'Error'
                                                    );
                                                });
                                        }
                                    }
                                });
                            });
                    }
                    function changePassword() {
                        if (this.passwordChange.newPassword !== this.passwordChange
                            .confirmPassword) {
                            this.changePasswordStatus = {
                                show: true,
                                success: false,
                                message: 'Passwords Do Not Match'
                            };
                            return;
                        }
                        var data = {
                            email: this.passwordChange.email,
                            new_password: this.passwordChange.newPassword,
                            new_password_confirm: this.passwordChange.confirmPassword
                        };
                        StakeholderAuth.changePassword(data)
                            .then(function() {
                                this.changePasswordStatus = {
                                    show: true,
                                    success: true,
                                    message: 'Successfully Changed Password'
                                };
                            }).catch(function() {
                                this.changePasswordStatus = {
                                    show: true,
                                    success: false,
                                    message: 'Error Changing Password. Please confirm your current password is correct and try again.'
                                };
                            });
                        this.passwordChange = {};
                    }
                    function checkRoles() {
                        ApiService.$get(ApiUrlService.stakeholders.roles(this.item.id))
                            .success(
                                function(response) {
                                    this.item.entitledRoles = response.results;
                                    setCheckboxValue();
                                }).error(function() {
                                toastr.error(
                                    'Oops, Something went wrong, please try again.',
                                    'Error');
                            });
                    }
                    function setCheckboxValue() {
                        this.item.roles = this.myRoles;
                        if (this.item.entitledRoles.length === 0) {
                            for (var i = 0; i < this.myRoles.length; i++) {
                                this.item.roles[i].checked = false;
                            }
                        } else {
                            for (var i = 0; i < this.myRoles.length; i++) {
                                for (var j = 0; j < this.item.entitledRoles.length; j++) {
                                    if (this.item.roles[i].id === this.item.entitledRoles[
                                        j].id) {
                                        this.item.roles[i].checked = true;
                                        break;
                                    } else {
                                        this.item.roles[i].checked = false;
                                    }
                                }
                            }
                        }
                    }
                    function toggleDisable(item, index) {
                        var updateText = (item.is_active) ?
                            'Stakeholder Disabled.' : 'Stakeholder Enabled.';
                        var dataPack = {
                            'is_active': !item.is_active
                        };
                        ApiService.$patch(
                            ApiUrlService.stakeholders.update(item.id),
                            dataPack
                        ).success(function(response) {
                            this.items.items[index] = response;
                            toastr.info(updateText);
                        }).error(function() {
                            toastr.error(
                                'Oops, Something went wrong, please try again.',
                                'Error');
                        });
                    }
                    function openPhaseDatesForm() {
                        var template =
                                                                'templates/partials/phase-transition-dates.html';
                        ApiService.$get(ApiUrlService.stakeholders.getPhaseDates()).success(
                            function(response) {
                                this.dates = response.results;
                                ngDialog.openConfirm({
                                    template: template,
                                    className: 'ngdialog-theme-default item-form',
                                    scope: $scope,
                                    closeByEscape: true,
                                    closeByDocument: true
                                }).then(function() // save and close
                                {
                                    ApiService.$put(ApiUrlService.stakeholders
                                        .updatePhaseDates(),
                                    this.dates).success(
                                        function(response) {
                                            toastr.info(
                                                'Phase Transition Dates Updated.'
                                            );
                                        }).error(function() {
                                        toastr.error(
                                            'Oops, Something went wrong, please try again.',
                                            'Error');
                                    });
                                });
                            });
                    }
                    function openNewItemForm() {
                        var template =
                                                                        'templates/partials/stakeholders-list-view-detail.html';
                        if (!(this.item && this.item.isNew)) {
                            this.item = { isNew: true };
                        }
                        this.previewSpreadsheet = false;
                        this.connections = [];
                        this.userLookup = {};
                        //get notification preferences
                        this.notifications = new NotificationPreference();
                        ngDialog.openConfirm({
                            template: template,
                            className: 'ngdialog-theme-default item-form',
                            scope: $scope,
                            closeByEscape: true,
                            closeByDocument: true
                        }).then(function() //save and close
                        {
                            if (this.item.gender) {
                                delete this.item.gender;
                            }
                            ApiService.$post(ApiUrlService.stakeholders.create(),
                                this.item).success(function(
                                response) {
                                toastr.info('Item Updated.');
                                //update notifications
                                this.notifications.setId(
                                    response.id);
                                this.notifications.update();
                                //add new connections
                                for (var i = 0; i < this.connections
                                    .length; i++) {
                                    if (!this.connections[i].id) {
                                        var dataPack = this.connections[
                                            i];
                                        ApiService.$post(ApiUrlService.stakeholders
                                            .createConnection(),
                                        dataPack).error(
                                            function() {
                                                toastr.error(
                                                    'Failed to add a connection.',
                                                    'Error'
                                                );
                                            });
                                    }
                                }
                            }).error(function() {
                                toastr.error(
                                    'Oops, Something went wrong, please try again.',
                                    'Error');
                            });
                        });
                    }
                    function lookupConnection(connectionId) {
                        this.userLookup = {};
                        ApiService.$get(ApiUrlService.stakeholders.getItem(connectionId)).success(
                            function(response) {
                                this.userLookup = response;
                            }).error(function() {
                            toastr.error(
                                'Could not find a stakeholder with that ID.',
                                'Error');
                        });
                    }
                    function pushConnection(connectionId) {
                        var recipientType = (this.item.connectionType ===
                                                                                            'adult_email') ? 'student_email' :
                            'adult_email';
                        var pushItem = {};
                        pushItem[this.item.connectionType] = this.item.email;
                        pushItem[recipientType] = this.userLookup.email;
                        this.connections.push(pushItem);
                        //reset the input field
                        return '';
                    }
                    function deleteConnection(index) {
                        this.deletedConnections.push(this.connections[index]
                            .id);
                        this.connections.splice(index, 1);
                    }
                    function getConnectionType(stakeholder_type) {
                        if (stakeholder_type === 'Student') {
                            return 'student_email';
                        } else if (stakeholder_type !== 'Anonymous') {
                            return 'adult_email';
                        }
                        return '';
                    }
                    function finalizeRoleChange() {
                        for (var i = 0; i < this.rolesToChange.length; i++) {
                            changeRoleAssociation(this.rolesToChange[i]);
                        }
                        this.rolesToChange = [];
                    }
                    function fileChanged(files) {
                        this.sheets = undefined;
                        this.invitesSent = false;
                        this.excelFile = files[0];
                        XLSXReaderService.readFile(this.excelFile).then(
                            function(response) {
                                this.sheets = response.sheets[Object.keys(
                                    response.sheets)[0]].data;
                                this.previewSpreadsheet = true;
                            }).catch(function(error) {
                            toastr.error(error);
                        });
                    }
                    function invite() {
                        var firstRow = this.sheets[0];
                        if (firstRow.indexOf('email') !== -1) {
                            var emailIndex = firstRow.indexOf('email');
                            for (var row = 0; row < this.sheets.length; row++) {
                                if (row > 0 && isValidInviteData(row,
                                    emailIndex)) {
                                    var studentEmail = this.sheets[row][
                                        emailIndex
                                    ];
                                    var counselorEmail = this.item.email;
                                    postInvite(studentEmail, counselorEmail,
                                        row);
                                } else if (row > 0 && !isValidInviteData(row,
                                    emailIndex)) {
                                    if (this.sheets[row][emailIndex] ===
                                                                                                                undefined || this.sheets[row][
                                        emailIndex
                                    ] === '') {
                                        this.sheets[row].push(
                                            'failed: email cell is blank');
                                    } else {
                                        this.sheets[row].push(
                                            'failed: email ' + this.sheets[
                                                row][emailIndex] +
                                                                                                                        ' is invalid.');
                                    }
                                }
                            }
                        } else {
                            toastr.error('Invalid excel format.');
                        }
                        this.invitesSent = true;
                        angular.forEach(angular.element(document.querySelector(
                            'input[type=\'file\']')), function(inputElem) {
                            angular.element(inputElem).val(null);
                        });
                    }
                    function isValidInviteData(row, emailIndex) {
                        var email = this.sheets[row][emailIndex];
                        if (email !== undefined && email.match(
                            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
                        ) !== null) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    function postInvite(studentEmail, counselorEmail,
                        instanceOfStudent) {
                        var data = {
                            email: studentEmail,
                            invite_type: 'Student',
                            from_email: counselorEmail
                        };
                        ApiService.$post(ApiUrlService.stakeholders.invite(), data).success(
                            function() {
                                this.sheets[instanceOfStudent].push('sent');
                            }).error(function(error) {
                            if (error.Detail ==
                                                                                                                          'You are already connected to this email.') {
                                this.sheets[instanceOfStudent].push(
                                    'already connected');
                            } else {
                                this.sheets[instanceOfStudent].push(
                                    'failed');
                            }
                        });
                    }
                    function statusColor(status) {
                        if (status == 'sent') {
                            return { 'background-color': 'green', color: 'white' };
                        } else if (status == 'already connected') {
                            return { 'background-color': 'orange', color: 'white' };
                        } else if (status !== undefined && status.match(
                            'failed') !== null) {
                            return { 'background-color': 'red', color: 'white' };
                        }
                    }
                    function hasStatus(inviteRow) {
                        if (inviteRow.indexOf('sent') === -1 && inviteRow.indexOf(
                            'already connected') === -1 && !
                        inviteFromFileFailed(inviteRow)) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    function inviteFromFileFailed(inviteRow) {
                        for (var i = 0; i < inviteRow.length; i++) {
                            if (i == inviteRow.length - 1) {
                                if (inviteRow[i] && inviteRow[i].match('failed') !==
                                                                                                                                    null) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                    function changeRoleAssociation(role) {
                        var isAssociated = checkIfAssociated(role);
                        if (isAssociated) {
                            unassociateRole(role);
                        } else {
                            associateRole(role);
                        }
                    }
                    function queueForChange(role) {
                        if (this.rolesToChange.indexOf(role) < 0) {
                            this.rolesToChange.push(role);
                        } else {
                            removeFromQueue(role);
                        }
                    }
                    function removeFromQueue(role) {
                        this.rolesToChange.splice(this.rolesToChange.indexOf(
                            role), 1);
                    }
                    function unassociateRole(role) {
                        ApiService.$delete(ApiUrlService.stakeholders.removeRole(this.item.id,
                            role.id)).success(function(response) {
                            toastr.info(
                                'successfully deleted role association!'
                            );
                        }).error(function() {
                            toastr.error('Some Error Occurred', 'Error');
                        });
                    }
                    function checkIfAssociated(role) {
                        var isAssociated = false;
                        if (this.item.entitledRoles.length === 0) {
                            isAssociated = false;
                        } else {
                            for (var i = 0; i < this.item.entitledRoles.length; i++) {
                                if (role.id === this.item.entitledRoles[i].id) {
                                    isAssociated = true;
                                    break;
                                }
                            }
                        }
                        return isAssociated;
                    }
                    function associateRole(role) {
                        ApiService.$post(ApiUrlService.stakeholders.addRole(), {
                            'role_name': role.name,
                            'user_id': this.item.id
                        }).success(function(response) {
                            toastr.info('successfully associated role!');
                        }).error(function() {
                            toastr.error('Some Error Occurred', 'Error');
                        });
                    }
                    function getDisplayConnectionType(stakeholder_type) {
                        if (stakeholder_type === 'Student') {
                            return 'adult_email';
                        } else if (stakeholder_type !== 'Anonymous') {
                            return 'student_email';
                        }
                        return '';
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
                    var exportAmbassadorCsv = function(fileName, data) {
                        if (!data.match(/^data:text\/csv/i)) {
                            data = 'data:text/csv;charset=utf-8,' + data;
                        }
                        data = encodeURI(data);
                        var link = document.createElement('a');
                        link.setAttribute('href', data);
                        link.setAttribute('download', fileName);
                        link.click();
                    };
                    var exportReferencesCsv = function(fileName, data, ambassador) {
                        if (!data.match(/^data:text\/csv/i)) {
                            data = 'data:text/csv;charset=utf-8,' + data;
                        }
                        data = encodeURI(data);
                        //add ambassador_id to csv header
                        data = addAmbassadorIdtoCsvHeader(data);
                        //check if ambassador has references
                        //if so, add ambassador_uid to ambassador_id column in csv
                        var hasAmbassadorReference = (data.indexOf('%0D%0A') +
                                                                                                                                    6) !== data.length;
                        if (hasAmbassadorReference) {
                            addAmbassadorUidToCsv(data, '%0D%0A', 2, ambassador);
                            data = this.table;
                            delete this.table;
                        }
                        var link = document.createElement('a');
                        link.setAttribute('href', data);
                        link.setAttribute('download', fileName);
                        link.click();
                    };
                    function exportStakeholdersReport(next, deferred, stakeholders) {
                        this.isExportingStakeholdersReport = true;
                        var localDeferred = deferred || $q.defer();
                        if (!next) {
                            var stakeholders = [];
                        }
                        ApiService.$get(next || ApiUrlService.stakeholders.getList()).success(
                            function(response) {
                                stakeholders.push.apply(stakeholders, response.results);
                                if (response.next) {
                                    exportStakeholdersReport(response.next,
                                        localDeferred, stakeholders);
                                } else {
                                    localDeferred.resolve(stakeholders);
                                    var stakeholdersData =
                                                                                                                                            compileStakeholdersData(stakeholders);
                                    var csv = createStakeholdersReportCSV(
                                        stakeholdersData);
                                    downloadStakeholdersReport(csv);
                                    toastr.info('Exported Stakeholders!');
                                    this.isExportingStakeholdersReport =
                                                                                                                                              false;
                                }
                            }).error(function() {
                            toastr.error('Error Exporting Stakeholders!');
                            this.isExportingStakeholdersReport = false;
                        });
                    }
                    function exportAmbassadorList() {
                        this.loadingCsv = true;
                        ApiService.$get(ApiUrlService.stakeholders.exportAmbassadorList())
                            .success(function(response) {
                                exportAmbassadorCsv('ambassador_list.csv',
                                    response);
                                this.loadingCsv = false;
                            });
                    }
                    function exportAmbassadorReferences(ambassador) {
                        this.loadingCsv = true;
                        ApiService.$get(ApiUrlService.stakeholders.exportAmbassadorReferences(
                            ambassador.id)).success(function(response) {
                            exportReferencesCsv(
                                'ambassador_references.csv',
                                response, ambassador);
                            this.loadingCsv = false;
                        });
                    }
                    function deleteAccount(stakeholder, index) {
                        var confirmDelete = $window.confirm('Delete ' +
                                                                                                                                              stakeholder.email + '\'s account?');
                        if (confirmDelete) {
                            this.items.items.splice(index, 1);
                            ApiService.$delete(ApiUrlService.stakeholders.delete(
                                stakeholder.id)).success(function() {
                                toastr.info('Stakeholder Deleted!');
                            }).error(function() {
                                toastr.error(
                                    'Error Deleting Stakeholder!');
                            });
                        }
                    }
                    function compileStakeholdersData(stakeholders) {
                        var headers = [];
                        var stakeholdersData = [];
                        for (var i = 0; i < stakeholders.length; i++) {
                            //setting headers
                            if (i === 0) {
                                var stakeholderKeys = Object.keys(stakeholders[i]);
                                for (var i = 0; i < stakeholderKeys.length; i++) {
                                    if (isStakeholdersReportData(stakeholderKeys[i])) {
                                        headers.push(stakeholderKeys[i]);
                                    }
                                }
                                stakeholdersData.push(headers);
                            }
                            //check to see if there is a filter for registration date
                            if (this.registrationFilter) {
                                //setting registration date and filter dates to UTC String and then
                                // milliseconds from epoch
                                var stakeholderRegistrationDate = new Date(
                                    stakeholders[i].registration_date).toUTCString();
                                stakeholderRegistrationDate = Date.parse(
                                    stakeholderRegistrationDate);
                                var filterStartDate = this.item.registrationDateLowerBound
                                    .toUTCString();
                                filterStartDate = Date.parse(filterStartDate);
                                var filterEndDate = this.item.registrationDateUpperBound
                                    .toUTCString();
                                //setting time on end date to millisecond before midnight next day
                                filterEndDate = Date.parse(filterEndDate) +
                                                                                                                                                          86399999;
                                if (stakeholderRegistrationDate >= filterStartDate &&
                                                                                                                                                            stakeholderRegistrationDate <= filterEndDate) {
                                    var row = [];
                                    for (var property in stakeholders[i]) {
                                        if (isStakeholdersReportData(property)) {
                                            row.push(stakeholders[i][property]);
                                        }
                                    }
                                    stakeholdersData.push(row);
                                }
                            } else {
                                var row = [];
                                for (var property in stakeholders[i]) {
                                    if (isStakeholdersReportData(property)) {
                                        row.push(stakeholders[i][property]);
                                    }
                                }
                                stakeholdersData.push(row);
                            }
                        }
                        return stakeholdersData;
                    }
                    function exportSummaryReportOfStudents(studentList) {
                        var data = '';
                        var aggregateSummaryFunction = function(student,
                            metaHeaders, studentsArray) {
                            return function(taskSummary) {
                                student.taskCount = taskSummary.taskCount;
                                student.taskCompleted = taskSummary.taskCompleted;
                                studentsArray.push(student);
                                if (studentsArray.length == studentList
                                    .length) {
                                    var fields = ['id', 'full_name',
                                        'email', 'phase',
                                        'institutions',
                                        'recommended_institutions',
                                        'tags', 'taskCompleted',
                                        'taskCount'
                                    ];
                                    var fieldNames = ['student_id',
                                        'student', 'email', 'grade',
                                        'institutions_followed',
                                        'recommended_institutions',
                                        'groups', 'tasks_completed',
                                        'total_tasks'
                                    ];
                                    for (var i = 0; i < metaHeaders.length; i++) {
                                        fields.push('[meta][' +
                                                                                                                                                                metaHeaders[i] + ']');
                                        fieldNames.push(metaHeaders[i].toLowerCase()
                                            .replace(/ /g, '_'));
                                    }
                                    data += fieldNames + '\r\n';
                                    var csvString = CsvExport.convertStudentsDataToCSVSummary(
                                        studentsArray, fields, data
                                    );
                                    CsvExport.exportCSV(
                                        'student-export-summary.csv',
                                        csvString);
                                    this.downloadingSummary = false;
                                }
                            };
                        };
                        var students = [];
                        this.downloadingSummary = true;
                        for (var i = 0; i < studentList.length; i++) {
                            ApiService.$get(ApiUrlService.stakeholders.details(studentList[
                                i].student.id)).success(function(response) {
                                students.push(response);
                                if (students.length == studentList.length) {
                                    var uniqueMetaHeaders =
                                                                                                                                                                  getUniqueMetaHeaders(
                                                                                                                                                                      studentList);
                                    var studentsArray = [];
                                    for (var j = 0; j < students.length; j++) {
                                        getStudentTaskList(students[j].id)
                                            .then(
                                                aggregateSummaryFunction(
                                                    students[j],
                                                    uniqueMetaHeaders,
                                                    studentsArray));
                                    }
                                }
                            });
                        }
                    }
                    function exportDetailedReportOfStudents(studentList) {
                        var data = '';
                        var aggregateAnalyticFunction = function(student, done,
                            metaHeaders) {
                            return function(taskSummary) {
                                var params = { 'data': taskSummary.taskList };
                                var recInstitutionNames = function(
                                    taskListItem) {
                                    return CsvExport.flattenArray(
                                        taskListItem.repeated.recommended_institutions
                                    );
                                };
                                var institutionNames = function(
                                    taskListItem) {
                                    return CsvExport.flattenArray(
                                        taskListItem.repeated.institutions
                                    );
                                };
                                var groupNames = function(taskListItem) {
                                    return CsvExport.flattenArray(
                                        taskListItem.repeated.tags
                                    );
                                };
                                var gradeLevel = function(taskListItem) {
                                    return /enior/.test(
                                        taskListItem.repeated.phase
                                    ) ? 'Senior' : 'Junior';
                                };
                                params['fields'] = ['repeated.id',
                                    'repeated.full_name',
                                    'repeated.email', { 'value': gradeLevel },
                                    { 'value': institutionNames },
                                    { 'value': recInstitutionNames },
                                    { 'value': groupNames },
                                    'task.name',
                                    'task.institution_name',
                                    'note_count', 'status',
                                    'started_on', 'completed_on',
                                    'due_date'
                                ];
                                params['fieldNames'] = ['student_id',
                                    'student', 'email', 'grade',
                                    'institutions_followed',
                                    'recommended_institutions',
                                    'groups', 'task_name',
                                    'task_institution_name',
                                    'note_count', 'status',
                                    'started_on', 'completed_on',
                                    'due_date'
                                ];
                                for (var i = 0; i < metaHeaders.length; i++) {
                                    params['fields'].push(
                                        'repeated.meta[' +
                                                                                                                                                                            metaHeaders[i] + ']');
                                    params['fieldNames'].push(
                                        metaHeaders[i].toLowerCase()
                                            .replace(/ /g, '_'));
                                }
                                var result = CsvExport.convertToCSV(
                                    params, student);
                                data += result.csv + '\r\n';
                                if (done) {
                                    data = result.titles + '\r\n' +
                                                                                                                                                                                data;
                                    CsvExport.exportCSV(
                                        'student-export-analytic.csv',
                                        data);
                                    this.downloadingAnalytic = false;
                                }
                            };
                        };
                        var students = [];
                        this.downloadingAnalytic = true;
                        for (var i = 0; i < studentList.length; i++) {
                            ApiService.$get(ApiUrlService.stakeholders.details(studentList[
                                i].student.id)).success(function(response) {
                                students.push(response);
                                if (students.length == studentList.length) {
                                    //collecting meta headers for studentList
                                    var uniqueMetaHeaders =
                                                                                                                                                                                    getUniqueMetaHeaders(
                                                                                                                                                                                        studentList);
                                    for (var j = 0; j < students.length; j++) {
                                        getStudentTaskList(students[j].id)
                                            .then(
                                                aggregateAnalyticFunction(
                                                    students[j], j ==
                                                                                                                                                                                            students.length - 1,
                                                    uniqueMetaHeaders));
                                    }
                                }
                            });
                        }
                    }
                    function getUniqueMetaHeaders(studentList) {
                        var metaHeaders = [];
                        for (var i = 0; i < studentList.length; i++) {
                            var metaKeys = Object.keys(studentList[i].student.meta);
                            if (metaKeys.length > 0) {
                                metaHeaders.push.apply(metaHeaders, metaKeys);
                            }
                        }
                        //remove duplicate headers
                        var uniqueMetaHeaders = [];
                        for (var i = 0; i < metaHeaders.length; i++) {
                            if (uniqueMetaHeaders.indexOf(metaHeaders[i]) == -1) {
                                uniqueMetaHeaders.push(metaHeaders[i]);
                            }
                        }
                        return uniqueMetaHeaders;
                    }
                    function getStudentTaskList(studentId, next, deferred, taskList) {
                        //Get the tasks for each team member
                        var localDeferred = deferred || $q.defer();
                        var taskList = taskList || [];
                        ApiService.$get(next || ApiUrlService.peer.taskList(studentId)).success(
                            function(response) {
                                //Adds three new properties to the students - taskCount, taskCompleted, and schoolCount
                                taskList.push.apply(taskList, response.results);
                                if (response.next) {
                                    getStudentTaskList(studentId, response.next,
                                        localDeferred, taskList);
                                } else {
                                    var taskInfo = countTaskListInformation(
                                        taskList, studentId);
                                    localDeferred.resolve(taskInfo);
                                }
                            }).error(function(err) {
                            console.log(err);
                        });
                        return localDeferred.promise;
                    }
                    function countTaskListInformation(taskList, studentId) {
                        var today = new Date();
                        var counts = {};
                        var completed = 0;
                        var pastDue = 0;
                        var leadTime = 0;
                        var leadTimeCount = 0;
                        for (var j = 0; j < taskList.length; j++) {
                            var aTaskLink = taskList[j];
                            if (!aTaskLink.archived) {
                                counts[aTaskLink.task.institution_name] = 1 + (
                                    counts[aTaskLink.task.institution_name] ||
                                                                                                                                                                                                0);
                                if (aTaskLink.completed) completed += 1;
                                if (aTaskLink.task.deadline != null) {
                                    var taskDifferential = jsUtilities.dates.days(
                                        today, aTaskLink.task.deadline);
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
                        var schools = Object.keys(counts).length > 0 ? Object.keys(
                            counts).length - 1 : 0;
                        return {
                            taskCount: taskList.length,
                            schoolCount: schools,
                            taskCompleted: completed,
                            status: 'HIGH RISK',
                            taskList: taskList
                        };
                    }
                    function createStakeholdersReportCSV(stakeholdersData) {
                        var csvString = undefined;
                        for (var i = 0; i < stakeholdersData.length; i++) {
                            if (csvString === undefined) {
                                csvString = stakeholdersData[i].join(',') +
                                                                                                                                                                                                    '%0D%0A';
                            } else {
                                csvString = csvString + stakeholdersData[i].join(
                                    ',') + '%0D%0A';
                            }
                        }
                        var csv = 'data:text/csv;charset=utf-8,' + csvString;
                        return csv;
                    }
                    function downloadStakeholdersReport(csv) {
                        var link = document.createElement('a');
                        link.setAttribute('href', csv);
                        link.setAttribute('download', 'Stakeholders');
                        link.click();
                    }
                    function isStakeholdersReportData(property) {
                        if (property == 'id' || property == 'first_name' ||
                                                                                                                                                                                                  property == 'last_name' || property == 'email' ||
                                                                                                                                                                                                  property == 'registration_date' || property ==
                                                                                                                                                                                                  'verified' || property == 'stakeholder_type' ||
                                                                                                                                                                                                  property == 'is_active' || property == 'phase' ||
                                                                                                                                                                                                  property == 'last_login') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    function addAmbassadorIdtoCsvHeader(ambassadorReferences) {
                        var indexOfLastName = ambassadorReferences.indexOf(
                            'last_name') + 9;
                        var header = ambassadorReferences.slice(0, indexOfLastName) +
                                                                                                                                                                                                    ',ambassador_id';
                        var data = ambassadorReferences.slice(indexOfLastName,
                            ambassadorReferences.length);
                        var table = header + data;
                        return table;
                    }
                    function addAmbassadorUidToCsv(table, newRowCharacter,
                        instanceOf, ambassador) {
                        var indexOfNewRowCharacter = nthIndexOfNewRowCharacter(
                            table, newRowCharacter, instanceOf);
                        var row = table.slice(0, indexOfNewRowCharacter) + ',';
                        var nextRow = table.slice(indexOfNewRowCharacter, table.length);
                        var table = row + ambassador.ambassador_uid + nextRow;
                        var updatedIndexOfNewRowCharacter =
                                                                                                                                                                                                          nthIndexOfNewRowCharacter(table, newRowCharacter,
                                                                                                                                                                                                              instanceOf);
                        var hasAnotherReference = (updatedIndexOfNewRowCharacter +
                                                                                                                                                                                                              6) !== table.length;
                        if (hasAnotherReference) {
                            instanceOf++;
                            addAmbassadorUidToCsv(table, newRowCharacter,
                                instanceOf, ambassador);
                        } else {
                            this.table = table;
                        }
                    }
                    function nthIndexOfNewRowCharacter(table, newRowCharacter, n) {
                        var length = table.length;
                        var i = -1;
                        while (n-- && i++ < length) {
                            i = table.indexOf(newRowCharacter, i);
                        }
                        return i;
                    }
                    function filterByRegistrationDate() {
                        if (this.registrationFilter) {
                            this.registrationFilter = false;
                            delete this.item.registrationDateLowerBound;
                            delete this.item.registrationDateUpperBound;
                        } else {
                            this.registrationFilter = true;
                        }
                    }
                    init();
                }
            ]);
}());
