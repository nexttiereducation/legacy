(function () {

    angular.module('nteExtensions')
        .controller('modalWrapper', modalWrapper );

    modalWrapper.$inject = ['modalWrapper'];

    function modalWrapper(modalWrapper) {
        var vm = this;

        //vm methods

        ///////////////////////////////////////////////////////////////
        //vm properties

        ///////////////////////////////////////////////////////////////
        //private vars

        //////////////////////////////////////////

        //activate();
        (function activate() {
            this.myTemplate = modalWrapper.getTemplateToUse();

        })();

        ////////vm methods

        ////////private methods////////

    }
})();
