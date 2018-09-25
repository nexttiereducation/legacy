angular
    .module('adminModule')
    .service('AdminDialog', AdminDialog);

AdminDialog.$inject = ['ApiService', 'ApiUrlService', 'ngDialog', '$filter'];

function AdminDialog(ApiService, ApiUrlService, ngDialog, $filter) {

    this.editDialog = function(scope, itemId, itemIndex, page) {

        var template = 'templates/partials/' + page + '-list-view-detail.html';

        ApiService.$get(ApiUrlService[page].getItem(itemId)).success(
            function(response) {
                scope.item = response;
                ngDialog.openConfirm({
                    template: template,
                    className: 'ngdialog-theme-default item-form',
                    scope: scope,
                    closeByEscape: true,
                    closeByDocument: true
                }).then(function() {
                    ApiService.$patch(ApiUrlService[page].update(itemId), scope.item)
                        .success(
                            function(response) {
                                scope.items.items[itemIndex] = response;
                                toastr.info('Item Updated.');
                        })
                        .error(function() {
                            toastr.error('Oops, Something went wrong, please try again.', 'Error');
                        });
                });
            });
    };

    this.disableDialog = function(scope, itemId, itemIndex, page, field) {
        var dataPack = {};
        dataPack[field] = false;
        ngDialog.openConfirm({
            template: 'templates/partials/confirm-delete.html',
            scope: scope
        }).then(function() {
            ApiService.$patch(ApiUrlService[page].update(itemId), dataPack)
                .success(function(response) {
                    scope.items.items[itemIndex] = response;
                    toastr.info('Item Disabled.');
                }).error(function() {
                    toastr.error('Oops, Something went wrong, please try again.', 'Error');
                });
        });
    };

    this.newDialog = function(scope, page) {
        var template = 'templates/partials/' + page + '-list-view-detail.html';
        if (!(scope.item && scope.item.isNew)) {
            scope.item = { isNew: true };
        }
        ngDialog.openConfirm({
            template: template,
            className: 'ngdialog-theme-default item-form',
            scope: scope,
            closeByEscape: true,
            closeByDocument: true
        }).then(function() {
            delete scope.item.isNew;
            ApiService.$post(ApiUrlService[page].create(), scope.item)
                .success(function(response) {
                    scope.items.items.unshift(response);
                    toastr.info('New Item Created.');
                }).error(function(response) {
                    toastr.error(response, 'Error');
                    scope.item.isNew = true;
                });
        });
    };

    this.convertDateFormat = function(date) {
        if (Object.prototype.toString.call(date) !== '[object Date]') { return date; }
        var formatted = $filter('date')(date, 'yyyy-MM-dd', 'UTC');
        return formatted;
    };

    this.getObjectChanges = function(initial, modified) {
        if (initial == modified) {
            return {};
        }
        var changes = {};
        var keys = Object.keys(initial);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (initial[key] !== modified[key]) {
                var value = modified[key];
                if (Object.prototype.toString.call(value) === '[object Date]') {
                    value = this.convertDateFormat(value);
                }
                changes[key] = value;
            }
        }
        return changes;
    };

    return this;
}
