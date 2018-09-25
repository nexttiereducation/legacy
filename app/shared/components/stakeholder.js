(function() {
    'use strict';

    angular
        .module('Stakeholder', [])
        .service('Stakeholder', ['$rootScope',
            'API', 'UrlHelper', '$q', 'localStorageService', 'Track',

            function($rootScope, API, UrlHelper, $q,
                localStorageService, Track) {

                var Stakeholder = function() {
                    this.reset();
                    this.deferred = $q.defer();
                    this.resolvePromise = this.deferred.promise;
                };

                Stakeholder.prototype.reset = function() {
                    var keys = Object.keys(this);
                    for (var i = 0; i < keys.length; i++) {
                        delete this[keys[i]];
                    }
                    this.firstName = 'Guest';
                    this.stakeholderType = 'anonymous';
                    this.calculateStakeholderTraits();
                    this.loggedIn = false;
                    this.anonymous = false;
                };

                Stakeholder.prototype.establish = function() {
                    localStorageService.remove('stakeholder');
                    var stk = this;
                    stk.resolvePromise = stk.getStakeholderInformation()
                        .then(function() {
                            localStorageService.set(
                                'stakeholder', stk);
                            $rootScope.loggedIn = stk.loggedIn;
                            $rootScope.anonStakeholder = stk.anonymous;
                            $rootScope.$broadcast(
                                'stakeholderEstablished');
                        });
                    return stk.resolvePromise;
                };

                Stakeholder.prototype.destroy = function() {
                    $rootScope.loggedIn = false;
                    localStorageService.remove('stakeholder');
                    localStorage.removeItem('nextTierUser');
                    this.reset();
                    $rootScope.$broadcast('stakeholderDestroyed');
                };

                Stakeholder.prototype.update = function(object) {
                    angular.extend(this, object);
                    this.calculateStakeholderTraits();
                    $rootScope.$broadcast('stakeholderUpdated');
                };

                Stakeholder.prototype.getStakeholderInformation =
                function() {
                    var stk = this;
                    return API.$get(UrlHelper.stakeholder.details())
                        .then(function(response) {
                            stk.id = response.data.id;
                            stk.firstName = response.data.first_name;
                            stk.lastName = response.data.last_name;
                            stk.email = response.data.email;
                            stk.phase = response.data.phase;
                            stk.stakeholderType = response.data
                                .stakeholder_type;
                            stk.photoUrl = response.data.profile_photo; // temporary until API is updated
                            stk.hasTransitioned = response.data
                                .has_transitioned;
                            stk.graduationYear = response.data.graduation_year;
                            stk.calculateStakeholderTraits();
                            stk.ambassador_uid = response.data.ambassador_uid ||
                                'none';
                            stk.is_ambassador = response.data.is_ambassador;
                            stk.hasConnections = (response.data
                                .adult_connections.length >
                                0 || response.data.student_connections
                                .length > 0);
                            stk.class_rank = response.data.class_rank;
                            stk.gpa = response.data.gpa;
                            stk.sat_math = response.data.sat_math;
                            stk.sat_reading = response.data.sat_reading;
                            stk.sat_writing = response.data.sat_writing;
                            stk.act_composite = response.data.act_composite;
                            stk.act_english = response.data.act_english;
                            stk.act_math = response.data.act_math;
                            stk.act_reading = response.data.act_reading;
                            stk.act_science = response.data.act_science;
                            stk.act_writing = response.data.act_writing;
                            stk.highschool = response.data.highschool;
                            stk.hasCompletedAcademicInformation();
                        }, function(error) {
                            alert(
                                'Could not retrieve stakeholder information, please reload the page.'
                            );
                            return $q.reject(error);
                        });
                };
                Stakeholder.prototype.calculateStakeholderTraits =
                function() {
                    var stk = this;
                    stk.name = stk.getName();
                    stk.anonymous = /(anonymous)/i.test(stk.stakeholderType);
                    stk.loggedIn = !stk.anonymous;
                    stk.displayType = stk.parseDisplayStakeholderType(
                        stk.stakeholderType);
                    stk.fullName = stk.getFullName();
                    stk.isStudent = (/(student|anonymous)/i.test(
                        stk.stakeholderType));
                    stk.isCounselor = (this.stakeholderType ===
                        'Counselor');
                    stk.isTeamMember = !(stk.isStudent || stk.isCounselor);
                    stk.canAddSchools = (this.isStudent || this.anonymous ||
                        !this.loggedIn);
                    stk.canRecommendSchools = ((this.stakeholderType ===
                        'Counselor') || (this.stakeholderType ===
                        'Parent'));
                    stk.isMentor = ((this.stakeholderType ===
                        'Counselor') || (this.stakeholderType ===
                        'Parent'));
                    stk.usesApplicationDates = /senior/i.test(stk.phase) &&
                        stk.phase.toLowerCase().indexOf('rising') ===
                        -1;
                    stk.photoUrl = stk.parseStakeholderPhoto(stk.photoUrl,
                        stk.stakeholderType);
                    stk.trackType = (stk.isStudent) ? 'student' :
                        'mentor';
                };
                Stakeholder.prototype.parseStakeholderPhoto = function(
                    photo, stakeholderType) {
                    stakeholderType = stakeholderType || '';
                    if (!photo) {
                        if (stakeholderType.toLowerCase() ===
                        'counselor') {
                            photo =
                            '/build/images/ic_counselor.png';
                        } else if (stakeholderType.toLowerCase() ===
                        'parent') {
                            photo = '/build/images/ic_teammate.png';
                        } else {
                            photo =
                            '/build/images/ic_student_badge.png';
                        }
                    }
                    if (!/https?:\/\//.test(photo)) {
                        photo =
                        'http://next-tier-cust-files.s3.amazonaws.com/' +
                        photo;
                    }
                    return photo;
                };
                Stakeholder.prototype.parseDisplayStakeholderType =
                function(stakeholderType) {
                    if (stakeholderType.toLowerCase() === 'parent') {
                        return 'Team Member';
                    }
                    if (stakeholderType.toLowerCase() ===
                        'senior applying') {
                        return 'Senior';
                    } else {
                        return stakeholderType;
                    }
                };
                Stakeholder.prototype.resetTransition = function() {
                    var stk = this;
                    return API.$patch(UrlHelper.stakeholder.details(), { has_transitioned: false })
                        .then(function(response) {
                            stk.hasTransitioned = false;
                        }, function(error) {
                            alert(
                                'Could not update user information, please reload the page.'
                            );
                        });
                };
                Stakeholder.prototype.parseDisplayName = function(fn,
                    ln, email) {
                    return (fn || ln ? (fn || '') + ' ' + (ln || '') :
                        (email).replace(/@.*/, '')).trim();
                };
                Stakeholder.prototype.parseTrackingType = function(
                    stakeholderType) {
                    return (/(student|anonymous)/i.test(
                        stakeholderType)) ? 'Students' :
                        'Mentors';
                };
                Stakeholder.prototype.getTrackingType = function() {
                    if (!this.loggedIn) {
                        return 'anonymous';
                    }
                    return 'registered';
                };
                Stakeholder.prototype.getName = function() {
                    var stk = this;
                    var name = stk.firstName || stk.lastName || stk
                        .email;
                    return name.replace(/@.*/, '');
                };
                Stakeholder.prototype.getFullName = function() {
                    var stk = this;
                    return stk.parseDisplayName(stk.firstName, stk.lastName,
                        stk.email);
                };
                Stakeholder.prototype.hasCompletedAcademicInformation =
                function() {
                    if (this.gpa && this.class_rank) {
                        if (this.act_composite && this.act_english &&
                            this.act_math && this.act_reading &&
                            this.act_science && this.act_writing) {
                            this.hasCompletedAcademicInformation =
                                true;
                        } else if (this.sat_math && this.sat_reading &&
                            this.sat_writing) {
                            this.hasCompletedAcademicInformation =
                                true;
                        } else {
                            this.hasCompletedAcademicInformation =
                                false;
                        }
                    } else {
                        this.hasCompletedAcademicInformation =
                            false;
                    }
                };
                var stakeholder = new Stakeholder();
                return stakeholder;
            }
        ]);
})();
