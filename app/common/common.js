angular.module('common', [

])
    .value('ORDER_STATUS', {
        '25': 'Ordered',
        '50': 'Preparing',
        '75': 'Pickup',
        '100': 'Completed'
    })
    .value('MENU', [
        {title: 'Super Berry Blast', price: '3.50', total: 0 },
        {title: 'Mega Mango Madness', price: '4.50', total: 0 },
        {title: 'Protein Power House', price: '5.50', total: 0 }
    ])
    .factory('LoadingService', function ($rootScope) {
        var setLoading = function (loading) {
            $rootScope.loadingView = loading;
        };

        return {
            setLoading: setLoading
        }
    })
;