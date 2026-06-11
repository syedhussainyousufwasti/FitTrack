var app = angular.module('fittrackApp', ['ngRoute']);

var API = 'http://localhost:3000/api';

// ROUTES
app.config(function ($routeProvider, $httpProvider) {
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
app.service('Toast', function ($timeout) {
  this.show = function (msg, type) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.innerHTML = '<i class="fas ' + (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check') + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    $timeout(function () {
      t.style.animation = 'fadeOut 0.3s forwards';
      $timeout(function () { if (t.parentNode) t.remove(); }, 300);
    }, 2800);
  };
});

// LOGOUT CONFIRM SERVICE
app.service('LogoutConfirm', function ($rootScope) {
  this.show = function (callback) {
    $rootScope.showLogoutModal = true;
    document.body.classList.add('modal-open');
    $rootScope.confirmLogout = function () {
      $rootScope.showLogoutModal = false;
      document.body.classList.remove('modal-open');
      callback();
    };
    $rootScope.cancelLogout = function () {
      $rootScope.showLogoutModal = false;
      document.body.classList.remove('modal-open');
    };
  };
});

// AUTH GUARD
app.run(function ($rootScope, $location) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var publicPages = ['/login', '/register'];
    var targetPage = next.$$route ? next.$$route.originalPath : null;
    if (!targetPage) return;
    var isPublic   = publicPages.indexOf(targetPage) !== -1;
    var isLoggedIn = !!localStorage.getItem('userId');
    if (!isPublic && !isLoggedIn) {
      $location.path('/login');
    }
  });
});

// BMI CONTROLLER
app.controller('BmiCtrl', function ($scope, $http, Toast, LogoutConfirm) {
  $scope.userName = localStorage.getItem('userName');
  var userId      = localStorage.getItem('userId');
  $scope.bmi      = null;
  $scope.bmiCat   = '';
  $scope.savedBMI = null;
  $scope.editMode = false;

  $scope.goto   = function (path) { window.location.hash = '#!/' + path; };
  $scope.logout = function () {
    LogoutConfirm.show(function () {
      localStorage.clear();
      window.location.hash = '#!/login';
    });
  };

  $http.get(API + '/bmi/' + userId).then(function (res) {
    if (res.data) {
      $scope.savedBMI = res.data;
      $scope.height   = res.data.height;
      $scope.weight   = res.data.weight;
      $scope.age      = res.data.age;
      $scope.bmi      = res.data.bmi;
      $scope.bmiCat   = res.data.category;
    }
  });

  $scope.calcBmi = function () {
    var h = $scope.height / 100;
    var w = $scope.weight;
    if (!h || !w) return;
    $scope.bmi = (w / (h * h)).toFixed(1);
    if      ($scope.bmi < 18.5) $scope.bmiCat = 'Underweight';
    else if ($scope.bmi < 25)   $scope.bmiCat = 'Normal';
    else if ($scope.bmi < 30)   $scope.bmiCat = 'Overweight';
    else                         $scope.bmiCat = 'Obese';
  };

  $scope.saveBMI = function () {
    if (!$scope.bmi) return Toast.show('Calculate first!', 'error');
    var data = {
      userId:   userId,
      height:   $scope.height,
      weight:   $scope.weight,
      age:      $scope.age || null,
      bmi:      $scope.bmi,
      category: $scope.bmiCat
    };
    $http.post(API + '/bmi', data).then(function (res) {
      $scope.savedBMI = res.data;
      $scope.editMode = false;
      Toast.show('BMI saved!');
    }).catch(function (err) {
      if (err.data && err.data.exists) {
        Toast.show('BMI already saved — use Edit!', 'error');
      }
    });
  };

  $scope.updateBMI = function () {
    if (!$scope.bmi) return Toast.show('Calculate first!', 'error');
    var data = {
      height:   $scope.height,
      weight:   $scope.weight,
      age:      $scope.age || null,
      bmi:      $scope.bmi,
      category: $scope.bmiCat
    };
    $http.put(API + '/bmi/' + userId, data).then(function (res) {
      $scope.savedBMI = res.data;
      $scope.editMode = false;
      Toast.show('BMI updated!');
    });
  };

  $scope.enableEdit = function () { $scope.editMode = true; };
  $scope.cancelEdit = function () {
    $scope.editMode = false;
    if ($scope.savedBMI) {
      $scope.height = $scope.savedBMI.height;
      $scope.weight = $scope.savedBMI.weight;
      $scope.age    = $scope.savedBMI.age;
      $scope.bmi    = $scope.savedBMI.bmi;
      $scope.bmiCat = $scope.savedBMI.category;
    }
  };
});

// PROFILE CONTROLLER
app.controller('ProfileCtrl', function ($scope, $http, Toast, LogoutConfirm) {
  $scope.userName      = localStorage.getItem('userName');
  $scope.userEmail     = localStorage.getItem('userEmail');
  var userId           = localStorage.getItem('userId');
  $scope.totalWorkouts = 0;
  $scope.avgWeight     = 0;
  $scope.totalGoals    = 0;
  $scope.achievedGoals = 0;
  $scope.editMode      = false;
  $scope.newName       = '';

  $scope.goto   = function (path) { window.location.hash = '#!/' + path; };
  $scope.logout = function () {
    LogoutConfirm.show(function () {
      localStorage.clear();
      window.location.hash = '#!/login';
    });
  };

  $scope.enableEdit = function () {
    $scope.newName  = $scope.userName;
    $scope.editMode = true;
  };

  $scope.cancelEdit = function () {
    $scope.editMode = false;
    $scope.newName  = '';
  };

  $scope.saveName = function () {
    if (!$scope.newName || !$scope.newName.trim())
      return Toast.show('Name cannot be empty!', 'error');

    $http({
      method:  'PUT',
      url:     API + '/auth/update/' + userId,
      data:    JSON.stringify({ name: $scope.newName.trim() }),
      headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
      $scope.userName = res.data.name;
      localStorage.setItem('userName', res.data.name);
      $scope.editMode = false;
      Toast.show('Name updated!');
      setTimeout(function () { window.location.reload(); }, 1000);
    }).catch(function () {
      Toast.show('Update failed!', 'error');
    });
  };

  $http.get(API + '/workouts/' + userId).then(function (res) {
    var workouts         = res.data;
    $scope.totalWorkouts = workouts.length;
    var totalWeight      = workouts.reduce(function (sum, w) { return sum + (w.weight || 0); }, 0);
    $scope.avgWeight     = $scope.totalWorkouts > 0 ? (totalWeight / $scope.totalWorkouts).toFixed(1) : 0;
  });

  $http.get(API + '/goals/' + userId).then(function (res) {
    $scope.totalGoals    = res.data.length;
    $scope.achievedGoals = res.data.filter(function (g) { return g.achieved; }).length;
  });
});