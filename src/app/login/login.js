angular.module('login', [

])
.controller('LoginCtrl', function ($scope, $location, UserService) {
    $scope.user = {
        email: '',
        password: '',
        register: false
    };

    $scope.errorMessage = '';

    $scope.$on('onLoginError', function (evt, err) {
        $scope.$apply(function () {
            $scope.errorMessage = err;
        });
    });

    $scope.submit = function (email, password, register) {
        $scope.errorMessage = '';

        if ($scope.loginForm.$valid) {
            ((register) ? UserService.register : UserService.login)(email, password);
        }
        $scope.reset();
    };

    $scope.reset = function () {
        $scope.user = {
            email: '',
            password: '',
            register: false
        };
    };
})
;