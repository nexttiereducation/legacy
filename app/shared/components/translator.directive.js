(function() {
    angular.module('navbar-svc')
        .directive('translator', translator);

    translator.$inject = ['$mdDialog', '$timeout'];

    function translator($mdDialog, $timeout) {
        return {
            link: link
        };

        function link(scope, element, attrs) {
            $timeout(function() {
                $('iframe.goog-te-menu-frame').contents().find('a').click(function(event) {
                    showLanguageMessage();
                });
            }, 1500);

        }

        function showLanguageMessage() {
            var messageText = "NextTier is translated through a third party and may not be accurate. Names, addresses, and websites may inadvertently be altered. Searching, posting, and messaging within NextTier cannot be translated and must be done in English for proper results. Use translation as a help tool to read content within NextTier only.";
            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('NextTier')
                    .textContent(messageText)
                    .ariaLabel('Translation disclaimer')
                    .ok('Got it!')
                    //.targetEvent(ev)
            );
        }
    }
})();



