'use strict';

import AppCtrl from './controllers/AppCtrl';
import UsersCtrl from './controllers/UsersCtrl';

angular.module('studhq', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ngMaterial'])
  .controller('AppCtrl', AppCtrl)
  .controller('UsersCtrl', UsersCtrl)

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'app/templates/sidebar.html',
        controller: 'AppCtrl'
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
  })
;
