(function() {
    'use strict';
    angular
        .module('Institutions', [])
        .factory('InstitutionTracker',

            ['$rootScope', 'API', 'Stakeholder', 'TargetStakeholder', 'UrlHelper',
                'Track', '$http', 'StakeholderAuth',

                function($rootScope, API, Stakeholder, TargetStakeholder, UrlHelper,
                    Track, $http, StakeholderAuth) {
                    var tracker = {};
                    tracker.reset = function() {
                        tracker.schoolDict = {};
                        tracker.schoolList = [];
                        tracker.recommendedDict = {};
                        tracker.featuredList = [];
                        tracker.recommendedList = [];
                        tracker.set = false;
                        tracker.schoolMatches = [];
                    };
                    tracker.reset();
                    tracker.updateSchoolList = function() {
                        tracker.refreshSchools();
                        tracker.refreshRecommendations();
                    };
                    $rootScope.$on('updateSchoolList', function(e, data) {
                        tracker.updateSchoolList();
                    });
                    tracker.postSchool = function(schoolObj) {
                        var id = schoolObj.id;
                        var appType = schoolObj.appType;
                        var payload = {
                            institution: id,
                            application_type: appType
                        };
                        return API.$post(UrlHelper.stakeholder.institutionTracker(),
                            payload).finally(function() {
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
                                if (tracker.featuredList[i].id ===
                                schoolObj.id) {
                                    featuredSchool = true;
                                    Track.event('featured_school_added',
                                        trackObj);
                                    break;
                                }
                            }
                            if (!featuredSchool) {
                                Track.event('school_added', trackObj);
                            }
                            //refresh user schools to make sure of accuracy
                            tracker.refreshSchools().then(function() {
                                tracker.refreshMatchingSchools();
                            });
                        });
                    };
                    //populate user's list of schools for marking already added schools
                    tracker.refreshSchools = function() {
                        var url = (TargetStakeholder.getPeer() !== null) ?
                            UrlHelper.peer.institutionTracker(TargetStakeholder
                                .getPeerId()) : UrlHelper.stakeholder.institutionTracker();
                        return API.$get(url).then(function(response) {
                            tracker.schoolDict = {};
                            tracker.schoolList = response.data;
                            for (var i = 0; i < tracker.schoolList.length; i++) {
                                tracker.schoolDict[tracker.schoolList[i]
                                    .institution] = tracker.schoolList[
                                    i];
                            }
                            var trackSchoolList = tracker.schoolList.reduce(
                                function(pre, curr) {
                                    pre.push(curr.institution_name);
                                    return pre;
                                }, []);
                            Track.setSchools(trackSchoolList);
                            tracker.set = true;
                            tracker.schoolMatches = [];
                            StakeholderAuth.updateStakeholderInstitutions(
                                tracker.schoolList);
                        // $rootScope.$broadcast('schoolListUpdated');
                        }, function(error) {
                            $rootScope.$broadcast(
                                'institutionLoadingError', { details: 'Could not retrieve your schools, please refresh the page.' }
                            );
                        });
                    };
                    tracker.addSchool = function(schoolObj) {
                    //check to see if the user is allowed to add schools
                        if (!Stakeholder.canAddSchools) {
                            return false;
                        }
                        //check to see if the user is signed in
                        if (!(StakeholderAuth.getStakeholder())) {
                        //if they aren't make an anonymous user before sending the rest
                            $rootScope.$broadcast('anonymousAddFirstSchool',
                                schoolObj);
                        } else //in the clear, pull up the application deadline picker
                        {
                            $rootScope.$broadcast('applicationType', schoolObj);
                        }
                        return true;
                    };
                    tracker.updateSchool = function(schoolObj) {
                        var id = schoolObj.id;
                        var payload = {
                            application_type: schoolObj.appType
                        };
                        var url = UrlHelper.stakeholder.updateInstitutionTracker(
                            id);
                        return API.$patch(url, payload).then(function(response) {
                            tracker.schoolDict[schoolObj.id] = response
                                .data;
                            tracker.updateSchoolInList(response.data);
                            // $rootScope.$broadcast( 'schoolListUpdated');
                            StakeholderAuth.updateStakeholderInstitutions(
                                tracker.schoolList);
                        }, function() {
                            alert(
                                'Failed to update school, please try again.'
                            );
                        });
                    };
                    tracker.updateSchoolInList = function(schoolObj) {
                        if (!schoolObj.institution) {
                            return;
                        }
                        for (var i = 0; i < tracker.schoolList.length; i++) {
                            if (schoolObj.institution == tracker.schoolList[i].institution) {
                                tracker.schoolList[i] = schoolObj;
                            }
                        }
                    };
                    tracker.removeSchool = function(schoolId) {
                        var url = UrlHelper.stakeholder.updateInstitutionTracker(
                            schoolId);
                        return API.$delete(url).then(function() {
                            Track.event('school_removed');
                            Track.increment('schools followed', -1);
                            if (tracker.recommendedDict[schoolId] !==
                            undefined) {
                                tracker.unrecommendSchool(tracker.recommendedDict[
                                    schoolId].institution);
                            }
                            tracker.refreshSchools();
                        }, function() {
                            alert(
                                'Failed to remove school, please try again.'
                            );
                        });
                    };
                    tracker.getOptions = function() {
                        tracker.options = $http({
                            method: 'OPTIONS',
                            url: UrlHelper.stakeholder.institutionTracker(),
                            headers: {
                                'AUTHORIZATION': API.getKey()
                            }
                        });
                        return tracker.options;
                    };
                    //Recommended Schools section
                    tracker.recommendSchool = function(schoolObj) {
                        var urlId = (TargetStakeholder.getPeer() !== null)
                            ? TargetStakeholder.getPeer().id
                            : Stakeholder.id;
                        var url = UrlHelper.stakeholder.recommendedSchools(urlId);
                        var payload = { 'institution': schoolObj.id };
                        return API.$post(url, payload).then(function() {
                        //tracking when school is recommended and what the stakeholder type is
                            var featuredSchool = false;
                            for (var i = 0; i < tracker.featuredList.length; i++) {
                                if (tracker.featuredList[i].id ===
                                schoolObj.id) {
                                    featuredSchool = true;
                                    Track.event(
                                        'featured_school_recommended', {
                                            institution_id: schoolObj.id,
                                            institution_name: schoolObj.name,
                                            stakeholder_type: Stakeholder.stakeholderType
                                        });
                                    break;
                                }
                            }
                            if (!featuredSchool) {
                                Track.event('school_recommended', {
                                    institution_id: schoolObj.id,
                                    institution_name: schoolObj.name,
                                    stakeholder_type: Stakeholder.stakeholderType
                                });
                            }
                            return tracker.refreshRecommendations();
                        });
                    };
                    tracker.getFeaturedSchools = function() {
                        tracker.featuredList = [];
                        return API.$get(UrlHelper.app.featuredInstitutionList())
                            .then(function(response) {
                                if (response.data.results.length > 0) {
                                    for (var i = 0; i < response.data.results.length; i++) {
                                        var instId = response.data.results[i].institution;
                                        tracker.getFeaturedSchoolDetail(instId);
                                    }
                                }
                            }).catch(function(error) {
                                return error;
                            });
                    };
                    tracker.getFeaturedSchoolDetail = function(instId) {
                        return API.$get(UrlHelper.app.institution(instId)).then(
                            function(response) {
                                tracker.featuredList.push(response.data);
                                $rootScope.$broadcast(
                                    'featuredSchoolsAvailable');
                            }).catch(function(error) {
                            return error;
                        });
                    };
                    tracker.refreshRecommendations = function() {
                        var urlId = (TargetStakeholder.getPeer() !== null) ?
                            TargetStakeholder.getPeer().id : StakeholderAuth.getUser().id;
                        var url = UrlHelper.stakeholder.recommendedSchools(urlId);
                        return API.$getPaged(url).then(function(response) {
                            tracker.recommendedDict = {};
                            tracker.recommendedList = response || [];
                            for (var i = 0; i < tracker.recommendedList
                                .length; i++) {
                                var rec = tracker.recommendedList[i];
                                rec.recommender.displayName =
                                Stakeholder.parseDisplayName(
                                    rec.recommender.first_name,
                                    rec.recommender.last_name,
                                    rec.recommender.email
                                );
                                rec.recommender.photoUrl = Stakeholder.parseStakeholderPhoto(
                                    rec.recommender.photo_url,
                                    rec.recommender.stakeholder_type
                                );
                                rec.recommender.displayStakeholderType =
                                Stakeholder.parseDisplayStakeholderType(
                                    rec.recommender.stakeholder_type
                                );
                                tracker.recommendedDict[tracker.recommendedList[i].institution.id] = rec;
                            }
                            $rootScope.$broadcast(
                                'recommendedSchoolListUpdated');
                        }, function(error) {
                            $rootScope.$broadcast(
                                'institutionLoadingError', { details: 'Could not retrieve your schools, please refresh the page.' }
                            );
                        });
                    };
                    tracker.unrecommendSchool = function(schoolObj) {
                        var userInQuestionId = (TargetStakeholder.getPeer() !== null)
                            ? TargetStakeholder.getPeer().id
                            : Stakeholder.id;
                        //find the recommendation id
                        var recId = tracker.recommendedDict[schoolObj.id].id;
                        var url = UrlHelper.stakeholder.singleRecommendedSchool(userInQuestionId, recId);
                        return API.$delete(url).then(function() {
                            return tracker.refreshRecommendations();
                        });
                    };
                    tracker.findRecommendationById = function(recId) {
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
                    tracker.refreshMatchingSchools = function() {
                        var queryString = '?';
                        for (var i = 0, school; school = tracker.schoolList[i]; ++i) {
                            queryString += 'id=' + school.institution + '&';
                        }
                        var stakeholder = StakeholderAuth.getStakeholder();
                        var stakeholderValueKeys = ['act_composite',
                            'act_english', 'act_math', 'act_reading',
                            'act_science', 'act_writing', 'sat_math',
                            'sat_reading', 'sat_writing'
                        ];
                        for (var k = 0, key; key = stakeholderValueKeys[k]; ++k) {
                            if (stakeholder[key]) {
                                queryString += key + '=' + stakeholder[key] + '&';
                            }
                        }
                        return API.$get(UrlHelper.institution.list() +
                        queryString.slice(0, -1)).then(function(response) {
                            return tracker.schoolMatches = response.data.results;
                        });
                    };
                    tracker.getApplicationGroups = function() {
                        return API.$get(UrlHelper.application.groupList()).then(
                            function(response) {
                                return response.data;
                            });
                    };
                    return tracker;
                }
            ]);
})();
