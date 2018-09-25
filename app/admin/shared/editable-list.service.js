angular
    .module('adminModule')
    .factory('EditableList',

        ['ApiService', '$q',

            function(ApiService, $q) {
                var EditableList = function(items) {
                    this.items = items || [];
                };

                EditableList.prototype.addItem = function(newItem) {
                    if (!angular.equals({}, newItem)) {
                        newItem.newStatus = true;
                        this.items.push(newItem);
                    }
                    return {};
                };

                EditableList.prototype.separateLists = function() {
                    var itemsToPatch = [];
                    var itemsToDelete = [];
                    var newItems = [];
                    for (var i = 0; i < this.items.length; i++) {
                        var item = this.items[i];
                        if (item.deleteStatus) {
                            if (!item.newStatus) {
                                itemsToDelete.push(item);
                            }
                        } else if (item.newStatus) {
                            newItems.push(item);
                        } else if (item.patchStatus) {
                            itemsToPatch.push(item);
                        }
                    }
                    return {
                        patchList: itemsToPatch,
                        deleteList: itemsToDelete,
                        newList: newItems
                    };
                };
                return EditableList;
            }
        ]);
