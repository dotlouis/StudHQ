'use strict';

class ParseType{
    constructor($q){
    }

    getAll(){
        return new Parse.Query('Type').find();
    }

    static ParseTypeFactory($q){
        return new ParseType($q);
    }
}

ParseType.ParseTypeFactory.$inject = ['$q'];

export default ParseType;
