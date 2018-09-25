'use strict';

angular
    .module('mixpanelModule', [])
    .factory('MixpanelService', MixpanelService);

MixpanelService.$inject = ['$rootScope'];

function MixpanelService($rootScope) {
    function initMixpanel() {
        if ($rootScope.isDev) {
            return;
        }
        (function (f, b) {
            if (!b.__SV) { var a, e, i, g; window.mixpanel = b; b._i = []; b.init = function (a, e, d) { function f(b, h) { var a = h.split('.'); 2 == a.length && (b = b[a[0]], h = a[1]); b[h] = function () { b.push([h].concat(Array.prototype.slice.call(arguments, 0))) } } var c = b; 'undefined' !== typeof d ? c = b[d] = [] : d = 'mixpanel'; c.people = c.people || []; c.toString = function (b) { var a = 'mixpanel'; 'mixpanel' !== d && (a += '.' + d); b || (a += ' (stub)'); return a }; c.people.toString = function () { return c.toString(1) + '.people (stub)' }; i = 'disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user'.split(' '); for (g = 0; g < i.length; g++) f(c, i[g]); b ._i .push([a, e, d]) }; b.__SV = 1.2; a = f.createElement('script'); a.type = 'text/javascript'; a.async = !0; a.src = '//cdn.mxpnl.com/libs/mixpanel-2.2.min.js'; e = f.getElementsByTagName('script')[0]; e .parentNode .insertBefore(a, e) }
        })(document, window.mixpanel || []);

        if ($rootScope.isStaging) {
            window
                .mixpanel
                .init('9cc2a3fd9e2c6d98326e0682a438ca50');
        } else if ($rootScope.isProduction) {
            window
                .mixpanel
                .init('7228e95b46c931253c7da79cb73ff436');
        }

    }
    initMixpanel();
    var broadcastProps = {};
    //Default to unknown-- this way we know if there is a problem determining environment
    var environment = 'unknown';

    var track = {
        signUp: signUp,
        start: start,
        event: event,
        clearUser: clearUser,
        setSchools: setSchools,
        setHighSchool: setHighSchool,
        setMajors: setMajors,
        setStudentGraduation: setStudentGraduation,
        increment: increment,
        init: basics
    };

    $rootScope.$on('trackProp', function (event, ap) {
        var properties = ap.split('|');

        properties.forEach(function (prop) {
            var parts = prop.split(':');
            var eventName = parts[0];
            var key = parts[1];
            var value = parts[2];
            var eventProps = broadcastProps[eventName] || {};
            eventProps[key] = value;
            broadcastProps[eventName] = eventProps;
        });

    });

    return track;

    function device() {
        if (navigator.userAgent.match(/Android/i)) {
            return 'Android';
        }
        if (navigator.userAgent.match(/iPhone/i)) {
            return 'iPhone';
        }
        if (navigator.userAgent.match(/iPad/i)) {
            return 'iPad';
        }
        if (navigator.userAgent.match(/iPod/i)) {
            return 'iPod Touch';
        }
        if (navigator.userAgent.match(/IEMobile/i)) {
            return 'Windows Phone';
        }
        if (navigator.userAgent.match(/Windows/i)) {
            return 'Windows';
        }
        if (navigator.userAgent.match(/MacOS/i)) {
            return 'Macintosh OS';
        }
        if (navigator.userAgent.match(/Linux/i)) {
            return 'Linux';
        }
        if (navigator.userAgent.match(/UNIX/i)) {
            return 'Unix';
        }
        return 'Unknown';
    }

    function browser() {
        if (navigator.userAgent.match(/Opera/i)) {
            return 'Opera';
        }
        if (navigator.userAgent.match(/Chrome/i)) {
            return 'Chrome';
        }
        if (navigator.userAgent.match(/Safari/i)) {
            return 'Safari';
        }
        if (navigator.userAgent.match(/msie/i)) {
            return 'Internet Explorer';
        }
        return 'Unknown';
    };

    function basics(scope) {
        if ($rootScope.isDev) {
            return;
        }
        if (scope) {
            environment = scope.environment;
            mixpanel.register({'user_type': 'anonymous'});
        }
    }

    function signUp(credentials, isFacebook, user) {
        if ($rootScope.isDev) {
            return;
        }

        var mixId = credentials.id;

        mixpanel.alias(mixId);
        mixpanel
            .people
            .set({
                '$created': new Date(),
                '$email': user.email,
                '$first_name': user.first_name,
                '$last_name': user.last_name,
                '$name': `${user.first_name} ${user.last_name}`,
                'district': user.district
                    ? user.district.name
                    : null,
                'stakeholder_id': userIdAndToken.id,
                'graduation_year': user.graduation_year,
                'registration_date': new Date(),
                'user_type': user.stakeholder_type,
                'high_school_id': user.highschool
            });
        //Flush data to mixpanel
        mixpanel.identify();
        localStorage.removeItem('ambassador');
    }

    function start(user) {
        if ($rootScope.isDev) {
            return;
        }

        var mixId = user.id;

        mixpanel.identify(mixId);

        var userPhase = user.stakeholderType == 'Parent'
            ? 'N/A'
            : user.phase;

        mixpanel
            .people
            .set({
                '$email': user.email,
                '$first_name': user.first_name,
                '$last_name': user.last_name,
                '$name': `${user.first_name} ${user.last_name}`,
                'district': user.district
                    ? user.district.name
                    : null,
                'graduation_year': user.graduation_year,
                'has_connections': user.hasConnections,
                'high_school_id': user.highschool,
                'registration_date': user.registration_date,
                'stakeholder_id': user.id,
                'user_type': user.stakeholder_type,
                'user_phase': userPhase,
                'verified': user.verified
            });

        mixpanel.register({
            'district': user.district
                ? user.district.name
                : null,
            'email': user.email,
            'graduation_year': user.graduation_year,
            'high_school_id': user.highschool,
            'user_type': user.stakeholder_type,
            'user_phase': userPhase
        });

        mixpanel.people
            .set_once({'schools_followed': 0, 'tasks_completed': 0, 'tasks_started': 0});

    }

    function event(name, propObject) {
        if ($rootScope.isDev) {
            return;
        }
        propObject = propObject || {};
        var now = new Date();
        propObject = angular.extend(propObject, broadcastProps[name] || {}, {timestamp: now.toISOString()});
        mixpanel.track(name, propObject);
        broadcastProps[name] = {};
    }
    //the mixpanel object needs ot be initialize befored calling the clear service
    //The id is the timer function if the system is waiting for MP to load
    function resetMixpanel(id) {
        if ($rootScope.isDev) {
            return;
        }
        mixpanel.cookie.clear();
        mixpanel.cookie.save();
        if (id)
            window.clearInterval(id);
        }
    function clearUser(reload) {
        if ($rootScope.isDev) {
            return;
        }
        var new_distinct_id = Math
            .random()
            .toString(36)
            .substr(2) + Math
            .random()
            .toString(36)
            .substr(2);
        mixpanel.identify(new_distinct_id);
        basics();
        var reloadPage = typeof reload !== 'undefined'
            ? reload
            : false;
        if (mixpanel.cookie && mixpanel.cookie.clear) {
            resetMixpanel();
        } else {
            //Need to wait for mixpanel to initialize
            var id = window.setInterval(
                function () {
                    if (mixpanel.cookie && mixpanel.cookie.clear) {
                        resetMixpanel(id);
                        if (reloadPage) {
                            location.reload();
                        }
                    }
                }, 1000
            );
        }
    }

    function setSchools(list) {
        if ($rootScope.isDev) {
            return;
        }
        mixpanel.people.set({'school_names': list});
    }

    function setMajors(majorsArray) {
        if ($rootScope.isDev) {
            return;
        }
        mixpanel.people.set({'potential_majors': majorsArray});
    }

    function setStudentGraduation(yearsArray) {
        if ($rootScope.isDev) {
            return;
        }
        mixpanel.people.set({'student_grad_years': yearsArray});
    }

    function setHighSchool(schoolName, ncesId) {
        if ($rootScope.isDev) {
            return;
        }
        var data = {
            'high_school': schoolName,
            'high_school_nces': ncesId
        };
        mixpanel.people.set(data);
    }

    function increment(property, value) {
        if ($rootScope.isDev) {
            return;
        }
        mixpanel.people.increment(property, value);
    }

    function registrationSource() {
        if (document.referrer.search(/https?:\/\/.*\.google\..*/) === 0) {
            return 'Google';
        } else if (document.referrer.search(/https?:\/\/.*\.bing\..*/) === 0) {
            return 'Bing';
        } else if (document.referrer.search(/https?:\/\/.*\.yahoo\..*/) === 0) {
            return 'Yahoo';
        } else if (document.referrer.search(/https?:\/\/.*\.facebook\..*/) === 0) {
            return 'Facebook';
        } else if (document.referrer.search(/https?:\/\/.*\.twitter\..*/) === 0) {
            return 'Twitter';
        } else if (document.referrer.search(/https?:\/\/.*\.youtube\..*/) === 0) {
            return 'Youtube';
        } else {
            return 'Other';
        }
    }

}
