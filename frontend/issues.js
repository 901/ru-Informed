$(document).ready(function() {

    var chart;
    var mainAngular = angular.module('myApp', []);

    mainAngular.controller('IssueController', function($scope, $http) {
      //var hCat=  "./customAngular/headerCatalogue.json";
      var p = 'https://vast-sierra-64531.herokuapp.com/v1/issues/top?num=10'
      var n = 'https://vast-sierra-64531.herokuapp.com/v1/categories'

      $scope.peopleIssues = [];
      $scope.newsIssues = [];
      //$scope.currentArticles = [];
      $scope.currentCategory = 'Select a category in the pie chart to find related articles';

      $scope.selectCategory = function(topic, y){

         console.log(topic, y);
         $http.get('https://vast-sierra-64531.herokuapp.com/v1/articles?category=' + topic).success(function(response){
             $scope.currentArticles = response;
             $scope.currentCategory = topic;
         });
     };

     $http.get(p).success(function(response){
        $scope.peopleIssues = response;
     });

     $http.get(n).success(function(response){

         var top = response.categories.sort(function IHaveAName(a, b) { // non-anonymous as you ordered...
            return b.count > a.count ?  1 // if b should come earlier, push a to end
                 : b.count < a.count ? -1 // if b should come later, push a to begin
                 : 0;                   // a and b are equal
        });

        $scope.newsIssues = top;
     });



      /*$http.get(p).success(function(response) {
        $scope.categories = response;

        var json  = $scope.categories.categories;
        options.series[0].data = JSON.parse(JSON.stringify(json).split("\"count\":").join( "\"y\":"));
        chart = new Highcharts.Chart('pie', options);

    });*/



    });




});
