angular.module('TicTacToe').controller('LoginController', function ($scope, AuthenticationSharedService) {
    $scope.rememberMe = true;
    $scope.login = function () {
        AuthenticationSharedService.login({
                                              username: $scope.username,
                                              password: $scope.password,
                                              rememberMe: $scope.rememberMe
                                          });
    }
});
