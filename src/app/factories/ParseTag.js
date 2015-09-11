'use strict';

class ParseTag{
    constructor($q){
    }

    getAll(){
        return new Parse.Query('Tag').limit(1000).find();
    }

    create(name, filter){
        return new Parse.Object('Tag',{
            'Name': name,
            'Filter': filter
        });
    }

    static ParseTagFactory($q){
        return new ParseTag($q);
    }
}

ParseTag.ParseTagFactory.$inject = ['$q'];

export default ParseTag;
