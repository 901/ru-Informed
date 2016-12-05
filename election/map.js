$(document).ready(function() {
    const blue = '#31A2FE';
    const red = '#FF585B';

    Highcharts.setOptions({
        colors: [blue, red]
    });

    const clintonMap1 = new Datamap({
        scope: 'usa',
        element: document.getElementById('clinton-map-1'),
        fills: {
            'Democrat': blue,
            defaultFill: 'transparent'
        }
    });

    const clintonMap2 = new Datamap({
        scope: 'usa',
        element: document.getElementById('clinton-map-2'),
        fills: {
            'Democrat': blue,
            defaultFill: 'transparent'
        }
    });

    const trumpMap1 = new Datamap({
        scope: 'usa',
        element: document.getElementById('trump-map-1'),
        fills: {
            'Republican': red,
            defaultFill: 'transparent'
        }
    });

    const trumpMap2 = new Datamap({
        scope: 'usa',
        element: document.getElementById('trump-map-2'),
        fills: {
            'Republican': red,
            defaultFill: 'transparent'
        }
    });

    var mainAngular = angular.module('myApp', []);
    mainAngular.controller('DateController', function($scope, $http){
        $scope.stateSelected = '';
        const electionMap = new Datamap({
            scope: 'usa',
            element: document.getElementById('election-map'),
            done: function(map) {
                map.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                    $scope.getStateInfo(geography.properties.name);

                    $('body').addClass('modal--open');
                    $('#modal-view').css({
                        'display': 'block'
                    });
                })
            },
            fills: {
                'Republican': red,
                'Democrat': blue,
                defaultFill: '#7C87C3'
            }
        });

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

                let electoralVotes = {
                    clinton: 0,
                    trump: 0
                };
                let mapData = {};
                for (var i = 0; i < response.state_results.length; ++i) {
                    const data = response.state_results[i];
                    if (data == null) continue;

                    const stateAbbrev = statesHash[data.state.toLowerCase()];
                    mapData[stateAbbrev] = {
                        'fillKey': data.clinton > data.trump ? 'Democrat' : 'Republican',
                        'clinton': data.clinton,
                        'trump': data.trump
                    };

                    if (data.clinton > data.trump) {
                        electoralVotes.clinton += statesElectoralVotes[data.state.toLowerCase()];
                    } else {
                        electoralVotes.trump += statesElectoralVotes[data.state.toLowerCase()];
                    }
                }

                electionMap.updateChoropleth(mapData, { reset: true });

                Highcharts.chart('election-donut', {
                    chart: {
                        backgroundColor: '#F7F7F7',
                        plotShadow: false
                    },
                    title: {
                        text: 'Electoral<br />Votes<br />2016',
                        align: 'center',
                        verticalAlign: 'middle',
                        y: 80
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: true,
                                distance: -15,
                                style: {
                                    fontWeight: 'bold',
                                    color: 'white'
                                }
                            },
                            startAngle: -90,
                            endAngle: 90,
                            center: ['50%', '75%']
                        }
                    },
                    series: [
                        {
                            type: 'pie',
                            name: '2016 Presidential Election',
                            innerSize: '50%',
                            data: [
                                ['Clinton', electoralVotes.clinton],
                                ['Trump', electoralVotes.trump]
                            ]
                        }
                    ]
                });
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

                let mapData = {};
                for (var i = 0; i < response.states.length; ++i) {
                    const stateAbbrev = statesHash[response.states[i].toLowerCase()];
                    mapData[stateAbbrev] = {
                        'fillKey': 'Democrat'
                    };
                }

                clintonMap2.updateChoropleth(mapData, { reset: true });
            });

            $http.get(urlTrump).success(function(response){
                $scope.statesTopicApproveTrump = response.states;

                let mapData = {};
                for (var i = 0; i < response.states.length; ++i) {
                    const stateAbbrev = statesHash[response.states[i].toLowerCase()];
                    mapData[stateAbbrev] = {
                        'fillKey': 'Republican'
                    };
                }

                trumpMap2.updateChoropleth(mapData, { reset: true });
            });

        }

        $scope.statesPosArticles = function(){
            var urlClinton = getFormattedUrl('states',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'clinton']);

            var urlTrump = getFormattedUrl('states',
                ['start_date', 'end_date', 'candidate'], [$scope.daterange.d1, $scope.daterange.d2, 'trump']);

            $http.get(urlClinton).success(function(response){
                $scope.statesPositiveClinton = response.states;

                let mapData = {};
                for (var i = 0; i < response.states.length; ++i) {
                    const stateAbbrev = statesHash[response.states[i].toLowerCase()];
                    mapData[stateAbbrev] = {
                        'fillKey': 'Democrat'
                    };
                }

                clintonMap1.updateChoropleth(mapData, { reset: true });
            });

            $http.get(urlTrump).success(function(response){
                $scope.statesPositiveTrump = response.states;

                let mapData = {};
                for (var i = 0; i < response.states.length; ++i) {
                    const stateAbbrev = statesHash[response.states[i].toLowerCase()];
                    mapData[stateAbbrev] = {
                        'fillKey': 'Republican'
                    };
                }

                trumpMap1.updateChoropleth(mapData, { reset: true });
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
