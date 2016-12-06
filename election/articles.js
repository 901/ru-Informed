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
        $scope.keywords='';
        $scope.selectedTopic='';

        // get topics
        var topicsUrl = getFormattedUrl("topics", ["start_date", "end_date", ], [$scope.daterange.d1, $scope.daterange.d2]);
        $http.get(topicsUrl).success(function(response){
            $scope.topics = response.topics;
        })

        $scope.validateForm = function(){
            if ($scope.daterange.start_date > $scope.daterange.end_date){
                $scope.dateError = 'Start date is greater than end date';
                return;
            } else if ($scope.daterange.start_date > (new Date('12-31-2016')) || $scope.daterange.end_date > (new Date('11-09-2016'))){

                $scope.dateError='data only available within range 01-01-2016 and 11-08-2016';
                return;
            } else {
                $scope.dateError='';
            }

            console.log($scope.selectedTopic + '\n'+ $scope.keywords);

            // parse keywords
            keys = ["start_date", "end_date", "topic"];
            values = [$scope.daterange.d1, $scope.daterange.d2, $scope.selectedTopic];
            if ($scope.keywords.includes(',')){
                keywords_array = $scope.keywords.split(',');
                for (var i = 0; i < keywords_array.length; ++i){
                    keys.push("keywords");
                    values.push(keywords_array[i].trim());
                }
            } else {
                keys.push("keywords");
                values.push($scope.keywords);
            }


            // get articles
            var url = getFormattedUrl("articles/search", keys, values);
            $http.get(url).success(function(response){
                console.log(response);
                $scope.articles = response.articles;
            })
        }



    });




});
