angular.module('admin', [

])
.controller('AdminCtrl', function ($scope, $location, OrdersService, currentUser) {
    if (!currentUser) $location.path('/login');

    $scope.orders = OrdersService.getOrders();

    $scope.removeOrder = function (order) {
        OrdersService.removeOrder(order);
    };
});
