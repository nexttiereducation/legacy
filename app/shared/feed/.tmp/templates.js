(function(module) {
try {
  module = angular.module('feed');
} catch (e) {
  module = angular.module('feed', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('feed.html',
    '<div class="activity-feed-container" ng-class="{\'height-100\': !isTablet() && !isMobile()}"\n' +
    '    layout="row" flex>\n' +
    '    <md-sidenav md-is-locked-open="$mdMedia(\'gt-xs\')" class="md-whiteframe-z2 md-sidenav-left"\n' +
    '        ng-if="feedthis.feed.length > 0 && feedthis.feedSummary" md-component-id="left">\n' +
    '        <div class="feed-summary">\n' +
    '            <md-toolbar class="md-toolbar-small md-primary">\n' +
    '                <div class="md-toolbar-tools" layout="row" layout-align="space-between center">\n' +
    '                    <div class="bold text-white" ng-click="feedthis.selectedFilter={ category: [], date: \'Today\', displayDate: \'Today\'}">TODAY</div>\n' +
    '                    <div ng-show="showLoader" class="subheader-loading">\n' +
    '                        <md-progress-circular class="md-hue-1" md-diameter="20px"></md-progress-circular>\n' +
    '                    </div>\n' +
    '                    <div class="md-caption">{{feedthis.today | date:"EEEE, MMMM dd"}}</div>\n' +
    '                </div>\n' +
    '            </md-toolbar>\n' +
    '            <md-list class="md-list-clickable" ng-if="feedthis.activityToShow(feedthis.feedSummary.today)">\n' +
    '                <md-list-item class="summary-item" ng-repeat="(key, value) in feedthis.feedSummary.today"\n' +
    '                              ng-if="key !=\'null\' && key !=\'day\' && value > 0">\n' +
    '                    <div layout="row" layout-align="start center" flex\n' +
    '                         ng-click="feedthis.addFilter(feedthis.feedConstants.categories[key], 0, \'Today\')">\n' +
    '                        <img class="summary-icon" ng-src="{{feedthis.feedConstants.icons[key] || feedthis.getActivityIcon(key)}}">\n' +
    '                        <span ng-class="{ \'selected-item\': feedthis.isSelected(key, \'Today\')}" flex>{{value}} {{key | underscoresToSpaces}}</span>\n' +
    '                    </div>\n' +
    '                    <button class="clear-button brand-blue" ng-if="feedthis.isFiltered() && feedthis.selectedFilter.date === 0 && feedthis.isSelected(key, \'Today\')"\n' +
    '                        ng-click="feedthis.removeFilter(feedthis.feedConstants.categories[key])">Clear</button>\n' +
    '                </md-list-item>\n' +
    '            </md-list>\n' +
    '            <div ng-if="!feedthis.activityToShow(feedthis.feedSummary.today)"\n' +
    '                 class="md-padding">You have had no student activity today</div>\n' +
    '            <md-toolbar class="md-toolbar-small md-accent">\n' +
    '                <div class="md-toolbar-tools" layout="row" layout-align="space-between center">\n' +
    '                    <div class="bold text-white" ng-click="feedthis.selectedFilter={ category: [], date: \'Yesterday\', displayDate: \'Yesterday\'}">YESTERDAY</div>\n' +
    '                </div>\n' +
    '            </md-toolbar>\n' +
    '            <md-list class="md-list-clickable" ng-if="feedthis.activityToShow(feedthis.feedSummary.yesterday)">\n' +
    '                <md-list-item class="summary-item" ng-repeat="(key, value) in feedthis.feedSummary.yesterday"\n' +
    '                              ng-if="key !=\'null\' && key !=\'day\' && value > 0">\n' +
    '                    <div layout="row" layout-align="start center" flex\n' +
    '                         ng-click="feedthis.addFilter(feedthis.feedConstants.categories[key], 1, \'Yesterday\')">\n' +
    '                        <img class="summary-icon" ng-src="{{feedthis.feedConstants.icons[key] || feedthis.getActivityIcon(key)}}">\n' +
    '                        <span ng-class="{ \'selected-item\': feedthis.isSelected(key, \'Yesterday\')}" flex>{{value}} {{key | underscoresToSpaces}}</span>\n' +
    '                    </div>\n' +
    '                    <button class="clear-button brand-blue" ng-if="feedthis.isFiltered() && feedthis.selectedFilter.date === 1 && feedthis.isSelected(key, \'Yesterday\')"\n' +
    '                        ng-click="feedthis.removeFilter(feedthis.feedConstants.categories[key])">Clear</button>\n' +
    '                </md-list-item>\n' +
    '            </md-list>\n' +
    '            <div ng-if="!feedthis.activityToShow(feedthis.feedSummary.yesterday)"\n' +
    '                 class="md-padding">You had no student activity yesterday</div>\n' +
    '            <md-toolbar class="md-toolbar-small md-accent">\n' +
    '                <div class="md-toolbar-tools" layout="row" layout-align="space-between center">\n' +
    '                    <div class="bold text-white" ng-click="feedthis.selectedFilter={ category: [], date: 6, displayDate: \'Within The Past Week\'}">THIS WEEK</div>\n' +
    '                </div>\n' +
    '            </md-toolbar>\n' +
    '            <md-list class="md-list-clickable" ng-if="feedthis.activityToShow(feedthis.weeklySummary)">\n' +
    '                <md-list-item class="summary-item" ng-repeat="(key, value) in feedthis.weeklySummary"\n' +
    '                              ng-if="key !=\'null\' && key !=\'day\' && value > 0">\n' +
    '                    <div layout="row" layout-align="start center" flex\n' +
    '                         ng-click="feedthis.addFilter(feedthis.feedConstants.categories[key], 6, \'Within The Past Week\')">\n' +
    '                        <img class="summary-icon" ng-src="{{feedthis.feedConstants.icons[key] || feedthis.getActivityIcon(key)}}">\n' +
    '                        <span ng-class="{ \'selected-item\': feedthis.isSelected(key, \'Within The Past Week\')}" flex>{{value}} {{key | underscoresToSpaces}}</span>\n' +
    '                    </div>\n' +
    '                    <button class="clear-button brand-blue" ng-if="feedthis.isFiltered() && feedthis.selectedFilter.date === 6 && feedthis.isSelected(key, \'Within The Past Week\')"\n' +
    '                        ng-click="feedthis.removeFilter(feedthis.feedConstants.categories[key])">Clear</button>\n' +
    '                </md-list-item>\n' +
    '            </md-list>\n' +
    '            <div ng-if="!feedthis.activityToShow(feedthis.weeklySummary)"\n' +
    '                 class="md-padding">You had no student activity this week</div>\n' +
    '        </div>\n' +
    '    </md-sidenav>\n' +
    '    <div ng-class="{ \'student-dash\': feedthis.isStudent || feedthis.isParent }" ng-if="feedthis.feed.length > 0"\n' +
    '        layout="column" flex class="bg-grey">\n' +
    '        <md-toolbar class="md-accent md-whiteframe-z2" ng-hide="isMobile() || feedthis.isCounselor">\n' +
    '            <div class="md-toolbar-tools">\n' +
    '                <div class="text-white">Activity Feed</div>\n' +
    '                <span flex></span>\n' +
    '                <div layout="row" layout-align="space-around center" ng-show="showLoader" class="subheader-loading">\n' +
    '                    <md-progress-circular class="md-hue-1" md-diameter="20px"></md-progress-circular>\n' +
    '                    <span class="md-caption">&ensp;Loading . . .</span>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </md-toolbar>\n' +
    '        <md-content id="top" class="card-list no-grow bg-grey scroll-container" flex layout="column">\n' +
    '            <md-card class="brand-border-left" ng-class="{ \'no-pointer\': !feedthis.isCounselor }"\n' +
    '                ng-repeat="item in feedthis.feed" ng-click="feedthis.followGoToLink(item)"\n' +
    '                ng-disabled="feedthis.isStudent || feedthis.isParent" layout="row" layout-align="space-between center">\n' +
    '                <md-card-content flex layout="row" layout-align="space-between center">\n' +
    '                    <img class="feed-image" md-avatar style="height:40px;width:40px;"\n' +
    '                         ng-src="{{item.imageURL || \'http://next-tier.s3.amazonaws.com/images/deadline_icon.svg\'}}">\n' +
    '                    <div class="md-body-1 line-height-1" flex>{{item.body}}</div>\n' +
    '                    <div class="activity-date md-caption text-dark-grey" layout="row" layout-align="end center" hide-xs>\n' +
    '                        <md-icon class="material-icons inherit">event</md-icon> <span>{{item.created_on | amCalendar}}</span>\n' +
    '                    </div>\n' +
    '                </md-card-content>\n' +
    '            </md-card>\n' +
    '             <div infinite-scroll="feedthis.getFeed(feedthis.nextUrl)"\n' +
    '                  infinite-scroll-container="\'.scroll-container\'"\n' +
    '                  infinite-scroll-immediate-check="false">\n' +
    '            </div>\n' +
    '        </md-content>\n' +
    '    </div>\n' +
    '    <md-content class="empty-feed bg-grey md-padding" ng-if="feedthis.showCarousel" layout="row" flex>\n' +
    '        <md-card class="carousel-wrapper" ng-if="!isMobile() && feedthis.stakeholder.isStudent">\n' +
    '            <slick class="slider single-item">\n' +
    '                <div ng-repeat="image in feedthis.feedConstants.web track by $index">\n' +
    '                    <img ng-src="{{image}}" class="layer no-margin" /> </div>\n' +
    '            </slick>\n' +
    '        </md-card>\n' +
    '        <md-card class="carousel-wrapper" ng-if="isMobile() && feedthis.stakeholder.isStudent">\n' +
    '            <slick class="slider single-item">\n' +
    '                <div ng-repeat="image in feedthis.feedConstants.mobile track by $index">\n' +
    '                    <img ng-src="{{image}}" class="layer no-margin" /> </div>\n' +
    '            </slick>\n' +
    '        </md-card>\n' +
    '        <md-card class="carousel-wrapper" ng-if="!isMobile() && !feedthis.stakeholder.isStudent">\n' +
    '            <slick class="slider single-item">\n' +
    '                <div ng-if="!feedthis.stakeholder.isCounselor" ng-repeat="image in feedthis.feedConstants.parentWeb track by $index">\n' +
    '                    <img ng-src="{{image}}" class="layer no-margin" /> </div>\n' +
    '                <div ng-if="feedthis.stakeholder.isCounselor" ng-repeat="image in feedthis.feedConstants.counselorWeb track by $index">\n' +
    '                    <img ng-src="{{image}}" class="layer no-margin" /> </div>\n' +
    '            </slick>\n' +
    '        </md-card>\n' +
    '        <md-card class="carousel-wrapper" ng-if="isMobile() && !feedthis.stakeholder.isStudent">\n' +
    '            <slick class="slider single-item">\n' +
    '                <div ng-if="feedthis.stakeholder.isCounselor" ng-repeat="image in feedthis.feedConstants.counselorMobile track by $index">\n' +
    '                    <img ng-src="{{image}}" class="layer no-margin" /> </div>\n' +
    '                <div ng-if="!feedthis.stakeholder.isCounselor" ng-repeat="image in feedthis.feedConstants.parentMobile track by $index">\n' +
    '                    <img ng-src="{{image}}" class="layer no-margin" /> </div>\n' +
    '            </slick>\n' +
    '        </md-card>\n' +
    '    </md-content>\n' +
    '</div>\n' +
    '\n' +
    '');
}]);
})();
