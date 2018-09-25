angular
  .module('nte-loader', [])
  .directive('nte-loader', loaderDirective);

function loaderDirective() {
	return {
		replace: true,
		restrict: 'E',
		scope: '=',
		template: '<div style="width: 100%; height: 100%;" flex layout="column" layout-align="center center" ng-if="showLoader"> <div class="loader"> <img src="https://next-tier.s3.amazonaws.com/build/images/animations/loader.svg"> </div> </div>'
	};
}