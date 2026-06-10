var app = angular.module('fittrackApp', ['ngRoute']);

var API = 'http://localhost:3000/api';

// ROUTES
app.config(function($routeProvider, $httpProvider) {

  // Fix content type for all POST requests
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';

  $routeProvider
    .when('/login',     { templateUrl: 'views/login.html',     controller: 'AuthCtrl' })
    .when('/register',  { templateUrl: 'views/register.html',  controller: 'AuthCtrl' })
    .when('/dashboard', { templateUrl: 'views/dashboard.html', controller: 'DashCtrl' })
    .when('/workouts',  { templateUrl: 'views/workouts.html',  controller: 'WorkoutCtrl' })
    .when('/goals',     { templateUrl: 'views/goals.html',     controller: 'GoalCtrl' })
    .when('/bmi',       { templateUrl: 'views/bmi.html',       controller: 'BmiCtrl' })
    .when('/profile',   { templateUrl: 'views/profile.html',   controller: 'ProfileCtrl' })
    .otherwise({ redirectTo: '/login' });
});

// TOAST SERVICE
app.service('Toast', function($timeout) {
  this.show = function(msg, type) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.innerHTML = '<i class="fas ' + (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check') + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    $timeout(function() {
      t.style.animation = 'fadeOut 0.3s forwards';
      $timeout(function() { if (t.parentNode) t.remove(); }, 300);
    }, 2800);
  };
});

// AUTH GUARD
app.run(function($rootScope, $location) {
  $rootScope.$on('$routeChangeStart', function(event, next) {
    var publicPages = ['/login', '/register'];
    var targetPage  = next.$$route ? next.$$route.originalPath : null;
    if (!targetPage) return;
    var isPublic   = publicPages.indexOf(targetPage) !== -1;
    var isLoggedIn = !!localStorage.getItem('userId');
    if (!isPublic && !isLoggedIn) {
      $location.path('/login');
    }
  });
});

// BMI CONTROLLER
app.controller('BmiCtrl', function($scope) {
  $scope.bmi      = null;
  $scope.bmiCat   = '';
  $scope.userName = localStorage.getItem('userName');
  $scope.goto     = function(path) { window.location.hash = '#!/' + path; };
  $scope.logout   = function() { localStorage.clear(); window.location.hash = '#!/login'; };

  $scope.calcBmi = function() {
    var h = $scope.height / 100;
    var w = $scope.weight;
    if (!h || !w) return;
    $scope.bmi = (w / (h * h)).toFixed(1);
    if      ($scope.bmi < 18.5) $scope.bmiCat = 'Underweight';
    else if ($scope.bmi < 25)   $scope.bmiCat = 'Normal';
    else if ($scope.bmi < 30)   $scope.bmiCat = 'Overweight';
    else                         $scope.bmiCat = 'Obese';
  };
});

// PROFILE CONTROLLER
app.controller('ProfileCtrl', function($scope, $http) {
  $scope.userName  = localStorage.getItem('userName');
  $scope.userEmail = localStorage.getItem('userEmail');
  var userId       = localStorage.getItem('userId');
  $scope.totalWorkouts = 0;
  $scope.avgWeight     = 0;
  $scope.totalGoals    = 0;
  $scope.achievedGoals = 0;
  $scope.goto   = function(path) { window.location.hash = '#!/' + path; };
  $scope.logout = function() { localStorage.clear(); window.location.hash = '#!/login'; };

  $http.get(API + '/workouts/' + userId).then(function(res) {
    var workouts     = res.data;
    $scope.totalWorkouts = workouts.length;
    var totalWeight  = workouts.reduce(function(sum, w) { return sum + (w.weight || 0); }, 0);
    $scope.avgWeight = $scope.totalWorkouts > 0 ? (totalWeight / $scope.totalWorkouts).toFixed(1) : 0;
  });

  $http.get(API + '/goals/' + userId).then(function(res) {
    $scope.totalGoals    = res.data.length;
    $scope.achievedGoals = res.data.filter(function(g) { return g.achieved; }).length;
  });
});