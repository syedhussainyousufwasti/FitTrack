app.controller('WorkoutCtrl', function($scope, $http, Toast) {
  var userId = localStorage.getItem('userId');
  $scope.userName = localStorage.getItem('userName');
  $scope.workouts = [];
  $scope.workout  = {};
  $scope.search   = '';
  $scope.filterType = '';
  $scope.showForm = false;
  $scope.muscleGroups = ['Chest','Back','Legs','Shoulders','Arms','Core','Cardio','Full Body'];

  $scope.goto   = function(path) { window.location.hash = '#!/' + path; };
  $scope.logout = function() { localStorage.clear(); window.location.hash = '#!/login'; };

  $scope.load = function() {
    $http.get(API + '/workouts/' + userId).then(function(res) {
      $scope.workouts = res.data.reverse();
    });
  };

  $scope.filtered = function() {
    return $scope.workouts.filter(function(w) {
      var matchSearch = !$scope.search || w.exercise.toLowerCase().includes($scope.search.toLowerCase());
      var matchType   = !$scope.filterType || w.muscleGroup === $scope.filterType;
      return matchSearch && matchType;
    });
  };

  $scope.addWorkout = function() {
    if (!$scope.workout.exercise) return;
    $scope.workout.userId = userId;
    $http.post(API + '/workouts', $scope.workout).then(function() {
      Toast.show('Workout logged!');
      $scope.workout  = {};
      $scope.showForm = false;
      $scope.load();
    });
  };

  $scope.deleteWorkout = function(id) {
    $http.delete(API + '/workouts/' + id).then(function() {
      Toast.show('Workout removed', 'error');
      $scope.load();
    });
  };

  $scope.toggleForm = function() { $scope.showForm = !$scope.showForm; };

  $scope.categoryClass = function(cat) {
    var map = { 'Cardio':'badge-blue','Legs':'badge-red','Chest':'badge-yellow','Core':'badge-green' };
    return map[cat] || 'badge-blue';
  };

  $scope.load();
});