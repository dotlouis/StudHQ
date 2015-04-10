'use strict';

import AppCtrl from './controllers/AppCtrl';
import UsersCtrl from './controllers/UsersCtrl';
import LoginCtrl from './controllers/LoginCtrl';

angular.module('studhq', [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ngMaterial',
    'permission',
    'lbServices'
])
.controller('AppCtrl', AppCtrl)
.controller('UsersCtrl', UsersCtrl)
.controller('LoginCtrl', LoginCtrl)

.config(function ($stateProvider, $urlRouterProvider, $httpProvider, LoopBackResourceProvider) {
    $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'app/templates/login.html',
        controller: 'LoginCtrl',
        data: {
            permissions: {
                only: ['anonymous'],
                redirectTo: 'app.users'
            }
        }
    })
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'app/templates/sidebar.html',
        controller: 'AppCtrl',
        data: {
            permissions: {
                only: ['god'],
                redirectTo: 'login'
            }
        }
    })
    .state('app.users', {
        url: '/users',
        views: {
            'main@app' :{
                templateUrl: 'app/templates/users.html',
                controller: 'UsersCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('/app/users');

    LoopBackResourceProvider.setUrlBase('http://localhost:3005/api');

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

})

.run(['Permission','CustomUser', function(Permission, CustomUser){
    Permission.defineRole('anonymous', function() {
        if(!CustomUser.isAuthenticated())
            return true;
        return false;
    });

    Permission.defineRole('god', function() {
        if(CustomUser.isAuthenticated())
            return true;
        return false;
    });
}]);
