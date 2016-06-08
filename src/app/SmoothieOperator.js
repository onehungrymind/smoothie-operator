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
    .factory('firebaseRef', function (Firebase, FIREBASE_URI) {
        return function (path) {
            var ref = new Firebase(FIREBASE_URI);
            if (path) {
                ref = ref.child(path);
            }
            return ref;
        }
    })
    //todo-hack https://github.com/firebase/angularfire/issues/403
    .config(function ($provide) {
        $provide.decorator('$firebaseUtils', function ($delegate) {
            function stripDollarPrefixes(obj) {
                if (angular.isArray(obj)) {
                    obj = obj.slice();
                    angular.forEach(obj, function (v, k) {
                        obj[k] = stripDollarPrefixes(v);
                    });
                }
                else if (angular.isObject(obj)) {
                    obj = angular.extend({}, obj);
                    angular.forEach(obj, function (v, k) {
                        if (k.charAt(0) === '$') {
                            delete obj[k];
                        }
                        else {
                            obj[k] = stripDollarPrefixes(v);
                        }
                    });
                }
                return obj;
            }

            var toJSON = $delegate.toJSON;
            $delegate.toJSON = function (rec) {
                var json = toJSON(rec);
                angular.forEach(json, function (v, k) {
                    if (angular.isObject(v)) {
                        json[k] = stripDollarPrefixes(v);
                    }
                });
                return json;
            };
            return $delegate;
        });
    })
    .controller('MainCtrl', function ($scope, $location, UserService) {
        $scope.logout = function () {
            UserService.logout();
        };

        $scope.$on('onLogin', function () {
            $scope.currentUser = UserService.getCurrentUser();
            $location.path('/');
        });

        $scope.$on('onLogout', function () {
            $scope.currentUser = null;
            $location.path('/login');
        });

        $scope.currentUser = UserService.getCurrentUser();
    })
;
