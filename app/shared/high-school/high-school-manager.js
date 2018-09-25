(function() {
    'use strict';

    angular
        .module('high-school')
        .factory('HighSchoolManager', HighSchoolManager);

    HighSchoolManager.$inject = ['API', 'UrlHelper', 'localStorageService'];

    function HighSchoolManager(API, UrlHelper, localStorageService) {
        return {
            createSearchQuery: createSearchQuery,
            currentHighSchoolId: null,
            getDetails: getDetails,
            searchSchools: searchSchools,
            updateHighSchool: updateHighSchool
        };

        function searchSchools(query) {
            return API.$get(UrlHelper.highschools.getList(query), { hideLoader: true })
                .then(function(response) {
                    return response;
                }).catch(function(response) {
                    return response;
                });
        }

        function updateHighSchool(highSchoolId) {
            return API.$patch(UrlHelper.stakeholder.details(), { highschool: highSchoolId })
                .then(function(response) {
                    return response;
                }).catch(function(response) {
                    return response;
                });
        }

        function getDetails(highSchoolId) {
            return API.$get(UrlHelper.highschools.highschool(highSchoolId))
                .then(function(response) {
                    return response;
                }).catch(function(response) {
                    return response;
                });
        }

        function createSearchQuery(filtersUtil, searchName, searchZipCode) {
            var searchItems = jQuery.extend({}, filtersUtil);
            var query;
            if (searchName != '' && (searchZipCode == '' || searchZipCode == undefined)) {
                searchName = searchName.trim();
                query = '';
                if ((!jQuery.isEmptyObject(searchItems)) || (searchName !== '')) {
                    query = '?';
                    if (searchName !== '') {
                        query += 'name=' + searchName;
                    }
                    query = Object.keys(searchItems).reduce(function(pre, curr, index) {
                        for (var i = 0; i < searchItems[curr].length; i++) {
                            if (Array.isArray(searchItems[curr][i])) {
                                for (var j = 0; j < searchItems[curr][i].length; j++) {
                                    pre += curr + '=' + searchItems[curr][i][j];
                                }
                            } else {
                                pre += curr + '=' + searchItems[curr][i];
                            }
                        }
                        return pre;
                    }, query);
                    query = query.slice(0, query.length);
                }
                return query;
            } else if (searchName == '' && searchZipCode != '') {
                searchZipCode = searchZipCode.trim();
                query = '';
                if ((!jQuery.isEmptyObject(searchItems)) || (searchZipCode !== '')) {
                    query = '?';
                    if (searchZipCode !== '') {
                        query += 'zipcode=' + searchZipCode.toString();
                    }
                    query = Object.keys(searchItems).reduce(function(pre, curr, index) {
                        for (var i = 0; i < searchItems[curr].length; i++) {
                            if (Array.isArray(searchItems[curr][i])) {
                                for (var j = 0; j < searchItems[curr][i].length; j++) {
                                    pre += curr + '=' + searchItems[curr][i][j];
                                }
                            } else {
                                pre += curr + '=' + searchItems[curr][i];
                            }
                        }
                        return pre;
                    }, query);
                    query = query.slice(0, query.length);
                }
                return query;
            } else if (searchName != '' && searchZipCode != '') {
                searchName = searchName.trim();
                searchZipCode = searchZipCode.trim();
                query = '';
                if ((!jQuery.isEmptyObject(searchItems)) || (searchZipCode !== '' && searchName.trim() !== '')) {
                    query = '?';
                    if (searchZipCode !== '' && searchName !== '') {
                        query += 'name=' + searchName + '&' + 'zipcode=' + searchZipCode.toString();
                    }
                    query = Object.keys(searchItems).reduce(function(pre, curr, index) {
                        for (var i = 0; i < searchItems[curr].length; i++) {
                            if (Array.isArray(searchItems[curr][i])) {
                                for (var j = 0; j < searchItems[curr][i].length; j++) {
                                    pre += curr + '=' + searchItems[curr][i][j];
                                }
                            } else {
                                pre += curr + '=' + searchItems[curr][i];
                            }
                        }
                        return pre;
                    }, query);
                    query = query.slice(0, query.length);
                }
                return query;
            }
        }
        return srvc;
    }
})();
