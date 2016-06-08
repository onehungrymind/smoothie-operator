angular.module('admin', [

])
.controller('AdminCtrl', function ($scope, $location, OrdersService, currentAuth) {
    OrdersService.createRefsAndOrders();

    $scope.orders = OrdersService.getOrders();

    $scope.removeOrder = function (order) {
        OrdersService.removeOrder(order);
    };
});
