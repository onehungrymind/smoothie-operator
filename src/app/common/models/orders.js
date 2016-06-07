angular.module('common')
    .factory('OrdersService', function ($firebase, firebaseRef, UserService) {
        var ordersRef = firebaseRef('orders');
        var orders = $firebase(ordersRef).$asArray();

        var usersRef = firebaseRef('users');

        var getOrders = function () {
            return orders;
        };

        var getOrdersForUser = function (userId) {
            return $firebase(usersRef.child(userId + '/orders/')).$asObject();
        };

        var addOrder = function (order) {
            orders.$add(order).then(function (ref) {
                usersRef.child(order.userId + '/orders/' + ref.name()).set(true);
            });
        };

        var updateOrder = function (order) {
            orders.$save(order);
        };

        var removeOrder = function (orderId) {
            var user = UserService.getCurrentUser();
            var order = orders.$getRecord(orderId);
            orders.$remove(order).then(function () {
                usersRef.child(user.id + '/orders/' + order.$id).remove();
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