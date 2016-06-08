angular.module('smoothieOperator', [
    'ngRoute',
    'ui.bootstrap',
    'firebase',
    'common',
    'login',
    'customer',
    'admin'
])
    .config(function ($routeProvider) {
        var waitForUser = function (UserService) {
            return UserService.waitForUser();
        };

        $routeProvider.
            when('/', {
                templateUrl: 'app/customer/customer.html',
                controller: 'CustomerCtrl',
                resolve: {
                  currentAuth: function(Auth) {
                    return Auth.$requireSignIn();
                  }
                }
            }).
            when('/admin', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl',
                resolve: {
                  currentAuth: function(Auth) {
                    return Auth.$requireSignIn();
                  }
                }
            }).
            when('/login', {
                templateUrl: 'app/login/login.html',
                controller: 'LoginCtrl',
                resolve: {
                  currentAuth: function(Auth) {
                    return Auth.$waitForSignIn();
                  }
                }
            }).
            otherwise({redirectTo: '/'});
    })
    .run(function ($rootScope, $location) {
      $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        if (error === "AUTH_REQUIRED") {
          $location.path("/login");
        }
      });
    })
    .factory('firebaseRef', function () {
      return function (path) {
        var ref = firebase.database().ref();
        if (path) {
          ref = ref.child(path);
        }
        return ref;
      }
    })
    .factory('Auth', function ($firebaseAuth) {
      return $firebaseAuth();
    })
    .controller('MainCtrl', function (LoadingService, Auth, $scope, $location, UserService) {
        $scope.logout = function () {
            UserService.logout();
        };

        Auth.$onAuthStateChanged(function(user) {
          LoadingService.setLoading(false);
          $scope.currentUser = user || null;
          UserService.setCurrentUser(user);

          if (user && $location.path() === '/login') {
            $location.path('/');
          } else if (!user) {
            $location.path('/login');
          }
        });
    })
;
