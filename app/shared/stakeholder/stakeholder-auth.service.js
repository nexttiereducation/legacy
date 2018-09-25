'use strict';

angular
    .module('stakeholderModule')
    .factory('StakeholderAuthService', StakeholderAuthService);

StakeholderAuthService.$inject = [
    '$cookies',
    '$location',
    '$q',
    '$rootScope',
    'Ambassador',
    'ApiService',
    'ApiUrlService',
    'HighSchoolManager',
    'localStorageService',
    'MixpanelService',
    'NotificationManager'
];

function StakeholderAuthService(
    $cookies,
    $location,
    $q,
    $rootScope,
    Ambassador,
    ApiService,
    ApiUrlService,
    HighSchoolManager,
    localStorageService,
    MixpanelService,
    NotificationManager
) {

    var baseStakeholder = {
        loggedIn: false,
        anonymous: false,
        firstName: 'Guest'
    };

    var user = angular.copy(baseStakeholder);

    $rootScope.$on('updateStakeholder', function(e, data) {
        updateStakeholder(data);
    });

    $rootScope.$on('schoolListUpdated', function(event, data) {
        updateStakeholderInstitutions(data);
    });

    function updateStakeholderInstitutions(data) {
        user.institution_trackers = data;
        return updateStakeholder();
    }

    function updateStakeholder(data) {
        var deferred = $q.defer();
        if (data) {
            angular.extend(user, data);
        }
        calculateStakeholderTraits();
        saveStakeholderData(user);
        $rootScope.$broadcast('stakeholderUpdated', user);
        deferred.resolve(user);
        return deferred.promise;
    };

    return {
        allowUnauthenticatedUsers: allowUnauthenticatedUsers,
        basicLogin: function(data) {
            return basicLogin(data);
        },
        basicRegistration: function(data) {
            return basicRegistration(data);
        },
        canAddSchools: canAddSchools,
        changePassword: changePassword,
        createAlternateContact: createAlternateContact,
        createAnonStakeholder: createAnonStakeholder,
        createStakeholderACT: createStakeholderACT,
        createStakeholderSAT: createStakeholderSAT,
        deleteAccount: deleteAccount,
        deleteStakeholderACT: deleteStakeholderACT,
        deleteStakeholderSAT: deleteStakeholderSAT,
        destroySession: function() {
            destroySession();
        },
        getAlternateContact: getAlternateContact,
        getAuthToken: getAuthToken,
        getPreferences: getPreferences,
        getStakeholder: function() {
            return getStakeholder();
        },
        getStakeholderInformation: getStakeholderInformation,
        getTrackingType: function() {
            return getTrackingType();
        },
        getUser: function() {
            return getStakeholder();
        },
        getUserId: getUserId,
        ghostLogin: function(data) {
            return ghostLogin(data);
        },
        ghostLogout: function(data) {
            return ghostLogout(data);
        },
        isAdmin: function() {
            return isAdmin();
        },
        isAllowed: function(action, resource) {
            return isAllowed(action, resource);
        },
        isAnonymous: isAnonymous,
        isCounselor: function() {
            return isCounselor();
        },
        isGhost: function() {
            return isGhost()
        },
        isParent: function() {
            return isParent();
        },
        isSenior: function() {
            return isSenior();
        },
        isStudent: function() {
            return isStudent();
        },
        isUpperClassman: function() {
            return isUpperClassman();
        },
        logout: function() {
            return logout();
        },
        needsLogin: needsLogin,
        parseDisplayStakeholderType: function(type) {
            return parseDisplayStakeholderType(type);
        },
        parseDisplayName: function(fn, ln, email) {
            return parseDisplayName(fn, ln, email);
        },
        parseTrackingType: function(stakeholder_type) {
            return parseTrackingType(stakeholder_type);
        },
        parseUserPhoto: function(photo, type) {
            return parseUserPhoto(photo, type);
        },
        resendConfirmation: function(data) {
            return resendConfirmation(data);
        },
        resetPassword: function(data) {
            return resetPassword(data);
        },
        saveStakeholderData: saveStakeholderData,
        setSession: function(token, id) {
            return setSession(token, id);
        },
        setupUser: function() {
            return setupUser();
        },
        updateAlternateContact: updateAlternateContact,
        updateStakeholder: function() {
            return updateStakeholder();
        },
        updateStakeholderACT: updateStakeholderACT,
        updateStakeholderDetails: updateStakeholderDetails,
        updateStakeholderInstitutions: function(data) {
            return updateStakeholderInstitutions(data);
        },
        updateStakeholderSAT: updateStakeholderSAT
    };
    //Persist stakeholder data to LS and cookies
    function saveStakeholderData(user) {
        localStorageService.set('stakeholder', JSON.stringify(user));
        try {
            $cookies.put('stakeholder', JSON.stringify(user), {domain: $rootScope.webApp});
        } catch (Exception) {}
    }

    function getStakeholder() {
        return user;
    };

    function isAdmin() {
        return user && user.email && user.email.indexOf('admin') !== -1 && user.email.indexOf('@nexttier') !== -1;
    }

    function isGhost() {
        return localStorageService.get('isGhost');
    }

    function isParent() {
        return /parent/i.test(user.stakeholderType);
    }

    function isStudent() {
        return (/(student|anonymous)/i.test(user.stakeholderType));
    }

    function isCounselor() {
        return (user.stakeholderType === 'Counselor');
    }

    function isAnonymous() {
        return user.anonymous;
    }

    function canAddSchools() {
        return (user.isStudent || user.anonymous || !user.loggedIn);
    }

    function canRecommendSchools() {
        return ((user.stakeholderType === 'Counselor') || (user.stakeholderType === 'Parent'));
    }

    function isMentor() {
        return ((user.stakeholderType === 'Counselor') || (user.stakeholderType === 'Parent'));
    }

    function isUpperClassman() {
        return (/senior/.test(user.phase.toLowerCase()) || /junior/.test(user.phase.toLowerCase()));
    }

    function isSenior() {
        return (/senior/.test(user.phase.toLowerCase()));
    }
    /*
    Retrieves any existing stakeholder information from the API and stores
    stakeholder information in localStorage
    */
    function setSession(token, id) {
        user.loggedIn = true;
        user.id = id;
        user.authToken = token;
        // Local Storage Session management - Call to stakeholder won't work without
        ApiService.setAuthToken(user.authToken);
        localStorageService.set('user.roleId', user.id);
        return getStakeholderInformation(). finally(function() {
            $rootScope.user = user;
            saveStakeholderData(user);
            $rootScope.loggedIn = true;
            $rootScope.$broadcast('stakeholderUpdated', user);
        });
    };
    /*
    Retrieve stakeholder information from local storage
    and return whether the stakeholder is logged in or not
    */
    function setupUser() {
        var deferred = $q.defer();
        if (localStorageService.get('stakeholder') !== null) {
            user = angular.fromJson(localStorageService.get('stakeholder'));
            $rootScope.loggedIn = user.loggedIn;
            $rootScope.anonStakeholder = user.anonymous;
            $rootScope.$broadcast('stakeholderUpdated', user);
            NotificationManager.start(user);
            MixpanelService.start(user);
            deferred.resolve(user);
        } else if (localStorageService.get('authToken') !== null && localStorageService.get('user.roleId') !== null) {
            deferred.resolve(setSession(localStorageService.get('authToken'), localStorageService.get('user.roleId')));
        } else {
            deferred.reject();
        }
        return deferred.promise;
    }
    /*
    Log the stakeholder out and remove their information from localStorage
    */
    function destroySession() {
        //clear user data
        user = angular.copy(baseStakeholder);
        // calculateStakeholderTraits();
        //Remove it from the local storage
        ApiService.removeAuthToken();
        localStorageService.remove('user.roleId');
        localStorageService.remove('stakeholder');
        localStorageService.remove('targetStakeholder');
        localStorageService.remove('location');
        localStorageService.remove('photoUrl');
        localStorageService.remove('tabs');
        localStorageService.remove('isGhost');
        localStorageService.remove('ghostData');
        $cookies.remove('stakeholder', {domain: $rootScope.webApp});
        $rootScope.loggedIn = false;
        $rootScope.anonStakeholder = false;
        $rootScope.$broadcast('sessionEnded');
        // $rootScope.$broadcast( 'stakeholderUpdated', user );
        MixpanelService.clearUser();
    }
    /*	Exposed as 'logout'
    Clearout stakeholder info, storage, cookies, etc.
    */
    function logout() {
        destroySession();
        localStorageService.clearAll();
    }

    function getName() {
        var name = user.firstName || user.lastName || user.email;
        return (name.replace(/@.*/, ''));
    }

    function getFullNameOri() {
        return (user.firstName || user.lastName
            ? (user.firstName || '') + ' ' + (user.lastName || '')
            : (user.email).replace(/@.*/, '')).trim();
    }

    function getFullName() {
        return parseDisplayName(user.firstName, user.lastName, user.email);
    }

    function parseDisplayName(fn, ln, email) {
        return (fn || ln
            ? (fn || '') + ' ' + (ln || '')
            : (email).replace(/@.*/, '')).trim();
    }
    /*	Exposed as 'parseTrackingType'
    */
    function parseTrackingType(stakeholder_type) {
        return (user.isStudent)
            ? 'Students'
            : 'Mentors';
    }
    /*	Exposed as 'getTrackingType'
    */
    function getTrackingType() {
        if (!user.loggedIn) {
            return 'anonymous';
        }
        return parseTrackingType(user.stakeholder_type);
    }

    function getPreferences() {
        return ApiService.$get(ApiUrlService.stakeholder.preferences())
            .then(function(response) {
                return response.data.sms_prefs;
            });
    }

    function getAlternateContact() {
        return ApiService.$get(ApiUrlService.stakeholder.alternateContact())
            .then(function(response) {
                return response.data.results;
            });
    }
    /*	Hidden
    Retrieve stakeholder information from the API
    */
    function getStakeholderInformation() {
        return ApiService.$get(ApiUrlService.stakeholder.details())
            .then(function(response) {
                var data = response.data;
                angular.merge(user, response.data);
                user.firstName = data.first_name;
                user.lastName = data.last_name;
                user.stakeholderType = data.stakeholder_type;
                user.photoUrl = data.profile_photo || data.photo_url; // The response is currently coming back at profile_photo. Will want to change the API so   that it comes back to photo_url
                user.hasConnections = (data.adult_connections.length > 0 || data.student_connections.length > 0);
                user.ambassador_uid = data.ambassador_uid || 'none';
                user.highschool = data.highschool;
                user.graduationYear = data.graduation_year;
                if (user.highschool) {
                    setHighSchool(user.highschool);
                }
                hasCompletedAcademicInformation();
                calculateStakeholderTraits();
                MixpanelService.start(user);
                return getEntitlements();
            })
            .catch(function(error) {
                console.log(error)
                if (error.status == -1) {
                    return;
                }
                alert('Could not retrieve user information, please reload the page.');
            });
    }

    function setHighSchool(highSchoolId) {
        return HighSchoolManager.getDetails(highSchoolId)
            .then(function(response) {
                MixpanelService.setHighSchool(response.data.name, response.data.nces);
            })
            .catch(function(error) {
                toastr.error('Unable to load high school details.')
                return error;
            })
        }
    /* Determine if the user has the rights to the listed action and resource in the list of entitlements */
    function isAllowed(actionName, resource) {
        if (user.entitlements) {
            var entitlements = user.entitlements;
            for (var idx in user.entitlements) {
                if (entitlements[idx].name.toUpperCase() == actionName.toUpperCase()) {
                    if (!resource)
                        return true;
                    if (entitlements[idx].resource && resource.toUpperCase() == entitlements[idx].resource.toUpperCase()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /* Populate the user object with the list of entitled actions */
    function getEntitlements() {
        if (user.entitlements) {
            return;
        }
        return ApiService.$getPaged(ApiUrlService.stakeholder.entitlements())
            .then(function(response) {
                user.entitlements = response.results;
                $rootScope.$broadcast('entitlements-set');
                return user;
            })
            .catch(function(error) {
                console.log(error);
                if (error.status == -1) {
                    return;
                }
            });
    }
    /*
    Calculate special traits from what we already know
    */
    function calculateStakeholderTraits() {
        user.name = getName();
        user.fullName = getFullName();
        user.isStudent = isStudent();
        user.isCounselor = isCounselor();
        user.isTeamMember = !(user.isStudent || user.isCounselor);
        user.canAddSchools = canAddSchools();
        user.canRecommendSchools = canRecommendSchools();
        user.isMentor = isMentor();
        user.usesApplicationDates = /senior/i.test(user.phase) && user.phase.toLowerCase().indexOf('rising') === -1;
        user.photoUrl = parseUserPhoto(user.photoUrl, user.stakeholder_type);
        user.trackType = (user.isStudent) ? 'student' : 'mentor';
    }

    function hasCompletedAcademicInformation() {
        if (user.gpa && user.class_rank) {
            if (user.act_composite && user.act_english && user.act_math
                && user.act_reading && user.act_science && user.act_writing) {
                user.hasCompletedAcademicInformation = true;
            } else if (user.sat_math && user.sat_reading && user.sat_writing) {
                user.hasCompletedAcademicInformation = true;
            } else {
                user.hasCompletedAcademicInformation = false;
            }
        } else {
            user.hasCompletedAcademicInformation = false;
        }
    }

    function parseUserPhoto(photo, userType) {
        userType = userType || '';
        if (!photo) {
            photo = $rootScope.ENV_ROOT;
            if (userType.toLowerCase() === 'counselor') {
                photo += 'build/images/ic_counselor.png';
            } else if (userType.toLowerCase() === 'parent') {
                photo += 'build/images/ic_teammate.png';
            } else {
                photo += 'build/images/ic_student_badge.png';
            }
        }
        if (!/https?:\/\//.test(photo)) {
            photo = 'http://next-tier-cust-files.s3.amazonaws.com/' + photo;
        }
        return photo;
    }

    function parseDisplayStakeholderType(stakeholderType) {
        if (stakeholderType.toLowerCase() === 'parent') {
            return 'Team Member';
        } else {
            return stakeholderType;
        }
    }
    /*
    Stakeholder login using username and password
    */
    function basicLogin(data) {
        destroySession();
        //Update the email on the stakeholder as retrieving all of the stakeholder data is asynchronous
        //and the next page could need the email before full stakeholder details are available
        user.email = data.email;
        return ApiService.$post(ApiUrlService.stakeholder.signIn(), data)
            .then(function(response) {
                return setSession(response.data.token, response.data.id).then(function() {
                    MixpanelService.event('logged_in_with_basic_login');
                    return getStakeholderInformation().then(function(response) {
                        return response;
                    });
                });
            });
    }

    function ghostLogin(login) {
        var url = ApiUrlService.app.ghostLogin();
        var oldToken = localStorageService.get('authToken');
        var ghostData = {
            'token': oldToken,
            'email': user.email,
            'id': user.id
        };
        ApiService.$post(url, login)
            .then(function(response) {
                // destroySession must happen after ghost login call
                destroySession();
                user.email = login.email;
                localStorageService.set('isGhost', true);
                localStorageService.set('ghostData', JSON.stringify(ghostData));
                return setSession(response.data.token, response.data.id).then(function() {
                    // Eventually want to add tracking for the ghost login
                    // MixpanelService.event('logged_in_with_basic_login');
                    return getStakeholderInformation().then(function(response) {
                        window.location.replace('/app/');
                    });
                });
            });
    }

    function ghostLogout() {
        var ghostData = localStorageService.get('ghostData');
        destroySession();
        user.email = ghostData.email;
        return setSession(ghostData.token, ghostData.id).then(function() {
            // Will want to set tracking for ghost logout eventually.
            //MixpanelService.event('logged_in_with_basic_login');
            return getStakeholderInformation().then(function(response) {
                window.location.replace('/app/');
            });
        });
    }

    function basicRegistration(data) {
        if (user.anonymous) {
            return basicAnonUpgrade(data);
        } else {
            return ApiService.$post(ApiUrlService.stakeholder.register(), data)
                .then(function(response) {
                    MixpanelService.signUp(response.data, false, data);
                    MixpanelService.event('user_created', {
                        'user type': 'registered',
                        'user type 2': data.stakeholder_type,
                        'referring ambassador': Ambassador.get() || 'none'
                    });
                    return response;
                });
        }
    }

    function basicAnonUpgrade(data) {
        data.anon_app_id = user.uuid;
        return ApiService.$post(ApiUrlService.stakeholder.upgradeAnonymous(), data)
            .then(function() {
                MixpanelService.signUp(StakeholderAuthService.id, false, data);
                MixpanelService.event('user_created', {
                    'user type': 'registered',
                    'user type 2': data.stakeholder_type,
                    'referring ambassador': Ambassador.get() || 'none'
                });
            }, function(error) {
                alert('I\'m sorry, we were unable to upgrade your account.  Please try again.');
            });
    }

    function createAnonStakeholder(payload) {
        var uuid = generateUUID();
        payload.anon_app_id = uuid;
        return ApiService.$post(ApiUrlService.stakeholder.createAnonymous(), payload)
            .then(function(response) {
                MixpanelService.event('user_created', {
                    'user type': 'anonymous',
                    'user type 2': 'Anonymous',
                    'referring ambassador': Ambassador.get() || 'none'
                });
                user.anonymous = true;
                user.uuid = uuid;
                user.graduation_year = payload.graduation_year;
                return setSession(response.data.token)
            }, function(error) {
                alert('Couldn\'t create a guest account. ' +
                        'Please Register to make use of this service at this time.');
            });
    }
    //	--- Facebook Section ---
    /*	Hidden
    Make the call to Facebook to authorize app access through Single Sign-in
    */
    function facebookHandshake(callback) {
        return Facebook.login(function() {}, {scope: 'public_profile,email'});
    }
    /*	Exposed as 'facebookLogin'
    Stakeholder sign-in using Facebook Single Sign-in
    */
    function facebookLogin() {
        destroySession();
        return facebookHandshake().then(function(response) {
            if (response.status == 'connected') {
                var data = {
                    facebook_id: response.authResponse.userID,
                    auth_token: response.authResponse.accessToken
                };
                return facebookConfirmation(data).then(function(response) {
                    return setSession(response.data.token, response.data.id);
                })
            }
            return 'NO_FB_CONNECTION';
        });
    }
    /*	Exposed as 'facebookRegistration'
    Stakeholder registration using Facebook Single Sign-in
    */
    function facebookRegistration(userData) {
        return facebookHandshake().then(function(response) {
            if (response.status == 'connected') {
                userData.facebook_id = response.authResponse.userID;
                userData.auth_token = response.authResponse.accessToken;
                if (user.anonymous) {
                    userData.anon_app_id = user.uuid;
                }
                return facebookConfirmation(userData).then(function(response) {
                    MixpanelService.event('user_created', {
                        'user type': 'registered',
                        'user type 2': userData.stakeholder_type,
                        'referring ambassador': Ambassador.get() || 'none'
                    });
                    MixpanelService.signUp(response.data.id, true, userData);
                });
            }
            return 'NO_FB_CONNECTION';
        });
    }
    /*	Hidden
    Handshake with the API to notify of Facebook authorization
    */
    function facebookConfirmation(data) {
        return ApiService.$post(ApiUrlService.stakeholder.facebookConfirmation(), data)
            .error(function(result) {
                console.log(result);
            });
    }

    function resendConfirmation(data) {
        return ApiService.$post(ApiUrlService.stakeholder.resendConfirmation(), data);
    }

    function resetPassword(data) {
        return ApiService.$post(ApiUrlService.stakeholder.forgotPassword(), data);
    }

    function createAlternateContact(data) {
        return ApiService.$post(ApiUrlService.stakeholder.alternateContact(), data)
            .then(function(response) {
                return response.data;
            });
    }

    function getAuthToken() {
        return ApiService.getAuthToken();
    }

    function getUserId() {
        return localStorageService.get('user.roleId');
    }

    function updateAlternateContact(data, id) {
        if (!data.value || data.value.length === 0) {
            return ApiService.$delete(ApiUrlService.stakeholder.updateAlternateContact(id))
                .then(function(response) {
                    return response.data;
                });
        } else {
            return ApiService.$patch(ApiUrlService.stakeholder.updateAlternateContact(id), data)
                .then(function(response) {
                    return response.data;
                });
        }
    }

    function updateStakeholderDetails(data) {
        return ApiService.$patch(ApiUrlService.stakeholder.details(), data)
            .then(function(response) {
                return response;
            });
    }

    function updateStakeholderACT(act_scores, act_id) {
        return ApiService.$patch(ApiUrlService.stakeholder.updateActScores(act_id), act_scores)
            .then(function(response) {
                return response;
            });
    }

    function updateStakeholderSAT(sat_scores, sat_id) {
        return ApiService.$patch(ApiUrlService.stakeholder.updateSatScores(sat_id), sat_scores)
            .then(function(response) {
                return response;
            });
    }

    function deleteStakeholderACT(act_id) {
        return ApiService.$delete(ApiUrlService.stakeholder.updateActScores(act_id))
            .then(function(response) {
                return response;
            });
    }

    function deleteStakeholderSAT(sat_id) {
        return ApiService.$delete(ApiUrlService.stakeholder.updateSatScores(sat_id))
            .then(function(response) {
                return response;
            });
    }

    function createStakeholderACT(act_test) {
        return ApiService.$post(ApiUrlService.stakeholder.makeActScores(), act_test)
            .then(function(response) {
                return response;
            });
    }

    function createStakeholderSAT(sat_scores) {
        return ApiService.$post(ApiUrlService.stakeholder.makeSatScores(), sat_scores)
            .then(function(response) {
                return response;
            });
    }

    function deleteAccount() {
        return ApiService.$delete(ApiUrlService.stakeholder.deleteAccount())
            .then(function(response) {
                return response;
            })
            .catch(function(response) {
                return response;
            });
    }

    function changePassword(data) {
        return ApiService.$post(ApiUrlService.stakeholder.changePassword(), data)
            .then(function(response) {
                return response;
            });
    }

    function generateUUID() {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = (c == 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid;
    }

    function allowUnauthenticatedUsers() {
        user.allowAny = true;
    }

    function needsLogin() {
        //If either of these are true then we don't need to route to the login page
        return !(user.allowAny || user.loggedIn)
    }
}
