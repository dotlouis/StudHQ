'use strict';

class ParseType{

    constructor($q){
      this.getAll().then((types)=>{
        this.allTypes = types;
      });
    }

    getAll(){
        return new Parse.Query('Type').limit(1000).find();
    }

    get(courseType){
      var filter;

      switch(courseType.toUpperCase()){
        case 'CM':
        case 'AMPHI':
        case 'AMPHI / CM':
          filter = 'Amphi / CM';
          break;
        case 'EXAMEN':
        case 'PARTIEL':
        case 'SOUTENANCE':
        case 'CONCOURS':
          filter = 'Partiel';
          break;
        case 'TD':
          filter = 'TD';
          break;
        case 'TP':
          filter = 'TP';
          break;
      }

      return _.filter(this.allTypes, (t)=>{
        return t.attributes.Name == filter;
      })[0];
    }

    static ParseTypeFactory($q){
        return new ParseType($q);
    }
}

ParseType.ParseTypeFactory.$inject = ['$q'];

export default ParseType;
