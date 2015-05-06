'use strict';

class ParseSpecialty{
    constructor($q){
    }

    getAll(){
        return new Parse.Query("Specialties").find();
    }

    create(name, field){

        return new Parse.Object('Specialties',{
            'Name': name,
            'FieldName': field.get('Name'),
            'ID_Field': field.id
        });
    }

    static ParseSpecialtyFactory($q){
        return new ParseSpecialty($q);
    }
}

ParseSpecialty.ParseSpecialtyFactory.$inject = ['$q'];

export default ParseSpecialty;
