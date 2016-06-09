/**
 * Created by vincent on 16/6/10.
 */

var app = angular.module('SearchApp', []);

app.controller('SearchController',
  function SearchController($scope, $http) {
    // initialized empty list
    $scope.projects = [];
    $scope.schools  = {};
    // initialized empty string
    $scope.search_text = ""; 
    // main search function 
    $scope.search = function (type) {
      if (typeof type !== 'string')
        throw new Error('Type should be string');
      // parse input parameter
      var search_url;
      switch (type) {
        case 'text': 
          search_url = '/upload'; break;
        case 'category':
          search_url = '/upload_neo'; break;
        default:
          throw new Error('Unrecognized type');
      }
      // fetch data from remote
      $http.post(search_url, { text: $scope.search_text })
        .success(function (data) {
          $scope.projects = data;
          $scope.schools  = {};
          // calculate schools
          data.forEach(function (project) {
            var school_name = project.school_name;
            if ($scope.schools.hasOwnProperty(school_name)) {
              // add one count
              $scope.schools[school_name].count += 1;
            } else {
              // or initialized as 1
              $scope.schools[school_name] = { count: 1 };
            }
          });
          // finally sort it
          $scope.schools = 
            $scope.schools.sort(function (s1, s2) { return s1.count < s2.count; });
        })
        .error(function (err) { throw err; });
    };
  });
