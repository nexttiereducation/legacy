(function() {

    angular.module('district').run( AddUrls );
    AddUrls.$inject = ['UrlHelper'];

    function AddUrls( urlHelper ) {

        urlHelper.init();

        urlHelper.filters = {
            team: function(showFilters) {
                return urlHelper.getPathRoot() + '/meta/stakeholder' + (showFilters ? '?show_district=true' : '');
            }
        };
        urlHelper.district = {
            createRole: function() {
                return urlHelper.getPathRoot() + '/admin/role/create';
            },
            updateRole: function(dist_id, role_id) {
                return urlHelper.getPathRoot() + '/district/' + dist_id + '/role/' + role_id;
            },
            detail: function(id){
                return urlHelper.getPathRoot() + '/district/' + id + '/';
            },
            highschools: function(id){
                return urlHelper.getPathRoot() + '/highschool/?district=' + id + '&page_size=200';
            },
            getActivity: function(id){
                return urlHelper.getPathRoot() + '/district/' + id + '/stakeholder_history/';
            },
            getFieldmap: function(id) {
                return urlHelper.getPathRoot() + '/district/' + id + '/field_map/';
            },
            getPotentialMembers: function(id){
                return urlHelper.getPathRoot() + '/district/' + id + '/matches/';
            },
            addAllMatches: function(id){
                return urlHelper.getPathRoot() + '/district/'+ id + '/matches/add/';
            },
            getDistricts: function(){
                return urlHelper.getPathRoot() + '/districts/';
            },
            addStakeholder: function() {
                return urlHelper.getPathRoot() + '/district/stakeholder/';
            },
            getMembers: function(id) {
                return urlHelper.getPathRoot() + '/district/' + id + '/stakeholder/';
            },
            getSummary: function(ids){
                var queryString = '?';
                for(var i in ids) {
                    queryString += 'id=' + ids[i] + '&';
                }
                return urlHelper.getPathRoot() + '/stakeholder/summary/' + queryString.slice(0, -1);

            },
            districtExport: function() {
                return urlHelper.getPathRoot() + '/export_token/';
            },
            districtExportWithAuth: function(isDetailed, auth, districtId, queryString) {
                var url = urlHelper.getPathRoot() + '/district/export/' + districtId + '/';
                url += isDetailed ? '?detailed&auth=' + auth : '?auth=' + auth;
                if (queryString) {
                    url += queryString.replace('?', '&');
                }
                return url;
            },
            export: function(id){
                return urlHelper.getPathRoot() + '/district/export/' + id + '/';
            },
            update: function(id){
                return urlHelper.getPathRoot() + '/district/' + id + '/update/';
            },
            messages: function(id) {
                return urlHelper.getPathRoot() + '/messages/district/' + id + '/';
            }
        };
        urlHelper.entitlements = {
            linkRoleAction: function (id) {
                return urlHelper.getPathRoot() + '/district/' + id + '/role/action/';
            },
            getActionList: function (id) {
                return urlHelper.getPathRoot() + '/district/' + id + '/action/';
            },
            getRoleList: function (id) {
                return urlHelper.getPathRoot() + '/district/' + id + '/role/';
            }
        };

    }
})();
