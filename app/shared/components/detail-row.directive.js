(function() {
	'use strict';

	angular
	  .module('detail-row', [])
	  .directive('detailRow', detailRow);

	  detailRow.$inject = ['$filter'];

	function detailRow($filter) {
		return{
			restrict: 'A',
			scope: {
				'detailValue': '=detail',
				'detailName': '@detail',
				'detailTooltip': '@tooltip'
			},
			link: function(scope, element, attrs) {
				if (!scope.detailValue || scope.detailValue=='') {
					//element.addClass('ng-hide');
					element.remove();
				} else {
					if (attrs.label) {
						scope.detailDisplayName = attrs.label;
					} else {
						var detailPropArray = scope.detailName.split('.');
						var detailPropName = detailPropArray[detailPropArray.length - 1];
						var detailDisplayName = $filter('underscoresToSpaces')(detailPropName);
						scope.detailDisplayName = $filter('titleCase')(detailDisplayName);
					}
					scope.filter = attrs.filter;
					if (attrs.filter && attrs.filter !== 'link') {
						scope.detailDisplayValue = $filter(attrs.filter)(scope.detailValue);
					} else {
						scope.detailDisplayValue = scope.detailValue;
					}
				}
			},
			template: '<td class="md-body-1 line-height-1">{{detailDisplayName || ""}}<md-icon class="material-icons icon-tooltip" ng-if="detailTooltip">help<md-tooltip>{{detailTooltip}}</md-tooltip></md-icon></td><td class="md-body-1 line-height-1" ng-if="filter!==\'link\'">{{detailDisplayValue || ""}}</td><td class="md-body-1 line-height-1" ng-if="filter==\'link\'"><a ng-href="{{detailDisplayValue}}" target="blank">{{detailDisplayName || ""}}</a></td>'
		};
	}
})();
