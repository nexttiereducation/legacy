(function() {
    'use strict';

    angular.module('materialModule', ['ngMaterial', 'ngAnimate', 'ngAria'])
        .config(materialThemeConfig);

    materialThemeConfig.$inject = ['$mdThemingProvider'];

    function materialThemeConfig($mdThemingProvider) {
        $mdThemingProvider.definePalette('nextTier-primary', {
            '50': '#ffffff',
            '100': '#e9f9fe',
            '200': '#b4e9fb',
            '300': '#70d6f7',
            '400': '#53cdf6',
            '500': '#36c5f4',
            '600': '#19bdf2',
            '700': '#0cace1',
            '800': '#0b96c3',
            '900': '#0980a6',
            'A100': '#ffffff',
            'A200': '#e9f9fe',
            'A400': '#53cdf6',
            'A700': '#0cace1',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 400 A100 A200 A400 A700'
        });
        $mdThemingProvider.definePalette('nextTier-accent', {
            '50': '#ffffff',
            '100': '#cce4f2',
            '200': '#a0cbe7',
            '300': '#67acd8',
            '400': '#4e9fd2',
            '500': '#3692cc',
            '600': '#2e81b5',
            '700': '#28709d',
            '800': '#225e85',
            '900': '#1b4d6c',
            'A100': '#ffffff',
            'A200': '#cce4f2',
            'A400': '#4e9fd2',
            'A700': '#28709d',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 400 A100 A200 A400'
        });
        $mdThemingProvider.definePalette('nextTier-warn', {
          '50': '#ffffff',
          '100': '#f9c2d2',
          '200': '#f48ead',
          '300': '#ee4d7d',
          '400': '#eb3169',
          '500': '#e81655',
          '600': '#cc134b',
          '700': '#b01141',
          '800': '#940e36',
          '900': '#780b2c',
          'A100': '#ffffff',
          'A200': '#f9c2d2',
          'A400': '#eb3169',
          'A700': '#b01141',
          'contrastDefaultColor': 'light',
          'contrastDarkColors': '50 100 200 300 A100 A200'
        });

        $mdThemingProvider.theme('default')
            .primaryPalette('nextTier-primary')
            .accentPalette('nextTier-accent', {
                'default': '500',
                'hue-1': '500'
            })
            .warnPalette('nextTier-warn');

        $mdThemingProvider.theme('dark')
            .primaryPalette('nextTier-primary')
            .dark();
    }
})();
