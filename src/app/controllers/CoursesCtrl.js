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
            let instanceCourses = [];
            let allCourses = [];

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
                            let option = ParseCourse.createOption(course, template, specialty);
                            options.push(option);
                            allCourses.push({option: option, course: course});
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

                _.map(allCourses, (obj)=>{
                    instanceCourses.push(ParseCourse.create(obj.option, obj.course));
                });

                return Parse.Object.saveAll(instanceCourses);
            })
            .then(()=>{
                console.log(instanceCourses.length+' instanceCourses saved');
            })
            .fail((error)=>{console.log(error);});

        };

        // This function subtract one week to all courses that was instanciated
        // one week too late due to a bug.
        // It also modifies the Type to 'CM'
        $scope.updateCourses = function(){

            let date1 = moment(new Date()).subtract(2, 'days').startOf('day').toDate();
            let date2 = moment(new Date()).subtract(1, 'days').startOf('day').toDate();
            console.log('greaterThan: '+date1);
            console.log('lesserThan: '+date2);
            new Parse.Query('Courses')
            .greaterThan('createdAt', date1)
            .lessThan('createdAt', date2)
            .limit(1000)
            .find()
            .then((courses)=>{
                console.log(courses.length+' results');
                _.map(courses, (course)=>{
                    // console.log(course.get('Begining'));
                    course.set('Type', 'CM');
                    course.set('Begining', moment(course.get('Begining')).subtract(1,'week').toDate());
                    course.set('Ending', moment(course.get('Ending')).subtract(1,'week').toDate());
                });
                // Parse.Object.saveAll(courses);
            })
            .fail((error)=>{console.log(error);});
        };
    }
}

CoursesCtrl.$inject = ['$scope','$q','ParseCourse','ParseField','ParseSpecialty','ParseTemplate'];

export default CoursesCtrl;
