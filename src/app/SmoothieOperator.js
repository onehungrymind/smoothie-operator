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
                    currentUser: waitForUser
                }
            }).
            when('/admin', {
                templateUrl: 'app/admin/admin.html',
                controller: 'AdminCtrl',
                resolve: {
                    currentUser: waitForUser
                }
            }).
            when('/login', {
                templateUrl: 'app/login/login.html',
                controller: 'LoginCtrl'
            }).
            otherwise({redirectTo: '/'});
    })
    .constant('FIREBASE_URI', 'https://smoothie-operator.firebaseio.com/')
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

          if (user) {
            $scope.currentUser = user;

            if ($location.path() === '/login') {
              $location.path('/');
            }
          } else {
            $scope.currentUser = null;
            $location.path('/login');
          }
        });
    })
;
