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

        $scope.uploadCourses = function(){

            if(!$scope.field){
                alert('please choose a field for the courses to be added to');
                return;
            }

            // Arrays to be filled and batch saved later
            let specialties = [];
            let templates = [];
            let joinSpecTmpl = [];
            let options = [];

            let courses = _.chain($scope.csv.result)
            // we groupBy specialty to get all the different specialties
            .groupBy("specialty")
            .mapValues((specialtyCourses, specialtyName)=>{
                // we create the specialty from the name and the field it's in
                let specialty = ParseSpecialty.create(specialtyName, $scope.field);
                // we put the specialty in the array to be persisted later
                specialties.push(specialty);

                return {
                    'value': specialty,
                    'templates': specialtyCourses
                };
            })
            .value();

            console.log(courses);

            Parse.Object.saveAll(specialties)
            .then(()=>{
                console.log(specialties.length+' specialties saved');

                _.mapValues(courses, (specialty, specialtyName)=>{
                    // we loop through the courses,
                    specialty.templates = _.chain(specialty.templates)
                    // extract the date based on string elements
                    .mapValues(ParseCourse.extractDate)
                    // and group them by templates
                    .groupBy(ParseTemplate.filter)
                    .mapValues((templateCourses, templateName)=>{
                        // we create the specialty from the name
                        let template = ParseTemplate.create(templateName, specialtyName);
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

                return Parse.Object.saveAll(templates);
            })
            .then(()=>{
                console.log(templates.length+' templates saved');

                _.mapValues(courses, (specialty)=>{
                    _.mapValues(specialty.templates,(template)=>{
                        // for each template in each specialty we create
                        // the corresponding joint record
                        joinSpecTmpl.push(ParseTemplate.createJoin(specialty.value.id, template.value.id));

                        // we create the options of each template
                        _.mapValues(template.courses, (course)=>{
                            options.push(ParseCourse.createOption(course, template, specialty));
                        });
                    });
                })

                return Parse.Object.saveAll(joinSpecTmpl);
            })
            .then(()=>{
                console.log(joinSpecTmpl.length+' joinSpecTmpl saved');
                return Parse.Object.saveAll(options);
            })
            .then(()=>{
                console.log(options.length+' options saved');
            })
            .fail((error)=>{console.log(error);});

        };
    }
}

CoursesCtrl.$inject = ['$scope','$q','ParseCourse','ParseField','ParseSpecialty','ParseTemplate'];

export default CoursesCtrl;
