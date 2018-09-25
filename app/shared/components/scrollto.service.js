var scrollToMod = angular.module('scrollto-svc', [] );

scrollToMod.factory( 'ScrollTo', [ '$rootScope', '$location', '$anchorScroll',
    function ( $rootScope, $location, $anchorScroll )
    {
        'use strict';
        var go = function()
        {
            var scrollto = $location.search().scrollto;
            if ( scrollto )
            {
                $location.hash( scrollto );
                $anchorScroll();
                $location.hash( '' );
            }
        };

        return (
            function() { go(); }
        );
    } ] );
