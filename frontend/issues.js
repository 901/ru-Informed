$(document).ready(function() {

    var chart;
    var mainAngular = angular.module('myApp', []);

    mainAngular.controller('IssueController', function($scope, $http) {
      //var hCat=  "./customAngular/headerCatalogue.json";
      var p = 'https://vast-sierra-64531.herokuapp.com/v1/issues/top?num=10'
      var n = 'https://vast-sierra-64531.herokuapp.com/v1/categories'
      var categories = 'https://vast-sierra-64531.herokuapp.com/v1/categories'
      var issues = 'https://vast-sierra-64531.herokuapp.com/v1/issues/top?num=70'

      // top 10 only
      $scope.peopleIssues = [];
      $scope.newsIssues = [];
      $scope.months = ['june, july, august, sept'];

     // Get top 10 election issues
     $http.get(p).success(function(response){
        $scope.peopleIssues = response;
     });

     // Get top 10 news categories
     $http.get(n).success(function(response){

         // descreasing count sorting function
         var top = response.categories.sort(function IHaveAName(a, b) { // non-anonymous as you ordered...
            return b.count > a.count ?  1 // if b should come earlier, push a to end
                 : b.count < a.count ? -1 // if b should come later, push a to begin
                 : 0;                   // a and b are equal
        });

        $scope.newsIssues = top;
     });

     // Percentage of interest

     // Categories and percentage of articles
     var options = {
             chart: {
                 plotBackgroundColor: null,
                 plotBorderWidth: null,
                 plotShadow: false,
                 type: 'pie',
                 style: {
                 }
             },
             title: {
                 text: '',
                 style : {
                     fontFamily: 'Playfair Display',
                     fontSize: '30px'
                 },
                 align: 'left'
             },
             /*tooltip: {
                 pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
             },*/

             legend: {
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
                x: 0,
                y: 100,
                style: {
                    fontFamily: 'Raleway',
                    fontSize: '15px'
                }
            },
             plotOptions: {
                 pie: {
                    /*allowPointSelect: true,*/
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                 }
             },
            colors: [
                '#01FFFE','#FFA6FE','#FFDB66','#006401','#010067','#95003A','#007DB5','#FF00F6','#FFEEE8','#774D00','#90FB92','#0076FF','#D5FF00','#FF937E','#6A826C','#FF029D','#FE8900','#7A4782','#7E2DD2','#85A900','#FF0056','#A42400','#00AE7E','#683D3B','#BDC6FF',
                '#263400','#BDD393','#00B917','#9E008E','#001544','#C28C9F','#FF74A3','#01D0FF','#004754','#E56FFE','#788231','#0E4CA1','#91D0CB','#BE9970','#968AE8','#BB8800','#43002C','#DEFF74','#00FFC6','#FFE502','#620E00','#008F9C','#98FF52','#7544B1','#B500FF',
                '#00FF78','#FF6E41'
            ],
             series: [{
                 name: '%',
                 colorByPoint: true,
                 data: [{}],
                 point: {
                     events: {
                         /*click: function(event){
                             $scope.selectCategory(this.name, this.y);
                         }*/
                     }
                 }
             }]
         };



        $http.get(categories).success(function(response) {
            //$scope.categories = response.slice(0, 10);

            var x = 16;
            var json  = response.categories.slice(0, x);
            json.push({'count': 0 ,'name': 'other'});
            for (var i = x; i<response.categories.length; ++i){
                json[x].count += response.categories[i].count;
            }

            console.log(json);
            options.series[0].data = JSON.parse(JSON.stringify(json).split("\"count\":").join( "\"y\":"));
            options.title.text = 'Issues the News Talks About';
            chart = new Highcharts.Chart('news-pie', options);

        });

        $http.get(issues).success(function(response) {
            //$scope.categories = response.slice(0, 10);

            var x = 25;
            var json  = response.issues.slice(0, x);
            json.push({'avg_importance': 0 ,'issue': 'other'});
            //console.log(json);
            for (var i = x; i<response.issues.length; ++i){
                json[x].avg_importance += response.issues[i].avg_importance;
            }
            //console.log(json);

            var processed_json = new Array();
            $.map(json, function(obj, i) {
                processed_json.push([obj.issue, parseInt(obj.avg_importance)]);
            });

            //console.log(processed_json);

            options.series[0].data = processed_json;
            options.title.text = 'Issues Americans Care About';
            chart = new Highcharts.Chart('interest-pie', options);

        });



    });




});
