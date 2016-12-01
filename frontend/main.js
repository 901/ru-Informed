$(document).ready(function() {

    var chart;
    var mainAngular = angular.module('myApp', []);

    mainAngular.controller('TopicController', function($scope, $http) {
      //var hCat=  "./customAngular/headerCatalogue.json";
      var hCat = 'https://vast-sierra-64531.herokuapp.com/v1/categories'

      $scope.catgeories = [];
      //$scope.currentArticles = [];
      $scope.currentCategory = 'Select a category in the pie chart to find related articles';

      $scope.selectCategory = function(topic, y){

         console.log(topic, y);
         $http.get('https://vast-sierra-64531.herokuapp.com/v1/articles?category=' + topic).success(function(response){
             $scope.currentArticles = response;
             $scope.currentCategory = topic;
         });
     };

      var options = {
              chart: {
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false,
                  type: 'pie',
                  width: 400,
                  height: 520
              },
              title: {
                  text: 'Frequency of Media Articles By Election Category',
                  align: 'left'
              },
              tooltip: {
                  pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
              },
              plotOptions: {
                  pie: {
                      allowPointSelect: true,
                      cursor: 'pointer',
                      dataLabels: {
                          enabled: false
                      },
                      showInLegend: true
                  }
              },
              series: [{
                  name: 'category',
                  colorByPoint: true,
                  data: [{}],
                  point: {
                      events: {
                          click: function(event){
                              $scope.selectCategory(this.name, this.y);
                          }
                      }
                  }
              }]
          };

          // TO DO: change to server link
          $http.get(hCat).success(function(response) {
            $scope.categories = response;

            var json  = $scope.categories.categories;
            options.series[0].data = JSON.parse(JSON.stringify(json).split("\"count\":").join( "\"y\":"));
            chart = new Highcharts.Chart('pie', options);

          });



    });




});
