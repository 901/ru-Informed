$(document).ready(function() {

    var mainAngular = angular.module('myApp', []);
    mainAngular.controller('DateController', function($scope, $http){
        $scope.datedPolls = [];
        $scope.daterange = {
            start_date: new Date('2016-01-02'),
            end_date: new Date('2016-11-09'),
            d1: '2016-01-02',
            d2: '2016-11-09'
        };
        $scope.stateTopicsClinton = [];
        $scope.stateTopicsTrump = [];


        $scope.validateDate = function(){
            if ($scope.daterange.start_date > $scope.daterange.end_date){
                console.log("error");
                return;
            }
            /*$scope.daterange.start_date = daterange.start_date;
            $scope.daterange.end_date = daterange.start*/
            $scope.daterange.d1 = getFormattedDate($scope.daterange.start_date);
            $scope.daterange.d2 = getFormattedDate($scope.daterange.end_date);

            // format url to send to server
            var datedPollsUrl = getFormattedUrl("polls", ["start_date", "end_date"], [$scope.daterange.d1, $scope.daterange.d2]);

            $http.get(datedPollsUrl).success(function(response){
                $scope.datedPolls = response.state_results;
            });

        };

        $scope.getStateInfo = function(state){
            $scope.selectedState = state;

            // get top 10 topics from clinton and trump by state
            $scope.topics(state);
            $scope.positiveArticles(state);


        };

        $scope.topics = function(state){
            var topicsClintonUrl = getFormattedUrl('topics/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'clinton']);
            console.log(topicsClintonUrl);

            $http.get(topicsClintonUrl).success(function(response){
                $scope.stateTopicsClinton = response.topics;
            });

            var topicsTrumpUrl =  getFormattedUrl('topics/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(topicsTrumpUrl).success(function(response){
                $scope.stateTopicsTrump = response.topics;
            });
        }
        $scope.positiveArticles = function(state){
            var posArtClinton = getFormattedUrl('articles/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            $http.get(posArtClinton).success(function(response){
                $scope.positiveArticlesClinton = response.favorable_articles;
            });

            var posArtTrump = getFormattedUrl('articles/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(posArtTrump).success(function(response){
                $scope.positiveArticlesTrump = response.favorable_articles;
            });
        };
        /*$scope.states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington', 'Washington, D.C.', 'West Virginia','Wisconsin','Wyoming'];
        $scope.stateSelect = [];
        console.log($scope.states);

        $scope.getStateData = function(){
            //
            console.log($scope.stateSelect);
        }*/



    });

    function getFormattedDate(date) {
      var year = date.getFullYear();
      var month = (1 + date.getMonth()).toString();
      month = month.length > 1 ? month : '0' + month;
      var day = date.getDate().toString();
      day = day.length > 1 ? day : '0' + day;
      return year + '/' + month + '/' + day;
    }

    function getFormattedUrl(endpoint, keys, values){
        var url = "https://limitless-taiga-13414.herokuapp.com/api/v1/" + endpoint + "?";
        var param = "";

        for (var i = 0; i < keys.length; ++i){
            param += keys[i] + "=" + values[i];
            if (i + 1 != keys.length)
                param += "&";
        }

        return url + param;
    }

    /*var chart;
    var mainAngular = angular.module('myApp', []);

    mainAngular.controller('TopicController', function($scope, $http) {
      //var hCat=  "./customAngular/headerCatalogue.json";
      var hCat = 'https://vast-sierra-64531.herokuapp.com/v1/categories'

      $scope.catgeories = [];
      //$scope.currentArticles = [];
      $scope.currentCategory = 'Select a category in the pie chart to find related articles';

      $scope.selectCategory = function(topic, y){

         $http.get('https://vast-sierra-64531.herokuapp.com/v1/articles?category=' + topic).success(function(response){
             $scope.currentArticles = response;
             $scope.currentCategory = topic;
         });
     };



          // TO DO: change to server link
          $http.get(hCat).success(function(response) {
            $scope.categories = response;

            var json  = $scope.categories.categories;
            options.series[0].data = JSON.parse(JSON.stringify(json).split("\"count\":").join( "\"y\":"));
            chart = new Highcharts.Chart('pie', options);

          });



    });*/




});
