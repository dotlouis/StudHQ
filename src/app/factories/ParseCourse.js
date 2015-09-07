'use strict';

class ParseCourse{
    constructor($q){
    }

    create(course){
      return new Parse.Object('Event',course);
    }

    // creates a Date from a week number and a week day
    extractDate(course){
        var week = parseInt(course.week.slice(course.week.indexOf('(')+1,course.week.indexOf(')')).trim());

        if(week < 36)
          week +=53;
        var day = course.day.trim();
        var hour = parseInt(course.hour.slice(0,course.hour.indexOf('h')).trim());
        var min = parseInt(course.hour.slice(course.hour.indexOf('h')+1).trim());

        var duration = moment.duration({
            hours: parseInt(course.duration.slice(0,course.duration.indexOf('h')).trim()),
            minutes: parseInt(course.duration.slice(course.duration.indexOf('h')+1,course.duration.indexOf('m')).trim())
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
