angular.module('common')
    .factory('OrdersService', function ($firebaseArray, $firebaseObject, firebaseRef, UserService) {
        var ordersRef, orders, usersRef;

        var createRefsAndOrders = function () {
          ordersRef = firebaseRef('orders');
          orders = $firebaseArray(ordersRef);
          usersRef = firebaseRef('users');
        };

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
            var order = orders.$getRecord(orderId);
            orders.$remove(order).then(function () {
                usersRef.child(order.userId + '/orders/' + order.$id).remove();
            });
        };

        return {
            createRefsAndOrders: createRefsAndOrders,
            getOrders: getOrders,
            getOrdersForUser: getOrdersForUser,
            addOrder: addOrder,
            updateOrder: updateOrder,
            removeOrder: removeOrder
        }
    })
;
