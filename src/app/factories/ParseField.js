'use strict';

class ParseField{
    constructor($q){
    }

    getAll(){
        return new Parse.Query("Fields").find();
    }

    static ParseFieldFactory($q){
        return new ParseField($q);
    }
}

ParseField.ParseFieldFactory.$inject = ['$q'];

export default ParseField;
