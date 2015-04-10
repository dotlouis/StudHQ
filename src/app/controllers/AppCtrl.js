'use strict';

class AppCtrl{
    constructor($scope, $state, CustomUser, Role){

        $scope.logout = function(){
            CustomUser.logout().$promise
            .then(()=>{
                $state.go('login');
            });
        };

        CustomUser.getCurrent().$promise
        .then((user)=>{
            $scope.user = user;
            // TODO
            // check the user role and display a
            // message when not an admin
        });

    }
}

AppCtrl.$inject = ['$scope','$state','CustomUser','Role'];

export default AppCtrl;
