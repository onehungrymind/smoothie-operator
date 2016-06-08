angular.module('customer', [

])
.controller('CustomerCtrl', function ($firebaseObject, $scope, $location, ORDER_STATUS, MENU, OrdersService, currentUser) {
    $scope.menu = MENU;
    $scope.menuItems = [];
    $scope.orderTotal = 0;

    if (!currentUser) {
      $location.path('/login');
    } else {
      OrdersService.createRefsAndOrders();
      $scope.orders = OrdersService.getOrdersForUser(currentUser.uid);
    }

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
            userId: $scope.currentUser.uid,
            userEmail: $scope.currentUser.email,
            // ng-repeat adds $$hashKey properties to each item in the array
            // so we have to strip them back out before they can be saved
            // https://github.com/firebase/angularfire/issues/403
            items: angular.fromJson(angular.toJson($scope.menuItems)),
            total: $scope.orderTotal,
            status: 25
        };

        OrdersService.addOrder(order);

        $scope.resetOrder();
    };

    $scope.updateOrder = function (order) {
        OrdersService.updateOrder(order);
    };

    $scope.removeOrder = function (orderId) {
        OrdersService.removeOrder(orderId);
    };

    $scope.getOrderStatus = function (status) {
        return ORDER_STATUS[status] || 'Pending';
    };

    $scope.resetOrder = function () {
        angular.forEach($scope.menu, function (item) {
            item.total = 0;
        });
    };
})
.controller('MenuItemCtrl', function ($scope) {
    $scope.menuItems.push($scope.menuItem);
})
.directive('order', function (firebaseRef, $firebaseObject, ORDER_STATUS) {
    var linker = function (scope, element, attrs) {
        scope.orderId = attrs['orderId'];
        var order = scope.order = $firebaseObject(firebaseRef('orders/' + scope.orderId));
        order.$loaded(function () {
            // wait for $loaded so that we don't accidentally try and set
            // the value before we fetch it from the server
            scope.$watch('order.status', function () {
              order.$save();
            });
        });

        scope.getOrderStatus = function (status) {
            return ORDER_STATUS[status];
        };

        // stop synchronizing when the scope is destroyed
        scope.$on('$destroy', function () {
            order.$destroy();
        });
    };

    return {
        restrict: 'E',
        scope: true,
        link: linker
    };
})
;
