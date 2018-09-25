(function() {
    angular
      .module('district')
      .factory('DistrictManager', DistrictManager);

    DistrictManager.$inject = ['API', 'UrlHelper', 'DistrictModel', '$q',
        'StakeholderAuth'
    ];

    function DistrictManager(API, UrlHelper, DistrictModel, $q, StakeholderAuth) {
        var memberList = [];
        var districtManager = {
            addHighSchool: addHighSchool,
            addMatches: addMatches,
            createDistrict: createDistrict,
            createRole: createRole,
            createTeamMember: createTeamMember,
            deleteRole: deleteRole,
            deleteStakeholder: deleteStakeholder,
            editStakeholder: editStakeholder,
            exportTeam: exportTeam,
            getActions: getActions,
            getAllDistricts: getAllDistricts,
            getAllMembers: getAllMembers,
            getDownloadAuth: getDownloadAuth,
            getMembers: getMembers,
            getMetadata: getMetadata,
            getMoreDistricts: getMoreDistricts,
            getMoreStakeholders: getMoreStakeholders,
            getRoles: getRoles,
            getStakeholder: getStakeholder,
            getStakeholders: getStakeholders,
            initFaculty: initFaculty,
            initTeam: initTeam,
            initTeamFilter: initTeamFilter,
            removeHighSchool: removeHighSchool,
            renameRole: renameRole,
            saveDistrict: saveDistrict,
            selectDistrict: selectDistrict,
            sendNotifications: sendNotifications,
            setMetadata: setMetadata,
            updateActionList: updateActionList,
            updateMetadata: updateMetadata,
            updateTeamMember: updateTeamMember
        };
        return districtManager;

        function addHighSchool(highSchool) {
            var data = {
                district: DistrictModel.district.id
            };
            return API.$patch(UrlHelper.highschools.highschool(highSchool.id), data);
        }

        function removeHighSchool(highSchool) {
            var data = {
                district: ''
            };
            return API.$patch(UrlHelper.highschools.highschool(highSchool.id), data);
        }

        function createDistrict() {
            return rawCreateDistrict(DistrictModel.district)
                .then(function(results) {
                    DistrictModel.district = results.data;
                    DistrictModel.allDistricts.push(DistrictModel.district);
                    return DistrictModel.district;
                });
        }

        function createRole() {
            var id = DistrictModel.district.id;
            var data = {
                'name': 'New Role',
                'district': id
            }
            return API.$post(UrlHelper.district.createRole(), data)
                .then(function(result) {
                    DistrictModel.district.roles.push(result.data);
                    return result.data
                })
        }

        function getActions() {
            return rawGetActions().then(function(result) {
                DistrictModel.district.actions = result.data.results;
                return result.data.results;
            })
        }

        function getRoles() {
            return rawGetRoles().then(function(result) {
                DistrictModel.district.roles = result.data.results;
                return result.data.results;
            })
        }

        function updateActionList(role, action, add) {
            var id = DistrictModel.district.id;
            var role_id = role.id;
            var data = {
                'role_id': role.id,
                'action_id': action.id
            };
            if (add) {
                return API.$post(UrlHelper.entitlements.linkRoleAction(id), data);
            } else {
                return API.$delete(UrlHelper.entitlements.linkRoleAction(id), data);
            }
        }

        function deleteRole(role) {
            var id = DistrictModel.district.id;
            var role_id = role.id;
            return API.$delete(UrlHelper.district.updateRole(id, role_id)).then(
                function(ex) {
                    _.remove(DistrictModel.district.roles, function(n) {
                        return n.id == role_id
                    });
                });
        }

        function renameRole(role) {
            var id = DistrictModel.district.id;
            var role_id = role.id;
            var data = {
                'name': role.name,
                'description': role.description
            };
            return API.$patch(UrlHelper.district.updateRole(id, role_id), data);
        }

        function exportTeam(id, detailed) {
            if (!id) {
                if (DistrictModel.district && DistrictModel.district.id) id = DistrictModel.district.id;
            }
            var url = UrlHelper.district.export(id);
            if (DistrictModel.currentFilter) {
                url += DistrictModel.currentFilter;
            }
            if (detailed) {
                if (DistrictModel.currentFilter) {
                    url += '&detailed';
                } else {
                    url += '?detailed';
                }
            }
            return API.$get(url).then(function(result) {
                return result.data;
            });
        }

        function convertDateTime(dateString) {
            var login = new Date(dateString);
            return login.toLocaleDateString() + ' ' + (login.toLocaleTimeString()
                .split()[0]);
        }

        function editStakeholder(stakeholder) {
            DistrictModel.originalStakeholderObject = stakeholder;
            var stakeholderToEdit = jQuery.extend({}, stakeholder);
            DistrictModel.selectedStakeholder = stakeholderToEdit;
            stakeholderToEdit.lastLogin = convertDateTime(stakeholderToEdit.last_login);
            var emailDomain = stakeholder.email.split('@');
            if (emailDomain[1] == DistrictModel.district.domain) {
                stakeholderToEdit.emailSplice = emailDomain[0];
            } else {
                stakeholderToEdit.cannotChangeEmail = true;
            }
            if (stakeholderToEdit.id) {
                if (stakeholderToEdit.roles == null) {
                    enrichWithRoles(stakeholderToEdit);
                }
                getActivity(stakeholderToEdit.id).then(function(feed) {
                    stakeholderToEdit.activity = feed;
                    for (var idx = feed.length; idx--;) {
                        feed[idx].eventDate = convertDateTime(feed[
                            idx].created_on);
                    }
                })
            }
        }

        function enrichWithRoles(stakeholder) {
            return API.$get(UrlHelper.stakeholder.roles(stakeholder.id)).then(
                function(response) {
                    var stakeholderRoles = response.data.results;
                    stakeholder.roles = _.map(stakeholderRoles, 'id');
                })
        }

        function saveDistrict(data) {
            return API.$patch(UrlHelper.district.detail(data.id), data);
        }

        function getAllDistricts() {
            return rawGetAllDistricts().then(function(response) {
                DistrictModel.allDistricts = response.data.results;
                DistrictModel.allDistrictsNextPage = response.data.next;
                return DistrictModel.allDistricts;
            });
        }

        function getMoreDistricts() {
            return API.$get(DistrictModel.allDistrictsNextPage).then(
                function(response) {
                    DistrictModel.allDistricts.push.apply(DistrictModel.allDistricts, response.data.results);
                    DistrictModel.allDistrictsNextPage = response.data.next;
                })
        }

        function getDownloadAuth() {
            return API.$get(UrlHelper.district.districtExport()).then(
                function(response) {
                    return response;
                })
        }

        function deleteStakeholder(stakeholder) {
            return API.$delete(UrlHelper.stakeholder.details() + stakeholder.id);
        }

        function getStakeholder(stakeholderId) {
            return API.$get(UrlHelper.stakeholder.details() + stakeholderId)
                .then(function(response) {
                    return response.data;
                }).catch(function(ex) {
                    toastr.error('Failed to load member.');
                    console.log(ex);
                });
        }
        // You can pass the name of the array that you want and get a paged list
        // of the stakeholders
        function getStakeholders(stakeholderRequestObject) {
            var queryString = buildStakeholderQueryString(
                stakeholderRequestObject.systemLogId,
                stakeholderRequestObject.name);
            return API.$get(UrlHelper.stakeholder.bulk() + queryString).then(
                function(response) {
                    return response.data;
                }).catch(function(error) {
                toastr.error('Failed to get all stakeholders');
                console.log(error);
            })
        }

        function getMetadata(districtId) {
            return API.$get(UrlHelper.district.getFieldmap(districtId)).then(
                function(response) {
                    return response.data;
                }).catch(function(error) {
                toastr.error('Failed to get metadata');
                console.log(error);
            });
        }

        function sendNotifications(districtId, data, query_string) {
            return API.$post(UrlHelper.district.messages(districtId) + query_string, data).then(function(response) {
                toastr.success('Notifications sent');
                return response.data;
            }).catch(function(error) {
                toastr.error('Failed to send notifications');
                console.log(error);
            });
        }

        function setMetadata(uniqueIdentifier) {
            var data = { name: uniqueIdentifier, field_type: 'unique' };
            var districtId = DistrictModel.district.id;
            return API.$post(UrlHelper.district.getFieldmap(districtId),
                data).then(function(response) {
                data = { field_name: uniqueIdentifier, field_type: 'unique' }
                return data;
            }).catch(function(error) {
                toastr.error('Failed to update metadata');
                console.log(error);
            });
        }

        function updateMetadata(uniqueIdentifier, metadataId) {
            var data = { field_name: uniqueIdentifier };
            var districtId = DistrictModel.district.id;
            return API.$patch(UrlHelper.district.getFieldmap(districtId) + metadataId, data).then(function(response) {
                return response.data;
            }).catch(function(error) {
                toastr.error('Failed to update metadata');
                console.log(error);
            });
        }

        function getMoreStakeholders(next) {
            return API.$get(next).then(function(response) {
                return response.data;
            }).catch(function(error) {
                toastr.error('Failed to get more stakeholders');
                console.log(error);
            })
        }

        function setCounselorSummaries(idArray) {
            if (idArray.length == 0) {
                return $q.when([]);
            }
            return getSummaryRaw(idArray).then(function(results) {
                var summary = results.data.results;
                for (var counidx = summary.length; counidx--;) {
                    var counselorPos = DistrictModel.getStakeholderPos(
                        summary[counidx].id);
                    var counselor = counselorPos.coun;
                    counselor.summary = summary[counidx];
                }
                return summary;
            });
        }

        function addMatches(id, data) {
            return API.$post(UrlHelper.district.addAllMatches(id), data);
        }

        function initTeam(queryParams) {
            DistrictModel.currentFilter = queryParams;
            DistrictModel.pagedStakeholderList = [];
            return getAllMembers(null, queryParams)
        }
        //Active district must be set
        function getAllMembers(next, queryParams) {
            return rawGetAllMembers(next, queryParams).then(function(result) {
                if (!DistrictModel.totalResults) {
                    DistrictModel.totalResults = result.data.count
                }
                DistrictModel.district.size = result.data.count;
                DistrictModel.pagedStakeholderList = DistrictModel.pagedStakeholderList
                    .concat(result.data.results);
                DistrictModel.url = result.data.next;
            });
        }

        function getMembers(id) {
            return API.$get(UrlHelper.district.getMembers(id) + '?stakeholder_type=Counselor&page_size=100');
        }

        function createTeamMember(data) {
            return API.$post(UrlHelper.district.addStakeholder(), data);
        }

        function updateTeamMember(stakeholder) {
            return API.$patch(UrlHelper.stakeholder.details() + stakeholder.id + '/', stakeholder);
        }

        function initTeamFilter() {
            return getActions().then(function(actions) {
                var showDistrict = hasViewAllDistrictEntitlement(
                    StakeholderAuth.getUser().entitlements);
                var url = UrlHelper.filters.team(showDistrict);
                if (StakeholderAuth.isAdmin()) {
                    url += (url.includes('?') ? '&' : '?') + 'district=' + DistrictModel.district.id;
                }
                return API.$get(url).then(function(response) {
                    var filter = response.data;
                    for (var key = filter.length; key--;) {
                        if (filter[key].subCategories) {
                            for (var item = filter[key].subCategories.length; item--;) {
                                filter[key].subCategories[
                                        item].type = 'default';
                            }
                        }
                    }
                    DistrictModel.filters = DistrictModel.filters
                        .concat(filter);
                    return filter;
                });
            });
        }

        function initFaculty() {
            return getBasicMembers().then(function(members) {
                return enrichMembers(members);
            });
        }

        function getBasicMembers() {
            DistrictModel.members = [];
            if (DistrictModel.district && DistrictModel.district.id) {
                getDomainMatches(DistrictModel.district.id).then(function(
                    response) {
                    DistrictModel.potential = response.data;
                });
                return getMembers(DistrictModel.district.id).then(function(
                    response) {
                    DistrictModel.members = response.data.results;
                    DistrictModel.filters = updateFilter(
                        DistrictModel.members, DistrictModel.filters
                    );
                    DistrictModel.visibleMembers = DistrictModel.members;
                    return DistrictModel.members;
                });
            }
        }

        function initModel(dist) {
            DistrictModel.filters = [];
            DistrictModel.pagedStakeholderList = null;
            DistrictModel.url = null;
            DistrictModel.district = dist;
        }

        function enrichDistrict(dist) {
            initModel(dist);
            initTeam();
            initTeamFilter();
            initHighSchools();
            return initFaculty();
        }

        function selectDistrict(id, dist) {
            if (dist) {
                return enrichDistrict(dist);
            }
            if (id && id > 0) {
                for (var idx = DistrictModel.allDistricts.length; idx--;) {
                    if (DistrictModel.allDistricts[idx].id == id) {
                        return enrichDistrict(DistrictModel.allDistricts[
                            idx]);
                    }
                }
            }
        }

        function initHighSchools() {
            DistrictModel.district.highschools = [];
            if (DistrictModel.district.id) {
                API.$get(UrlHelper.district.highschools(DistrictModel.district.id)).then(function(response) {
                    DistrictModel.district.highschools = response.data.results;
                }).catch(function(ex) {
                    console.log(ex);
                    toastr.warning(
                        'Failed to find High Schools for districts. Refresh page.'
                    )
                })
            }
        }
        //API calls
        function rawGetAllMembers(next, queryParams) {
            if (!next) {
                DistrictModel.pagedStakeholderList = [];
                var url = UrlHelper.district.getMembers(DistrictModel.district.id);
                var pg_size = 'page_size=40';
                if (queryParams) url += queryParams + '&' + pg_size;
                else url += '?' + pg_size;
                return API.$get(url);
            }
            return API.$get(next);
        }

        function rawGetAllDistricts() {
            return API.$get(UrlHelper.district.getDistricts());
        }

        function getSummaryRaw(idArray) {
            return API.$get(UrlHelper.district.getSummary(idArray));
        }

        function getDomainMatches(id) {
            return API.$get(UrlHelper.district.getPotentialMembers(id));
        }

        function rawCreateDistrict(data) {
            return API.$post(UrlHelper.district.getDistricts(), data);
        }
        // private methods
        function filterEntry(counselor) {
            return {
                id: counselor.id,
                value: getStakeholderName(counselor)
            };
        }

        function updateFilter(members, filters) {
            newFilters = _.filter(filters, function(x) { return x.name != 'Counselors' })
            var counselors = [];
            var counselorFilter = {
                name: 'Faculty',
                queryName: 'coun_id',
                type: 'default',
                options: counselors
            };
            var result = [counselorFilter];
            for (var i = members.length; i--;) {
                var member = filterEntry(members[i]);
                counselors.push(member);
            }
            counselors.push({ id: '-1', value: 'No Connection' });
            newFilters.push(counselorFilter);
            return newFilters;
        }

        function getStakeholderName(stake) {
            if (stake.first_name) {
                return stake.first_name + ' ' + stake.last_name;
            }
            return stake.email;
        }

        function getActivity(id) {
            var distId = DistrictModel.district.id;
            return API.$get(UrlHelper.district.getActivity(distId) + '?student=' + id).then(function(result) {
                return result.data.results;
            });
        }

        function rawGetActions() {
            return API.$get(UrlHelper.entitlements.getActionList(
                DistrictModel.district.id));
        }

        function rawGetRoles() {
            return API.$get(UrlHelper.entitlements.getRoleList(
                DistrictModel.district.id));
        }
        //get data required for graph
        function enrichMembers(members) {
            var allIds = [];
            for (var idx = members.length; idx--;) {
                var member = members[idx];
                allIds.push(member.id);
                member.emailSplice = member.email.split('@')[0];
                member.score = .7;
                member.size = 20;
                member.name = member.emailSplice;
                member.summary = { connections: 0 }
            }
            return setCounselorSummaries(allIds);
        }

        function buildStakeholderQueryString(systemLogId, key) {
            var queryString = '?system_log=' + systemLogId + '&key=' + key;
            return queryString;
        }

        function hasViewAllDistrictEntitlement(actions) {
            var hasViewAll = false;
            for (var i = 0, action; action = actions[i]; ++i) {
                if (action.name === 'View All' && action.resource === 'District') {
                    hasViewAll = true;
                    break;
                }
            }
            return hasViewAll;
        }
    }
})();
