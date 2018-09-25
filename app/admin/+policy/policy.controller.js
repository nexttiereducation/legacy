angular
    .module('adminModule')
    .controller('PolicyCtrl', PolicyCtrl);

PolicyCtrl.$inject = ['$scope', 'ApiService', 'ApiUrlService'];

function PolicyCtrl($scope, ApiService, ApiUrlService) {
    this.textContent = '';
    this.editingToU = true;
    this.termsId = null;
    this.policyId = null;

    function editToU() {
        this.textContent = '';
        this.editingToU = true;
        ApiService.$get(ApiUrlService.policy.getToU()).success(function(
            response) {
            this.textContent = response.content;
            this.termsId = response.id;
        }).error(function(data, status) {
            if (status == 404) {
                ApiService.$post(ApiUrlService.policy.create(), {
                    title: 'terms',
                    content: '-empty-'
                }).success(function(response) {
                    this.textContent = response.content;
                    this.termsId = response.id;
                });
            }
        });
    }

    function editPP() {
        this.textContent = '';
        this.editingToU = false;
        ApiService.$get(ApiUrlService.policy.getPP())
            .success(function(response) {
                this.textContent = response.content;
                this.policyId = response.id;
            }).error(function(data, status) {
                if (status == 404) {
                    ApiService.$post(ApiUrlService.policy.create(), {
                        title: 'policy',
                        content: '-empty-'
                    }).success(function(response) {
                        this.textContent = response.content;
                        this.policyId = response.id;
                    });
                }
            });
    }

    function save() {
        var id = (this.editingToU) ? this.termsId : this.policyId;
        var url = ApiUrlService.policy.updateText(id);
        ApiService.$patch(url, { 'content': this.textContent }).success(
            function() {
                toastr.info('Content Updated.');
            }).error(function() {
            toastr.error(
                'Content failed to update, please try again.',
                'Error'
            );
        });
    }

    this.editToU();
}
