var app = angular.module('smoothieOperator', ['ngRoute', 'ui.bootstrap']);

app.config(function ($routeProvider) {
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
            templateUrl: 'app/admin/admin.start.html',
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
});

app.controller('MainCtrl',
    function ($scope, $location, UserService) {
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

        $scope.$on('dataLoaded', function () {
            $scope.currentUser = UserService.getCurrentUser();
        });

    });

app.controller('LoginCtrl',
    function ($scope, $location, UserService) {
        $scope.user = {
            email: '',
            password: '',
            register: false
        };

        $scope.submit = function (email, password, register) {
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
    });

app.controller('AdminCtrl',
    function ($scope, $location, OrdersService) {
        $scope.removeOrder = function (orderId) {
            OrdersService.removeOrder(orderId);
        };

        $scope.$on('dataLoaded', function () {
            $scope.orders = OrdersService.getOrders();
        });

        OrdersService.loadData();
    });

app.controller('CustomerCtrl',
    function ($scope, $location, ORDER_STATUS, MENU, OrdersService, UserService) {
        $scope.menu = MENU;
        $scope.menuItems = [];
        $scope.orderTotal = 0;

        $scope.calculateOrderTotal = function (items) {
            var orderTotal = 0;

            angular.forEach(items, function (item) {
                orderTotal += item.price * item.total;
            });

            return orderTotal;
        };

        $scope.$watch('menuItems', function () {
            $scope.orderTotal = $scope.calculateOrderTotal($scope.menuItems);
        }, true);

        $scope.addOrder = function () {
            var order = {
                userId: $scope.currentUser.id,
                userEmail: $scope.currentUser.email,
                items: $scope.menuItems,
                total: $scope.orderTotal,
                status: 25
            };

            OrdersService.addOrder(order);

            $scope.resetOrder();
        };

        $scope.updateOrder = function () {
            // Nothing
        };

        $scope.getOrderStatus = function (status) {
            return ORDER_STATUS[status] || 'Pending';
        };

        $scope.removeOrder = function (order) {
            OrdersService.removeOrder(order);
        };

        $scope.resetOrder = function () {
            angular.forEach($scope.menu, function (item) {
                item.total = 0;
            });
        };

        $scope.$on('dataLoaded', function () {
            $scope.currentUser = UserService.getCurrentUser();
            $scope.orders = OrdersService.getOrdersForUser($scope.currentUser.id);
        });

        OrdersService.loadData();
    });

app.controller('MenuItemCtrl',
    function ($scope) {
        $scope.menuItems.push($scope.menuItem);
    });

app.directive('order',
    function (OrdersService, ORDER_STATUS, $timeout) {
        var linker = function (scope, element, attrs) {
            scope.orderId = attrs['orderId'];

            $timeout(function(){
                scope.order = OrdersService.getOrderById(scope.orderId);
            });
        };

        var controller = function ($scope) {
            $scope.getOrderStatus = function (status) {
                return ORDER_STATUS[status];
            };
        };

        return {
            restrict: 'E',
            scope: true,
            link: linker,
            controller: controller
        };
    });

app.factory('OrdersService',
    function ($rootScope, $http, UserService) {
        var orders = null,
            users = null,
            loaded = false;

        var getOrders = function () {
            return orders;
        };

        var getOrdersForUser = function (userId) {
            return users[userId].orders;
        };

        var getOrderById = function (orderId) {
            return orders[orderId];
        };

        var addOrder = function (order) {
            var orderId = new Date().getTime();
            orders[orderId] = order;
            users[order.userId].orders[orderId] = true;
        };

        var updateOrder = function (order) {
            // Nothing
        };

        var removeOrder = function (orderId) {
            var user = UserService.getCurrentUser();

            delete orders[orderId];
            delete users[user.id].orders[orderId];
        };

        var loadData = function () {
            if (loaded) {
                $rootScope.$broadcast('dataLoaded');
            } else {
                $http.get('data/smoothie-operator.json')
                    .then(function (result) {
                        orders = result.data.orders;
                        users = result.data.users;
                        loaded = true;
                        $rootScope.$broadcast('dataLoaded');
                    });
            }
        };

        return {
            loadData: loadData,
            getOrders: getOrders,
            getOrdersForUser: getOrdersForUser,
            getOrderById: getOrderById,
            addOrder: addOrder,
            updateOrder: updateOrder,
            removeOrder: removeOrder
        }
    });

app.service('UserService',
    function ($rootScope) {
        var service = this;

        service.user = { id: 2, email: 'simpul@gmail.com', password:'password'};

        // To keep the API consistent
        service.waitForUser = function() {
            return service.user;
        };

        service.getCurrentUser = function () {
            return service.user;
        };

        service.login = function (email, password) {
            $rootScope.$broadcast('onLogin');
        };

        service.logout = function () {
            service.user = null;
            $rootScope.$broadcast('onLogout');
        };

        service.register = function (email, password) {
            service.user = {};
            service.user.email = email;
            service.user.password = password;
            $rootScope.$broadcast('onLogin');
        };
    });

app.value('ORDER_STATUS', {
    25: 'Ordered',
    50: 'Preparing',
    75: 'Pickup',
    100: 'Completed'
});

app.value('MENU', [
    {title: 'Super Berry Blast', price: '3.50', total: 0 },
    {title: 'Mega Mango Madness', price: '4.50', total: 0 },
    {title: 'Protein Power House', price: '5.50', total: 0 }
]);

app.factory('LoadingService',
    function ($rootScope) {
        var setLoading = function (loading) {
            $rootScope.loadingView = loading;
        };

        return {
            setLoading: setLoading
        }
    });