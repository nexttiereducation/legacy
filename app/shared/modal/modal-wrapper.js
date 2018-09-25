(function() {
    angular.module('modalModule')
        .factory('modalWrapper', modalWrapper);

    modalWrapper.$inject = ['$rootScope'];

    function modalWrapper($rootScope) {
        this.templateToUse = '';
        return {
            getTemplateToUse: getTemplate,
            setTemplateToUse: setTemplate,
            shouldRoute: shouldRoute
        };

        function getTemplate() {
            var that = this;
            return that.templateToUse;
        }

        function setTemplate(template) {
            var that = this;
            that.templateToUse = template;
        }

        function shouldRoute() {
            return $rootScope.isMobile();
        }
    }
})();
