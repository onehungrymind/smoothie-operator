angular.module('common')
    .service('UserService', function ($rootScope, LoadingService, $firebaseSimpleLogin, firebaseRef) {
        var service = this;
        service.user = null;
        service.loginService = $firebaseSimpleLogin(firebaseRef());

        service.waitForUser = function () {
            return service.loginService.$getCurrentUser();
        };

        service.getCurrentUser = function () {
            return service.user;
        };

        service.login = function (email, password) {
            LoadingService.setLoading(true);

            service.loginService.$login('password', { email: email, password: password });
        };

        service.logout = function () {
            LoadingService.setLoading(true);

            service.loginService.$logout();
        };

        service.register = function (email, password) {
            LoadingService.setLoading(true);

            service.loginService.$createUser(email, password);
        };

        $rootScope.$on('$firebaseSimpleLogin:login', function (e, user) {
            service.user = user;
            LoadingService.setLoading(false);
            $rootScope.$broadcast('onLogin');
        });

        $rootScope.$on('$firebaseSimpleLogin:logout', function (e) {
            service.user = null;
            LoadingService.setLoading(false);
            $rootScope.$broadcast('onLogout');
        });

        $rootScope.$on('$firebaseSimpleLogin:error', function (e, err) {
            service.user = null;

            $rootScope.$apply(function () {
                LoadingService.setLoading(false);
            });

            var errorMessage = err.message.replace('FirebaseSimpleLogin: ', '');
            $rootScope.$broadcast('onLoginError', errorMessage);
        });
    })
;