'use strict';

angular
    .module('institutionsModule', ['apiModule', 'mixpanelModule', 'stakeholderModule'])
    .factory('InstitutionTrackerService', InstitutionTrackerService);

InstitutionTrackerService.$inject = [
    '$http',
    '$rootScope',
    'ApiService',
    'ApiUrlService',
    'StakeholderService',
    'MixpanelService',
    'StakeholderAuthService',
    'TargetStakeholderService'
];

function InstitutionTrackerService($http, $rootScope, ApiService, ApiUrlService,
    MixpanelService, StakeholderAuthService, StakeholderService, TargetStakeholderService) {

    var tracker = {};

    tracker.reset = function () {
        tracker.featuredList = [];
        tracker.recommendedDict = {};
        tracker.recommendedList = [];
        tracker.schoolDict = {};
        tracker.schoolList = [];
        tracker.schoolMatches = [];
        tracker.set = false;
    };

    tracker.reset();

    tracker.updateSchoolList = function () {
        tracker.refreshSchools();
        tracker.refreshRecommendations();
    };

    $rootScope.$on('updateSchoolList', function (e, data) {
        tracker.updateSchoolList();
    });

    tracker.postSchool = function (schoolObj) {
        var id = schoolObj.id;
        var appType = schoolObj.appType;
        var payload = {
            institution: id,
            application_type: appType
        };
        return ApiService.$post(ApiUrlService.stakeholder.institutionTracker(), payload)
            .finally(function () {
                var trackObj = {
                    institution_id: schoolObj.id,
                    institution_name: schoolObj.schoolName,
                    sector: schoolObj.sector
                };
                if (schoolObj.page) {
                    trackObj.page = schoolObj.page;
                }
                //tracking when school is added and stakeholder type
                var featuredSchool = false;
                for (var i = 0; i < tracker.featuredList.length; i++) {
                    if (tracker.featuredList[i].id === schoolObj.id) {
                        featuredSchool = true;
                        MixpanelService.event('featured_school_added', trackObj);
                        break;
                    }
                }
                if (!featuredSchool) {
                    MixpanelService.event('school_added', trackObj);
                }
                //refresh user schools to make sure of accuracy
                tracker.refreshSchools()
                    .then(function () {
                        tracker.refreshMatchingSchools();
                    });
            });
    };

    //populate user's list of schools for marking already added schools
    tracker.refreshSchools = function () {
        var url = (TargetStakeholderService.getPeer() !== null)
            ? ApiUrlService.peer.institutionTracker(TargetStakeholderService.getPeerId())
            : ApiUrlService.stakeholder.institutionTracker();
        return ApiService.$get(url)
            .then(function (response) {
                tracker.schoolDict = {};
                tracker.schoolList = response.data;
                for (var i = 0; i < tracker.schoolList.length; i++) {
                    tracker.schoolDict[tracker.schoolList[i].institution] = tracker.schoolList[i];
                }
                var trackSchoolList = tracker
                    .schoolList
                    .reduce(function (pre, curr) {
                        pre.push(curr.institution_name);
                        return pre;
                    }, []);
                MixpanelService.setSchools(trackSchoolList);
                tracker.set = true;
                tracker.schoolMatches = [];
                StakeholderAuthService.updateStakeholderInstitutions(tracker.schoolList);
                // $rootScope.$broadcast('schoolListUpdated');

            }, function (error) {
                $rootScope.$broadcast('institutionLoadingError', {
                    details: 'Could not retrieve your schools, please refresh the page.'
                });
            });
    };

    tracker.addSchool = function (schoolObj) {
        //check to see if the user is allowed to add schools
        if (!StakeholderService.canAddSchools) {
            return false;
        }
        //check to see if the user is signed in
        if (!(StakeholderAuthService.getStakeholder())) {
            //if they aren't make an anonymous user before sending the rest
            $rootScope.$broadcast('anonymousAddFirstSchool', schoolObj);
        } else { //in the clear, pull up the application deadline picker
            $rootScope.$broadcast('applicationType', schoolObj);
        }
        return true;
    };

    tracker.updateSchool = function (schoolObj) {
        var id = schoolObj.id;
        var payload = {
            application_type: schoolObj.appType
        };
        var url = ApiUrlService.stakeholder.updateInstitutionTracker(id);
        return ApiService.$patch(url, payload)
            .then(function (response) {
                tracker.schoolDict[schoolObj.id] = response.data;
                tracker.updateSchoolInList(response.data);
                // $rootScope.$broadcast( 'schoolListUpdated');
                StakeholderAuthService.updateStakeholderInstitutions(tracker.schoolList);
            }, function () {
                alert('Failed to update school, please try again.');
            });
    };

    tracker.updateSchoolInList = function (schoolObj) {
        if (!schoolObj.institution) {
            return;
        }
        for (var i = 0; i < tracker.schoolList.length; i++) {
            if (schoolObj.institution == tracker.schoolList[i].institution) {
                tracker.schoolList[i] = schoolObj;
            }
        }
    };

    tracker.removeSchool = function (schoolId) {
        var url = ApiUrlService.stakeholder.updateInstitutionTracker(schoolId);
        return ApiService.$delete(url)
            .then(function () {
                MixpanelService.event('school_removed');
                MixpanelService.increment('schools followed', -1);
                if (tracker.recommendedDict[schoolId] !== undefined) {
                    tracker.unrecommendSchool(tracker.recommendedDict[schoolId].institution);
                }
                tracker.refreshSchools();
            }, function () {
                alert('Failed to remove school, please try again.');
            });
    };

    tracker.getOptions = function () {
        tracker.options = $http({
            method: 'OPTIONS',
            url: ApiUrlService.stakeholder.institutionTracker(),
            headers: {
                'AUTHORIZATION': ApiService.getKey()
            }
        });
        return tracker.options;
    };

    //Recommended Schools section
    tracker.recommendSchool = function (schoolObj) {
        var urlId = (TargetStakeholderService.getPeer() !== null)
            ? TargetStakeholderService.getPeer().id
            : StakeholderService.id;
        var url = ApiUrlService.stakeholder.recommendedSchools(urlId);
        var payload = {
            'institution': schoolObj.id
        };
        return ApiService.$post(url, payload)
            .then(function () {
                //tracking when school is recommended and what the stakeholder type is
                var featuredSchool = false;
                for (var i = 0; i < tracker.featuredList.length; i++) {
                    if (tracker.featuredList[i].id === schoolObj.id) {
                        featuredSchool = true;
                        MixpanelService.event('featured_school_recommended', {
                            institution_id: schoolObj.id,
                            institution_name: schoolObj.name,
                            stakeholder_type: StakeholderService.stakeholderType
                        });
                        break;
                    }
                }
                if (!featuredSchool) {
                    MixpanelService.event('school_recommended', {
                        institution_id: schoolObj.id,
                        institution_name: schoolObj.name,
                        stakeholder_type: StakeholderService.stakeholderType
                    });
                }
                return tracker.refreshRecommendations();
            });
    };

    tracker.getFeaturedSchools = function () {
        tracker.featuredList = [];
        return ApiService.$get(ApiUrlService.app.featuredInstitutionList())
            .then(function (response) {
                if (response.data.results.length > 0) {
                    for (var i = 0; i < response.data.results.length; i++) {
                        var instId = response.data.results[i].institution;
                        tracker.getFeaturedSchoolDetail(instId);
                    }
                }
            })
            .catch(function (error) {
                return error;
            });
    };

    tracker.getFeaturedSchoolDetail = function (instId) {
        return ApiService.$get(ApiUrlService.app.institution(instId))
            .then(function (response) {
                tracker.featuredList.push(response.data);
                $rootScope.$broadcast('featuredSchoolsAvailable');
            })
            .catch(function (error) {
                return error;
            });
    };

    tracker.refreshRecommendations = function () {
        var urlId = (TargetStakeholderService.getPeer() !== null)
            ? TargetStakeholderService.getPeer().id
            : StakeholderAuthService.getUser().id;
        var url = ApiUrlService.stakeholder.recommendedSchools(urlId);
        return ApiService.$getPaged(url)
            .then(function (response) {
                tracker.recommendedDict = {};
                tracker.recommendedList = response || [];
                for (var i = 0; i < tracker.recommendedList.length; i++) {
                    var rec = tracker.recommendedList[i];
                    rec.recommender.displayName = StakeholderService.parseDisplayName(
                        rec.recommender.first_name, rec.recommender.last_name, rec.recommender.email
                    );
                    rec.recommender.photoUrl = StakeholderService.parseStakeholderPhoto(
                        rec.recommender.photo_url, rec.recommender.stakeholder_type
                    );
                    rec.recommender.displayStakeholderType = StakeholderService.parseDisplayStakeholderType(
                        rec.recommender.stakeholder_type
                    );
                    tracker.recommendedDict[tracker.recommendedList[i].institution.id] = rec;
                }
                $rootScope.$broadcast('recommendedSchoolListUpdated');
            }, function (error) {
                $rootScope.$broadcast('institutionLoadingError', {
                    details: 'Could not retrieve your schools, please refresh the page.'
                });
            });
    };

    tracker.unrecommendSchool = function (schoolObj) {
        var userInQuestionId = (TargetStakeholderService.getPeer() !== null)
            ? TargetStakeholderService.getPeer().id
            : StakeholderService.id;
        //find the recommendation id
        var recId = tracker.recommendedDict[schoolObj.id].id;
        var url = ApiUrlService.stakeholder.singleRecommendedSchool(userInQuestionId, recId);
        return ApiService.$delete(url)
            .then(function () {
                return tracker.refreshRecommendations();
            });
    };

    tracker.findRecommendationById = function (recId) {
        var rec = null;
        var keys = Object.keys(tracker.recommendedDict);
        for (var i = 0; i < keys.length; i++) {
            var recommendation = tracker.recommendedDict[keys[i]];
            if (recommendation.id == recId) {
                rec = recommendation;
                break;
            }
        }
        return rec;
    };

    tracker.refreshMatchingSchools = function () {
        var queryString = '?';
        for (var i = 0, school; school = tracker.schoolList[i]; ++i) {
            queryString += 'id=' + school.institution + '&';
        }
        var stakeholder = StakeholderAuthService.getStakeholder();
        var stakeholderValueKeys = [
            'act_composite',
            'act_english',
            'act_math',
            'act_reading',
            'act_science',
            'act_writing',
            'sat_math',
            'sat_reading',
            'sat_writing'
        ];
        for (var k = 0, key; key = stakeholderValueKeys[k]; ++k) {
            if (stakeholder[key]) {
                queryString += key + '=' + stakeholder[key] + '&';
            }
        }
        return ApiService.$get(ApiUrlService.institution.list() + queryString.slice(0, -1))
            .then(function (response) {
                return tracker.schoolMatches = response.data.results;
            });
    };

    tracker.getApplicationGroups = function () {
        return ApiService.$get(ApiUrlService.application.groupList())
            .then(function (response) {
                return response.data;
            });
    };

    return tracker;
}
