//TODO This module doesn't appear to be used. May be able to delete.
(function () {
    angular.module('Auth', []);

    angular.module('Auth')
        .service('Authorization', ['$rootScope', 'UrlHelper', 'API', '$q',
            'Stakeholder', 'Facebook', 'Track', '$location', 'localStorageService', 'Ambassador',
            'InstitutionTracker', 'TargetStakeholder',
            function ($rootScope, UrlHelper, API, $q,
                      Stakeholder, Facebook, Track, $location, Storage, Ambassador,
                      InstitutionTracker, TargetStakeholder) {
                'use strict';

                var srvc = {};
                var deferred = $q.defer();
                srvc.isSet = false;
                srvc.authPromise = deferred.promise;

                var sendToDash = function () {
                    $location.path('/dashboard');
                };

                srvc.start = function () {
                    if (srvc.isSet) {
                        //get Stakeholder
                        srvc.authPromise = Stakeholder.establish().then(function () {
                            //get Target Stakeholder
                            TargetStakeholder.checkSession();
                        });
                    }
                    else {
                        deferred.resolve();
                    }
                    return srvc.authPromise;
                };

                srvc.clear = function () {
                    //broadcast still affects notification service and task tracker
                    $rootScope.$broadcast('logout');
                    Stakeholder.destroy();
                    TargetStakeholder.clearPeer();
                    InstitutionTracker.reset();
                    srvc.signOut();
                    Track.clearUser();
                };

                srvc.checkSession = function () {
                    var token = Storage.get('authToken');
                    if (token) {
                        API.setAuthToken(token);
                    }
                    srvc.isSet = !!token;
                    return srvc.start();
                };

                var setToken = function (token) {
                    API.setAuthToken(token);
                    Storage.set('authToken', token);
                    srvc.isSet = true;
                };

                srvc.signOut = function () {
                    srvc.isSet = false;
                    Storage.remove('authToken');
                    API.removeAuthToken();
                };

                // Stakeholder login using username and password
                srvc.basicLogin = function (data) {
                    srvc.signOut();
                    Ambassador.clear();
                    return API.$post(UrlHelper.stakeholder.signIn(), data)
                        .then(function (response) {
                            $rootScope.anonStakeholder = false;
                            setToken(response.token);
                            srvc.start()
                                .then(function () {
                                    sendToDash();
                                });
                        });
                };

                //    --- Facebook Section ---

                // Make the call to Facebook to authorize app access through Single Sign-in
                var facebookHandshake = function (callback) {
                    return Facebook.login(function () {
                    }, {scope: 'public_profile,email'});
                };

                // Stakeholder sign-in using Facebook Single Sign-in
                srvc.facebookLogin = function () {
                    srvc.signOut();
                    Ambassador.clear();
                    return facebookHandshake()
                        .then(function (response) {
                            if (response.status == 'connected') {
                                var data = {
                                    facebook_id: response.authResponse.userID,
                                    auth_token: response.authResponse.accessToken
                                };
                                return facebookConfirmation(data)
                                    .then(function (response) {
                                        $rootScope.anonStakeholder = false;
                                        setToken(response.token);
                                        srvc.start()
                                            .then(function () {
                                                sendToDash();
                                            });
                                    });
                            }
                            return 'NO_FB_CONNECTION';
                        });
                };

                // Stakeholder registration using Facebook Single Sign-in
                srvc.facebookRegistration = function (userData) {
                    return facebookHandshake()
                        .then(function (response) {
                            if (response.status == 'connected') {
                                userData.facebook_id = response.authResponse.userID;
                                userData.auth_token = response.authResponse.accessToken;
                                if (Stakeholder.anonymous) {
                                    userData.anon_app_id = Stakeholder.uuid;
                                }

                                return facebookConfirmation(userData)
                                    .then(function (response) {
                                        Track.event('user_created', {
                                            'user type': 'registered',
                                            'user type 2': userData.stakeholder_type,
                                            'referring ambassador': Ambassador.get() || 'none'
                                        });
                                        Track.signUp(response.id, true, userData);
                                        srvc.signOut();
                                    });
                            }
                            return 'NO_FB_CONNECTION';
                        });
                };

                // Handshake with the API to notify of Facebook authorization
                var facebookConfirmation = function (data) {
                    return API.$post(UrlHelper.stakeholder.facebookConfirmation(), data);
                };

                // Check against Facebook API to see if the user is signed-in
                srvc.facebookCheckLoginStatus = function () {
                    return Facebook.getLoginStatus()
                        .then(function (response) {
                            if (response.status == 'connected') {
                                var data = {
                                    facebook_id: response.authResponse.userID,
                                    auth_token: response.authResponse.accessToken
                                };
                                return facebookConfirmation(data)
                                    .then(function (response) {
                                        setToken(response.token);
                                        srvc.start()
                                            .then(function () {
                                                sendToDash();
                                            });
                                    });
                            }
                        });
                };

                //    --- Anonymous Stakeholder Section ---

                // Generates unique ID for anon stakeholder
                var generateUUID = function () {
                    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
                        return v.toString(16);
                    });

                    return uuid;
                };

                // Creates an anonymous stakeholder
                srvc.createAnonStakeholder = function (payload) {
                    var uuid = generateUUID();
                    payload.anon_app_id = uuid;
                    return API.$post(UrlHelper.stakeholder.createAnonymous(), payload)
                        .then(function (response) {
                            Track.event('user_created', {
                                'user type': 'anonymous',
                                'user type 2': 'Anonymous',
                                'referring ambassador': Ambassador.get() || 'none'
                            });

                            setToken(response.token);
                            Stakeholder.anonymous = true;
                            Stakeholder.uuid = uuid;
                            return Stakeholder.establish(response.id)
                                .then(function () {
                                    $rootScope.anonStakeholder = true;
                                });
                        },
                        function (error) {
                            alert('Couldn't create a guest account. ' +
                                'Please Register to make use of this service at this time.');
                        });
                };

                // Function to upgrade anonymous stakeholder up to a registered stakeholder
                var basicAnonUpgrade = function (data) {
                    data.anon_app_id = Stakeholder.uuid;
                    return API.$post(UrlHelper.stakeholder.upgradeAnonymous(), data)
                        .then(function () {
                            Track.event('user_created', {
                                'user type': 'registered',
                                'user type 2': data.stakeholder_type,
                                'referring ambassador': Ambassador.get() || 'none'
                            });
                            Track.signUp(Stakeholder.id, false, data);
                        },
                        function (error) {
                            alert('I\'m sorry, we were unable to upgrade your account.  Please try again.');
                        }
                    );
                };

                return srvc;
            }]);

})();
