'use strict';

class LoginCtrl{
    constructor($scope, $state, CustomUser){
        $scope.login = function(){
            CustomUser.login($scope.credentials).$promise
            .then((res)=>{
                $state.go('app.users',{user: res.user});
            });
        };
    }
}

LoginCtrl.$inject = ['$scope','$state','CustomUser'];

export default LoginCtrl;
