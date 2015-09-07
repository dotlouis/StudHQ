'use strict';

class CoursesCtrl{
    constructor($scope, $q, ParseCourse, ParseAnthill, ParseTag, ParseFeed, ParseType){
        $scope.$parent.stateName = 'Courses';

        let eventType;

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

          processTypes()
          .then(processTags)
          .then(processFeeds)
          .then(processCourses);
        };

        function processTypes(){
            return ParseType.getAll()
            .then((types)=>{
              eventType = _.filter(types, (t)=>{
                return t.attributes.Name == 'Amphi / CM';
              })[0];
            });
        }

        function processTags(){
          let existingTags;
          let extractedTags;
          let newTags;
          let allTags;

          return ParseTag.getAll()
          .then((tags)=>{

            allTags = tags;

            existingTags = _.chain(tags)
            .pluck('attributes.Name')
            .value();
            console.log('existingTags');
            console.log(existingTags);

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

            console.log('extractedTags');
            console.log(extractedTags);

            newTags = _.chain(extractedTags)
            .filter((tag)=>{
              // only keep the one that are not already existing
              return !_.includes(existingTags, tag);
            })
            .map((tag)=>{
              return ParseTag.create(tag);
            })
            .value();

            console.log('newTags');
            console.log(newTags);

            return newTags;
          })
          .then((newTags)=>{
            return Parse.Object.saveAll(newTags);
          })
          .then((newTags)=>{
            return allTags.concat(newTags);
          });
        }

        function processFeeds(tagList){
          console.log(tagList);

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

            // for each feed get the corresponding tag.
            let feedTags = _.pluck(_.filter(tagList,(tag)=>{
              return _.includes(tagsArray, tag.attributes.Name);
            }), 'id');

            // don't forget to also include the id of anthill as a tag
            feedTags.push($scope.anthill.id);

            return ParseFeed.create(feedName, feedTags);
          })
          .value();

          return Parse.Object.saveAll(feeds);
        }

        function processCourses(feedList){
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

            let course = ParseCourse.create({
              'Name': c.feed,
              'Author': c.professor,
              'Beginning': c.start,
              'Ending': c.end,
              'Feeds': [courseFeed.id],
              'Recurrence': false,
              'Place': c.room,
              'Type': eventType.id,
              'TypeString': eventType.attributes.Name,
              'Icon': eventType.attributes.Icon
            });
            return course;
          })
          .value();

          return Parse.Object.saveAll(courses)
          .then((savedCourses)=>{
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
          })
          .then((savedUpdatedCourses)=>{
            console.log(savedUpdatedCourses);
          });
        }
    }
}

CoursesCtrl.$inject = ['$scope','$q','ParseCourse','ParseAnthill','ParseTag','ParseFeed','ParseType'];

export default CoursesCtrl;
