app.controller('DashCtrl', function($scope, $http, $timeout) {
  $scope.userName = localStorage.getItem('userName');
  var userId = localStorage.getItem('userId');

  $scope.goto   = function(path) { window.location.hash = '#!/' + path; };
  $scope.logout = function() { localStorage.clear(); window.location.hash = '#!/login'; };

  $http.get(API + '/workouts/' + userId).then(function(res) {
    var all = res.data;
    $scope.totalWorkouts = all.length;

    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    $scope.weekWorkouts = all.filter(function(w) {
      return new Date(w.date) > weekAgo;
    }).length;

    $scope.recentWorkouts = all.slice(-5).reverse();

    // Build bar chart for last 7 days
    $timeout(function() {
      var days = [], counts = [];
      for (var i = 6; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en', { weekday: 'short' }));
        var ds = d.toDateString();
        counts.push(all.filter(function(w) {
          return new Date(w.date).toDateString() === ds;
        }).length);
      }
      var ctx = document.getElementById('weekChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [{
              data: counts,
              backgroundColor: 'rgba(232,255,71,0.2)',
              borderColor: '#e8ff47',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#2a2a3a' }, ticks: { color: '#666680' } },
              y: { grid: { color: '#2a2a3a' }, ticks: { color: '#666680', stepSize: 1 }, beginAtZero: true }
            }
          }
        });
      }
    }, 100);
  });

  $http.get(API + '/goals/' + userId).then(function(res) {
    $scope.totalGoals    = res.data.length;
    $scope.goalsAchieved = res.data.filter(function(g) { return g.achieved; }).length;
  });
});