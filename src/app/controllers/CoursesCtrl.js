'use strict';

class CoursesCtrl{
    constructor($scope, $q, ParseCourse, ParseField, ParseSpecialty, ParseTemplate){
        $scope.$parent.stateName = 'Courses';

        $scope.loadFields = function(){
            return ParseField.getAll().then((fields)=>{
                $scope.$apply(()=>{
                    $scope.fields = fields;
                    return;
                });
            });
        };

        $scope.makeCourses = function(){

            let courses = $scope.csv.result;

            if(!$scope.field){
                alert("please choose a field for the courses to be added to");
                return;
            }

            // we groupBy specialty to get all the different specialties
            let groupedBySpecialty = _.groupBy(courses,"specialty");
            let specialties = [];
            let templates = [];
            let joinSpecTmpl = [];

            // We group by specialty,
            var sorted = _.mapValues(groupedBySpecialty,
                (specialtyCourses, specialtyName)=>{

                // we create the specialty from the name and the field it's in
                var specialty = ParseSpecialty.create(specialtyName, $scope.field);
                // we put the specialty in the array to be persisted later
                specialties.push(specialty);

                return {
                    'value': specialty,
                    'templates': specialtyCourses
                };
            });

            console.log('sorted:');
            console.log(sorted);

            console.log('specialties:');
            console.log(specialties);

            Parse.Object.saveAll(specialties)
            .then(()=>{
                console.log('specialties saved');

                _.mapValues(sorted, (specialty, specialtyName)=>{
                    // we loop through the courses,
                    specialty.templates = _.chain(specialty.templates)
                    // extract the date based on string elements
                    .mapValues(ParseCourse.extractDate)
                    // and group them by templates
                    .groupBy(ParseTemplate.filter)
                    .mapValues((templateCourses, templateName)=>{
                        // we create the specialty from the name
                        var template = ParseTemplate.create(templateName, specialtyName);
                        // we put the template in the array to be persisted later
                        templates.push(template);

                        return {
                            'value': template,
                            'courses': templateCourses
                        };
                    })
                    .value();
                    return specialty;

                });

                console.log('templates:');
                console.log(templates);

                return Parse.Object.saveAll(templates);
            })
            .then(()=>{
                console.log('templates saved');

                _.mapValues(sorted, (specialty)=>{
                    _.mapValues(specialty.templates,(template)=>{
                        joinSpecTmpl.push(ParseTemplate.createJoin(specialty.value.id, template.value.id));
                    });
                })

                console.log('joinSpecTmpl:');
                console.log(joinSpecTmpl);

                return Parse.Object.saveAll(joinSpecTmpl);
            })
            .then(()=>{
                console.log('joinSpecTmpl saved');
            })
            .fail((error)=>{console.log(error);});


        };
    }
}

CoursesCtrl.$inject = ['$scope','$q','ParseCourse','ParseField','ParseSpecialty','ParseTemplate'];

export default CoursesCtrl;
