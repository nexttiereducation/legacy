angular
    .module('adminModule')
    .controller('PolicyCtrl', PolicyCtrl);

PolicyCtrl.$inject = ['$scope', 'ApiService', 'ApiUrlService'];

function PolicyCtrl($scope, ApiService, ApiUrlService) {
    $scope.textContent = '';
    $scope.editingToU = true;
    $scope.termsId = null;
    $scope.policyId = null;
    $scope.editToU = function() {
        $scope.textContent = '';
        $scope.editingToU = true;
        ApiService.$get(ApiUrlService.policy.getToU()).success(function(
            response) {
            $scope.textContent = response.content;
            $scope.termsId = response.id;
        }).error(function(data, status) {
            if (status == 404) {
                ApiService.$post(ApiUrlService.policy.create(), {
                    title: 'terms',
                    content: '-empty-'
                }).success(function(response) {
                    $scope.textContent = response.content;
                    $scope.termsId = response.id;
                });
            }
        });
    };
    $scope.editPP = function() {
        $scope.textContent = '';
        $scope.editingToU = false;
        ApiService.$get(ApiUrlService.policy.getPP())
            .success(function(response) {
                $scope.textContent = response.content;
                $scope.policyId = response.id;
            }).error(function(data, status) {
                if (status == 404) {
                    ApiService.$post(ApiUrlService.policy.create(), {
                        title: 'policy',
                        content: '-empty-'
                    }).success(function(response) {
                        $scope.textContent = response.content;
                        $scope.policyId = response.id;
                    });
                }
            });
    };
    $scope.save = function() {
        var id = ($scope.editingToU) ? $scope.termsId : $scope.policyId;
        var url = ApiUrlService.policy.updateText(id);
        ApiService.$patch(url, { 'content': $scope.textContent }).success(
            function() {
                toastr.info('Content Updated.');
            }).error(function() {
            toastr.error(
                'Content failed to update, please try again.',
                'Error'
            );
        });
    };
    $scope.editToU();
}
