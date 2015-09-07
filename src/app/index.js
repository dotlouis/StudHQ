'use strict';

import AppCtrl from './controllers/AppCtrl';
import CoursesCtrl from './controllers/CoursesCtrl';
import ParseCourse from './factories/ParseCourse';
import ParseAnthill from './factories/ParseAnthill';
import ParseTag from './factories/ParseTag';
import ParseType from './factories/ParseType';
import ParseFeed from './factories/ParseFeed';

angular.module('studhq', [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ngMaterial',
    'ngCsvImport'
])
.controller('AppCtrl', AppCtrl)
.controller('CoursesCtrl', CoursesCtrl)
.factory('ParseCourse', ParseCourse.ParseCourseFactory)
.factory('ParseAnthill', ParseAnthill.ParseAnthillFactory)
.factory('ParseTag', ParseTag.ParseTagFactory)
.factory('ParseFeed', ParseFeed.ParseFeedFactory)
.factory('ParseType', ParseType.ParseTypeFactory)

.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        controller: 'AppCtrl',
        template: '<ui-view name="main"></ui-view>'
    })
    .state('app.courses', {
        url: '/courses',
        views: {
            'main@app': {
                controller: 'CoursesCtrl',
                templateUrl: 'app/templates/courses.html'
            }
        }
    });

    $urlRouterProvider.otherwise('/app/courses');

    // Handling errors
    // http://docs.strongloop.com/display/public/LB/AngularJS+JavaScript+SDK#AngularJSJavaScriptSDK-Handling401Unauthorized
    $httpProvider.interceptors.push(function($q, $location) {
        return {
            responseError: function(rejection) {
                // Server down or does not answer
                if(rejection.status === 0)
                    return $q.reject({message:'Can\'t reach the server', name:'Error', status: 0, statusCode: 0});

                return $q.reject(rejection);
            }
        };
    });

    Parse.initialize('LK0ZnJAA5uMrksf7t5tGPbMTrIlmwzWYzrJrHcjR', 'uFXMpOz1ksG4bIyRdkLvwxCtx6MdWZ8R0R5H8Pqo');

    /********************************************************************************************************/
    /*                                          PRODUCTION DATABASE                                         */
    /*                                                                                                      */
    // Parse.initialize('cei7mRd9aWsbrWCkmkbXzhinkcKhnsIlw59BnaMY', 'EhQ2No3Qz2HXJzQ03cgYQ6uhBkHYx8uXhf3Ym3Q8');
    /********************************************************************************************************/

    moment.locale('fr');
});
