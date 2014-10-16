angular.module('TicTacToe').factory('Sessions', function ($resource) {
    return $resource('app/rest/account/sessions/:series', {}, {
        'get': { method: 'GET', isArray: true}
    });
});
