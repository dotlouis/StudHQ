'use strict';

class ParseCourse{
    constructor($q){
    }

    create(courses){
        var specialties = _.groupBy(courses,"specialty");
        var sorted = _.mapValues(specialties, (specialtyCourses, specialtyName)=>{
            console.log(specialtyName);

            // createParseSpecialty(spec);
            var specialty = createParseSpecialty(specialtyName);

            return  _.chain(specialtyCourses)
                    .mapValues(extractDate)
                    .groupBy(filterTemplate)
                    .mapValues((templateCourses, templateName)=>{
                        console.log(templateName);
                        createParseTemplate(templateName, specialtyName);
                        return templateCourses;
                    })
                    .value();
        });
        console.log(sorted);

    }

    createOption(course, template, specialty){
        return new Parse.Object('OptionsOfTemplates',{
            'Day': course.day,
            'Begin_Time': moment(course.start).format('HH:mm'),
            'End_Time': moment(course.end).format('HH:mm'),
            'CompleteName': specialty.value.get('FieldName')+' '+specialty.value.get('Name'),
            'EveryTwoWeek': false,
            'EveryWeek': false,
            'ID_Template': template.value.id,
            // 'Icon': 'fa-book',
            'Location': course.room,
            'Mandatory': true,
            'Name': template.value.get('Name'),
            // 'Number':,
            'Professor': course.professor,
            'Recurrence': false,
            'Type': course.state
        });
    }

    // creates a Date from a week number and a week day
    extractDate(course){
        var week = course.week.slice(course.week.indexOf('(')+1,course.week.indexOf(')'));
        var day = course.day;
        var hour = parseInt(course.hour.slice(0,course.hour.indexOf('h')));
        var min = parseInt(course.hour.slice(course.hour.indexOf('h')+1));

        var duration = moment.duration({
            hours: parseInt(course.duration.slice(0,course.duration.indexOf('h'))),
            minutes: parseInt(course.duration.slice(course.duration.indexOf('h')+1,course.duration.indexOf('m')))
        });

        // Thanks momentJS, you save my life so much <3
        var start = moment().week(week)
                               .day(day)
                               .startOf('day')
                               .hour(hour)
                               .minute(min);
        var end = moment(start).add(duration);

        course.start = start.toDate();
        course.end = end.toDate();
        course.momentDuration = duration;

        return course;
    }

    static ParseCourseFactory($q){
        return new ParseCourse($q);
    }
}

ParseCourse.ParseCourseFactory.$inject = ['$q'];

export default ParseCourse;

function createParseTemplate(templateName, specialtyName){
    new Parse.Object('TemplatesOfCourses',{
        'Name': templateName
    })
    .save()
    .then((tpl)=>{
        return new Parse.Object('Joint_Spec_Template',{
            'ID_Template': tpl.id,
            'ID_Speciatly': spec.id
        })
        .save();
    });
}

function makeParseObject(course, template){
    // console.log(template);
    console.log(course);
    // return new Parse.Object("Courses",{
    //
    // });
    return course;
}
