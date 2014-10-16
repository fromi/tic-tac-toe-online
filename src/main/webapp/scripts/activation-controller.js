angular.module('TicTacToe').controller('ActivationController', function ($scope, $routeParams, $http) {
    // TODO: should not be a GET
    $http.get('/app/rest/activate?key=' + $routeParams.key).success(function () {
        $scope.success = 'OK';
        $scope.error = null;
    }).error(function () {
        $scope.success = null;
        $scope.error = "ERROR";
    });
});
