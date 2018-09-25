angular
    .module('adminModule')
    .controller('SponsoredSchoolsCtrl', SponsoredSchoolsCtrl);

SponsoredSchoolsCtrl.$inject = ['ApiUrlService', 'ApiService', 'QueryBuilder',
    'ngDialog', '$scope', 'infiniteScroll', 'jsUtilities'
];

function SponsoredSchoolsCtrl(ApiUrlService, ApiService, QueryBuilder,
    ngDialog, $scope, infiniteScroll, jsUtilities) {

    this.createNewSponsor = createNewSponsor;
    this.dateValidate = dateValidate;
    this.getInstItems = getInstItems;
    this.hideActiveSchools = hideActiveSchools;
    this.index = -1;
    this.items = [];
    this.openDeleteSponsorForm = openDeleteSponsorForm;
    this.openEditSponsorForm = openEditSponsorForm;
    this.openNewSponsorForm = openNewSponsorForm;
    this.orderingField = 'name';
    this.prevSponsored = [];
    this.query = '';
    this.removeSponsor = removeSponsor;
    this.showActiveSchools = showActiveSchools;
    this.showSponsored = true;
    this.sponsoredSchools = [];
    this.sponsorship = {};
    this.valid = true;

    init();

    function init() {
        populateSponsoredSchools();
    }

    function showActiveSchools() {
        this.showSponsored = true;
    }

    function hideActiveSchools() {
        this.showSponsored = false;
    }

    function populateSponsoredSchools() {
        ApiService.$get(ApiUrlService.sponsoredSchools.getList())
            .success(function(response) {
                filterResponse(response);
            })
            .error(function(response) {
                toastr.error(response, 'Error');
            });
    }

    function filterResponse(response) {
        for (var i = 0; i < response.results.length; i++) {
            var elm = response.results[i];
            elm.start_date = jsUtilities.dates.convertToDate(elm.start_date);
            elm.end_date = jsUtilities.dates.convertToDate(elm.end_date);
            elm.name = getInstName(elm);
            if (isActive(elm.start_date, elm.end_date)) {
                this.sponsoredSchools.push(elm);
            } else {
                this.prevSponsored.push(elm);
            }
        }
    }

    function isActive(startDate, endDate) {
        return checkStart(startDate) && checkEnd(endDate);
    }

    function checkStart(startDate) {
        var today = new Date;
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        if (today.toDateString() === startDate.toDateString()) {
            return true;
        } else if (startDate.getTime() < today.getTime()) {
            return true;
        } else {
            return false;
        }
    }

    function checkEnd(endDate) {
        var today = new Date;
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        if (today.toDateString() === endDate.toDateString()) {
            return false;
        } else if (endDate.getTime() > today.getTime()) {
            return true;
        } else {
            return false;
        }
    }

    function openEditSponsorForm(sponsorship, index) {
        this.valid = true;
        var template = 'scripts/project/sponsor_Feature/edit_sponsorship.html';
        this.sponsorship = sponsorship;
        var temp = isActive(sponsorship.start_date, sponsorship.end_date);
        ngDialog.openConfirm({
            template: template,
            className: 'ngdialog-theme-default item-form',
            scope: $scope,
            closeByEscape: true,
            closeByDocument: true
        }).then(function() {
            var start = jsUtilities.dates.convertToString(this.sponsorship.start_date);
            var end = jsUtilities.dates.convertToString(this.sponsorship.end_date);
            ApiService.$patch(ApiUrlService.sponsoredSchools.update(this.sponsorship
                .id), {
                'priority': this.sponsorship.priority,
                'start_date': start,
                'end_date': end
            })
                .success(function(response) {
                    toastr.info('Edit Successful');
                    this.valid = true;
                    var active = isActive(this.sponsorship.start_date,
                        this.sponsorship.end_date);
                    if (!active === temp) {
                        response.start_date = jsUtilities.dates.convertToDate(start);
                        response.end_date = jsUtilities.dates.convertToDate(end);
                        response.name = getInstName(response);
                        if (active) {
                            this.prevSponsored.splice(index, 1);
                            this.sponsoredSchools.push(response);
                        } else {
                            this.sponsoredSchools.splice(index, 1);
                            this.prevSponsored.push(response);
                        }
                    } else {
                        sponsorship.priority = response.priority;
                        sponsorship.end_date = jsUtilities.dates.convertToDate(end);
                        sponsorship.start_date = jsUtilities.dates.convertToDate(start);
                    }
                    this.sponsorship = {};
                }).error(function(response) {
                    this.sponsorship = {};
                    toastr.error(response, 'Error');
                });
        });
    }

    function openDeleteSponsorForm(sponsorship, index) {
        var template = 'scripts/project/sponsor_Feature/deleteForm.html';
        this.sponsorship = sponsorship;
        this.index = index;
        ngDialog.openConfirm({
            template: template,
            className: 'ngdialog-theme-default item-form',
            scope: $scope,
            closeByEscape: true,
            closeByDocument: true
        });
    }

    function openNewSponsorForm() {
        var template = 'scripts/project/sponsor_Feature/newSponsorForm.html';
        getInstItems();
        ngDialog.openConfirm({
            template: template,
            className: 'ngdialog-theme-default item-form',
            scope: $scope,
            closeByEscape: true,
            closeByDocument: true
        });
        this.query = '';
        this.items = [];
    }

    function getInstItems(reload) {
        this.items = [];
        if (!(this.query === '')) {
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
    }

    function removeSponsor(sponsorship) {
        ApiService.$delete(ApiUrlService.sponsoredSchools.deleteSponsor(sponsorship.id))
            .success(function() {
                toastr.info('Item Deleted');
                if (isActive(sponsorship.start_date, sponsorship.end_date)) {
                    this.sponsoredSchools.splice(this.index, 1);
                    this.index = -1;
                } else {
                    this.prevSponsored.splice(this.index, 1);
                    this.index = -1;
                }
            }).error(function(response) {
                toastr.error(response, 'Error');
            });
    }

    function getInstName(sponsorship) {
        ApiService.$get(ApiUrlService.institutions.getItem(sponsorship.institution))
            .success(function(response) {
                sponsorship.name = response.name;
            }).error(function(response) {
                toastr.error(response, 'Error');
            });
    }

    function dateValidate() {
        if (typeof this.sponsorship.start_date !== 'undefined'
            && typeof this.sponsorship.end_date !== 'undefined') {
            if (this.sponsorship.start_date.getTime() < this.sponsorship.end_date.getTime()) {
                this.valid = true;
                return true;
            } else {
                this.sponsorship.start_date.setHours(0, 0, 0, 0);
                this.sponsorship.end_date.setHours(0, 0, 0, 0);
                if (this.sponsorship.start_date.toDateString() === this.sponsorship.end_date.toDateString()) {
                    this.valid = true;
                    return true;
                } else {
                    this.valid = false;
                    return false;
                }
            }
        }
    }

    function createNewSponsor(item) {
        this.valid = true;
        var template = 'scripts/project/sponsor_Feature/edit_sponsorship.html';
        this.sponsorship = {};
        ngDialog.openConfirm({
            template: template,
            className: 'ngdialog-theme-default item-form',
            scope: $scope,
            closeByEscape: true,
            closeByDocument: true
        }).then(function() {
            var begin = jsUtilities.dates.convertToString(this.sponsorship.start_date);
            var end = jsUtilities.dates.convertToString(this.sponsorship.end_date);
            ApiService.$post(ApiUrlService.sponsoredSchools.create(), {
                'institution': item.id,
                'priority': this.sponsorship.priority,
                'start_date': begin,
                'end_date': end
            }).success(function(response) {
                response.start_date = jsUtilities.dates.convertToDate(begin);
                response.end_date = jsUtilities.dates.convertToDate(end);
                response.name = getInstName(response);
                if (isActive(response.start_date, response.end_date)) {
                    this.sponsoredSchools.push(response);
                } else {
                    this.prevSponsored.push(response);
                }
                this.valid = true;
            }).error(function(response) {
                toastr.error(response, 'Error');
            });
            this.sponsorship = {};
        });
    }
}
