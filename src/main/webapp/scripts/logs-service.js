angular.module('TicTacToe').factory('LogsService', function ($resource) {
    return $resource('app/rest/logs', {}, {
        'findAll': { method: 'GET', isArray: true},
        'changeLevel': { method: 'PUT'}
    });
});
