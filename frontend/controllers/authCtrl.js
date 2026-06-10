
app.controller('AuthCtrl', function($scope, $http, $location, Toast) {
  $scope.user       = {};
  $scope.error      = '';
  $scope.success    = '';
  $scope.codeSent   = false;
  $scope.loading    = false;
  $scope.verifyCode = '';

  // REGISTER
  $scope.register = function() {
    $scope.error   = '';
    $scope.loading = true;

    var data = {
      name:     $scope.user.name,
      email:    $scope.user.email,
      password: $scope.user.password
    };

    // Save email to localStorage so it is never lost
    localStorage.setItem('pendingEmail', $scope.user.email);

    $http({
      method:  'POST',
      url:     API + '/auth/register',
      data:    JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(res) {
      $scope.loading  = false;
      $scope.codeSent = true;
      Toast.show('Verification code sent to your email!');
    })
    .catch(function(err) {
      $scope.loading = false;
      $scope.error   = err.data ? err.data.message : 'Registration failed';
    });
  };

  // VERIFY
  $scope.verify = function() {
    $scope.error   = '';
    $scope.loading = true;

    // Read email from localStorage
    var email = localStorage.getItem('pendingEmail');
    var code  = $scope.verifyCode;

    console.log('Verifying email:', email, 'code:', code);

    var data = {
      email: email,
      code:  code
    };

    $http({
      method:  'POST',
      url:     API + '/auth/verify',
      data:    JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(res) {
      $scope.loading = false;
      $scope.success = 'Account verified! Redirecting to login...';
      localStorage.removeItem('pendingEmail');
      Toast.show('Account verified! Please login.');
      setTimeout(function() {
        $location.path('/login');
        $scope.$apply();
      }, 2000);
    })
    .catch(function(err) {
      $scope.loading = false;
      $scope.error   = err.data ? err.data.message : 'Verification failed';
    });
  };

  // RESEND
  $scope.resend = function() {
    $scope.error = '';

    var email = localStorage.getItem('pendingEmail');
    var data  = { email: email };

    $http({
      method:  'POST',
      url:     API + '/auth/resend',
      data:    JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(function(res) {
      $scope.success = 'New code sent! Check your email.';
      Toast.show('New verification code sent!');
    })
    .catch(function(err) {
      $scope.error = err.data ? err.data.message : 'Could not resend code';
    });
  };

  // LOGIN
// LOGIN
$scope.login = function() {
  $scope.error   = '';
  $scope.loading = true;

  var data = {
    email:    $scope.user.email,
    password: $scope.user.password
  };

  $http({
    method:  'POST',
    url:     API + '/auth/login',
    data:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(function(res) {
    $scope.loading = false;
    localStorage.setItem('userId',    res.data.id);
    localStorage.setItem('userName',  res.data.name);
    localStorage.setItem('userEmail', res.data.email);
    localStorage.setItem('token',     res.data.token);

    // Force hard redirect — bypasses auth guard completely
    window.location.href = 'index.html#!/dashboard';

  })
  .catch(function(err) {
    $scope.loading = false;
    $scope.error   = err.data ? err.data.message : 'Login failed';
  });
};
});