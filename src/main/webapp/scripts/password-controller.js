angular.module('TicTacToe').controller('PasswordController', function ($scope, Password) {
    $scope.success = null;
    $scope.error = null;
    $scope.doNotMatch = null;
    $scope.changePassword = function () {
        if ($scope.password != $scope.confirmPassword) {
            $scope.doNotMatch = "ERROR";
        } else {
            $scope.doNotMatch = null;
            Password.save($scope.password,
                          function () {
                              $scope.error = null;
                              $scope.success = 'OK';
                          },
                          function () {
                              $scope.success = null;
                              $scope.error = "ERROR";
                          });
        }
    };
});
