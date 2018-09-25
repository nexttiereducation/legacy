(function() {
    'use strict';

    angular
        .module('adminModule')
        .factory('ConditionalTaskManager', ConditionalTaskManager);

    ConditionalTaskManager.$inject = ['$q', 'API', 'ApiUrlService'];

    function ConditionalTaskManager($q, ApiService, ApiUrlService) {
        return {
            getConditionalTaskOptions: getConditionalTaskOptions
        };


        function getConditionalTaskOptions(){
            return $q(function(resolve, reject){
                getConditionalTasks().success(function(response){
                    var tasks = response.results;

                    getOptions().success(function(response){
                        resolve(parseConditionalTasks(response, tasks));
                    }).error(function(){
                        toastr.error('Unable to retrieve Task options', 'Error');
                        reject();
                    });

                }).error(function(){
                    toastr.error( 'Unable to Retrieve Conditional Tasks', 'Error' );
                    reject();
                });
            });
        }

        function getConditionalTasks() {
            return ApiService.$get(ApiUrlService.tasks.conditionalTasks());
        }


        function getOptions() {
            return ApiService.$get(ApiUrlService.dropDowns.options());
        }

        function parseConditionalTasks(options, conditionalTasks) {
            var sorted = {
                eventNames: [],
                guards: [],
                taskTypes: []
            };

            for(var i = 0, conditionalTask; conditionalTask = conditionalTasks[i]; ++i) {
                if(sorted.guards.indexOf(conditionalTask.guard) === -1) {
                    sorted.guards.push(conditionalTask.guard);
                }
            }
            sorted.eventNames = options.cta_event;
            sorted.taskTypes = options.task_type;
            sorted.anchors = options.anchor;
            return sorted;
        }

    }
}());
