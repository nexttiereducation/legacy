(function() {
    angular.module('phone-number-service', [])
        .factory('PhoneNumberService', PhoneNumberService);

    PhoneNumberService.$inject = ['API', 'UrlHelper'];

    function PhoneNumberService(API, UrlHelper) {
        var PhoneNumberService = {
            decodePhoneNumber: decodePhoneNumber,
            encodePhoneNumber: encodePhoneNumber,
            verifyNumber: verifyNumber
        };

        function decodePhoneNumber(rawPhoneNumber) {
            if (rawPhoneNumber.length === 10) {
                return rawPhoneNumber.slice(0, 3) + '-' + rawPhoneNumber.slice(3, 6) + '-' + rawPhoneNumber.slice(6);
            } else if (rawPhoneNumber.length === 12) {
                return rawPhoneNumber.slice(1, 2) + '-' + rawPhoneNumber.slice(2,5) + '-' + rawPhoneNumber.slice(5,8) + '-' + rawPhoneNumber.slice(8);
            }
            return rawPhoneNumber;
        }

        function verifyNumber(data) {
            data.phone_number = PhoneNumberService.encodePhoneNumber(data.phone_number);
            data.verification_code = parseInt(data.verification_code);

            return API.$post(UrlHelper.stakeholder.verifyNumber(), data).then(function(response) {
                return response;
            });
        };

        /*  Takes phone numbers in format of x-xxx-xxx-xxxx or xxx-xxx-xxxx
         *  and variations and returns in format of xxxxxxxxxx or +xxxxxxxxxxx
         */
        function encodePhoneNumber(formattedPhoneNumber) {
            var result = formattedPhoneNumber.replace(/(\D)/g, '');
            if ( result.length === 11) {
                return '+' + result;
            } else {
                return result + '';
            }
        }

        return PhoneNumberService;
    }
})();
