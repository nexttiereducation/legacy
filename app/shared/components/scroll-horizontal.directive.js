(function() {
    'use strict';
    angular.module('nteExtensions').directive('scrollHorizontal',
        scrollHorizontal);

    function scrollHorizontal($timeout, $mdMedia) {

    	var buttonLeft = '<md-button class="scroll-horizontal scroll-left md-icon-button" ng-click="scrollLeft()" ng-hide="!$mdMedia(\'gt-sm\')" ng-disabled="leftPosition == 0"><md-icon class="material-icons">keyboard_arrow_left</md-icon></md-button>';
    	var buttonRight = '<md-button class="scroll-horizontal scroll-right md-icon-button" ng-click="scrollRight()" ng-hide="!$mdMedia(\'gt-sm\')"><md-icon class="material-icons">keyboard_arrow_right</md-icon></md-button>';

        return {
            restrict: 'A',
            transclude: true,
            template: buttonLeft + '<div class="scroll-horizontal-wrapper" layout="row" flex><div class="scroll-horizontal-content" layout="row" layout-align="{{!$mdMedia(\'gt-sm\') ? \'space-around start\' : \'start center\'}}" flex ng-class="{\'layout-wrap\': !$mdMedia(\'gt-sm\')}" ng-transclude></div></div>' + buttonRight,
            scope: '=',
            link: function(scope, element, attrs) {

            	attrs.$set('style', 'position:relative');

            	var scrollBox = element.find('.scroll-horizontal-wrapper');
            	var scrollContent = element.find('.scroll-horizontal-content');
            	var clickOffset = 700; /* Pixels that will be displayed/hidden on click */
            	var clickOffsetTiming = 500; /* Amount of time to scroll (in ms) */

            	scope.leftPosition = scrollBox.scrollLeft();
            	scope.wrapperWidth = scrollBox.width();

               scope.scrollRight = function() {
                    scrollBox.animate({ scrollLeft: scope.leftPosition + clickOffset }, clickOffsetTiming);
                    scope.leftPosition = scope.leftPosition + clickOffset;
                    scope.contentWidth = scrollContent.width();
                };

                scope.scrollLeft = function() {
                    scrollBox.animate({ scrollLeft: scope.leftPosition - clickOffset }, clickOffsetTiming);
                    scope.leftPosition = scope.leftPosition - clickOffset;
                };
            }
        }
    }
})();

