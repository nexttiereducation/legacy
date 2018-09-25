(function() {
    angular.module('invite', [])
        .factory('InviteService', InviteService);

    InviteService.$inject = ['$rootScope', 'API', 'UrlHelper', 'Track', 'StakeholderAuth'];

    function InviteService($rootScope, API, UrlHelper, Track, StakeholderAuth) {
        return {
            invite: invite
        };

        function invite(email, inviteType)  {
            return API.$post( UrlHelper.invite.create(), {email: email, invite_type: inviteType})
                .then( function ()
                {
                    Track.event( 'connection_invitation_form_done', {
                        'form outcome': 'provided email',
                        'invitation sent outcome': 'sent',
                        'connection view type': StakeholderAuth.parseTrackingType( inviteType )
                    } );

                    $rootScope.$broadcast( 'inviteSent' );
                },
                function ()
                {
                    Track.event( 'connection_invitation_form_done', {
                        'form outcome': 'provided email',
                        'invitation sent outcome': 'not sent',
                        'connection view type': StakeholderAuth.parseTrackingType( inviteType )

                    } );
                }
                );
        }

    }

})();
