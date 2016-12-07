$(document).ready(function() {

    var chart;
    var mainAngular = angular.module('myApp', []);

    mainAngular.controller('ArticleController', function($scope, $http) {
        console.log('hello');
        $scope.daterange = {
            start_date: new Date('2016-01-02'),
            end_date: new Date('2016-11-09'),
            d1: '2016-01-02',
            d2: '2016-11-09'
        };
        $scope.selectedState='';
        $scope.selectedTopic='';
        $scope.articles='';
        $scope.states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','Washington D.C.','West Virginia','Wisconsin','Wyoming'];

        $scope.validateFormState = function(){
            if ($scope.daterange.start_date > $scope.daterange.end_date){
                $scope.formError = 'Start date is greater than end date';
                return;
            } else if ($scope.daterange.start_date > (new Date('12-31-2016')) || $scope.daterange.end_date > (new Date('11-09-2016'))){

                $scope.formError='data only available within range 01-01-2016 and 11-08-2016';
                return;
            } else {
                $scope.formError='';
                $scope.selectedTopic='';
                $scope.articles='';
            }

            $scope.daterange.d1 = getFormattedDate($scope.daterange.start_date);
            $scope.daterange.d2 = getFormattedDate($scope.daterange.end_date);


            var url = getFormattedUrl("topics/state", ['start_date', 'end_date', 'state'], [$scope.daterange.d1, $scope.daterange.d2, $scope.selectedState.toLowerCase()]);
            $http.get(url).success(function(response){
                $scope.topics = response.topics;

                var options = {
                    chart: {
                        backgroundColor: '#F7F7F7',
                        plotShadow: false,
                        type: 'pie',
                        width: 400,
                        height: 300
                    },
                    cursor: "pointer",

                    title: {
                        text: 'Media Topics in ' + $scope.selectedState,
                        align: 'center'
                    },
                    /*tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    }*/
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: "<strong>{point.name}</strong><br>{point.percentage:.0f}%",
                                //distance: -10,
                                color: "black"
                            }//,
                            //showInLegend: true
                        }
                    },
                    series: [{
                        name: 'topic',
                        colorByPoint: true,
                        data: [{}],
                        point: {
                            events: {
                                click: function(event){
                                    $scope.selectedTopic = this.name;
                                    $scope.getArticles();
                                }
                            }
                        }
                    }]
                };

                var objects = [];
                $.each($scope.topics, function (index, value) {
                    objects.push([value.topic, value.count]);
                });

                options.series[0].data = objects;
                chart = new Highcharts.Chart('pie', options);
            });

        }

        $scope.getArticles = function(){
            if ($scope.daterange.start_date > $scope.daterange.end_date){
                $scope.formError = 'Start date is greater than end date';
                return;
            } else if ($scope.daterange.start_date > (new Date('12-31-2016')) || $scope.daterange.end_date > (new Date('11-09-2016'))){

                $scope.formError='data only available within range 01-01-2016 and 11-08-2016';
                return;
            } else {
                $scope.formError='';
            }

            // parse keywords
            keys = ["start_date", "end_date", "topic", "state"];
            values = [$scope.daterange.d1, $scope.daterange.d2, $scope.selectedTopic, $scope.selectedState.toLowerCase()];


            // get articles
            var url = getFormattedUrl("articles/search", keys, values);
            $http.get(url).success(function(response){
                var articles = response.articles;
                for (var i =0; i < articles.length; i++){
                    articles[i].date = new Date(articles[i].date);
                    articles[i].date.setDate(articles[i].date.getDate() + 1);
                }
                $scope.articles = articles;
            });
        }



    });




});
