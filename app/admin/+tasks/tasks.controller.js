angular.module('adminModule')
.controller("TasksCtrl", [ "$scope", "$rootScope", "$location", "infiniteScroll",
    "ApiUrlService", "ApiService", "ngDialog", "AdminDialog", "$filter", "QueryBuilder", "$q", "EditableList", "$http", "StakeholderAuth",
    "ConditionalTaskManager",
function ( $scope, $rootScope, $location, infiniteScroll, ApiUrlService, ApiService,
    ngDialog, AdminDialog, $filter, QueryBuilder, $q, EditableList, $http, StakeholderAuth, ConditionalTaskManager )
{
    "use strict";
    $scope.items = [];
    $scope.filterItems = {};
    $scope.orderingField = "";
    $scope.ctaOptions = {};
    $scope.sorting = {
        field: '',
        direction: ''
    }

    $scope.taskCategories = ["Freshmen", "Sophomores", "Juniors", "Seniors", "Counselors", "Tutorial"];

    $http({
        method: "OPTIONS",
        url: ApiUrlService.tasks.getItem( 0 ),
        headers: {
            "AUTHORIZATION": "Token " + StakeholderAuth.getAuthToken()
        }
    }).then( function ( response )
        {
            $scope.officialPhases = response.data.actions.PUT.phases_choices;
        });

    //TODO eventually replace the above, with the below
    ApiService.$get( ApiUrlService.dropDowns.phases( )).success(
        function(response){
            $rootScope.phaseList = response.data;
        }
    );

    $scope.phaseList = function( phaseIds ){
        if(! $rootScope.phaseList ){ return phaseIds; }
        var result = [];
        var len = phaseIds.length;
        while (len--) {
            var phaseLen = $rootScope.phaseList.length;
            while(phaseLen--){
                if($rootScope.phaseList[phaseLen].id === phaseIds[len]){
                    result.push($rootScope.phaseList[phaseLen].name);
                    break;
                }
            }
        }
    }
    $scope.getListItems = function ( reload )
    {
        var url = ApiUrlService.tasks.getList();

        var queryArray = [];
        QueryBuilder.arrayBuilder( queryArray, "name", $scope.name );
        QueryBuilder.arrayBuilder( queryArray, "institution_name", $scope.institution );
        QueryBuilder.arrayBuilder( queryArray, "is_template", $scope.is_template);
        QueryBuilder.arrayBuilder( queryArray, "phase", $scope.phase);
        QueryBuilder.arrayBuilder( queryArray, "task_type", $scope.task_type);
        QueryBuilder.arrayBuilder( queryArray, "ordering", $scope.orderingField );
        var queryStr = QueryBuilder.fromArray( queryArray );
        url += queryStr;

        // Pass true as reload argument to update list
        $scope.items = new infiniteScroll( "list", reload, url );
    };

    $scope.openEditForm = function ( item, index )
    {
        var template = "templates/partials/tasks-list-view-detail.html";

        ApiService.$get( ApiUrlService.tasks.getItem( item.id ) )
            .success( function ( response )
            {
                $scope.item = response;
                $scope.categories = (response.category && response.category.length > 0) ? response.category.split(',') : [];

                ApiService.$get( ApiUrlService.tasks.getDeadlines( item.id ) )
                    .success( function ( response )
                    {
                        var dateConvert = response.results.reduce( function ( pre, curr )
                        {
                            if (curr.start_date === null && curr.deadline === null) {
                                pre.push({
                                    start_date: curr.start_date,
                                    start_date_offset: curr.start_date_offset,
                                    deadline: curr.deadline,
                                    deadline_offset: curr.deadline_offset,
                                    id: curr.id
                                });
                            }else if (curr.start_date === null){
                                pre.push( {
                                    start_date: curr.start_date,
                                    start_date_offset: curr.start_date_offset,
                                    deadline: new Date( curr.deadline ),
                                    deadline_offset: curr.deadline_offset,
                                    id: curr.id
                                });
                            }else if(curr.deadline === null){
                                pre.push( {
                                    start_date: new Date(curr.start_date),
                                    start_date_offset: curr.start_date_offset,
                                    deadline: curr.deadline,
                                    deadline_offset: curr.deadline_offset,
                                    id: curr.id
                                });
                            }else{
                                pre.push( {
                                    start_date: new Date(curr.start_date),
                                    start_date_offset: curr.start_date_offset,
                                    deadline: new Date(curr.deadline),
                                    deadline_offset: curr.deadline_offset,
                                    id: curr.id
                                });
                            }
                            return pre;
                        }, [] );
                        $scope.dates = new EditableList( dateConvert );
                    });

                ngDialog.openConfirm( {
                    template: template,
                    className: "item-form ngdialog-theme-default",
                    scope: $scope,
                    closeByEscape: true,
                    closeByDocument: true
                })
                    .then( function () //save and close
                    {

                        if($scope.item.phase == "Non Applicant"){
                            $scope.item.phase = "Universal Student"
                        }
                        $scope.item.category = $scope.categories.length > 0 ? $scope.categories.join(',') : null;
                        $scope.item.scholarship = $scope.item.scholarship ? $scope.item.scholarship.id : null;

                        ApiService.$patch( ApiUrlService.tasks.update( item.id ), $scope.item )
                            .success( function ( response )
                            {
                                $scope.items.items[ index ] = response;
                                toastr.info( "Item Updated." );
                            })
                            .error( function ()
                            {
                                toastr.error( "Oops, Something went wrong, please try again.", "Error" );
                            });
                        patchApplicationDates( item.id, $scope.dates );
                    });

            });
    };

    $scope.toggleDisable = function ( item, index )
    {
        var updateText = ( item.is_active ) ?
            "Task Disabled." : "Task Enabled.";
        var dataPack = {
            "is_visible": !item.is_visible
        };
        ApiService.$patch( ApiUrlService.tasks.update( item.id ), dataPack )
            .success( function ( response )
            {
                $scope.items.items[ index ] = response;
                toastr.info( updateText );
            })
            .error( function ()
            {
                toastr.error( "Oops, Something went wrong, please try again.", "Error" );
            });
    };

    $scope.openNewItemForm = function ()
    {
        var template = "templates/partials/tasks-list-view-detail.html";
        if( !( $scope.item && $scope.item.isNew ) )
        {
            $scope.item = { isNew: true, is_visible: true, phases: [] };
            $scope.categories = [];
        }

        $scope.dates = new EditableList();

        ngDialog.openConfirm( {
            template: template,
            className: "ngdialog-theme-default item-form",
            scope: $scope,
            closeByEscape: true,
            closeByDocument: true
        })
            .then( function () //save and close
            {
                    delete $scope.item.isNew;
                    $scope.item.category = $scope.categories.length > 0 ? $scope.categories.join(',') : null;
                    ApiService.$post( ApiUrlService.tasks.create(), $scope.item )
                        .success( function ( response )
                        {
                            $scope.items.items.unshift( response );
                            patchApplicationDates( response.id, $scope.dates );
                            toastr.info( "New Item Created." );
                        })
                        .error( function ( response )
                        {
                            toastr.error( response, "Error" );
                            $scope.item.isNew = true;
                        });
            },
            function () //cancel
            {
                delete $scope.item;
            });
    };

    $scope.lookupInstitution = function ( newId )
    {
        $scope.item.institution_name = "-";
        ApiService.$get( ApiUrlService.institutions.getItem( newId ) )
            .success( function ( response )
            {
                $scope.item.institution_name = response.name;
            })
            .error( function ()
            {
                toastr.error( "Could not find an institution with that ID.", "Error" );
            });
    };

    var patchApplicationDates = function ( id, data )
    {
        var lists = data.separateLists();
        var patches = lists.patchList,
            news = lists.newList,
            deletes = lists.deleteList;
        news = news.reduce( function ( pre, curr )
        {
            if(curr.start_date && (curr.start_date_offset && curr.start_date_offset.length > 0 && curr.start_date_offset != 0)) {
                return;
            }

            if(curr.deadline && (curr.deadline_offset && curr.deadline_offset.length > 0 && curr.deadline_offset != 0)) {
                return;
            }

            var set = {
                item: {
                    deadline: $filter('date')( curr.deadline, "yyyy-MM-dd", "UTC" ),
                    deadline_offset: +curr.deadline_offset,
                    start_date: $filter('date')( curr.start_date, "yyyy-MM-dd", "UTC" ),
                    start_date_offset: +curr.start_date_offset
                }
            };
            pre.push( set );
            return pre;
        }, [] );

        patches = patches.reduce( function ( pre, curr )
        {

            if(curr.start_date && (curr.start_date_offset && curr.start_date_offset.length > 0 && curr.start_date_offset != 0)) {
                return;
            }

            if(curr.deadline && (curr.deadline_offset && curr.deadline_offset.length > 0 && curr.deadline_offset != 0)) {
                return;
            }

            var set = {
                id: curr.id,
                item: {
                    deadline: $filter('date')( curr.deadline, "yyyy-MM-dd", "UTC" ),
                    deadline_offset: curr.deadline_offset,
                    start_date: $filter('date')( curr.start_date, "yyyy-MM-dd", "UTC" ),
                    start_date_offset: curr.start_date_offset
                }
            };
            pre.push( set );
            return pre;
        }, [] );
        var promises = [];
        for( var i = 0; i < news.length; i++ )
        {
            promises.push (
                ApiService.$post( ApiUrlService.tasks.createDeadlines( id ), news[ i ].item )
                    .success( function ()
                    {
                        toastr.info( "Institution Application Dates Updated." );
                    })
                    .error( function ()
                    {
                        toastr.error( "Institution Application Dates Failed to Update.", "Error" );
                    })
            );
        }
        for( var i = 0; i < patches.length; i++ )
        {
            promises.push (
                ApiService.$patch( ApiUrlService.tasks.updateDeadlines( id, patches[ i ].id ), patches[ i ].item )
                    .success( function ()
                    {
                        toastr.info( "Institution Application Dates Updated." );
                    })
                    .error( function ()
                    {
                        toastr.error( "Institution Application Dates Failed to Update.", "Error" );
                    })
            );
        }
        for( var i = 0; i < deletes.length; i++ )
        {
            promises.push (
                ApiService.$delete( ApiUrlService.tasks.updateDeadlines( id, deletes[ i ].id ) )
                    .success( function ()
                    {
                        toastr.info( "Institution Application Dates Updated." );
                    })
                    .error( function ()
                    {
                        toastr.error( "Institution Application Dates Failed to Update.", "Error" );
                    })
            );
        }
        $q.all( promises )
            .finally( function ()
            {
                $scope.dates = new EditableList();
            });
    };

    $scope.toDate = function ( dateStr )
    {
        if( !dateStr )
        {
            return "";
        }
        return new Date( dateStr );
    };

    $scope.toDateStr = function ( date )
    {
        return $filter('date')( date, "yyyy-MM-dd", "UTC" );
    };

    $scope.setPhase = function(phaseId){
        if($scope.item.phases.indexOf(phaseId) === -1){
            $scope.item.phases.push(phaseId);
        }else{
            var indexOfPhase = $scope.item.phases.indexOf(phaseId);
            $scope.item.phases.splice(indexOfPhase, 1);
        }
    };

    $scope.setCategory = function(category){
        $scope.item.category.push(category);
    }

    $scope.setOrdering = function ( newField )
    {
        if(newField == '-' + $scope.sorting.field) {
            $scope.sorting.direction = 'down'; /*descending*/
        } else {
            /*ascending*/
            $scope.sorting = {
                field: newField,
                direction: 'up'
            }
        }
        $scope.orderingField = newField;
    };

    $scope.reloadList = function ()
    {
        $scope.getListItems();
        $scope.items.nextPage();
    };

    $scope.addNewDeadline = function(newDeadline) {

        if(newDeadline.start_date && (newDeadline.start_date_offset && newDeadline.start_date_offset.length > 0 && newDeadline.start_date_offset != 0)) {
            $scope.newDeadlineError = 'Cannot Set Values for both Start Date and Start Offset';
            throw 'Cannot Set Values for both Start Date and Start Offset';
        }

        if(newDeadline.deadline && (newDeadline.deadline_offset && newDeadline.deadline_offset.length > 0 && newDeadline.deadline_offset != 0)) {
            $scope.newDeadlineError = 'Cannot Set Values for both Deadline and Deadline Offset';
            throw 'Cannot Set Values for both Deadline and Deadline Offset';
        }


        var newDeadlineCopy = angular.copy(newDeadline);

        $scope.dates.addItem(newDeadlineCopy);

        newDeadline.start_date = "";
        newDeadline.start_date_offset = "";
        newDeadline.deadline = "";
        newDeadline.deadline_offset = "";
    };

    $scope.deadlineChanged = function(deadline) {
        if(deadline.start_date && (deadline.start_date_offset && deadline.start_date_offset.length > 0 && deadline.start_date_offset != 0)) {
            $scope.deadlineError = 'Cannot Set Values for both Start Date and Start Offset';
            throw 'Cannot Set Values for both Start Date and Start Offset';
        }

        if(deadline.deadline && (deadline.deadline_offset && deadline.deadline_offset.length > 0 && deadline.deadline_offset != 0)) {
            $scope.deadlineError = 'Cannot Set Values for both Deadline and Deadline Offset';
            throw 'Cannot Set Values for both Deadline and Deadline Offset';
        }
        $scope.deadlineError = '';
        deadline.patchStatus = true;
    };

     var formatTypes = function (type) {
        var formatted = [];
        var unformatted = $scope.ctaOptions[type];
        for(var i = 0; i < unformatted.length; i++){
            formatted.push({
                abbv: Object.keys(unformatted[i])[0],
                name: Object.values(unformatted[i])[0]
            })
        }
        $scope.ctaOptions[type] = formatted;

    }


    // Run on Load
    var init = function ()
    {
        $scope.getListItems();
        ConditionalTaskManager.getConditionalTaskOptions().then(function(result) {
            $scope.ctaOptions = result;
            formatTypes('taskTypes');
            formatTypes('anchors');
        });
    };

    init();

} ] );
