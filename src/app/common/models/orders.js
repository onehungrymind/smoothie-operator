angular.module('common')
    .factory('OrdersService', function ($firebaseArray, $firebaseObject, firebaseRef, UserService) {
        var ordersRef = firebaseRef('orders');
        var orders = $firebaseArray(ordersRef);

        var usersRef = firebaseRef('users');

        var getOrders = function () {
            return orders;
        };

        var getOrdersForUser = function (userId) {
          return $firebaseObject(usersRef.child(userId + '/orders/'));
        };

        var addOrder = function (order) {
            orders.$add(order)
              .then(function (ref) {
                usersRef.child(order.userId + '/orders/' + ref.key).set(true);
              })
              .catch(function(error) {
                console.log(error);
              })
        };

        var updateOrder = function (order) {
            orders.$save(order);
        };

        var removeOrder = function (orderId) {
            var user = UserService.getCurrentUser();
            var order = orders.$getRecord(orderId);
            orders.$remove(order).then(function () {
                usersRef.child(user.uid + '/orders/' + order.$id).remove();
            });
        };

        return {
            getOrders: getOrders,
            getOrdersForUser: getOrdersForUser,
            addOrder: addOrder,
            updateOrder: updateOrder,
            removeOrder: removeOrder
        }
    })
;
