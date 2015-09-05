'use strict';

class ParseAnthill{
    constructor($q){
    }

    getAll(){
        return new Parse.Query("Anthill").find();
    }

    static ParseAnthillFactory($q){
        return new ParseAnthill($q);
    }
}

ParseAnthill.ParseAnthillFactory.$inject = ['$q'];

export default ParseAnthill;
