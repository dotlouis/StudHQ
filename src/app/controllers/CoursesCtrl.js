'use strict';

class CoursesCtrl{
    constructor($scope){
        $scope.$parent.stateName = "Courses";
    }
}

CoursesCtrl.$inject = ['$scope'];

export default CoursesCtrl;
