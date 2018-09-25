'use strict';
// Infinite scrolling!!!
/*
	One directional infinite scroll (i.e. It will keep appending items to
	 the end of the list, but wont remove items from the beginning of it).

	There should be an associated function in scope to populate the
	 list with more items

	Example:
	<div id='item-list' infinite-scroll='functionToGetMoreItems()'>
		<ul>
			<li>item1</li>
			<li>item2</li>
			<li>item3</li>
			...
			<li>itemN</li>
		</ul>
	</div>
*/
angular.module('vokal.infiniteScroll', []).directive('infiniteScroll', [
    function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el = element[0];
                var heightHold = 0;
                var scrollBlock = 1;
                var bottomOffset = 120;
                if (attrs.offset) {
                    bottomOffset = attrs.offset;
                }
                var keepGoing = function() {
                    /*	check to see if the height has changed*/
                    if (el.scrollHeight !== heightHold) {
                        /*	If it has, keep the new height and make
                        	 sure the we aren't blocking retreiving more items*/
                        scrollBlock = 1;
                        heightHold = el.scrollHeight;
                    }
                    /*	Check to see if the scroll has reached the bottom
                    	 of the scroll area*/
                    if (el.scrollTop + el.offsetHeight >= (el.scrollHeight *
                            scrollBlock) - bottomOffset) {
                        /*	Block further scrolling by setting this value to >1
                        	 This will prevent loading the same items multiple
                        	 times in the case of a slow ajax call or
                        	 a large bottomOffset*/
                        scrollBlock = 2;
                        /*	Call the attached function*/
                        scope.$apply(attrs.infiniteScroll);
                    }
                };
                element.on('scroll touchmove', keepGoing);
            }
        };
    }
]);
