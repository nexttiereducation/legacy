(function() {
    angular.module('phase-svc', [])
        .factory('PhaseService', PhaseService);

    PhaseService.$inject = [];

    function PhaseService() {
        var phaseHash = {
            'Freshmen': false,
            'Sophomores': false,
            'Juniors': false,
            'Seniors': false,
            'Counselors': false
        }

        var PhaseService = {
            buildClassString: buildClassString,
            convertPhaseNumber: convertPhaseNumber
        };

        /*
        *  Converts Phase numbers into human-readable phases
        */
        function convertPhaseNumber(phaseArray) {
            var humanReadablePhases = [];

            phaseHash['Freshmen'] = phaseArrayContainsValues(phaseArray, [1,2,14]) ;
            phaseHash['Sophomores'] = phaseArrayContainsValues(phaseArray, [1,2,12,13]) ;
            phaseHash['Juniors'] = phaseArrayContainsValues(phaseArray, [1,3,4]) ;
            phaseHash['Seniors'] = phaseArrayContainsValues(phaseArray, [1,5,6,7,8,9,10,11]) ;
            phaseHash['Counselors'] = phaseArrayContainsValues(phaseArray, [15]);

            if (phaseHash['Freshmen']) { humanReadablePhases.push('Freshmen') };
            if (phaseHash['Sophomores']) { humanReadablePhases.push('Sophomores') };
            if (phaseHash['Juniors']) { humanReadablePhases.push('Juniors') };
            if (phaseHash['Seniors']) { humanReadablePhases.push('Seniors') };
            if (phaseHash['Counselors']) { humanReadablePhases.push('Counselors') };

            return humanReadablePhases;
        }

        function buildClassString(humanReadablePhases) {
            var classValuesString = '';
            var classLength = humanReadablePhases.length;

            if (classLength === 0) {
                classValuesString = '';
            } else if (classLength == 1) {
                classValuesString = humanReadablePhases.toString();
            } else if (classLength == 2) {
                classValuesString = humanReadablePhases.join(' and ');
            } else {
                classValuesString = humanReadablePhases.slice(0, classLength - 1).join(', ') + ', and ' + humanReadablePhases[classLength - 1];
            }
            return classValuesString;
        }

        // Private Methods
        /*
         * Returns true if phaseArray contains any of the
         * assignedPhaseValues
         */
        function phaseArrayContainsValues(phaseArray, assignedPhaseValues) {
            for (var i=0; i < assignedPhaseValues.length; i++) {
                if (phaseArray.indexOf(assignedPhaseValues[i]) > -1) {
                    return true;
                }
            }
            return false;
        }

        return PhaseService;
    }
})();
