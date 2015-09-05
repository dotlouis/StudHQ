'use strict';

class ParseFeed{
    constructor($q){
    }

    getAll(){
        return new Parse.Query('Feed').find();
    }

    create(name, tags){
        return new Parse.Object('Feed',{
            'Name': name,
            'Tags': tags
        });
    }

    // Filter by templates while ignoring what's in parenthesis
    filter(course){
        if(course.template.indexOf('(') != -1)
            return course.template.slice(0,course.template.indexOf('(')).trim();
        else
            return course.template.trim();
    }

    static ParseFeedFactory($q){
        return new ParseFeed($q);
    }
}

ParseFeed.ParseFeedFactory.$inject = ['$q'];

export default ParseFeed;
