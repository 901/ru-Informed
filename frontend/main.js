$(document).ready(function() {

    var chart;
    var mainAngular = angular.module('myApp', []);

    mainAngular.controller('TopicController', function($scope, $http) {
      //var hCat=  "./customAngular/headerCatalogue.json";
      var hCat = 'categories.json'
      var articles = 'articles-taxes.json'

      $scope.catgeories = [];
      //$scope.currentArticles = [];

      $scope.selectCategory = function(x, y){

         console.log(x, y);
         $http.get('articles-national-security.json').success(function(response){
             $scope.currentArticles = response;
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
                  text: 'Frequency of Media Articles By Election Category'
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
