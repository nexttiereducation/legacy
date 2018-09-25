(function() {
    angular
        .module('dashboard')
        .controller('Dashboard', Dashboard);

    Dashboard.$inject = ['StakeholderAuth', 'DistrictManager',
        'DistrictModel', '$location', '$scope', '$rootScope'
    ];

    function Dashboard(StakeholderAuth, DistrictManager, DistrictModel,
        $location, $scope, $rootScope) {
        if (StakeholderAuth.needsLogin()) {
            return;
        }
        var vm = this;
        this.updateHighlight = updateHighlight;
        this.routeTo = routeTo;
        this.getStakeholderName = getStakeholderName;
        var user = StakeholderAuth.getStakeholder();
        this.admin = StakeholderAuth.isAdmin();
        this.administerMembers = this.admin || StakeholderAuth.isAllowed('Create Users');
        this.DistrictModel = DistrictModel;
        this.highlight = true;
        this.datanodes = { 'nodes': [{ 'name': 'None Set', 'type': 'square', 'size': 30 }], 'links': [] };
        this.stakeholders = [];
        this.toggleSidebar = toggleSidebar;
        activate();
        return;

        function activate() {
            setDetail($location.path());
            if (!this.admin && !StakeholderAuth.isAllowed('view all')) {
                alert('user not allowed to view district list');
            }
            if (user.district && user.district.id) {
                DistrictManager.selectDistrict(user.district.id, user.district)
                    .then(function() {
                        if (this.DistrictModel.currentPage == 'graph') {
                            setMembers();
                        }
                    });
            }
        }

        function getStakeholderName(stake) {
            if (stake.first_name) {
                return stake.first_name + ' ' + stake.last_name;
            }
            return stake.email;
        }

        function updateHighlight() {
            var nodes = this.datanodes.nodes;
            for (var nodeIdx = nodes.length; nodeIdx--;) {
                var stake = nodes[nodeIdx];
                if (stake.stakeholder_type && stake.stakeholder_type == 'Student') {
                    if (this.highlight) {
                        stake.score = stake.schoolScore;
                    } else {
                        stake.schoolScore = stake.score;
                        stake.score = undefined;
                    }
                }
            }
        }

        function toggleSidebar() {
            $rootScope.$broadcast('toggleSidebar');
        }
        //Draw the graph
        function populateNetwork(faculty) {
            var newNodes = [{
                name: DistrictModel.district.name,
                size: 30,
                type: 'square',
                score: 0,
                id: -100
            }];
            var nodes = newNodes.concat(faculty);
            var links = [];
            for (var i = nodes.length; i--;) {
                var link = {
                    'source': 0,
                    'target': parseInt(i)
                };
                if (i != 0) links.push(link);
            }
            this.datanodes.nodes = nodes;
            this.datanodes.links = links;
            for (var idx = faculty.length; idx--;) {
                newNodes = nodes;
                links = links;
                var summary = faculty[idx].summary;
                var studentIdx = nodes.length;
                for (var counidx = faculty.length; counidx--;) {
                    var counselor = faculty[counidx];
                    var pos = counidx;
                    var withSchool = parseInt(counselor.summary.students_with_a_school);
                    var colorIt = 0;
                    for (var i = 0; i < counselor.summary.connections; i++) {
                        var sourceIdx = parseInt(pos) + 1;
                        var aStudent = {
                            size: 2,
                            type: 'circle',
                            stakeholder_type: 'Student'
                        };
                        if (colorIt++ < withSchool && this.highlight) {
                            aStudent.score = 0.4;
                        }
                        newNodes.push(aStudent);
                        links.push({ 'source': sourceIdx, 'target': studentIdx++ });
                    }
                }
                this.datanodes = { nodes: newNodes, links: links };
            }
        }

        function routeTo(path) {
            $location.path(path, false);
            setDetail(path);
        }

        function setDetail(path) {
            this.DistrictModel.currentPage = 'all';
            if (this.admin) {
                this.DistrictModel.currentPage = 'setup';
                this.selectedTabIndex = 4;
            }
            if (/all/.test(path)) {
                this.DistrictModel.currentPage = 'all';
                this.selectedTabIndex = 0;
            }
            if (/summary/.test(path)) {
                this.DistrictModel.currentPage = 'summary';
                this.selectedTabIndex = 1;
            } else if (/edit/.test(path)) {
                this.DistrictModel.currentPage = 'edit';
                this.selectedTabIndex = 3;
            } else if (/graph/.test(path)) {
                if (this.datanodes.nodes.length < 2) {
                    setMembers();
                }
                this.DistrictModel.currentPage = 'graph';
                this.selectedTabIndex = 2;
            }
            if (StakeholderAuth.getUser().district == null &&
                StakeholderAuth.isAdmin() && this.DistrictModel.currentPage != 'setup') {
                $location.path('/setup', true);
            }
            if (this.DistrictModel.currentPage != 'edit') {
                DistrictModel.selectedStakeholder = null;
            }
        }

        function setMembers() {
            if (DistrictModel.isValid()) {
                this.datanodes = {
                    'nodes': [{
                        name: DistrictModel.district.name, size: 10,
                        type: 'square'
                    }],
                    'links': []
                };
                populateNetwork(DistrictModel.members);
            }
        }
    }
})();
