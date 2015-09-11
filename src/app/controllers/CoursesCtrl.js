'use strict';

class CoursesCtrl{
    constructor($scope, $q, ParseCourse, ParseAnthill, ParseTag, ParseFeed, ParseType){
        $scope.$parent.stateName = 'Courses';

        $scope.addTypeString = function(){
          if(!$scope.typeId || !$scope.typeString){
            console.error("needs typeId and typeString");
            return;
          }

          new Parse.Query('Event').equalTo('Type',$scope.typeId).doesNotExist('TypeString').limit(1000).find().then((events)=>{
            console.log(events.length);
            console.log(events);
            var updatedEvents = _.map(events,(e)=>{
              e.set('TypeString',$scope.typeString);
              return e;
            });
            console.log(updatedEvents);
            let timerCount = 0;
            let timer = setInterval(function () {
              console.log(timer+'s');
              timerCount++;
            }, 1000);
            return Parse.Object.saveAll(updatedEvents)
            .then(()=>{
              clearInterval(timer);
            });
          });
        };

        $scope.loadAnthill = function(){
            return ParseAnthill.getAll().then((anthills)=>{
                $scope.$apply(()=>{
                    $scope.anthills = anthills;
                    return;
                });
            });
        };

        $scope.process = function(){

          if(!$scope.anthill){
              alert('please select an Anthill');
              return;
          }

          processTags()
          .then(processFeeds)
          .then(processCourses)
          .fail((err)=>{
            console.log(err);
          });
        };

        function processTags(){
          let existingTags;
          let extractedTags;
          let newTags;
          let allTags;
          let existingTagObjects;

          return ParseTag.getAll()
          .then((tags)=>{

            allTags = tags;

            existingTags = _.chain(allTags)
            .pluck('attributes.Name')
            .map((tag)=>{
              return tag.toUpperCase();
            })
            .value();
            console.log('existingTags');
            console.log(existingTags.length);

            extractedTags = _.chain($scope.csv.result)
            .groupBy('tags')
            .keys()
            .map((tagString)=>{
              // extract tags from spec string
              return tagString.split('/');
            })
            // flatten the previously created nested array
            .flatten()
            .unique((n)=>{
              // remove possible duplicates
              return n.toUpperCase();
            })
            .value();

            // console.log('extractedTags');
            // console.log(extractedTags);

            let extractedTagsUpperCase = _.map(extractedTags,(tag)=>{
              return tag.toUpperCase();
            });
            console.log('extractedTagsUpperCase');
            console.log(extractedTagsUpperCase);

            newTags = _.chain(extractedTags)
            .filter((tag)=>{
              // only keep the one that are not already existing
              return !_.includes(existingTags, tag.toUpperCase());
            })
            .map((tag)=>{
              return ParseTag.create(tag);
            })
            .value();

            console.log('newTags');
            console.log(newTags);


            existingTagObjects = _.chain(allTags)
            .filter((tag)=>{
              return _.includes(extractedTagsUpperCase, tag.attributes.Name.toUpperCase());
            })
            .value();
            console.log('existingTagObjects')
            console.log(existingTagObjects);


            return newTags;
          })
          .then((newTags)=>{
            if($scope.simulation)
              return Parse.Promise.error("simulation done");
            return Parse.Object.saveAll(newTags);
          })
          .then((newTagsSaved)=>{

            let newTagsId = _.pluck(newTagsSaved,'id');
            let existingTagsId = _.pluck(existingTagObjects,'id');
            if(!$scope.anthill.attributes.Tags)
              $scope.anthill.attributes.Tags = [];
            $scope.anthill.set('Tags',$scope.anthill.attributes.Tags.concat(newTagsId).concat(existingTagsId));
            $scope.anthill.save();
            return allTags.concat(newTags);
          });
        }

        function processFeeds(tagList){

          let feeds = _.chain($scope.csv.result)
          // we groupBy feed to get all the different feeds
          .groupBy((course)=>{
            // ignore some brackets and spaces
            if(course.feed.indexOf('(') != -1)
                return course.feed.slice(0,course.feed.indexOf('(')).trim();
            else
                return course.feed.trim();
          })
          .map((feedCourses, feedName)=>{

            let tagsArray = feedCourses[0].tags.split('/');
            let tagsArrayUpper = _.map(tagsArray,(tag)=>{
              return tag.toUpperCase();
            });

            // for each feed get the corresponding tag.
            let feedTags = _.pluck(_.filter(tagList,(tag)=>{
              return _.includes(tagsArrayUpper, tag.attributes.Name.toUpperCase());
            }), 'id');

            // don't forget to also include the id of anthill as a tag
            feedTags.push($scope.anthill.attributes.IdentityTag);

            return ParseFeed.create(feedName, feedTags);
          })
          .value();

          return Parse.Object.saveAll(feeds);
        }

        function processCourses(feedList){
          console.log("added "+feedList.length+" feeds");
          console.log(feedList);

          let courses = _.chain($scope.csv.result)
          .map((c)=>{

            // get date start and end
            c = ParseCourse.extractDate(c);
            // ignore some brackets and spaces in feed name
            if(c.feed.indexOf('(') != -1)
                c.feed = c.feed.slice(0,c.feed.indexOf('(')).trim();
            else
                c.feed = c.feed.trim();

            // get the feed of this event
            let courseFeed = _.filter(feedList, (feed)=>{
              return feed.attributes.Name == c.feed;
            })[0];

            let eventType = ParseType.get(c.type);


            let course = ParseCourse.create({
              'Name': c.feed,
              'Author': c.professor,
              'Beginning': c.start,
              'Ending': c.end,
              'Feeds': [courseFeed.id],
              'Recurrence': false,
              'Place': c.room
            });
            if(eventType){
              course.set('Type', eventType.id);
              course.set('TypeString', eventType.attributes.Name);
              course.set('Icon', eventType.attributes.Icon);
            }
            return course;
          })
          .value();

          return Parse.Object.saveAll(courses)
          .then((savedCourses)=>{
            console.log("added "+savedCourses.length+" courses");
            console.log(savedCourses);

            let updatedCourses = [];

            _.chain(savedCourses)
            .groupBy('attributes.Name')
            .map((feedCourses)=>{
              let original;
              _.map(feedCourses, (course)=>{
                if(!original){
                  // the first course set as original
                  original = course.id;
                  course.set('Original', true);
                }
                else{
                  // the others reference it
                  course.set('Original', false);
                  course.set('ID_Original',original);
                }
                updatedCourses.push(course);
              });
            })
            .value();

            return Parse.Object.saveAll(updatedCourses);
          });
        }
    }
}

CoursesCtrl.$inject = ['$scope','$q','ParseCourse','ParseAnthill','ParseTag','ParseFeed','ParseType'];

export default CoursesCtrl;
