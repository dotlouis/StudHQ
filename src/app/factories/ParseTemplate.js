'use strict';

class ParseTemplate{
    constructor($q){
    }

    getAll(){
        return new Parse.Query('TemplatesOfCourses').find();
    }

    create(name, specName){
        return new Parse.Object('TemplatesOfCourses',{
            'Name': name,
            'CompleteName': specName
        });
    }

    createJoin(specId, tmplId){
        return new Parse.Object('Joint_Spec_Template',{
            'ID_Specialty': specId,
            'ID_Template': tmplId
        });
    }

    // Filter by templates while ignoring what's in parenthesis
    filter(course){
        if(course.template.indexOf('(') != -1)
            return course.template.slice(0,course.template.indexOf('(')).trim();
        else
            return course.template.trim();
    }

    static ParseTemplateFactory($q){
        return new ParseTemplate($q);
    }
}

ParseTemplate.ParseTemplateFactory.$inject = ['$q'];

export default ParseTemplate;
