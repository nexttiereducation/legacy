'use strict';

angular
    .module('stakeholderModule')
    .service('targetStakeholderService', [
        '$q',
        '$rootScope',
        'ApiUrlService',
        'ApiService',
        'localStorageService',
        function ($q, $rootScope, ApiUrlService, ApiService, localStorageService) {
            var Peer = function () {
                this.isSet = false;
            };
            var peerResults = [];

            Peer.prototype.setPeerId = function setThePeerId(peerId, oldDeferred, url, thePeer) {
                var defer = oldDeferred || $q.defer();
                var pr = thePeer || this;
                //get the list of team members and make sure you have access to that target
                ApiService.$get(url || ApiUrlService.peer.team())
                    .then(function (response) {
                        var set = false;
                        var results = response.data.results;
                        peerResults
                            .push
                            .apply(peerResults, results);
                        if (response.data.next) {
                            setThePeerId(peerId, defer, response.data.next, pr);
                        } else {
                            for (var i = 0; i < peerResults.length; i++) {
                                //if the id of the target is part of the list, add them
                                if (peerId == peerResults[i].student.id) {
                                    set = true;
                                    pr.setPeer(peerResults[i].student);
                                    defer.resolve({data: response.data});
                                    break;
                                }
                            }
                            if (!set) {
                                defer.reject('Student not found.');
                            }
                        }
                    });
                return defer.promise;
            };

            Peer.prototype.setPeer = function (peerObject) {
                peerObject = peerObject || {};
                angular.extend(this, peerObject);
                this.isSet = angular.isDefined(peerObject.id);
                localStorageService.set('targetStakeholder', peerObject);
                $rootScope.$broadcast('targetStakeholderEstablished');
            };

            Peer.prototype.getPeer = function () {
                return this.isSet ? this : null;
            };

            Peer.prototype.getPeerId = function () {
                return (this.isSet) ? this.id : null;
            };

            Peer.prototype.clearPeer = function () {
                var keys = Object.keys(this);
                for (var i = 0; i < keys.length; i++) {
                    delete this[keys[i]];
                }
                this.isSet = false;
                localStorageService.remove('targetStakeholder');
                $rootScope.$broadcast('targetStakeholderDestroyed');
            };

            Peer.prototype.checkSession = function () {
                var target = localStorageService.get('targetStakeholder');
                if (target) {
                    this.setPeer(target);
                }
            };

            var peer = new Peer();
            peer.checkSession();
            return peer;
        }
    ]);
