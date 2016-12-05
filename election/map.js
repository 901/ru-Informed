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
        $scope.positiveArticlesClintonNation = [];
        $scope.positiveArticlesTrumpNation = [];
        $scope.countryView = true;
        $scope.stateView = false;

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

                // extract US poll results and delete from state view on left
                for (var i =  0; i < response.state_results.length; i++){
                    if (response.state_results[i].state == 'U.S.'){
                        $scope.countryPolls = {
                            clinton: response.state_results[i].clinton,
                            trump: response.state_results[i].trump
                        };
                        delete response.state_results[i];
                        break;
                    }

                }
                $scope.datedPolls = response.state_results;
            });

            // get country info
            $scope.getCountryInfo();

        };

        $scope.getCountryInfo = function(){
            $scope.countryView = true;
            $scope.stateView = false;

            $scope.articlesNoState();
            $scope.statesTopicApprove();
            $scope.statesPosArticles();
            $scope.distribTopics();
        };

        $scope.getStateInfo = function(state){
            $scope.countryView = false;
            $scope.stateView = true;

            if (state == 'District of Columbia')
                state = 'D.C.';
            $scope.selectedState = state;
            var url = getFormattedUrl("polls/state", ["start_date", "end_date", "state"], [$scope.daterange.d1, $scope.daterange.d2, state.toLowerCase()]);
            $http.get(url).success(function(response){
                $scope.statePoll = {
                    state: state,
                    clinton: response.results[0].clinton,
                    trump: response.results[0].trump

                };
            });

            // get top 10 topics from clinton and trump by state
            $scope.topics(state.toLowerCase());
            // get positive articles
            $scope.positiveArticles(state.toLowerCase());


        };

        $scope.topics = function(state){
            var topicsClintonUrl = getFormattedUrl('topics/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            $http.get(topicsClintonUrl).success(function(response){
                if (response.topics.length == 0)
                    $scope.stateTopicsClinton = {};
                $scope.stateTopicsClinton = response.topics;
            });

            var topicsTrumpUrl =  getFormattedUrl('topics/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(topicsTrumpUrl).success(function(response){
                if (response.topics.length == 0)
                    $scope.stateTopicsTrump = {};
                $scope.stateTopicsTrump = response.topics;
            });
        }
        $scope.positiveArticles = function(state){
            var posArtClinton = getFormattedUrl('articles/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            $http.get(posArtClinton).success(function(response){
                if (response.favorable_articles.length == 0)
                    $scope.positiveArticlesClinton = {};

                var articles = response.favorable_articles;
                for (var i =0; i < articles.length; i++){
                    articles[i].date = new Date(articles[i].date);
                    articles[i].date.setDate(articles[i].date.getDate() + 1);
                }
                $scope.positiveArticlesClinton = response.favorable_articles;

            });

            var posArtTrump = getFormattedUrl('articles/favorable',
                ['state', 'start_date', 'end_date', 'candidate'], [state, $scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(posArtTrump).success(function(response){
                if (response.favorable_articles.length == 0)
                    $scope.positiveArticlesTrump  = {};

                var articles = response.favorable_articles;
                for (var i =0; i < articles.length; i++){
                    articles[i].date = new Date(articles[i].date);
                    articles[i].date.setDate(articles[i].date.getDate() + 1);                }
                $scope.positiveArticlesTrump = response.favorable_articles;


            });
        };


        $scope.articlesNoState = function(){
            var posArtClinton = getFormattedUrl('articles/favorable',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            $http.get(posArtClinton).success(function(response){
                if (response.favorable_articles.length == 0)
                    $scope.positiveArticlesClintonNation = {};

                var articles = response.favorable_articles;
                for (var i =0; i < articles.length; i++){
                    articles[i].date = new Date(articles[i].date);
                    articles[i].date.setDate(articles[i].date.getDate() + 1);
                }
                $scope.positiveArticlesClintonNation = response.favorable_articles;

            });

            var posArtTrump = getFormattedUrl('articles/favorable',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(posArtTrump).success(function(response){
                if (response.favorable_articles.length == 0)
                    $scope.positiveArticlesTrumpNation  = {};

                var articles = response.favorable_articles;
                for (var i =0; i < articles.length; i++){
                    articles[i].date = new Date(articles[i].date);
                    articles[i].date.setDate(articles[i].date.getDate() + 1);
                }
                $scope.positiveArticlesTrumpNation = response.favorable_articles;
            });
        };

        ///api/v1/states/topics_approved

        $scope.statesTopicApprove = function(){
            var urlClinton = getFormattedUrl('states/topics_approved',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            var urlTrump = getFormattedUrl('states/topics_approved',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(urlClinton).success(function(response){
                $scope.statesTopicApproveClinton = response.states;
            });

            $http.get(urlTrump).success(function(response){
                $scope.statesTopicApproveTrump = response.states;
            });

        }

        $scope.statesPosArticles = function(){
            var urlClinton = getFormattedUrl('states',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            var urlTrump = getFormattedUrl('states',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(urlClinton).success(function(response){
                $scope.statesPositiveClinton = response.states;
            });

            $http.get(urlTrump).success(function(response){
                $scope.statesPositiveTrump = response.states;
            });

        }

        $scope.distribTopics = function(){
            var url = getFormattedUrl('topics',
                ['start_date', 'end_date'], [$scope.daterange.d1, $scope.daterange.d2]);

            $http.get(url).success(function(response){
                $scope.distributedTopics = response.topics;
            });
        }

    });
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
