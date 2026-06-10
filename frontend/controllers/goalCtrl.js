app.controller('GoalCtrl', function($scope, $http, Toast) {
  var userId = localStorage.getItem('userId');
  $scope.userName  = localStorage.getItem('userName');
  $scope.goals     = [];
  $scope.goal      = {};
  $scope.showModal = false;

  $scope.goto   = function(path) { window.location.hash = '#!/' + path; };
  $scope.logout = function() { localStorage.clear(); window.location.hash = '#!/login'; };

  $scope.load = function() {
    $http.get(API + '/goals/' + userId).then(function(res) {
      $scope.goals = res.data;
    });
  };

  $scope.addGoal = function() {
    if (!$scope.goal.title) return;
    $scope.goal.userId   = userId;
    $scope.goal.progress = 0;
    $http.post(API + '/goals', $scope.goal).then(function() {
      Toast.show('Goal set!');
      $scope.goal      = {};
      $scope.showModal = false;
      $scope.load();
    });
  };

  $scope.toggleAchieved = function(g) {
    $http.put(API + '/goals/' + g._id, { achieved: !g.achieved }).then(function() {
      g.achieved = !g.achieved;
      Toast.show(g.achieved ? 'Goal achieved! 🎉' : 'Goal reopened');
    });
  };

  $scope.updateProgress = function(g) {
    $http.put(API + '/goals/' + g._id, { progress: g.progress }).then(function() {
      Toast.show('Progress updated!');
    });
  };

  $scope.deleteGoal = function(id) {
    $http.delete(API + '/goals/' + id).then(function() {
      Toast.show('Goal removed', 'error');
      $scope.load();
    });
  };

  $scope.progressPct = function(g) { return Math.min(100, g.progress || 0); };
  $scope.achieved    = function()  { return $scope.goals.filter(function(g) { return g.achieved; }).length; };

  $scope.load();
});