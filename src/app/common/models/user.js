angular.module('common')
    .service('UserService', function (Auth, $rootScope, LoadingService, $location) {
        var service = this;
        service.user = null;
        service.loginService = Auth;

        function onError(err) {
          service.user = null;

          LoadingService.setLoading(false);

          $rootScope.$broadcast('onLoginError', err.message);
        }

        service.waitForUser = function () {
            return service.loginService.$waitForSignIn();
        };

        service.getCurrentUser = function () {
          return service.user;
        };

        service.setCurrentUser = function (user) {
          return service.user = user;
        };

        service.login = function (email, password) {
            LoadingService.setLoading(true);

            service.loginService.$signInWithEmailAndPassword(email, password)
              .catch(onError);
        };

        service.logout = function () {
            LoadingService.setLoading(true);

            service.loginService.$signOut();
        };

        service.register = function (email, password) {
            LoadingService.setLoading(true);

            service.loginService.$createUserWithEmailAndPassword(email, password)
              .catch(onError);
        };
    })
;
