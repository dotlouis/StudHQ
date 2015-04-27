'use strict';

class UsersCtrl{
    constructor($scope, CustomUser){

        $scope.$parent.stateName = "Users";

        CustomUser.find({}).$promise
        .then((userList)=>{
            $scope.userList = userList;
        })
        .catch((error)=>{
            console.log(error);
        });

        $scope.createUsers = function(){
            console.log($scope.rawUsers);
        };
    }
}

UsersCtrl.$inject = ['$scope', 'CustomUser'];

export default UsersCtrl;
