angular.module('TicTacToe').factory('Account', function ($resource) {
    return $resource('app/rest/account');
});
